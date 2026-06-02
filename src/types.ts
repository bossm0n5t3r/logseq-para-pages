export type ParaKind = "project" | "area" | "resource" | "archive";

export type ParaSettings = {
  projectsDir: string;
  areasDir: string;
  resourcesDir: string;
  archiveDir: string;
};

export type FsAdapter = {
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  writeFile(path: string, data: string): Promise<void>;
};

export type NodeLikePath = {
  join(...parts: string[]): string;
  resolve(...parts: string[]): string;
};

export type HostApis = {
  doAction(action: unknown[]): Promise<unknown>;
};

export type PageStatus = "created" | "moved" | "existing";

export type CreatedPage = {
  kind: ParaKind;
  pageName: string;
  filePath: string;
  status: PageStatus;
};

export type ParaLink = {
  kind: ParaKind;
  pageName: string;
};
