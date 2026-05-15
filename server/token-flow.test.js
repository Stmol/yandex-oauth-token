import { expect, test } from "bun:test";

import { exchangePrimaryTokenForMusicToken } from "./exchange-music-token.js";
import { exchangePrimaryTokenForShedevrumToken } from "./exchange-shedevrum-token.js";
import { createLogger } from "./logger.js";
import { createYandexAuthSession, pollYandexAuthSession } from "./passport-auth.js";
import { handlePrimaryTokenExchange } from "../server.js";

function createCollectorLogger() {
  const entries = [];
  const log = createLogger({
    enabled: true,
    level: "info",
    sink(_level, message) {
      entries.push(JSON.parse(message));
    },
  });

  return { entries, log };
}

test("primary QR flow logs start on session creation", async () => {
  const { entries, log } = createCollectorLogger();
  let callIndex = 0;
  const fetchFn = async () => {
    callIndex += 1;

    if (callIndex === 1) {
      return new Response('<input name="csrf_token" value="csrf-token">', {
        status: 200,
        headers: {
          "set-cookie": "Session_id=abc123; Path=/; HttpOnly",
        },
      });
    }

    return new Response(JSON.stringify({ csrf_token: "csrf-token", track_id: "track-123" }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  };

  const session = await createYandexAuthSession(fetchFn, log);

  expect(typeof session.sessionId).toBe("string");
  expect(entries[0]).toMatchObject({
    level: "info",
    event: "token_flow_started",
    meta: {
      tokenKind: "primary",
      flow: "qr",
      stage: "create_session",
    },
  });
});

test("primary QR flow logs completion after token retrieval", async () => {
  process.env.TOKEN_BY_SESSION_CLIENT_ID = "test-client-id";
  process.env.TOKEN_BY_SESSION_CLIENT_SECRET = "test-client-secret";

  const { entries, log } = createCollectorLogger();
  let createCallIndex = 0;
  const createFetchFn = async () => {
    createCallIndex += 1;

    if (createCallIndex === 1) {
      return new Response('<input name="csrf_token" value="csrf-token">', {
        status: 200,
        headers: {
          "set-cookie": "Session_id=abc123; Path=/; HttpOnly",
        },
      });
    }

    return new Response(JSON.stringify({ csrf_token: "csrf-token", track_id: "track-123" }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  };

  const session = await createYandexAuthSession(createFetchFn, log);
  let pollCallIndex = 0;
  const pollFetchFn = async () => {
    pollCallIndex += 1;

    if (pollCallIndex === 1) {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ access_token: "AQprimaryTokenValue12345" }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  };

  const result = await pollYandexAuthSession(session.sessionId, pollFetchFn, log);

  expect(result.status).toBe("authorized");
  expect(result.primaryToken).toBe("AQprimaryTokenValue12345");
  expect(entries.at(-1)).toMatchObject({
    level: "info",
    event: "token_flow_completed",
    meta: {
      tokenKind: "primary",
      flow: "qr",
      stage: "get_primary_token",
    },
  });
});

test("music exchange logs start and completion", async () => {
  const { entries, log } = createCollectorLogger();
  const request = new Request("http://127.0.0.1/api/yandex-token/exchange/music", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      primaryToken: "AQmusicPrimaryToken12345",
    }),
  });

  const response = await handlePrimaryTokenExchange({
    request,
    service: "music",
    exchangeFn: async (primaryToken) => {
      expect(primaryToken).toBe("AQmusicPrimaryToken12345");
      return "y0__musicToken12345";
    },
    errorMessage: "Failed to exchange token for Yandex Music",
    securityHeaders: new Headers(),
    log,
  });

  expect(response.status).toBe(200);
  expect(entries[0]).toMatchObject({
    level: "info",
    event: "token_flow_started",
    meta: {
      tokenKind: "music",
      flow: "exchange",
      stage: "exchange_token",
    },
  });
  expect(entries[1]).toMatchObject({
    level: "info",
    event: "token_flow_completed",
    meta: {
      tokenKind: "music",
      flow: "exchange",
      stage: "exchange_token",
    },
  });
});

test("shedevrum exchange logs start and completion", async () => {
  const { entries, log } = createCollectorLogger();
  const request = new Request("http://127.0.0.1/api/yandex-token/exchange/shedevrum", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      primaryToken: "AQshedevrumPrimaryToken12345",
    }),
  });

  const response = await handlePrimaryTokenExchange({
    request,
    service: "shedevrum",
    exchangeFn: async (primaryToken) => {
      expect(primaryToken).toBe("AQshedevrumPrimaryToken12345");
      return "2.shedevrumToken12345";
    },
    errorMessage: "Failed to exchange token for Shedevrum",
    securityHeaders: new Headers(),
    log,
  });

  expect(response.status).toBe(200);
  expect(entries[0]).toMatchObject({
    level: "info",
    event: "token_flow_started",
    meta: {
      tokenKind: "shedevrum",
      flow: "exchange",
      stage: "exchange_token",
    },
  });
  expect(entries[1]).toMatchObject({
    level: "info",
    event: "token_flow_completed",
    meta: {
      tokenKind: "shedevrum",
      flow: "exchange",
      stage: "exchange_token",
    },
  });
});

