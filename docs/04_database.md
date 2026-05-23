# Alphabet-SMIS: Database and Data Models

## 1. Database Technology

Alphabet-SMIS relies on **MySQL**, managed via the **Prisma ORM**.

**Why MySQL?** 
A school management system deals with highly structured, inherently relational data. A `Student` belongs to a `Class`, makes `Payments`, and has many `Results`. A relational database enforces referential integrity through foreign keys, ensuring that if a `Class` is deleted, the system knows exactly how to handle the orphaned `Students`. MySQL is robust, highly available, and an industry standard for financial and academic record-keeping.

**Why Prisma?**
Prisma provides a declarative schema definition language that generates a fully type-safe TypeScript client. It manages database migrations seamlessly and protects against SQL injection by default.

---

## 2. Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o| Student : "has one"
    User ||--o| Teacher : "has one"
    User ||--o| AdminProfile : "has one"
    User ||--o| HostelOwner : "has one"
    
    Class ||--o{ Student : "contains"
    
    HostelOwner ||--o{ Hostel : "owns"
    Hostel ||--o{ Student : "houses"
    
    Student ||--o{ Payment : "makes"
    Student ||--o{ Result : "achieves"
    Student ||--o{ TermAssessmentScore : "scores"
    Student ||--o{ Attendance : "logs"

    %% Defining attributes for clarity on core models
    User {
        Int id PK
        String email UK
        Enum role
    }
    Student {
        Int id PK
        String student_id UK
        Int classId FK
        Int userId FK
    }
    Class {
        Int id PK
        String class_id UK
        String name
        Json subjects
    }
    Result {
        Int id PK
        Int studentId FK
        String subjectKey
        Float score
    }
```

---

## 3. Data Model Definitions

### Core Identity & Access
- **`User`**
  - *Purpose:* The base identity table for authenticating into the system.
  - *Fields:* `id` (PK), `email` (Unique login), `passwordHash` (Bcrypt string), `role` (Enum: ADMIN, TEACHER, STUDENT, HOSTEL_OWNER), `hashedRefreshToken`.
  - *Relationships:* 1:1 with `Student`, `Teacher`, `AdminProfile`, `HostelOwner`.

- **`AdminProfile`**
  - *Purpose:* Stores extended information for administrators.
  - *Fields:* `firstName`, `lastName`, `phone`, `permissions` (JSON array of specific access rights).
  - *Relationships:* Belongs to `User`.

### Academic Domain
- **`Student`**
  - *Purpose:* The central record for a pupil.
  - *Fields:* `student_id` (Unique human-readable ID), `firstName`, `lastName`, `dob`, `scholarType` (e.g., Day, Boarding), `guardianName`, `classHistory` (Text blob tracking promotions).
  - *Indexes:* `student_id`, `classId`, `hostelId`, `[firstName, lastName]`.
  - *Relationships:* Belongs to `User`, `Class`, `Hostel`. Has many `Payments`, `Results`, `Attendances`.

- **`Teacher`**
  - *Purpose:* Staff records for educators.
  - *Fields:* `teacher_id`, `firstName`, `lastName`, `subjects` (JSON), `classes` (JSON).
  - *Relationships:* Belongs to `User`. Note: Class assignments are currently stored as JSON rather than explicit join tables for rapid prototyping.

- **`Class`**
  - *Purpose:* Represents a physical or logical grouping of students.
  - *Fields:* `class_id`, `name`, `capacity`, `subjects` (JSON of offered subjects), `timetable` (JSON schedule matrix).
  - *Indexes:* `class_id`, `name`.
  - *Relationships:* Has many `Students`.

- **`Subject`**
  - *Purpose:* Master catalog of teachable courses.
  - *Fields:* `subject_code`, `name`, `department`.

- **`Result` & `TermAssessmentScore` & `GradeConfig`**
  - *Purpose:* The grading engine. `GradeConfig` dictates how a class is graded. `TermAssessmentScore` holds individual test marks. `Result` holds the aggregated final score for a subject in a term.
  - *Indexes:* Highly indexed composite unique keys (e.g., `[studentId, subjectKey, term, academicYear]`) to prevent duplicate grade entries.

- **`Attendance`**
  - *Purpose:* Daily student presence logging.
  - *Fields:* `date`, `status` (present/absent/late).
  - *Relationships:* Belongs to `Student`.

### Enrollment & Finance
- **`Application`**
  - *Purpose:* Temporary holding table for prospective students before they are approved and promoted to the `Student` table.
  - *Fields:* Form data, `status` (PENDING, APPROVED, REJECTED).

- **`Payment` & `FeeStructure` & `Expense`**
  - *Purpose:* Tracks money coming in (Payments) against expected targets (FeeStructure) and money going out (Expense).
  - *Fields (Payment):* `amount`, `method`, `reference`, `status`.

### Boarding
- **`Hostel` & `HostelOwner`**
  - *Purpose:* Manages residential capacity.
  - *Relationships:* A `HostelOwner` owns many `Hostels`. A `Hostel` houses many `Students`.

### Communication
- **`SchoolFeed` & `SchoolGallery`**
  - *Purpose:* Stores metadata and text/image URLs for the public campus explorer and authenticated dashboards.

---

## 4. Migration and Seeding Strategy

- **Migration Strategy:** The project relies on Prisma Migrate (`npx prisma migrate dev`). As the `schema.prisma` file is modified, Prisma generates deterministic SQL migration files. These migrations ensure that the production schema can be safely upgraded without data loss.
- **Seeding:** A seed script is configured (`prisma/seed.ts`). This script is essential for setting up the initial Super Admin account and injecting default System Settings, Subjects, and a base Fee Structure upon initial deployment.

---

## 5. Audit Trails, Soft Deletes, and Conventions

- **Timestamps:** Every model includes `createdAt` (`@default(now())`) and `updatedAt` (`@updatedAt`). This provides a basic audit trail for when a record was instantiated and last modified.
- **Cascade Deletions:** The system relies heavily on `onDelete: Cascade`. For example, deleting a `User` cascades down to delete the attached `Student` profile, which in turn cascades down to delete their `Payments` and `Results`.
  - *Warning:* While convenient, extreme care must be taken by Administrators. The database does not currently implement a "Soft Delete" (e.g., `deletedAt: DateTime?`) pattern. Deletions are permanent.

---

## 6. Common Query Patterns and Optimizations

1. **Fetching a Student's Dashboard:** 
   - *Query:* Select Student with relation to Class, including Attendances and Results filtered by the current Academic Year.
   - *Optimization:* Indexes on `[studentId]` and `[student_id]` ensure fast lookups, while Prisma's `include` feature handles the relational joins efficiently.
2. **Class Roster Aggregation:**
   - *Query:* Finding all students in a specific class for the Teacher to input grades.
   - *Optimization:* The `classId` foreign key on the `Student` model is explicitly indexed (`@@index([classId])`) to prevent full table scans when rendering a 50-student class roster.
3. **Preventing Duplicate Grades:**
   - *Pattern:* The backend uses `upsert` (Update or Insert) based on composite unique keys (e.g., `@@unique([studentId, subjectKey, term, academicYear])`). This delegates the concurrency constraint to the database, ensuring no student can accidentally receive two final results for the same subject in the same term.
