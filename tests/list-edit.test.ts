import { describe, expect, it } from "vitest";
import { openAfterDelete, openAfterMove, swap } from "@/lib/list-edit";

describe("swap", () => {
  it("exchanges two entries without touching the rest", () => {
    expect(swap(["a", "b", "c", "d"], 1, 2)).toEqual(["a", "c", "b", "d"]);
  });

  it("returns the list unchanged when the target is out of range", () => {
    expect(swap(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(swap(["a", "b"], 1, 2)).toEqual(["a", "b"]);
  });

  it("does not mutate the input", () => {
    const input = ["a", "b"];
    swap(input, 0, 1);
    expect(input).toEqual(["a", "b"]);
  });
});

describe("openAfterMove", () => {
  // The bug this exists to prevent: open a row, move that row, and the editor
  // stays pinned to the old index — silently editing whichever row slid into it.
  it("follows the row that was moved", () => {
    expect(openAfterMove(2, 2, 1)).toBe(1);
  });

  it("follows the row that was displaced by the move", () => {
    expect(openAfterMove(1, 2, 1)).toBe(2);
  });

  it("leaves an unrelated open row alone", () => {
    expect(openAfterMove(4, 2, 1)).toBe(4);
  });

  it("stays closed when nothing is open", () => {
    expect(openAfterMove(null, 2, 1)).toBeNull();
  });
});

describe("openAfterDelete", () => {
  it("closes the editor when the open row is the one deleted", () => {
    expect(openAfterDelete(2, 2)).toBeNull();
  });

  it("shifts down when a row above the open one is deleted", () => {
    expect(openAfterDelete(4, 1)).toBe(3);
  });

  it("leaves the index alone when a row below the open one is deleted", () => {
    expect(openAfterDelete(1, 4)).toBe(1);
  });

  it("stays closed when nothing is open", () => {
    expect(openAfterDelete(null, 0)).toBeNull();
  });
});
