import { randomBytes } from "node:crypto";

export const YANDEX_PASSPORT_ORIGIN = "https://passport.yandex.ru";
export const YANDEX_MOBILEPROXY_ORIGIN = "https://mobileproxy.passport.yandex.net";
export const SESSION_COOKIE_NAME = "yandex_token_session_id";

function readEnv(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

function readRequiredEnv(name) {
  const value = readEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readEnvNumber(name, fallback) {
  const value = Number(readEnv(name, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

function readEnvBoolean(name, fallback) {
  const value = readEnv(name, fallback ? "true" : "false").toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

function readEnvList(name) {
  return readEnv(name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolvePrimaryTokenSealSecret() {
  const configuredSecret = readEnv("PRIMARY_TOKEN_SEAL_SECRET");

  if (configuredSecret) {
    return configuredSecret;
  }

  if (readEnv("NODE_ENV") === "production") {
    throw new Error("Missing required environment variable: PRIMARY_TOKEN_SEAL_SECRET");
  }

  return randomBytes(32).toString("hex");
}

export const env = {
  host: readEnv("HOST", "127.0.0.1"),
  port: readEnvNumber("PORT", 3101),
  logEnabled: readEnvBoolean("LOG_ENABLED", false),
  logLevel: readEnv("LOG_LEVEL", "info").toLowerCase(),
  yandexAuthSessionTtlMs: readEnvNumber("YANDEX_AUTH_SESSION_TTL_MS", 10 * 60 * 1000),
  requireAccessAuth: readEnvBoolean("REQUIRE_ACCESS_AUTH", readEnv("NODE_ENV") === "production"),
  accessUsername: readEnv("ACCESS_USERNAME"),
  accessPassword: readEnv("ACCESS_PASSWORD"),
  accessBearerToken: readEnv("ACCESS_BEARER_TOKEN"),
  ipAllowlist: readEnvList("IP_ALLOWLIST"),
  rateLimitWindowMs: readEnvNumber("RATE_LIMIT_WINDOW_MS", 60 * 1000),
  rateLimitMaxRequests: readEnvNumber("RATE_LIMIT_MAX_REQUESTS", 60),
  rateLimitBucketLimit: readEnvNumber("RATE_LIMIT_BUCKET_LIMIT", 10_000),
  maxJsonBodyBytes: readEnvNumber("MAX_JSON_BODY_BYTES", 8 * 1024),
  primaryTokenSealSecret: resolvePrimaryTokenSealSecret(),
  primaryTokenReplayTtlMs: readEnvNumber("PRIMARY_TOKEN_REPLAY_TTL_MS", 24 * 60 * 60 * 1000),
  passportSdkVersion: readEnv("PASSPORT_SDK_VERSION", "6.32.2"),
  passportAppId: readEnv("PASSPORT_APP_ID", "ru.yandex.key"),
  passportAppVersion: readEnv("PASSPORT_APP_VERSION", "24023131"),
  passportIosVersion: readEnv("PASSPORT_IOS_VERSION", "26.4"),
  deviceModel: readEnv("DEVICE_MODEL", "iPad8,6"),
  deviceName: readEnv("DEVICE_NAME", "iPad"),
  musicAmVersionName: readEnv("MUSIC_AM_VERSION_NAME", "7.33.2(733022870)"),
  musicAppVersion: readEnv("MUSIC_APP_VERSION", "24023131"),
  musicAuthUserAgent: readEnv("MUSIC_AUTH_USER_AGENT", "com.yandex.mobile.auth.sdk/7.33.2.733022870"),
  musicDevicePlatform: readEnv("MUSIC_DEVICE_PLATFORM", "ios"),
  shedevrumDevicePlatform: readEnv("SHEDEVRUM_DEVICE_PLATFORM", "iPad"),
  shedevrumManufacturer: readEnv("SHEDEVRUM_MANUFACTURER", "Apple"),
  shedevrumIosVersion: readEnv("SHEDEVRUM_IOS_VERSION", "26.4"),
};

export function createPassportUserAgent() {
  return `com.yandex.mobile.auth.sdk/${env.passportSdkVersion}.11 (Apple ${env.deviceModel}; iOS ${env.passportIosVersion}) PassportSDK/${env.passportSdkVersion}.11 ${env.passportAppId}/${env.passportAppVersion}`;
}

export function createShedevrumUserAgent() {
  const { appId, appVersion } = getShedevrumExchangeConfig();

  return `com.yandex.mobile.auth.sdk/${env.passportSdkVersion}.11 (Apple ${env.deviceModel}; iOS ${env.shedevrumIosVersion}) PassportSDK/${env.passportSdkVersion}.11 ${appId}/${appVersion}`;
}

export function getTokenBySessionConfig() {
  return {
    clientId: readRequiredEnv("TOKEN_BY_SESSION_CLIENT_ID"),
    clientSecret: readRequiredEnv("TOKEN_BY_SESSION_CLIENT_SECRET"),
  };
}

export function getMusicExchangeConfig() {
  return {
    clientId: readRequiredEnv("MUSIC_CLIENT_ID"),
    clientSecret: readRequiredEnv("MUSIC_CLIENT_SECRET"),
    appId: readRequiredEnv("MUSIC_APP_ID"),
    deviceId: readRequiredEnv("MUSIC_DEVICE_ID"),
  };
}

export function getShedevrumExchangeConfig() {
  return {
    clientId: readRequiredEnv("SHEDEVRUM_CLIENT_ID"),
    clientSecret: readRequiredEnv("SHEDEVRUM_CLIENT_SECRET"),
    appId: readRequiredEnv("SHEDEVRUM_APP_ID"),
    appVersion: readRequiredEnv("SHEDEVRUM_APP_VERSION"),
    uuid: readRequiredEnv("SHEDEVRUM_UUID"),
    deviceId: readRequiredEnv("SHEDEVRUM_DEVICE_ID"),
  };
}
