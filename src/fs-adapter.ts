import type { FsAdapter, HostApis, NodeLikePath } from "./types";

type FileSystemAdapter = { fs: FsAdapter; path: NodeLikePath };

const browserPath: NodeLikePath = {
  join(...parts: string[]): string {
    const joined = parts
      .filter((part) => typeof part === "string" && part.length > 0)
      .join("/")
      .replace(/\/+/g, "/");
    return joined.replace(/([^:])\/+/g, "$1/");
  },
};

const getRequireFunction = (): ((name: string) => unknown) | null => {
  const host = globalThis as typeof globalThis & {
    top?: typeof globalThis;
    parent?: typeof globalThis;
    require?: (name: string) => unknown;
  };
  const candidates = [host, host.top, host.parent] as Array<
    | (typeof globalThis & { require?: (name: string) => unknown })
    | null
    | undefined
  >;

  for (const candidate of candidates) {
    if (typeof candidate?.require === "function") return candidate.require;
  }

  return null;
};

const createNodeFileSystemAdapter = (
  requireFn: (name: string) => unknown,
): FileSystemAdapter => {
  const fs = requireFn("fs") as {
    existsSync(path: string): boolean;
    mkdirSync(path: string, opts?: { recursive?: boolean }): void;
    renameSync(oldPath: string, newPath: string): void;
    readFileSync(path: string, opts?: { encoding?: string }): string;
    writeFileSync(
      path: string,
      data: string,
      opts?: { encoding?: string; flag?: string },
    ): void;
  };

  return {
    fs: {
      exists: async (path) => fs.existsSync(path),
      mkdir: async (path) => fs.mkdirSync(path, { recursive: true }),
      rename: async (oldPath, newPath) => fs.renameSync(oldPath, newPath),
      readFile: async (path) => fs.readFileSync(path, { encoding: "utf8" }),
      writeFile: async (path, data) =>
        fs.writeFileSync(path, data, { encoding: "utf8", flag: "wx" }),
      overwriteFile: async (path, data) =>
        fs.writeFileSync(path, data, { encoding: "utf8" }),
    },
    path: requireFn("path") as NodeLikePath,
  };
};

const isDirectoryReadError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("EISDIR") ||
    message.includes("illegal operation on a directory")
  );
};

const tryHostActions = async (
  apis: HostApis,
  actions: unknown[][],
): Promise<unknown> => {
  let lastError: unknown = null;
  for (const action of actions) {
    try {
      return await apis.doAction(action);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

const createHostFileSystemAdapter = (apis: HostApis): FileSystemAdapter => {
  return {
    fs: {
      exists: async (path) => {
        // Use readFile instead of stat for file existence. Some Logseq builds
        // return a truthy stat-like value even when the file path is not present.
        try {
          const content = await apis.doAction(["readFile", path]);
          return content !== null && content !== undefined;
        } catch (error) {
          // If the target path is a directory, readFile throws EISDIR. Treat it
          // as existing to avoid repeated native write error toasts.
          return isDirectoryReadError(error);
        }
      },
      mkdir: async (path) => {
        await tryHostActions(apis, [
          ["mkdir-recur", path],
          ["mkdir", path],
        ]);
      },
      rename: async (oldPath, newPath) => {
        await apis.doAction(["rename", oldPath, newPath]);
      },
      readFile: async (path) => {
        const content = await apis.doAction(["readFile", path]);
        return typeof content === "string" ? content : String(content ?? "");
      },
      writeFile: async (path, data) => {
        // Logseq's electron handler signature is:
        // ['writeFile', repo, path, content]
        await apis.doAction(["writeFile", "", path, data]);
      },
      overwriteFile: async (path, data) => {
        await apis.doAction(["writeFile", "", path, data]);
      },
    },
    path: browserPath,
  };
};

const getHostApis = (): HostApis | null => {
  const host = globalThis as typeof globalThis & {
    top?: typeof globalThis & { apis?: HostApis };
    parent?: typeof globalThis & { apis?: HostApis };
    apis?: HostApis;
  };
  const candidates = [host.apis, host.top?.apis, host.parent?.apis];
  return (
    candidates.find(
      (apis): apis is HostApis => typeof apis?.doAction === "function",
    ) ?? null
  );
};

export const getFileSystemAdapter = (): FileSystemAdapter | null => {
  const requireFn = getRequireFunction();
  if (requireFn) {
    try {
      return createNodeFileSystemAdapter(requireFn);
    } catch {
      // Fall back to Logseq host APIs below.
    }
  }

  const apis = getHostApis();
  return apis ? createHostFileSystemAdapter(apis) : null;
};
