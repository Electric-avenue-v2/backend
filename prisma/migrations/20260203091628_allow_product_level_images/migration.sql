-- DropForeignKey
ALTER TABLE "public"."product_attribute_values" DROP CONSTRAINT "product_attribute_values_attribute_value_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."variant_attribute_values" DROP CONSTRAINT "variant_attribute_values_attribute_value_id_fkey";

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "product_id" TEXT,
ALTER COLUMN "product_variant_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
