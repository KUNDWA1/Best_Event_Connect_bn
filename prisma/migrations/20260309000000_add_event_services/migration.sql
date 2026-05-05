-- CreateTable "EventService"
CREATE TABLE "EventService" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "budget" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventService_eventId_idx" ON "EventService"("eventId");

-- AddForeignKey
ALTER TABLE "EventService" ADD CONSTRAINT "EventService_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
