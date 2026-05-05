-- CreateTable
CREATE TABLE "VendorServicePackage" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorServicePackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorServicePackage_vendorId_idx" ON "VendorServicePackage"("vendorId");

-- AddForeignKey
ALTER TABLE "VendorServicePackage" ADD CONSTRAINT "VendorServicePackage_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
