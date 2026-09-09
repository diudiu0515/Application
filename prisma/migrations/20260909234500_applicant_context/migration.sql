-- AlterTable
ALTER TABLE "Program" ADD COLUMN "mainlandApplicantStatus" TEXT;
ALTER TABLE "Program" ADD COLUMN "mainlandApplicantNotes" TEXT;
ALTER TABLE "Program" ADD COLUMN "mainlandApplicantSource" TEXT;
ALTER TABLE "Program" ADD COLUMN "mainlandLastChecked" DATETIME;
ALTER TABLE "Program" ADD COLUMN "mainlandVerification" TEXT;
ALTER TABLE "Program" ADD COLUMN "internationalApplicationRoute" TEXT;
ALTER TABLE "Program" ADD COLUMN "applicantContextOverride" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LabMember" ADD COLUMN "mainlandChinaBackground" BOOLEAN;
ALTER TABLE "LabMember" ADD COLUMN "mainlandInstitution" TEXT;
ALTER TABLE "LabMember" ADD COLUMN "mainlandEvidenceStatus" TEXT;
ALTER TABLE "LabMember" ADD COLUMN "mainlandSourceUrl" TEXT;
