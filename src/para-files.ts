import { getFileSystemAdapter } from "./fs-adapter";
import { candidateDefaultPagePaths } from "./page-paths";
import { normalizePageName, pageNameToFileName } from "./para-links";
import { dirForKind, getSettings } from "./settings";
import type { CreatedPage, PageStatus, ParaLink } from "./types";

const extractGraphPath = (
  graph: { path?: unknown; url?: unknown } | null,
): string | null => {
  if (!graph) return null;

  if (typeof graph.path === "string" && graph.path.trim().length > 0) {
    return graph.path;
  }

  if (typeof graph.url === "string" && graph.url.startsWith("file://")) {
    return decodeURIComponent(graph.url.replace(/^file:\/\//, ""));
  }

  return null;
};

const makeInitialMarkdown = (): string => {
  return "- \n";
};

const listMarkdownFilesOfCurrentGraph = async (): Promise<string[]> => {
  try {
    const files = await logseq.Assets.listFilesOfCurrentGraph("md");
    return files
      .map((file) => file.path)
      .filter((filePath): filePath is string => typeof filePath === "string");
  } catch (error) {
    console.warn(
      "[logseq-para-pages] listFilesOfCurrentGraph failed; using common candidates only",
      error,
    );
    return [];
  }
};

const findExistingSourcePath = async (
  candidates: string[],
  targetPath: string,
  exists: (path: string) => Promise<boolean>,
): Promise<string | undefined> => {
  for (const candidate of candidates) {
    if (candidate !== targetPath && (await exists(candidate))) return candidate;
  }

  return undefined;
};

export const createParaFiles = async (
  matches: ParaLink[],
): Promise<CreatedPage[]> => {
  const node = getFileSystemAdapter();
  if (!node) {
    throw new Error(
      "File-system access is unavailable. This plugin currently requires Logseq Desktop.",
    );
  }

  const graph = await logseq.App.getCurrentGraph();
  const graphPath = extractGraphPath(graph);
  if (!graphPath) {
    throw new Error("Current graph path could not be resolved.");
  }

  const settings = getSettings();
  const graphMarkdownFiles = await listMarkdownFilesOfCurrentGraph();
  const createdPages: CreatedPage[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const pageName = normalizePageName(match.pageName);
    const fileName = pageNameToFileName(pageName);
    if (fileName.length === 0) continue;

    const dir = dirForKind(match.kind, settings);
    const targetDir = node.path.join(graphPath, dir);
    const filePath = node.path.join(targetDir, `${fileName}.md`);
    const dedupeKey = `${match.kind}:${fileName}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    await node.fs.mkdir(targetDir);

    let exists = await node.fs.exists(filePath);
    console.info("[logseq-para-pages] target check", { filePath, exists });
    let status: PageStatus = "existing";

    if (!exists) {
      const candidates = candidateDefaultPagePaths(
        graphPath,
        match.kind,
        fileName,
        node.path,
        graphMarkdownFiles,
      );
      const sourcePath = await findExistingSourcePath(
        candidates,
        filePath,
        node.fs.exists,
      );

      if (sourcePath) {
        await node.fs.rename(sourcePath, filePath);
        exists = await node.fs.exists(filePath);
        if (!exists) {
          throw new Error(
            `Target file was not moved: ${sourcePath} -> ${filePath}`,
          );
        }
        status = "moved";
        console.info("[logseq-para-pages] moved page file", {
          sourcePath,
          filePath,
        });
      } else {
        await node.fs.writeFile(filePath, makeInitialMarkdown());
        exists = await node.fs.exists(filePath);
        if (!exists) {
          throw new Error(`Target file was not created: ${filePath}`);
        }
        status = "created";
        console.info("[logseq-para-pages] created page file", { filePath });
      }
    }

    createdPages.push({ kind: match.kind, pageName, filePath, status });
  }

  return createdPages;
};
