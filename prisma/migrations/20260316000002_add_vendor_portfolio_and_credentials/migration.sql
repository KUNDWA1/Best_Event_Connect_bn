-- AlterTable
ALTER TABLE "Vendor"
ADD COLUMN     "portfolioImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "certifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "awards" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];