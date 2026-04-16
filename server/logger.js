import { env } from "./config.js";

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export function normalizeLogLevel(level) {
  return Object.hasOwn(LOG_LEVELS, level) ? level : "info";
}

export function createLogger({ enabled = false, level = "info", sink = defaultSink } = {}) {
  const normalizedLevel = normalizeLogLevel(level);

  function write(logLevel, event, meta) {
    if (!enabled || LOG_LEVELS[logLevel] > LOG_LEVELS[normalizedLevel]) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      event,
    };

    if (meta !== undefined) {
      entry.meta = sanitizeForLogging(meta, { includeStack: normalizedLevel === "debug" });
    }

    sink(logLevel, JSON.stringify(entry));
  }

  return {
    error(event, meta) {
      write("error", event, meta);
    },
    warn(event, meta) {
      write("warn", event, meta);
    },
    info(event, meta) {
      write("info", event, meta);
    },
    debug(event, meta) {
      write("debug", event, meta);
    },
  };
}

export function sanitizeForLogging(value, options = {}) {
  return sanitizeValue(value, [], {
    includeStack: options.includeStack === true,
    seen: new WeakSet(),
  });
}

export function summarizeResponseBody(body) {
  const normalizedBody = typeof body === "string" ? body : "";
  const bodyLength = new TextEncoder().encode(normalizedBody).length;
  const trimmedBody = normalizedBody.trim();

  if (!trimmedBody) {
    return {
      bodyKind: "empty",
      bodyLength,
    };
  }

  try {
    const parsed = JSON.parse(trimmedBody);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        bodyKind: "json-object",
        bodyLength,
        bodyKeys: Object.keys(parsed).slice(0, 10),
      };
    }

    if (Array.isArray(parsed)) {
      return {
        bodyKind: "json-array",
        bodyLength,
        itemCount: parsed.length,
      };
    }

    return {
      bodyKind: "json-scalar",
      bodyLength,
    };
  } catch {
    return {
      bodyKind: trimmedBody.startsWith("<") ? "html" : "text",
      bodyLength,
    };
  }
}

export const logger = createLogger({
  enabled: env.logEnabled,
  level: env.logLevel,
});

function sanitizeValue(value, path, state) {
  if (value instanceof Error) {
    return sanitizeError(value, path, state);
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (state.seen.has(value)) {
    return "[circular]";
  }

  state.seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item, index) => sanitizeValue(item, [...path, String(index)], state));
  }

  const result = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      result[key] = "[redacted]";
      continue;
    }

    result[key] = sanitizeValue(nestedValue, [...path, key], state);
  }

  return result;
}

function sanitizeError(error, path, state) {
  const result = {
    name: error.name,
    message: sanitizeString(error.message),
  };

  if ("status" in error && typeof error.status === "number") {
    result.status = error.status;
  }

  if (state.includeStack && error.stack) {
    result.stack = sanitizeString(error.stack);
  }

  if (error.cause !== undefined) {
    result.cause = sanitizeValue(error.cause, [...path, "cause"], state);
  }

  return result;
}

function sanitizeString(value) {
  return value
    .replace(/\b(Bearer|Basic)\s+[^\s"]+/gi, "$1 [redacted]")
    .replace(
      /([?&](?:access_token|client_secret|token|track_id|csrf_token|session_id)=)[^&\s]+/gi,
      "$1[redacted]",
    )
    .replace(/"?(?:access_token|refresh_token|client_secret|token)"?\s*[:=]\s*"[^"]+"/gi, (match) =>
      match.replace(/"[^"]+"$/, '"[redacted]"'),
    )
    .replace(/\by0__[A-Za-z0-9._-]+\b/g, "[redacted]")
    .replace(/\bAQ[A-Za-z0-9._-]{8,}\b/g, "[redacted]")
    .replace(/\b2\.[A-Za-z0-9._-]{8,}\b/g, "[redacted]");
}

function isSensitiveKey(key) {
  const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();

  if (
    normalizedKey.includes("token") ||
    normalizedKey.includes("secret") ||
    normalizedKey.includes("password") ||
    normalizedKey.includes("cookie") ||
    normalizedKey.includes("authorization") ||
    normalizedKey.includes("csrf") ||
    normalizedKey.includes("trackid") ||
    normalizedKey.includes("sessionid")
  ) {
    return true;
  }

  return [
    "headers",
    "body",
    "email",
    "phone",
    "username",
    "user",
    "userid",
    "login",
    "uid",
    "ip",
    "xforwardedfor",
    "xrealip",
    "profile",
    "account",
    "firstname",
    "lastname",
    "fullname",
    "displayname",
  ].includes(normalizedKey);
}

function defaultSink(level, message) {
  if (level === "debug") {
    console.log(message);
    return;
  }

  console[level](message);
}
