import type { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
import type { ParaKind, ParaSettings } from "./types";

type ParaKindConfig = {
  settingKey: keyof Pick<
    ParaSettings,
    "projectsDir" | "areasDir" | "resourcesDir" | "archiveDir"
  >;
  defaultDir: string;
  title: string;
  description: string;
};

export const PARA_KIND_CONFIG = {
  project: {
    settingKey: "projectsDir",
    defaultDir: "01-projects",
    title: "Projects directory",
    description: "Directory used for [[project/page-name]] links.",
  },
  area: {
    settingKey: "areasDir",
    defaultDir: "02-areas",
    title: "Areas directory",
    description: "Directory used for [[area/page-name]] links.",
  },
  resource: {
    settingKey: "resourcesDir",
    defaultDir: "03-resources",
    title: "Resources directory",
    description: "Directory used for [[resource/page-name]] links.",
  },
  archive: {
    settingKey: "archiveDir",
    defaultDir: "04-archive",
    title: "Archive directory",
    description: "Directory used for [[archive/page-name]] links.",
  },
} satisfies Record<ParaKind, ParaKindConfig>;

export const DEFAULT_SETTINGS: ParaSettings = {
  projectsDir: PARA_KIND_CONFIG.project.defaultDir,
  areasDir: PARA_KIND_CONFIG.area.defaultDir,
  resourcesDir: PARA_KIND_CONFIG.resource.defaultDir,
  archiveDir: PARA_KIND_CONFIG.archive.defaultDir,
};

const PARA_KIND_SETTINGS_SCHEMA: SettingSchemaDesc[] = Object.values(
  PARA_KIND_CONFIG,
).map((config) => ({
  key: config.settingKey,
  type: "string",
  default: config.defaultDir,
  title: config.title,
  description: config.description,
}));

export const SETTINGS_SCHEMA: SettingSchemaDesc[] = PARA_KIND_SETTINGS_SCHEMA;

export const normalizeConfiguredDir = (
  value: unknown,
  fallback: string,
): string => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  return trimmed.length > 0 ? trimmed : fallback;
};

export const getSettings = (): ParaSettings => {
  const settings = (logseq.settings ?? {}) as Partial<ParaSettings>;

  return {
    projectsDir: normalizeConfiguredDir(
      settings.projectsDir,
      DEFAULT_SETTINGS.projectsDir,
    ),
    areasDir: normalizeConfiguredDir(
      settings.areasDir,
      DEFAULT_SETTINGS.areasDir,
    ),
    resourcesDir: normalizeConfiguredDir(
      settings.resourcesDir,
      DEFAULT_SETTINGS.resourcesDir,
    ),
    archiveDir: normalizeConfiguredDir(
      settings.archiveDir,
      DEFAULT_SETTINGS.archiveDir,
    ),
  };
};

export const dirForKind = (kind: ParaKind, settings: ParaSettings): string => {
  return settings[PARA_KIND_CONFIG[kind].settingKey];
};
