/*
  Warnings:

  - You are about to drop the column `pictureId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `Picture` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_pictureId_fkey";

-- DropIndex
DROP INDEX "Message_pictureId_key";

-- DropIndex
DROP INDEX "Picture_messageId_key";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "pictureId",
ADD COLUMN     "picture" TEXT;

-- AlterTable
ALTER TABLE "Picture" DROP COLUMN "messageId";
