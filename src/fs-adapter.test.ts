import { afterEach, describe, expect, mock, test } from "bun:test";

import { getFileSystemAdapter } from "./fs-adapter";

const GLOBAL_KEYS = ["require", "top", "parent", "apis", "api"] as const;
type GlobalKey = (typeof GLOBAL_KEYS)[number];
const originalDescriptors = Object.fromEntries(
  GLOBAL_KEYS.map((key) => [
    key,
    Object.getOwnPropertyDescriptor(globalThis, key),
  ]),
) as Record<GlobalKey, PropertyDescriptor | undefined>;

afterEach(() => {
  for (const key of GLOBAL_KEYS) {
    const descriptor = originalDescriptors[key];
    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor);
    } else {
      Reflect.deleteProperty(globalThis, key);
    }
  }
});

describe("getFileSystemAdapter", () => {
  test("uses the iframe host API when parent Window properties are cross-origin", async () => {
    const blockedWindow = {};
    for (const key of ["require", "apis"] as const) {
      Object.defineProperty(blockedWindow, key, {
        configurable: true,
        get() {
          throw new DOMException(
            `Blocked cross-origin access to ${key}`,
            "SecurityError",
          );
        },
      });
    }

    const doAction = mock(async (action: unknown[]) => {
      if (action[0] === "readFile") return "para:: project\n";
      throw new Error(`Unexpected host action: ${String(action[0])}`);
    });

    Object.defineProperties(globalThis, {
      require: { configurable: true, value: undefined },
      top: { configurable: true, value: blockedWindow },
      parent: { configurable: true, value: blockedWindow },
      apis: { configurable: true, value: { doAction } },
    });

    const adapter = getFileSystemAdapter();
    expect(adapter).not.toBeNull();
    if (!adapter) throw new Error("Expected a host file-system adapter");

    await expect(adapter.fs.readFile("/graph/project.md")).resolves.toBe(
      "para:: project\n",
    );
    expect(doAction).toHaveBeenCalledWith(["readFile", "/graph/project.md"]);
  });
});
