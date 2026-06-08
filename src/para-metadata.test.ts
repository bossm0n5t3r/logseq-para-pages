import { describe, expect, test } from "bun:test";

import {
  addMetadataProperty,
  hasMetadataProperty,
  makeInitialMarkdown,
  makeMetadataBlock,
} from "./para-metadata";

describe("makeMetadataBlock", () => {
  test("creates a top-level PARA page property", () => {
    expect(makeMetadataBlock("project")).toBe("para:: project");
  });
});

describe("makeInitialMarkdown", () => {
  test("creates initial page content with a PARA page property", () => {
    expect(makeInitialMarkdown("project")).toBe("para:: project\n-\n");
  });
});

describe("hasMetadataProperty", () => {
  test("detects an existing top-level PARA page property", () => {
    expect(hasMetadataProperty("para:: area\n- foo\n")).toBe(true);
  });

  test("returns false when the PARA page property is missing", () => {
    expect(hasMetadataProperty("- foo\n")).toBe(false);
  });

  test("does not treat the old nested metadata block format as a page property", () => {
    expect(hasMetadataProperty("- metadata\n  - para:: area\n- foo\n")).toBe(
      false,
    );
  });
});

describe("addMetadataProperty", () => {
  test("adds the PARA page property to empty content", () => {
    expect(addMetadataProperty("", "resource")).toBe("para:: resource\n-\n");
  });

  test("prepends the PARA page property to existing content", () => {
    expect(addMetadataProperty("- body\n", "area")).toBe(
      "para:: area\n- body\n",
    );
  });

  test("trims leading whitespace before prepending the PARA page property", () => {
    expect(addMetadataProperty("\n\n- body\n", "archive")).toBe(
      "para:: archive\n- body\n",
    );
  });

  test("does not duplicate an existing PARA page property", () => {
    const content = "para:: project\n- body\n";
    expect(addMetadataProperty(content, "project")).toBe(content);
  });
});
