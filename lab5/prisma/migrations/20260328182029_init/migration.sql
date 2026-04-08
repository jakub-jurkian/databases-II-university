-- CreateEnum
CREATE TYPE "Power" AS ENUM ('flight', 'strength', 'telepathy', 'speed', 'invisibility');

-- CreateEnum
CREATE TYPE "HeroStatus" AS ENUM ('available', 'busy', 'retired');

-- CreateEnum
CREATE TYPE "IncidentLevel" AS ENUM ('low', 'medium', 'critical');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('open', 'assigned', 'resolved');

-- CreateTable
CREATE TABLE "heroes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "power" "Power" NOT NULL,
    "status" "HeroStatus" NOT NULL DEFAULT 'available',
    "missionsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heroes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" SERIAL NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "district" VARCHAR(100),
    "level" "IncidentLevel" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'open',
    "heroId" INTEGER,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_categories" (
    "incidentId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "incident_categories_pkey" PRIMARY KEY ("incidentId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "heroes_name_key" ON "heroes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "heroes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_categories" ADD CONSTRAINT "incident_categories_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_categories" ADD CONSTRAINT "incident_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
