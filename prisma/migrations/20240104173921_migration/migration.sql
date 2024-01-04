-- CreateTable
CREATE TABLE "SocketMessages" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,

    CONSTRAINT "SocketMessages_pkey" PRIMARY KEY ("id")
);
