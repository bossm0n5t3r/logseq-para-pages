import { describe, expect, test } from "bun:test";

import {
  addMetadataProperty,
  blockTreeHasMetadata,
  hasMetadataProperty,
  makeInitialMarkdown,
} from "./para-metadata";

describe("makeInitialMarkdown", () => {
  test("creates a metadata block with the PARA property", () => {
    expect(makeInitialMarkdown("project")).toBe(
      "- metadata\n  - para:: project\n- \n",
    );
  });
});

describe("hasMetadataProperty", () => {
  test("detects an existing PARA metadata property", () => {
    expect(hasMetadataProperty("- metadata\n  - para:: area\n- foo\n")).toBe(
      true,
    );
  });

  test("returns false when the PARA metadata property is missing", () => {
    expect(hasMetadataProperty("- metadata\n- foo\n")).toBe(false);
  });

  test("does not detect the old non-block PARA property format", () => {
    expect(hasMetadataProperty("- metadata\n  para:: area\n- foo\n")).toBe(
      false,
    );
  });
});

describe("addMetadataProperty", () => {
  test("adds metadata to empty content", () => {
    expect(addMetadataProperty("", "resource")).toBe(
      "- metadata\n  - para:: resource\n- \n",
    );
  });

  test("adds the PARA property below an existing metadata block", () => {
    expect(addMetadataProperty("- metadata\n- body\n", "archive")).toBe(
      "- metadata\n  - para:: archive\n- body\n",
    );
  });

  test("does not duplicate an existing PARA property", () => {
    const content = "- metadata\n  - para:: project\n- body\n";
    expect(addMetadataProperty(content, "project")).toBe(content);
  });

  test("prepends metadata before existing content", () => {
    expect(addMetadataProperty("- body\n", "area")).toBe(
      "- metadata\n  - para:: area\n- body\n",
    );
  });
});

describe("blockTreeHasMetadata", () => {
  test("detects a metadata block", () => {
    expect(blockTreeHasMetadata([{ content: "metadata" }])).toBe(true);
  });

  test("detects a nested PARA property block", () => {
    expect(
      blockTreeHasMetadata([
        { content: "body", children: [{ content: "- para:: project" }] },
      ]),
    ).toBe(true);
  });

  test("returns false when metadata is missing", () => {
    expect(blockTreeHasMetadata([{ content: "body" }])).toBe(false);
  });
});
