/*
  Warnings:

  - The primary key for the `category_attributes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `attributeId` on the `category_attributes` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `category_attributes` table. All the data in the column will be lost.
  - Added the required column `attribute_id` to the `category_attributes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `category_attributes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."category_attributes" DROP CONSTRAINT "category_attributes_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."category_attributes" DROP CONSTRAINT "category_attributes_categoryId_fkey";

-- AlterTable
ALTER TABLE "category_attributes" DROP CONSTRAINT "category_attributes_pkey",
DROP COLUMN "attributeId",
DROP COLUMN "categoryId",
ADD COLUMN     "attribute_id" TEXT NOT NULL,
ADD COLUMN     "category_id" TEXT NOT NULL,
ADD CONSTRAINT "category_attributes_pkey" PRIMARY KEY ("category_id", "attribute_id");

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
