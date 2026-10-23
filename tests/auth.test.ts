import { afterEach, describe, expect, it } from "vitest";
import { checkIndexPassword, createIndexToken, createSessionToken, INDEX_SESSION_TTL_SECONDS, verifyIndexToken } from "@/lib/auth";

describe("demo index password", () => {
  afterEach(() => {
    delete process.env.DEMO_INDEX_PASSWORD;
  });

  it("is off when DEMO_INDEX_PASSWORD is not set", () => {
    expect(checkIndexPassword("")).toBe(false);
    expect(createIndexToken()).toBeUndefined();
    expect(verifyIndexToken("index.9999999999.x")).toBe(false);
  });

  it("checks the password and keeps the visitor signed in for 30 days", () => {
    process.env.DEMO_INDEX_PASSWORD = " test-secret ";
    expect(checkIndexPassword("wrong")).toBe(false);
    expect(checkIndexPassword("test-secret")).toBe(true);

    const now = Date.now();
    const token = createIndexToken(now)!;
    expect(verifyIndexToken(token, now)).toBe(true);
    expect(verifyIndexToken(token, now + (INDEX_SESSION_TTL_SECONDS + 1) * 1000)).toBe(false);
    expect(verifyIndexToken(token.slice(0, -2) + "xx", now)).toBe(false);
  });

  it("logs everyone out when the password changes", () => {
    process.env.DEMO_INDEX_PASSWORD = "first";
    const token = createIndexToken()!;
    process.env.DEMO_INDEX_PASSWORD = "second";
    expect(verifyIndexToken(token)).toBe(false);
  });

  it("does not accept a business admin session as the index cookie", () => {
    process.env.DEMO_INDEX_PASSWORD = "demo";
    expect(verifyIndexToken(createSessionToken("dent-star"))).toBe(false);
  });
});
