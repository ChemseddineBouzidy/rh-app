/*
  Warnings:

  - You are about to alter the column `remuneration` on the `leave_types` table. The data in that column could be lost. The data in that column will be cast from `Boolean` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_leave_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "annual_quota" INTEGER NOT NULL,
    "remuneration" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_leave_types" ("annual_quota", "created_at", "description", "id", "name", "remuneration", "updated_at") SELECT "annual_quota", "created_at", "description", "id", "name", "remuneration", "updated_at" FROM "leave_types";
DROP TABLE "leave_types";
ALTER TABLE "new_leave_types" RENAME TO "leave_types";
CREATE UNIQUE INDEX "leave_types_name_key" ON "leave_types"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
