import {
  createShedevrumUserAgent,
  getShedevrumExchangeConfig,
  YANDEX_MOBILEPROXY_ORIGIN,
  env,
} from "./config.js";
import { logger, summarizeResponseBody } from "./logger.js";

export async function exchangePrimaryTokenForShedevrumToken(primaryToken, fetchFn = fetch) {
  if (!primaryToken) {
    throw new Error("Primary Yandex token is required");
  }

  const startedAt = Date.now();
  const { clientId, clientSecret } = getShedevrumExchangeConfig();
  const response = await fetchFn(createShedevrumTokenUrl(), {
    method: "POST",
    headers: {
      accept: "*/*",
      "accept-language": "en-RU;q=1, ru-RU;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
      "user-agent": createShedevrumUserAgent(),
    },
    body: new URLSearchParams({
      access_token: primaryToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "x-token",
      not_cancelable: "0",
    }),
  });

  const json = await readExchangeJson(response, "Failed to exchange token for Shedevrum");

  if (!json.access_token || !String(json.access_token).startsWith("2.")) {
    throw new Error("Yandex did not return a Shedevrum token");
  }

  logger.info("shedevrum_token_exchanged", {
    durationMs: Date.now() - startedAt,
  });

  return json.access_token;
}

function createShedevrumTokenUrl() {
  const { appId, appVersion, deviceId, uuid } = getShedevrumExchangeConfig();
  const url = new URL("/1/token", YANDEX_MOBILEPROXY_ORIGIN);

  url.searchParams.set("ifv", deviceId);
  url.searchParams.set("device_name", env.deviceName);
  url.searchParams.set("manufacturer", env.shedevrumManufacturer);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("device_id", deviceId);
  url.searchParams.set("model", env.deviceModel);
  url.searchParams.set("request_id", `${crypto.randomUUID()}:${Math.floor(Date.now() / 1000)}`);
  url.searchParams.set("uuid", uuid);
  url.searchParams.set("am_version_name", env.passportSdkVersion);
  url.searchParams.set("app_platform", env.shedevrumDevicePlatform);
  url.searchParams.set("app_version_name", appVersion);

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

  if (!body.trim()) {
    throw new Error(`${errorMessage}: empty JSON response`);
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`${errorMessage}: invalid JSON response`);
  }
}
