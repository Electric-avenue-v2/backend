-- DropForeignKey
ALTER TABLE "public"."products" DROP CONSTRAINT "products_seller_id_fkey";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
