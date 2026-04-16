import { env, getMusicExchangeConfig, YANDEX_MOBILEPROXY_ORIGIN } from "./config.js";
import { logger, summarizeResponseBody } from "./logger.js";

export async function exchangePrimaryTokenForMusicToken(primaryToken, fetchFn = fetch) {
  if (!primaryToken) {
    throw new Error("Primary Yandex token is required");
  }

  const startedAt = Date.now();
  const { clientId, clientSecret } = getMusicExchangeConfig();
  const response = await fetchFn(createMusicTokenUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
      "user-agent": env.musicAuthUserAgent,
    },
    body: new URLSearchParams({
      access_token: primaryToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "x-token",
      payment_auth_retpath: "https://passport.yandex.ru/closewebview",
    }),
  });

  const json = await readExchangeJson(response, "Failed to exchange token for Yandex Music");

  if (!json.access_token) {
    throw new Error("Yandex did not return a Yandex Music token");
  }

  if (!String(json.access_token).startsWith("y0__")) {
    throw new Error("Yandex did not return a Yandex Music token");
  }

  logger.info("music_token_exchanged", {
    durationMs: Date.now() - startedAt,
  });

  return json.access_token;
}

function createMusicTokenUrl() {
  const { appId, deviceId } = getMusicExchangeConfig();
  const url = new URL("/1/token", YANDEX_MOBILEPROXY_ORIGIN);

  url.searchParams.set("app_id", appId);
  url.searchParams.set("am_version_name", env.musicAmVersionName);
  url.searchParams.set("app_version_name", env.musicAppVersion);
  url.searchParams.set("am_app", `${appId}+${env.musicAppVersion}`);
  url.searchParams.set("manufacturer", "Apple");
  url.searchParams.set("deviceid", deviceId);
  url.searchParams.set("device_id", deviceId);
  url.searchParams.set("app_platform", env.musicDevicePlatform);

  return url;
}

async function readExchangeJson(response, errorMessage) {
  const body = await response.text();

  if (!response.ok) {
    throw new Error(errorMessage, {
      cause: {
        status: response.status,
        response: summarizeResponseBody(body),
      },
    });
  }

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
