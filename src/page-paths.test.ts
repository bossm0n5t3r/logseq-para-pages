import { describe, expect, test } from "bun:test";

import { candidateDefaultPagePaths, toAbsoluteGraphPath } from "./page-paths";
import type { NodeLikePath } from "./types";

const posixPath: NodeLikePath = {
  join: (...parts) =>
    parts
      .filter((part) => part.length > 0)
      .join("/")
      .replace(/\/+/g, "/"),
};

describe("toAbsoluteGraphPath", () => {
  test("keeps absolute POSIX paths unchanged", () => {
    expect(
      toAbsoluteGraphPath("/graph", "/graph/pages/app.md", posixPath),
    ).toBe("/graph/pages/app.md");
  });

  test("keeps absolute Windows paths unchanged", () => {
    expect(
      toAbsoluteGraphPath("/graph", "C:\\graph\\pages\\app.md", posixPath),
    ).toBe("C:\\graph\\pages\\app.md");
  });

  test("resolves relative graph paths against the graph root", () => {
    expect(toAbsoluteGraphPath("/graph", "pages/app.md", posixPath)).toBe(
      "/graph/pages/app.md",
    );
  });
});

describe("candidateDefaultPagePaths", () => {
  test("returns common Logseq page path candidates first", () => {
    expect(
      candidateDefaultPagePaths("/graph", "project", "app", posixPath, []),
    ).toEqual([
      "/graph/pages/app.md",
      "/graph/pages/project/app.md",
      "/graph/pages/project___app.md",
      "/graph/pages/project%2Fapp.md",
      "/graph/app.md",
    ]);
  });

  test("includes matching files from Logseq graph file listing", () => {
    expect(
      candidateDefaultPagePaths("/graph", "project", "app", posixPath, [
        "pages/project/app.md",
        "pages/other.md",
      ]),
    ).toContain("/graph/pages/project/app.md");
  });
});
