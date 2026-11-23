-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMIN', 'LEITOR');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "perfil" "PerfilUsuario" NOT NULL DEFAULT 'ADMIN',
ALTER COLUMN "senha" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Usuario_perfil_idx" ON "Usuario"("perfil");
