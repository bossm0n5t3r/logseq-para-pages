import type { NodeLikePath, ParaKind } from "./types";

export const toAbsoluteGraphPath = (
  graphPath: string,
  maybeRelativePath: string,
  nodePath: NodeLikePath,
): string => {
  if (
    maybeRelativePath.startsWith("/") ||
    /^[A-Za-z]:[\\/]/.test(maybeRelativePath)
  )
    return maybeRelativePath;
  return nodePath.join(graphPath, maybeRelativePath);
};

export const candidateDefaultPagePaths = (
  graphPath: string,
  kind: ParaKind,
  fileName: string,
  nodePath: NodeLikePath,
  graphMarkdownFiles: string[],
): string[] => {
  // Logseq usually creates pages under graph/pages, but the exact file name can
  // differ by version and namespace handling. Try common paths first, then use
  // Logseq's known Markdown files and pick matching basenames.
  const encoded = encodeURIComponent(fileName);
  const common = [
    nodePath.join(graphPath, "pages", `${fileName}.md`),
    nodePath.join(graphPath, "pages", kind, `${fileName}.md`),
    nodePath.join(graphPath, "pages", `${kind}___${fileName}.md`),
    nodePath.join(graphPath, "pages", `${kind}%2F${encoded}.md`),
    nodePath.join(graphPath, `${fileName}.md`),
  ];

  const matchingFiles = graphMarkdownFiles
    .filter((filePath) => {
      const normalized = filePath.replace(/\\/g, "/");
      const lower = normalized.toLowerCase();
      return (
        lower.endsWith(`/pages/${fileName.toLowerCase()}.md`) ||
        lower.endsWith(`/pages/${kind}/${fileName.toLowerCase()}.md`) ||
        lower.endsWith(`/pages/${kind}___${fileName.toLowerCase()}.md`) ||
        lower.endsWith(`/pages/${kind}%2f${encoded.toLowerCase()}.md`) ||
        lower === `pages/${fileName.toLowerCase()}.md` ||
        lower === `pages/${kind}/${fileName.toLowerCase()}.md` ||
        lower === `pages/${kind}___${fileName.toLowerCase()}.md` ||
        lower === `pages/${kind}%2f${encoded.toLowerCase()}.md`
      );
    })
    .map((filePath) => toAbsoluteGraphPath(graphPath, filePath, nodePath));

  return [...common, ...matchingFiles];
};
