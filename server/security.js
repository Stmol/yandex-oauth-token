import { createHash, timingSafeEqual } from "node:crypto";

import { env } from "./config.js";
import { logger } from "./logger.js";

const rateLimitBuckets = new Map();
const primaryTokenUsage = new Map();

export class HttpError extends Error {
  constructor(status, message, options = {}) {
    super(message, options);
    this.name = "HttpError";
    this.status = status;
  }
}

export function ensureTrustedClient(request) {
  enforceIpAllowlist(request);
  enforceAccessAuth(request);
}

export function enforceRateLimit(request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const windowStartedAt = now - env.rateLimitWindowMs;
  const bucket = rateLimitBuckets.get(ip) ?? [];
  const recentRequests = bucket.filter((timestamp) => timestamp > windowStartedAt);

  if (recentRequests.length >= env.rateLimitMaxRequests) {
    throw new HttpError(429, "Too many requests");
  }

  recentRequests.push(now);
  rateLimitBuckets.set(ip, recentRequests);

  if (rateLimitBuckets.size > env.rateLimitBucketLimit) {
    pruneRateLimitBuckets(windowStartedAt);
  }
}

export function beginPrimaryTokenExchange(primaryToken, service) {
  const sealedToken = sealPrimaryToken(primaryToken);
  const entry = primaryTokenUsage.get(sealedToken) ?? {
    inFlight: new Set(),
    completed: new Set(),
    updatedAt: Date.now(),
  };

  entry.updatedAt = Date.now();

  if (entry.inFlight.has(service) || entry.completed.has(service)) {
    throw new HttpError(409, `This primaryToken has already been used for ${service}`);
  }

  entry.inFlight.add(service);
  primaryTokenUsage.set(sealedToken, entry);
  prunePrimaryTokenUsage();

  return sealedToken;
}

export function completePrimaryTokenExchange(sealedToken, service) {
  const entry = primaryTokenUsage.get(sealedToken);

  if (!entry) {
    return;
  }

  entry.inFlight.delete(service);
  entry.completed.add(service);
  entry.updatedAt = Date.now();
}

export function failPrimaryTokenExchange(sealedToken, service) {
  const entry = primaryTokenUsage.get(sealedToken);

  if (!entry) {
    return;
  }

  entry.inFlight.delete(service);

  if (!entry.completed.size) {
    primaryTokenUsage.delete(sealedToken);
    return;
  }

  entry.updatedAt = Date.now();
}

export function createSecurityHeaders(request) {
  const headers = new Headers();

  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "clipboard-write=(self)");
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "connect-src 'self'",
      "img-src 'self' https://play-lh.googleusercontent.com",
      "font-src 'self'",
      "object-src 'none'",
    ].join("; "),
  );

  if (new URL(request.url).protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return headers;
}

export function logServerError(context, error) {
  if (error instanceof HttpError && error.status < 500) {
    return;
  }

  logger.error("server_error", {
    context,
    error,
  });
}

function enforceIpAllowlist(request) {
  if (!env.ipAllowlist.length) {
    return;
  }

  const ip = getClientIp(request);

  if (!env.ipAllowlist.includes(ip)) {
    throw new HttpError(403, "Client IP is not allowed");
  }
}

function enforceAccessAuth(request) {
  if (!env.requireAccessAuth) {
    return;
  }

  const hasBasicConfig = Boolean(env.accessUsername && env.accessPassword);
  const hasBearerConfig = Boolean(env.accessBearerToken);

  if (!hasBasicConfig && !hasBearerConfig) {
    throw new HttpError(500, "Access control is enabled but not configured");
  }

  const authorization = request.headers.get("authorization");

  if (!authorization) {
    throwUnauthorized();
  }

  if (hasBearerConfig && authorization.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();

    if (safeEquals(token, env.accessBearerToken)) {
      return;
    }
  }

  if (hasBasicConfig && authorization.startsWith("Basic ")) {
    const encodedCredentials = authorization.slice("Basic ".length).trim();

    try {
      const decodedCredentials = atob(encodedCredentials);
      const separatorIndex = decodedCredentials.indexOf(":");

      if (separatorIndex > -1) {
        const username = decodedCredentials.slice(0, separatorIndex);
        const password = decodedCredentials.slice(separatorIndex + 1);

        if (safeEquals(username, env.accessUsername) && safeEquals(password, env.accessPassword)) {
          return;
        }
      }
    } catch {
      throwUnauthorized();
    }
  }

  throwUnauthorized();
}

function throwUnauthorized() {
  const error = new HttpError(401, "Authentication required");
  error.headers = {
    "www-authenticate": 'Basic realm="Restricted", charset="UTF-8"',
  };
  throw error;
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function pruneRateLimitBuckets(windowStartedAt) {
  for (const [ip, timestamps] of rateLimitBuckets) {
    const recentRequests = timestamps.filter((timestamp) => timestamp > windowStartedAt);

    if (recentRequests.length) {
      rateLimitBuckets.set(ip, recentRequests);
      continue;
    }

    rateLimitBuckets.delete(ip);
  }
}

function sealPrimaryToken(primaryToken) {
  if (!env.primaryTokenSealSecret) {
    throw new HttpError(500, "PRIMARY_TOKEN_SEAL_SECRET is not configured");
  }

  const material = `${env.primaryTokenSealSecret}:${primaryToken}`;
  return createHash("sha256").update(material).digest("hex");
}

function prunePrimaryTokenUsage() {
  const expiresBefore = Date.now() - env.primaryTokenReplayTtlMs;

  for (const [sealedToken, entry] of primaryTokenUsage) {
    if (entry.updatedAt < expiresBefore) {
      primaryTokenUsage.delete(sealedToken);
    }
  }
}

function safeEquals(left, right) {
  const leftBuffer = Buffer.from(left ?? "", "utf8");
  const rightBuffer = Buffer.from(right ?? "", "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
