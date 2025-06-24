-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Department" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "head_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Department_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Department" ("created_at", "description", "id", "name", "updated_at") SELECT "created_at", "description", "id", "name", "updated_at" FROM "Department";
DROP TABLE "Department";
ALTER TABLE "new_Department" RENAME TO "Department";
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birth_date" DATETIME NOT NULL,
    "national_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hire_date" DATETIME NOT NULL,
    "job_title" TEXT NOT NULL,
    "department_id" INTEGER,
    "employment_type" TEXT NOT NULL,
    "salaire_brut" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "photo" TEXT,
    "role" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "managerId" TEXT,
    CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("address", "birth_date", "created_at", "deleted_at", "department_id", "email", "employment_type", "first_name", "gender", "hire_date", "id", "job_title", "last_name", "managerId", "national_id", "password", "phone_number", "photo", "role", "salaire_brut", "status", "updated_at") SELECT "address", "birth_date", "created_at", "deleted_at", "department_id", "email", "employment_type", "first_name", "gender", "hire_date", "id", "job_title", "last_name", "managerId", "national_id", "password", "phone_number", "photo", "role", "salaire_brut", "status", "updated_at" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_national_id_key" ON "User"("national_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
