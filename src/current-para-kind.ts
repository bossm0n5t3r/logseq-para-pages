import { pageNameToFileName } from "./para-links";
import { PARA_KIND_CONFIG, dirForKind } from "./settings";
import type { ParaKind, ParaSettings } from "./types";

const PARA_KINDS = Object.keys(PARA_KIND_CONFIG) as ParaKind[];

const normalizePath = (path: string): string => {
  return path.replace(/\\/g, "/").replace(/^file:\/\//, "");
};

const stripGraphPath = (filePath: string, graphPath: string): string => {
  const normalizedFilePath = normalizePath(filePath);
  const normalizedGraphPath = normalizePath(graphPath).replace(/\/+$/g, "");

  if (normalizedFilePath.startsWith(`${normalizedGraphPath}/`)) {
    return normalizedFilePath.slice(normalizedGraphPath.length + 1);
  }

  return normalizedFilePath.replace(/^\/+/, "");
};

const kindFromRelativePath = (
  relativePath: string,
  settings: ParaSettings,
): ParaKind | null => {
  const normalizedRelativePath = normalizePath(relativePath).replace(
    /^\/+/,
    "",
  );

  for (const kind of PARA_KINDS) {
    const dir = normalizePath(dirForKind(kind, settings)).replace(
      /^\/+|\/+$/g,
      "",
    );
    if (
      normalizedRelativePath === dir ||
      normalizedRelativePath.startsWith(`${dir}/`)
    ) {
      return kind;
    }
  }

  return null;
};

const queryCurrentPageFilePath = async (): Promise<string | null> => {
  const currentPage = await logseq.Editor.getCurrentPage();
  if (!currentPage) return null;

  const pageId = typeof currentPage.id === "number" ? currentPage.id : null;
  if (pageId !== null) {
    try {
      const result = await logseq.DB.datascriptQuery<string | null>(
        `[:find ?path .
          :in $ ?page-id
          :where
          [?page-id :block/file ?file]
          [?file :file/path ?path]]`,
        pageId,
      );
      if (typeof result === "string" && result.length > 0) return result;
    } catch (error) {
      console.warn(
        "[logseq-para-pages] current page file path query by id failed",
        error,
      );
    }
  }

  const pageName =
    typeof currentPage.name === "string"
      ? currentPage.name
      : typeof currentPage.originalName === "string"
        ? currentPage.originalName
        : null;
  if (!pageName) return null;

  try {
    const result = await logseq.DB.datascriptQuery<string | null>(
      `[:find ?path .
        :in $ ?name
        :where
        [?page :block/name ?name]
        [?page :block/file ?file]
        [?file :file/path ?path]]`,
      pageName,
    );
    if (typeof result === "string" && result.length > 0) return result;
  } catch (error) {
    console.warn(
      "[logseq-para-pages] current page file path query by name failed",
      error,
    );
  }

  return null;
};

const inferFromMarkdownFiles = async (
  settings: ParaSettings,
): Promise<ParaKind | null> => {
  const currentPage = await logseq.Editor.getCurrentPage();
  if (!currentPage) return null;

  const originalName =
    typeof currentPage.originalName === "string"
      ? currentPage.originalName
      : typeof currentPage.name === "string"
        ? currentPage.name
        : null;
  if (!originalName) return null;

  const expectedFileName =
    `${pageNameToFileName(originalName)}.md`.toLowerCase();

  try {
    const files = await logseq.Assets.listFilesOfCurrentGraph("md");
    const matchedKinds = files
      .map((file) => file.path)
      .filter((filePath): filePath is string => typeof filePath === "string")
      .filter(
        (filePath) =>
          normalizePath(filePath)
            .toLowerCase()
            .endsWith(`/${expectedFileName}`) ||
          normalizePath(filePath).toLowerCase() === expectedFileName,
      )
      .map((filePath) => kindFromRelativePath(filePath, settings))
      .filter((kind): kind is ParaKind => kind !== null);

    const uniqueKinds = Array.from(new Set(matchedKinds));
    return uniqueKinds.length === 1 ? uniqueKinds[0]! : null;
  } catch (error) {
    console.warn(
      "[logseq-para-pages] current page PARA kind fallback failed",
      error,
    );
    return null;
  }
};

export const inferCurrentParaKind = async (
  graphPath: string,
  settings: ParaSettings,
): Promise<ParaKind | null> => {
  const filePath = await queryCurrentPageFilePath();
  if (filePath) {
    const relativePath = stripGraphPath(filePath, graphPath);
    const kind = kindFromRelativePath(relativePath, settings);
    if (kind) return kind;
  }

  return inferFromMarkdownFiles(settings);
};
