/*
  Warnings:

  - You are about to drop the column `passwordResetTokenExpireseAt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "passwordResetTokenExpireseAt",
ADD COLUMN     "passwordResetTokenExiresAt" TIMESTAMP(3);
