/*
  Warnings:

  - You are about to drop the column `itemType` on the `SocketMessage` table. All the data in the column will be lost.
  - Added the required column `message` to the `SocketMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SocketMessage" DROP COLUMN "itemType",
ADD COLUMN     "message" TEXT NOT NULL;
