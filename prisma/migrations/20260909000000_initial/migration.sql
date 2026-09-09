-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "department" TEXT,
    "degree" TEXT,
    "cycle" TEXT NOT NULL,
    "target" TEXT,
    "statement" TEXT,
    "gpa" REAL,
    "expectedGraduation" TEXT,
    "educationNotes" TEXT,
    "researchExperienceSummary" TEXT,
    "focus" JSONB,
    "skills" JSONB,
    "keywords" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ResearchProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "problem" TEXT,
    "motivation" TEXT,
    "method" TEXT,
    "contribution" TEXT,
    "result" TEXT,
    "researchInsight" TEXT,
    "futureDirection" TEXT,
    "keywords" JSONB NOT NULL,
    CONSTRAINT "ResearchProject_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "year" INTEGER,
    "status" TEXT NOT NULL,
    "authorOrder" INTEGER,
    "coauthors" JSONB,
    "submissionDeadline" DATETIME,
    CONSTRAINT "Publication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'USA'
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degree" TEXT NOT NULL DEFAULT 'PhD',
    "cycle" TEXT NOT NULL,
    "deadline" DATETIME,
    "priorityDeadline" DATETIME,
    "portalUrl" TEXT,
    "fee" REAL,
    "requirements" JSONB,
    "internationalRules" JSONB,
    "funding" JSONB,
    "admissionModel" TEXT,
    "programMetrics" JSONB,
    CONSTRAINT "Program_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    CONSTRAINT "Ranking_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "programId" TEXT,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "email" TEXT,
    "websites" JSONB,
    "interests" JSONB NOT NULL,
    "researchKeywords" JSONB,
    "researchData" JSONB,
    "recruiting" TEXT NOT NULL DEFAULT 'unknown',
    "consideration" TEXT NOT NULL DEFAULT 'not_reviewed',
    "whyConsider" TEXT,
    "concerns" TEXT,
    "decisionRationale" TEXT,
    "recruitingSource" TEXT,
    "recruitingCheckedAt" DATETIME,
    "completionScore" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Faculty_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Faculty_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacultyProjectMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "dimensions" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "pitch" TEXT,
    CONSTRAINT "FacultyProjectMatch_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FacultyProjectMatch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" JSONB,
    "venue" TEXT,
    "year" INTEGER,
    "url" TEXT,
    "abstract" TEXT,
    "importance" TEXT,
    "readingStatus" TEXT NOT NULL DEFAULT 'unread',
    "whyRelevant" TEXT,
    "potentialGap" TEXT,
    "notes" TEXT,
    CONSTRAINT "Paper_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "education" JSONB,
    "isTsinghuaAlumni" BOOLEAN,
    "tsinghuaDetails" JSONB,
    "publicContacts" JSONB,
    "sourceUrl" TEXT,
    "sourceType" TEXT,
    "lastVerifiedAt" DATETIME,
    "contactCandidateScore" INTEGER,
    "whyUseful" TEXT,
    CONSTRAINT "LabMember_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SchoolPriority" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "dimensions" JSONB NOT NULL,
    "whyApply" TEXT,
    "risks" TEXT,
    CONSTRAINT "SchoolPriority_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deadline" DATETIME,
    "notes" TEXT,
    CONSTRAINT "Application_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApplicationTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deadline" DATETIME,
    "completedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "ApplicationTask_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SOPDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "wordLimit" INTEGER,
    "sections" JSONB NOT NULL,
    "facultyMentions" JSONB,
    CONSTRAINT "SOPDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recommender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "relationship" TEXT,
    "projects" JSONB,
    "strengthEstimate" TEXT
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "recommenderId" TEXT NOT NULL,
    "deadline" DATETIME,
    "requestedAt" DATETIME,
    "submittedAt" DATETIME,
    "materialsSent" JSONB,
    CONSTRAINT "Recommendation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recommendation_recommenderId_fkey" FOREIGN KEY ("recommenderId") REFERENCES "Recommender" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacultyContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "subject" TEXT,
    "draft" TEXT,
    "facultyReference" TEXT,
    "relatedProjectId" TEXT,
    "paperCited" TEXT,
    "sentAt" DATETIME,
    "repliedAt" DATETIME,
    "followUpAt" DATETIME,
    "responseType" TEXT,
    "responseSummary" TEXT,
    CONSTRAINT "FacultyContact_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacultyChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "FacultyChecklistItem_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lastChecked" DATETIME NOT NULL,
    "confidence" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT,
    "status" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL,
    "notes" TEXT,
    CONSTRAINT "VerificationRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT,
    "sourceId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rawClaim" TEXT NOT NULL,
    "reliability" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "postedAt" DATETIME,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceClaim_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EvidenceClaim_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacultyTimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "at" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "sourceId" TEXT,
    CONSTRAINT "FacultyTimelineEvent_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "testDate" DATETIME,
    "scores" JSONB NOT NULL,
    "targetScore" REAL
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "facultyId" TEXT,
    "date" DATETIME NOT NULL,
    "format" TEXT,
    "duration" INTEGER,
    "preparation" JSONB,
    "notes" JSONB,
    CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "advisor" TEXT,
    "dimensions" JSONB NOT NULL,
    "weights" JSONB NOT NULL,
    "score" REAL,
    "funding" JSONB,
    CONSTRAINT "Offer_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CostItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimated" REAL,
    "actual" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    CONSTRAINT "CostItem_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CvItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    CONSTRAINT "CvItem_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SummerResearchOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "school" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "host" TEXT,
    "eligibility" TEXT,
    "internationalStatus" TEXT NOT NULL,
    "applicationRoute" TEXT,
    "deadline" DATETIME,
    "cycle" TEXT,
    "duration" TEXT,
    "funding" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "academicFit" INTEGER NOT NULL DEFAULT 0,
    "sourceUrl" TEXT,
    "lastChecked" DATETIME,
    "verification" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "DeadlineRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "school" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT
);

-- CreateTable
CREATE TABLE "AiTrace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "outputEntityId" TEXT,
    "sourceEntityIds" JSONB NOT NULL,
    "content" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ChangeEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "detail" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "FacultyProjectMatch_facultyId_projectId_key" ON "FacultyProjectMatch"("facultyId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolPriority_schoolId_cycle_key" ON "SchoolPriority"("schoolId", "cycle");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyChecklistItem_facultyId_key_key" ON "FacultyChecklistItem"("facultyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
