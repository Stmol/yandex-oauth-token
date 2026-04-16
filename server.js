import { env, SESSION_COOKIE_NAME } from "./server/config.js";
import { exchangePrimaryTokenForMusicToken } from "./server/exchange-music-token.js";
import { exchangePrimaryTokenForShedevrumToken } from "./server/exchange-shedevrum-token.js";
import { logger } from "./server/logger.js";
import {
  createYandexAuthSession,
  getActiveYandexAuthSessionCount,
  pollYandexAuthSession,
  pruneExpiredYandexAuthSessions,
} from "./server/passport-auth.js";
import {
  beginPrimaryTokenExchange,
  completePrimaryTokenExchange,
  createSecurityHeaders,
  ensureTrustedClient,
  enforceRateLimit,
  failPrimaryTokenExchange,
  HttpError,
  logServerError,
} from "./server/security.js";

const staticFiles = {
  "/": {
    file: Bun.file(new URL("./public/index.html", import.meta.url)),
    contentType: "text/html; charset=utf-8",
  },
  "/app.js": {
    file: Bun.file(new URL("./public/app.js", import.meta.url)),
    contentType: "application/javascript; charset=utf-8",
  },
  "/styles.css": {
    file: Bun.file(new URL("./public/styles.css", import.meta.url)),
    contentType: "text/css; charset=utf-8",
  },
};

if (import.meta.main) {
  const server = Bun.serve({
    hostname: env.host,
    port: env.port,
    idleTimeout: 30,
    fetch: handleRequest,
    error(error) {
      logServerError("Unhandled request error", error);
      return jsonResponse(
        { error: "Internal server error" },
        { status: 500 },
        createSecurityHeaders(new Request(`http://${env.host}:${env.port}/`)),
      );
    },
  });

  logger.info("server_started", {
    host: server.hostname,
    port: server.port,
  });
}

async function handleRequest(request) {
  pruneExpiredYandexAuthSessions();

  const url = new URL(request.url);
  const securityHeaders = createSecurityHeaders(request);
  const startedAt = Date.now();
  let responseStatus = 500;

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      responseStatus = 200;
      return jsonResponse(
        {
          ok: true,
          activeSessions: getActiveYandexAuthSessionCount(),
        },
        undefined,
        securityHeaders,
      );
    }

    ensureTrustedClient(request);

    if (request.method === "GET" && staticFiles[url.pathname]) {
      responseStatus = 200;
      return serveStaticFile(staticFiles[url.pathname], securityHeaders);
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/")) {
      enforceRateLimit(request);
    }

    if (request.method === "POST" && url.pathname === "/api/yandex-token/session") {
      const session = await createYandexAuthSession();

      responseStatus = 200;
      return jsonResponse(
        { authUrl: session.authUrl },
        {
          headers: {
            "set-cookie": createSetCookieHeader(SESSION_COOKIE_NAME, session.sessionId, {
              httpOnly: true,
              sameSite: "Strict",
              secure: isSecureRequest(url),
              path: "/",
              maxAge: Math.floor(env.yandexAuthSessionTtlMs / 1000),
            }),
          },
        },
        securityHeaders,
      );
    }

    if (request.method === "POST" && url.pathname === "/api/yandex-token/poll") {
      const cookies = parseCookieHeader(request.headers.get("cookie"));
      const sessionId = cookies[SESSION_COOKIE_NAME];

      if (!sessionId) {
        throw new HttpError(400, "QR session was not found");
      }

      const result = await pollYandexAuthSession(sessionId);
      const responseHeaders = new Headers();

      if (result.status === "authorized") {
        responseHeaders.set(
          "set-cookie",
          createSetCookieHeader(SESSION_COOKIE_NAME, "", {
            httpOnly: true,
            sameSite: "Strict",
            secure: isSecureRequest(url),
            path: "/",
            maxAge: 0,
          }),
        );
      }

      responseStatus = 200;
      return jsonResponse(result, { headers: responseHeaders }, securityHeaders);
    }

    if (request.method === "POST" && url.pathname === "/api/yandex-token/exchange/music") {
      const response = await handlePrimaryTokenExchange({
        request,
        service: "music",
        exchangeFn: exchangePrimaryTokenForMusicToken,
        errorMessage: "Failed to exchange token for Yandex Music",
        securityHeaders,
      });

      responseStatus = response.status;
      return response;
    }

    if (request.method === "POST" && url.pathname === "/api/yandex-token/exchange/shedevrum") {
      const response = await handlePrimaryTokenExchange({
        request,
        service: "shedevrum",
        exchangeFn: exchangePrimaryTokenForShedevrumToken,
        errorMessage: "Failed to exchange token for Shedevrum",
        securityHeaders,
      });

      responseStatus = response.status;
      return response;
    }

    responseStatus = 404;
    return jsonResponse({ error: "Route not found" }, { status: 404 }, securityHeaders);
  } catch (error) {
    const response = handleError(request, error, securityHeaders);
    responseStatus = response.status;
    return response;
  } finally {
    logger.info("http_request", {
      method: request.method,
      path: url.pathname,
      status: responseStatus,
      durationMs: Date.now() - startedAt,
    });
  }
}

