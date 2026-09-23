-- Preserve the existing pack name while replacing the old presentation fields.
ALTER TABLE "Pack" ADD COLUMN "nombre" TEXT;
ALTER TABLE "Pack" ADD COLUMN "comunidad" TEXT;
ALTER TABLE "Pack" ADD COLUMN "ciudad" TEXT;
ALTER TABLE "Pack" ADD COLUMN "administracion" TEXT;
ALTER TABLE "Pack" ADD COLUMN "check1" TEXT;
ALTER TABLE "Pack" ADD COLUMN "check2" TEXT;
ALTER TABLE "Pack" ADD COLUMN "check3" TEXT;

UPDATE "Pack" SET "nombre" = "name";

ALTER TABLE "Pack" ALTER COLUMN "nombre" SET NOT NULL;
ALTER TABLE "Pack" DROP COLUMN "name";
ALTER TABLE "Pack" DROP COLUMN "description";
