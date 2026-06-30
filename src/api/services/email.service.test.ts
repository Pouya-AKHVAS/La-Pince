import { describe, expect, it } from "vitest";
import { buildVerificationUrl } from "./email.service.ts";

describe("buildVerificationUrl", () => {
  it("adds a protocol to api base urls without one", () => {
    expect(buildVerificationUrl("abc123", "127.0.0.1:3007")).toBe(
      "http://127.0.0.1:3007/auth/verify/abc123",
    );
  });
});