async function handlePrimaryTokenExchange({
  request,
  service,
  exchangeFn,
  errorMessage,
  securityHeaders,
}) {
  const startedAt = Date.now();
  const { primaryToken } = await readExchangeBody(request);
  const sealedToken = beginPrimaryTokenExchange(primaryToken, service);

  try {
    const token = await exchangeFn(primaryToken);
    completePrimaryTokenExchange(sealedToken, service);

    logger.info("primary_token_exchange_completed", {
      service,
      durationMs: Date.now() - startedAt,
    });

    return jsonResponse(
      {
        service,
        token,
      },
      undefined,
      securityHeaders,
    );
  } catch (error) {
    failPrimaryTokenExchange(sealedToken, service);
    logger.warn("primary_token_exchange_failed", {
      service,
      durationMs: Date.now() - startedAt,
      error,
    });
    throw wrapUnexpectedError(error, errorMessage);
  }
}

async function readExchangeBody(request) {
  const body = await readJsonBody(request);
  const primaryToken = typeof body?.primaryToken === "string" ? body.primaryToken.trim() : "";

  if (!primaryToken) {
    throw new HttpError(400, "primaryToken is required");
  }

  return { primaryToken };
}

async function readJsonBody(request) {
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;

  if (Number.isFinite(contentLength) && contentLength > env.maxJsonBodyBytes) {
    throw new HttpError(413, "Request body is too large");
  }

  const rawBody = await request.text();

  if (new TextEncoder().encode(rawBody).length > env.maxJsonBodyBytes) {
    throw new HttpError(413, "Request body is too large");
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}

function serveStaticFile(entry, securityHeaders) {
  const headers = new Headers(securityHeaders);
  headers.set("content-type", entry.contentType);

  return new Response(entry.file, { headers });
}

function handleError(request, error, securityHeaders) {
  if (error instanceof HttpError) {
    const headers = new Headers(securityHeaders);

    if (error.headers) {
      for (const [key, value] of Object.entries(error.headers)) {
        headers.set(key, value);
      }
    }

    return jsonResponse({ error: error.message }, { status: error.status, headers }, new Headers());
  }

  logServerError(`Request failed: ${request.method} ${new URL(request.url).pathname}`, error);
  return jsonResponse({ error: "Internal server error" }, { status: 500 }, securityHeaders);
}

function wrapUnexpectedError(error, fallbackMessage) {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof Error) {
    return new HttpError(502, fallbackMessage, { cause: error.cause ?? error });
  }

  return new HttpError(502, fallbackMessage);
}

function parseCookieHeader(cookieHeader) {
  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  for (const chunk of cookieHeader.split(";")) {
    const trimmed = chunk.trim();

    if (!trimmed) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    cookies[key] = value;
  }

  return cookies;
}

function createSetCookieHeader(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function isSecureRequest(url) {
  return url.protocol === "https:";
}

function jsonResponse(data, init = {}, securityHeaders = new Headers()) {
  const headers = new Headers(init.headers);

  for (const [key, value] of securityHeaders.entries()) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }

  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}
