/*
  Warnings:

  - You are about to drop the column `firstname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstname",
DROP COLUMN "lastname",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Farms" (
    "id" CHAR(26) NOT NULL,
    "owner_id" CHAR(26) NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "area" INTEGER NOT NULL,
    "soil_type" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Farms_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Farms" ADD CONSTRAINT "Farms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
