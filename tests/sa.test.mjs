import test from "node:test";
import assert from "node:assert/strict";
import { inventory, selectInventory } from "../src/sa.mjs";
test("SA stock uses current responsible account and 60-day window", () => {
  assert(
    selectInventory().every(
      (l) => l.assigned === "Service Account" && l.created >= "2026-09-25",
    ),
  );
});
test("Project filter scopes stock and purchases", () => {
  for (const kind of ["stock", "purchases", "incoming"])
    assert(selectInventory("Север", kind).every((l) => l.project === "Север"));
});
test("HH belongs to NKI and IDs do not duplicate", () => {
  assert(
    inventory
      .filter((l) => l.source === "HH")
      .every((l) => l.category === "НКИ"),
  );
  assert.equal(new Set(inventory.map((l) => l.id)).size, inventory.length);
});
