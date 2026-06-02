import type { ParaKind, ParaLink } from "./types";

export const PARA_LINK_RE =
  /\[\[(project|area|resource|archive)\/([^\]\n]+?)\]\]/g;

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

const isFenceLine = (line: string): boolean => {
  return line.trimStart().startsWith("```");
};

const replaceOutsideInlineCode = (
  line: string,
  replacer: (segment: string) => string,
): string => {
  return line
    .split(/(`[^`]*`)/g)
    .map((segment) =>
      segment.startsWith("`") && segment.endsWith("`")
        ? segment
        : replacer(segment),
    )
    .join("");
};

const mapOutsideCode = (
  content: string,
  mapper: (segment: string) => string,
): string => {
  let inFence = false;

  return content
    .split(/(\n)/)
    .map((part) => {
      if (part === "\n") return part;

      if (isFenceLine(part)) {
        inFence = !inFence;
        return part;
      }

      if (inFence) return part;
      return replaceOutsideInlineCode(part, mapper);
    })
    .join("");
};

export const findParaLinks = (content: string): ParaLink[] => {
  const matches: ParaLink[] = [];

  mapOutsideCode(content, (segment) => {
    for (const match of segment.matchAll(PARA_LINK_RE)) {
      const kind = match[1] as ParaKind | undefined;
      const pageName = match[2];
      if (!kind || !pageName) continue;
      matches.push({ kind, pageName });
    }

    return segment;
  });

  return matches;
};

export const normalizeParaLinks = (content: string): string => {
  return mapOutsideCode(content, (segment) => {
    return segment.replace(
      PARA_LINK_RE,
      (_full, _kind: ParaKind, pageName: string) => {
        return `[[${pageNameToLinkName(pageName)}]]`;
      },
    );
  });
};
