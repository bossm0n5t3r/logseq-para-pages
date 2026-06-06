import "@logseq/libs";

import { inferCurrentParaKind } from "./src/current-para-kind";
import { createParaFiles, extractGraphPath } from "./src/para-files";
import { normalizePageName, pageNameToLinkName } from "./src/para-links";
import { blockTreeHasMetadata } from "./src/para-metadata";
import { getSettings, SETTINGS_SCHEMA } from "./src/settings";
import type { ParaKind } from "./src/types";

const PARA_KIND_OPTIONS: Array<{ kind: ParaKind; label: string }> = [
  { kind: "project", label: "Project" },
  { kind: "area", label: "Area" },
  { kind: "resource", label: "Resource" },
  { kind: "archive", label: "Archive" },
];

const labelForKind = (kind: ParaKind): string => {
  return (
    PARA_KIND_OPTIONS.find((option) => option.kind === kind)?.label ?? kind
  );
};

const METADATA_INDEX_TIMEOUT_MS = 3000;
const METADATA_INDEX_POLL_INTERVAL_MS = 150;

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const waitForPageMetadataIndexed = async (
  pageName: string,
  timeoutMs = METADATA_INDEX_TIMEOUT_MS,
): Promise<void> => {
  const startedAt = Date.now();
  const linkPageName = pageNameToLinkName(pageName);
  let attempts = 0;
  let lastBlockCount = 0;
  let lastError: unknown = null;

  console.info("[logseq-para-pages] metadata index polling started", {
    pageName: linkPageName,
    timeoutMs,
  });

  while (Date.now() - startedAt < timeoutMs) {
    attempts += 1;

    try {
      const blocks = await logseq.Editor.getPageBlocksTree(linkPageName);
      lastBlockCount = Array.isArray(blocks) ? blocks.length : 0;

      if (Array.isArray(blocks) && blockTreeHasMetadata(blocks)) {
        console.info("[logseq-para-pages] metadata indexed", {
          pageName: linkPageName,
          elapsedMs: Date.now() - startedAt,
          attempts,
          blockCount: lastBlockCount,
        });
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(METADATA_INDEX_POLL_INTERVAL_MS);
  }

  console.warn("[logseq-para-pages] metadata index polling timed out", {
    pageName: linkPageName,
    elapsedMs: Date.now() - startedAt,
    attempts,
    lastBlockCount,
    lastError,
  });
};

const showCreatePagePrompt = async (
  initialKind: ParaKind | null = null,
): Promise<{
  kind: ParaKind;
  pageName: string;
} | null> => {
  const doc = (globalThis as unknown as { document?: any }).document;
  if (!doc?.body) {
    await logseq.UI.showMsg("PARA: Prompt UI is unavailable.", "error");
    return null;
  }

  return new Promise((resolve) => {
    let selectedKind: ParaKind | null = initialKind;

    let keydownHandler: ((event: any) => void) | null = null;

    const cleanup = (result: { kind: ParaKind; pageName: string } | null) => {
      if (keydownHandler) doc.removeEventListener("keydown", keydownHandler);
      doc.body.innerHTML = "";
      void logseq.hideMainUI({ restoreEditingCursor: true });
      resolve(result);
    };

    doc.body.innerHTML = `
      <div id="para-create-page-modal" tabindex="-1" style="font-family: system-ui, sans-serif; box-sizing: border-box; padding: 16px; width: 100%; height: 100%; color: #1f2937; background: white; border: 1px solid #d1d5db; border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,.2); outline: none;">
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">PARA: Create Page</div>
        <div id="para-kind-step">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Project / Area / Resource / Archive 선택 (1-4)</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            ${PARA_KIND_OPTIONS.map(
              ({ kind, label }, index) =>
                `<button data-kind="${kind}" style="padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; background: #f9fafb; cursor: pointer;">${index + 1}. ${label}</button>`,
            ).join("")}
          </div>
        </div>
        <form id="para-name-step" style="display: none;">
          <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 8px;" for="para-page-name">page name 입력</label>
          <div id="para-current-kind" style="display: none; font-size: 12px; color: #2563eb; margin-bottom: 8px;"></div>
          <input id="para-page-name" style="box-sizing: border-box; width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px;" placeholder="foo" />
          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;">
            <button id="para-change-kind" type="button" style="display: none; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; background: white; cursor: pointer;">Change category</button>
            <button id="para-cancel" type="button" style="padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; background: white; cursor: pointer;">Cancel</button>
            <button type="submit" style="padding: 8px 10px; border: 1px solid #2563eb; border-radius: 8px; background: #2563eb; color: white; cursor: pointer;">Create</button>
          </div>
        </form>
      </div>
    `;

    const modal = doc.getElementById("para-create-page-modal");
    const kindStep = doc.getElementById("para-kind-step");
    const nameStep = doc.getElementById("para-name-step");
    const nameInput = doc.getElementById("para-page-name");
    const currentKindLabel = doc.getElementById("para-current-kind");
    const changeKindButton = doc.getElementById("para-change-kind");
    const cancelButton = doc.getElementById("para-cancel");

    const selectKind = (kind: ParaKind) => {
      selectedKind = kind;
      kindStep.style.display = "none";
      nameStep.style.display = "block";
      nameInput.focus();
    };

    if (initialKind) {
      kindStep.style.display = "none";
      nameStep.style.display = "block";
      currentKindLabel.style.display = "block";
      currentKindLabel.textContent = `현재 위치 기반: ${labelForKind(initialKind)}`;
      changeKindButton.style.display = "inline-block";
      setTimeout(() => nameInput.focus(), 0);
    }

    for (const button of Array.from(
      doc.querySelectorAll("[data-kind]"),
    ) as any[]) {
      button.addEventListener("click", () => {
        selectKind(button.getAttribute("data-kind") as ParaKind);
      });
    }

    keydownHandler = (event: any) => {
      if (event.key === "Escape") {
        cleanup(null);
        return;
      }

      if (kindStep.style.display === "none") return;

      const optionIndex = Number(event.key) - 1;
      const option = PARA_KIND_OPTIONS[optionIndex];
      if (!option) return;

      event.preventDefault();
      selectKind(option.kind);
    };
    doc.addEventListener("keydown", keydownHandler);

    changeKindButton.addEventListener("click", () => {
      selectedKind = null;
      currentKindLabel.style.display = "none";
      changeKindButton.style.display = "none";
      nameStep.style.display = "none";
      kindStep.style.display = "block";
      modal.focus();
    });

    cancelButton.addEventListener("click", () => cleanup(null));
    nameStep.addEventListener("submit", (event: any) => {
      event.preventDefault();
      const pageName = normalizePageName(nameInput.value);
      if (!selectedKind || pageName.length === 0) return;
      cleanup({ kind: selectedKind, pageName });
    });

    void logseq.setMainUIInlineStyle({
      position: "fixed",
      zIndex: 9999,
      width: "360px",
      height: "250px",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      background: "transparent",
    });
    void logseq.showMainUI({ autoFocus: true });
    setTimeout(() => modal.focus(), 0);
  });
};

const inferInitialKind = async (): Promise<ParaKind | null> => {
  try {
    const graph = await logseq.App.getCurrentGraph();
    const graphPath = extractGraphPath(graph);
    if (!graphPath) return null;

    return await inferCurrentParaKind(graphPath, getSettings());
  } catch (error) {
    console.warn(
      "[logseq-para-pages] current PARA kind inference failed",
      error,
    );
    return null;
  }
};

const createSingleParaPageFromPrompt = async (): Promise<void> => {
  const result = await showCreatePagePrompt(await inferInitialKind());
  if (!result) return;

  const { kind, pageName } = result;

  try {
    const [createdPage] = await createParaFiles([{ kind, pageName }]);
    await waitForPageMetadataIndexed(pageName);
    await logseq.Editor.restoreEditingCursor();
    await logseq.Editor.insertAtEditingCursor(
      `[[${pageNameToLinkName(pageName)}]]`,
    );

    console.info("[logseq-para-pages] PARA page ready", createdPage);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[logseq-para-pages]", error);
    await logseq.UI.showMsg(`PARA: Create Page failed: ${message}`, "error");
  }
};

const main = (): void => {
  logseq.useSettingsSchema(SETTINGS_SCHEMA);

  logseq.Editor.registerSlashCommand(
    "PARA: Create Page",
    createSingleParaPageFromPrompt,
  );

  console.info("[logseq-para-pages] loaded");
  void logseq.UI.showMsg("PARA Pages plugin loaded.", "success");
};

logseq.ready(main).catch(console.error);
