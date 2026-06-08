import type { ParaKind } from "./types";

export const PARA_PROPERTY_NAME = "para";

export const makeMetadataBlock = (kind: ParaKind): string => {
  return `${PARA_PROPERTY_NAME}:: ${kind}`;
};

export const makeInitialMarkdown = (kind: ParaKind): string => {
  return `${makeMetadataBlock(kind)}
-
`;
};

export const hasMetadataProperty = (content: string): boolean => {
  return new RegExp(`^${PARA_PROPERTY_NAME}::`, "m").test(content);
};

export const addMetadataProperty = (
  content: string,
  kind: ParaKind,
): string => {
  if (hasMetadataProperty(content)) return content;

  const propertyBlock = makeMetadataBlock(kind);
  const normalizedContent = content.trimStart();
  if (normalizedContent.length === 0) return `${propertyBlock}\n-\n`;
  return `${propertyBlock}\n${normalizedContent}`;
};
