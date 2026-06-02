import { describe, expect, test } from "bun:test";

import {
  findParaLinks,
  normalizePageName,
  normalizeParaLinks,
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

describe("findParaLinks", () => {
  test("finds supported PARA links", () => {
    expect(
      findParaLinks(
        "[[project/app]] [[area/health]] [[resource/book]] [[archive/old]]",
      ),
    ).toEqual([
      { kind: "project", pageName: "app" },
      { kind: "area", pageName: "health" },
      { kind: "resource", pageName: "book" },
      { kind: "archive", pageName: "old" },
    ]);
  });

  test("ignores unsupported link prefixes", () => {
    expect(
      findParaLinks("[[task/app]] [[projects/app]] [[project/app]]"),
    ).toEqual([{ kind: "project", pageName: "app" }]);
  });

  test("ignores links in inline code", () => {
    expect(findParaLinks("`[[project/ignored]]` [[project/found]]")).toEqual([
      { kind: "project", pageName: "found" },
    ]);
  });

  test("ignores links in fenced code blocks", () => {
    const content = [
      "```",
      "[[project/ignored]]",
      "```",
      "[[project/found]]",
    ].join("\n");

    expect(findParaLinks(content)).toEqual([
      { kind: "project", pageName: "found" },
    ]);
  });
});

describe("normalizeParaLinks", () => {
  test("converts PARA links to plain page links", () => {
    expect(normalizeParaLinks("[[project/app.md]] [[area/health]]")).toBe(
      "[[app]] [[health]]",
    );
  });

  test("keeps inline code unchanged", () => {
    expect(normalizeParaLinks("`[[project/ignored]]` [[project/found]]")).toBe(
      "`[[project/ignored]]` [[found]]",
    );
  });

  test("keeps fenced code blocks unchanged", () => {
    const content = [
      "```",
      "[[project/ignored]]",
      "```",
      "[[project/found]]",
    ].join("\n");

    expect(normalizeParaLinks(content)).toBe(
      ["```", "[[project/ignored]]", "```", "[[found]]"].join("\n"),
    );
  });
});
