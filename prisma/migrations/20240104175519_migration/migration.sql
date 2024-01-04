/*
  Warnings:

  - You are about to drop the `SocketMessages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SocketMessages";

-- CreateTable
CREATE TABLE "SocketMessage" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,

    CONSTRAINT "SocketMessage_pkey" PRIMARY KEY ("id")
);
