import { expect, test } from "bun:test";

import { sanitizeForLogging } from "./logger.js";

test("sanitizeForLogging redacts sensitive keys and token-like strings", () => {
  const sanitized = sanitizeForLogging({
    access_token: "y0__accessToken12345",
    primaryToken: "AQprimaryToken12345",
    cookie: "Session_id=session-cookie",
    authorization: "Bearer real-secret-token",
    track_id: "track-123",
    sessionId: "session-123",
    nested: {
      body: '{"access_token":"y0__nestedToken12345"}',
      message:
        'authorization=Bearer real-secret-token access_token="y0__stringToken12345" primaryToken=AQnestedPrimaryToken12345',
    },
  });

  expect(sanitized).toEqual({
    access_token: "[redacted]",
    primaryToken: "[redacted]",
    cookie: "[redacted]",
    authorization: "[redacted]",
    track_id: "[redacted]",
    sessionId: "[redacted]",
    nested: {
      body: "[redacted]",
      message:
        'authorization=Bearer [redacted] access_token="[redacted]" primaryToken=[redacted]',
    },
  });
});

test("production config enables logs by default", () => {
  const result = Bun.spawnSync({
    cmd: [
      process.execPath,
      "--eval",
      "const mod = await import('./server/config.js'); console.log(String(mod.env.logEnabled));",
    ],
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "production",
      LOG_ENABLED: "",
      PRIMARY_TOKEN_SEAL_SECRET: "test-primary-token-seal-secret",
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  expect(result.exitCode).toBe(0);
  expect(result.stdout.toString().trim()).toBe("true");
});
