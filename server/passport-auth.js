import {
  env,
  createPassportUserAgent,
  getTokenBySessionConfig,
  YANDEX_MOBILEPROXY_ORIGIN,
  YANDEX_PASSPORT_ORIGIN,
} from "./config.js";
import { logger, summarizeResponseBody } from "./logger.js";

const sessions = new Map();

export function getActiveYandexAuthSessionCount() {
  return sessions.size;
}

export function pruneExpiredYandexAuthSessions() {
  const expiresBefore = Date.now() - env.yandexAuthSessionTtlMs;

  for (const [sessionId, session] of sessions) {
    if (session.createdAt < expiresBefore) {
      sessions.delete(sessionId);
    }
  }
}

export async function createYandexAuthSession(fetchFn = fetch) {
  const startedAt = Date.now();
  const cookieJar = {};
  const amResponse = await fetchFn(`${YANDEX_PASSPORT_ORIGIN}/am?app_platform=android`, {
    headers: {
      "user-agent": createPassportUserAgent(),
    },
  });
  mergeSetCookies(cookieJar, amResponse.headers);

  const amHtml = await readTextResponse(amResponse, "Failed to open the Passport auth page");
  const csrfToken = extractCsrfToken(amHtml);
  const startResponse = await fetchFn(
    `${YANDEX_PASSPORT_ORIGIN}/pwl-yandex/api/passport/auth/password/submit`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: createCookieHeader(cookieJar),
        "user-agent": createPassportUserAgent(),
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({
        retpath: `${YANDEX_PASSPORT_ORIGIN}/profile`,
        with_code: true,
      }),
    },
  );
  mergeSetCookies(cookieJar, startResponse.headers);

  const startJson = await readJsonResponse(
    startResponse,
    "Failed to create the Yandex QR session",
  );

  if (!startJson.csrf_token || !startJson.track_id) {
    throw new Error("Yandex did not return a track_id for the QR session");
  }

  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    csrfToken: startJson.csrf_token,
    trackId: startJson.track_id,
    cookieJar,
    createdAt: Date.now(),
  });

  logger.info("passport_qr_session_created", {
    activeSessions: sessions.size,
    durationMs: Date.now() - startedAt,
  });

  return {
    sessionId,
    authUrl: `${YANDEX_PASSPORT_ORIGIN}/auth/magic/code/?track_id=${encodeURIComponent(startJson.track_id)}`,
  };
}

export async function pollYandexAuthSession(sessionId, fetchFn = fetch) {
  const startedAt = Date.now();
  const session = sessions.get(sessionId);

  if (!session) {
    throw new Error("QR session was not found or has expired");
  }

  const statusResponse = await fetchFn(`${YANDEX_PASSPORT_ORIGIN}/auth/new/magic/status/`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: createCookieHeader(session.cookieJar),
      "user-agent": createPassportUserAgent(),
    },
    body: new URLSearchParams({
      csrf_token: session.csrfToken,
      track_id: session.trackId,
    }),
  });
  mergeSetCookies(session.cookieJar, statusResponse.headers);

  const statusJson = await readJsonResponse(
    statusResponse,
    "Failed to check the Yandex QR session",
  );

  if (statusJson.status !== "ok") {
    return { status: "pending" };
  }

  const primaryToken = await getPrimaryTokenBySessionCookies(session.cookieJar, fetchFn);
  sessions.delete(sessionId);

  logger.info("passport_qr_session_authorized", {
    activeSessions: sessions.size,
    durationMs: Date.now() - startedAt,
  });

  return {
    status: "authorized",
    primaryToken,
    token: primaryToken,
  };
}

async function getPrimaryTokenBySessionCookies(cookieJar, fetchFn) {
  const { clientId, clientSecret } = getTokenBySessionConfig();

  const response = await fetchFn(`${YANDEX_MOBILEPROXY_ORIGIN}/1/bundle/oauth/token_by_sessionid`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "ya-client-host": "passport.yandex.ru",
      "ya-client-cookie": createCookieHeader(cookieJar),
      "user-agent": createPassportUserAgent(),
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const json = await readJsonResponse(
    response,
    "Failed to get a Yandex token from Passport cookies",
  );

  if (!json.access_token) {
    throw new Error("Yandex did not return a primary token");
  }

  return json.access_token;
}

function mergeSetCookies(cookieJar, headers) {
  readSetCookieHeaders(headers).forEach((setCookie) => {
    const cookiePair = setCookie.split(";")[0];

    if (!cookiePair) {
      return;
    }

    const separatorIndex = cookiePair.indexOf("=");

    if (separatorIndex <= 0) {
      return;
    }

    cookieJar[cookiePair.slice(0, separatorIndex)] = cookiePair.slice(separatorIndex + 1);
  });
}

function readSetCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const singleHeader = headers.get("set-cookie");
  return singleHeader ? [singleHeader] : [];
}

function createCookieHeader(cookieJar) {
  return Object.entries(cookieJar)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

function extractCsrfToken(html) {
  const match =
    /"csrf_token"\s+value="([^"]+)"/.exec(html) ?? /window\.__CSRF__\s*=\s*"([^"]+)"/.exec(html);

  if (!match?.[1]) {
    throw new Error("Yandex did not return a csrf_token");
  }

  return match[1];
}

async function readTextResponse(response, errorMessage) {
  const body = await response.text();

  if (!response.ok) {
    throw new Error(errorMessage, {
      cause: {
        status: response.status,
        response: summarizeResponseBody(body),
      },
    });
  }

  return body;
}

async function readJsonResponse(response, errorMessage) {
  const body = await readTextResponse(response, errorMessage);

  try {
    return JSON.parse(body);
  } catch {
    throw new Error(errorMessage, {
      cause: {
        status: response.status,
        response: summarizeResponseBody(body),
      },
    });
  }
}