test("music exchange failure logs stage and redacts tokens", async () => {
  const { entries, log } = createCollectorLogger();
  const request = new Request("http://127.0.0.1/api/yandex-token/exchange/music", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      primaryToken: "AQmusicPrimaryTokenFailure12345",
    }),
  });

  await expect(
    handlePrimaryTokenExchange({
      request,
      service: "music",
      exchangeFn: async () => {
        throw new Error(
          'upstream access_token="y0__secretToken12345" primaryToken=AQmusicPrimaryTokenFailure12345',
        );
      },
      errorMessage: "Failed to exchange token for Yandex Music",
      securityHeaders: new Headers(),
      log,
    }),
  ).rejects.toThrow("Failed to exchange token for Yandex Music");

  expect(entries.at(-1)).toMatchObject({
    level: "warn",
    event: "token_flow_failed",
    meta: {
      tokenKind: "music",
      flow: "exchange",
      stage: "exchange_token",
    },
  });
  expect(JSON.stringify(entries.at(-1))).not.toContain("y0__secretToken12345");
  expect(JSON.stringify(entries.at(-1))).not.toContain("AQmusicPrimaryTokenFailure12345");
});

test("exchange helpers still return upstream tokens", async () => {
  process.env.MUSIC_CLIENT_ID = "music-client-id";
  process.env.MUSIC_CLIENT_SECRET = "music-client-secret";
  process.env.MUSIC_APP_ID = "music-app-id";
  process.env.MUSIC_DEVICE_ID = "music-device-id";
  process.env.SHEDEVRUM_CLIENT_ID = "shedevrum-client-id";
  process.env.SHEDEVRUM_CLIENT_SECRET = "shedevrum-client-secret";
  process.env.SHEDEVRUM_APP_ID = "shedevrum-app-id";
  process.env.SHEDEVRUM_APP_VERSION = "1.2.3";
  process.env.SHEDEVRUM_UUID = "shedevrum-uuid";
  process.env.SHEDEVRUM_DEVICE_ID = "shedevrum-device-id";

  const musicToken = await exchangePrimaryTokenForMusicToken(
    "AQmusicPrimaryToken12345",
    async () =>
      new Response(JSON.stringify({ access_token: "y0__musicToken12345" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
  );
  const shedevrumToken = await exchangePrimaryTokenForShedevrumToken(
    "AQshedevrumPrimaryToken12345",
    async () =>
      new Response(JSON.stringify({ access_token: "2.shedevrumToken12345" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
  );

  expect(musicToken).toBe("y0__musicToken12345");
  expect(shedevrumToken).toBe("2.shedevrumToken12345");
});
