/*
  Warnings:

  - A unique constraint covering the columns `[shipId,year]` on the table `ShipCompliance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ShipCompliance_shipId_year_key" ON "ShipCompliance"("shipId", "year");
