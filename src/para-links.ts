export const normalizePageName = (rawPageName: string): string => {
  return rawPageName.trim().replace(/^\/+|\/+$/g, "");
};

export const pageNameToFileName = (pageName: string): string => {
  const withoutMarkdownExtension = pageName.replace(/\.md$/i, "");
  return withoutMarkdownExtension.replace(/[\\/:*?"<>|]/g, "-").trim();
};

export const pageNameToLinkName = (pageName: string): string => {
  return normalizePageName(pageName).replace(/\.md$/i, "");
};
