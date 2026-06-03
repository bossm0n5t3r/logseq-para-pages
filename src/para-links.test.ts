import { describe, expect, test } from "bun:test";

import {
  normalizePageName,
  pageNameToFileName,
  pageNameToLinkName,
} from "./para-links";

describe("normalizePageName", () => {
  test("trims whitespace and surrounding slashes", () => {
    expect(normalizePageName("  /my-page/  ")).toBe("my-page");
  });
});

describe("pageNameToFileName", () => {
  test("removes markdown extension case-insensitively", () => {
    expect(pageNameToFileName("My Page.MD")).toBe("My Page");
  });

  test("replaces filesystem-unsafe characters", () => {
    expect(pageNameToFileName('a/b:c*?"<>|\\name')).toBe("a-b-c-------name");
  });

  test("trims the sanitized filename", () => {
    expect(pageNameToFileName("  page  ")).toBe("page");
  });
});

describe("pageNameToLinkName", () => {
  test("normalizes the page name and removes markdown extension", () => {
    expect(pageNameToLinkName(" /topic.md/ ")).toBe("topic");
  });
});
