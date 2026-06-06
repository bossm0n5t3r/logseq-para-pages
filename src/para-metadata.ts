import type { ParaKind } from "./types";

export const METADATA_BLOCK_CONTENT = "metadata";
export const PARA_PROPERTY_NAME = "para";

export const makeMetadataBlock = (kind: ParaKind): string => {
  return `- ${METADATA_BLOCK_CONTENT}
  ${PARA_PROPERTY_NAME}:: ${kind}`;
};

export const makeInitialMarkdown = (kind: ParaKind): string => {
  return `${makeMetadataBlock(kind)}
-
`;
};

export const hasMetadataProperty = (content: string): boolean => {
  return new RegExp(`^\\s*${PARA_PROPERTY_NAME}::`, "m").test(content);
};

export const addMetadataProperty = (
  content: string,
  kind: ParaKind,
): string => {
  if (hasMetadataProperty(content)) return content;

  const lines = content.split(/\r?\n/);
  const metadataIndex = lines.findIndex(
    (line) => line.trim() === `- ${METADATA_BLOCK_CONTENT}`,
  );
  if (metadataIndex >= 0) {
    lines.splice(metadataIndex + 1, 0, `  ${PARA_PROPERTY_NAME}:: ${kind}`);
    return lines.join("\n");
  }

  const metadataBlock = makeMetadataBlock(kind);
  const normalizedContent = content.trimStart();
  if (normalizedContent.length === 0) return `${metadataBlock}\n- \n`;
  return `${metadataBlock}\n${normalizedContent}`;
};

export const blockTreeHasMetadata = (blocks: unknown[]): boolean => {
  const stack = [...blocks] as Array<{ content?: unknown; children?: unknown }>;

  while (stack.length > 0) {
    const block = stack.pop();
    const content = typeof block?.content === "string" ? block.content : "";
    if (
      content.trim() === METADATA_BLOCK_CONTENT ||
      new RegExp(`^\\s*${PARA_PROPERTY_NAME}::\\s*\\S+`, "m").test(content)
    ) {
      return true;
    }

    if (Array.isArray(block?.children)) stack.push(...block.children);
  }

  return false;
};
