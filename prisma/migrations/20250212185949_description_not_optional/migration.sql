/*
  Warnings:

  - Made the column `description` on table `FavoriteList` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FavoriteList" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE TEXT;
