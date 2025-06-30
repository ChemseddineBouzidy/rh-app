-- CreateTable
CREATE TABLE "leave_balances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "leave_type_id" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "leave_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_user_id_leave_type_id_key" ON "leave_balances"("user_id", "leave_type_id");
