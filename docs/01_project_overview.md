# Alphabet-SMIS: Project Overview

## 1. System Overview and Problem Statement

**Alphabet-SMIS** (School Management Information System) is a comprehensive, centralized platform designed to digitize, streamline, and optimize the day-to-day operations of an educational institution. 

**What problem it solves:**
Traditional school management often relies on fragmented systems—spreadsheets for grades, paper for attendance, disparate accounting software for fees, and separate communication channels for announcements. This fragmentation leads to data silos, administrative overhead, delayed reporting, and a poor experience for students and staff. Alphabet-SMIS solves this by providing a single source of truth that integrates student records, academic tracking, financial management, hostel administration, and school-wide communication.

**Who it is for:**
- **System Administrators / School Management:** To oversee operations, manage user roles, track finances, handle enrollments, and publish school-wide news.
- **Teachers:** To manage class rosters, record attendance, input grades, and track student academic progress.
- **Students:** To view their academic results, timetables, attendance history, and access school feeds.
- **Hostel Owners / Wardens:** To manage boarding facilities, track room capacities, and monitor student residential assignments.

---

## 2. Technology Stack and Architecture Rationale

Alphabet-SMIS uses a modern, decoupled client-server architecture. This separation of concerns allows the frontend and backend to scale independently and enables the potential future development of native mobile applications using the same API.

### Technology Overview Table

| Layer | Technology | Reason Chosen |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19 (via Vite)** | Provides a highly reactive, component-based UI. Vite ensures lightning-fast hot module replacement (HMR) and optimized production builds. |
| **Frontend Routing** | **React Router v6** | Enables declarative, client-side routing with nested layouts (e.g., Admin, Teacher, Student dashboards) for a seamless Single Page Application (SPA) experience. |
| **Styling** | **Custom Vanilla CSS (CSS Variables)** | A custom design system built on CSS variables provides granular control over theming (Light/Dark mode), glassmorphism effects, and dynamic animations without the overhead of heavy utility classes. |
| **Backend Framework** | **NestJS (Node.js)** | Offers a heavily structured, opinionated, Angular-like architecture for Node.js. It enforces clean code, dependency injection, and modularity, which is essential for a large-scale enterprise application. |
| **Database ORM** | **Prisma** | Provides a type-safe database client and automated migrations. It significantly reduces runtime errors and accelerates database interactions with intuitive relational modeling. |
| **Database** | **MySQL** | A robust, battle-tested relational database. The highly structured nature of school data (Students -> Classes -> Results) makes a relational schema the perfect fit to enforce data integrity. |
| **Authentication** | **JWT (JSON Web Tokens) & Passport** | Stateless authentication mechanism that scales well. It allows the backend to verify user roles (Admin, Teacher, Student, Hostel Owner) securely on every request without session state bottlenecks. |

---

## 3. High-Level Feature List

- **User Authentication & Role-Based Access Control (RBAC):**
  A secure login system that issues short-lived access tokens and long-lived refresh tokens. It strictly segments application access based on four distinct roles: Admin, Teacher, Student, and Hostel Owner.

- **Student Information & Enrollment Management:**
  An end-to-end pipeline for managing the student lifecycle. It handles new admissions (applications), tracks demographic data, manages guardian information, and maintains a historical record of class assignments.

- **Academic & Grading Engine:**
  A flexible academic tracking system that allows teachers to input continuous assessment scores and final exam marks. It aggregates these scores based on configurable grading weights, calculates class rankings, and generates comprehensive report cards.

- **Class & Timetable Administration:**
  Allows administrators to define classes, assign class teachers, set capacities, and allocate subjects. It includes a JSON-backed timetable system to schedule lessons and manage classroom utilization.

- **Financial Management (Fees & Expenses):**
  A ledger system for tracking student fee payments against structured academic term expectations. It also records institutional expenses to provide a high-level overview of the school's financial health.

- **Hostel & Boarding Management:**
  A residential management module that allows Hostel Owners to track boarding capacity, assign students to specific hostels (Boys/Girls), and monitor residential occupancy.

- **Attendance Tracking:**
  A daily logging system for teachers to record student presence, absence, or tardiness. This feeds into the student's overall record and can be viewed historically by administrators and parents.

- **Communication & Media (Feeds & Gallery):**
  A centralized announcement board and photo gallery. It allows the administration to broadcast news, upcoming events, and showcase campus life to all authenticated users.

- **Interactive Campus Map:**
  A visual map (powered by Leaflet) that helps users explore the campus infrastructure, highlighting key buildings, sports facilities, and academic blocks.

---

## 4. Core Strengths and Competitive Advantages

1. **Type Safety Across the Stack:** The use of TypeScript on both the React frontend and NestJS backend, combined with Prisma's generated types, ensures that data shapes are consistent. This drastically reduces "undefined is not an object" errors and API contract mismatches.
2. **Modular Backend Design:** NestJS's module system cleanly separates domains (e.g., `FinanceModule`, `StudentsModule`, `AttendanceModule`). This means multiple developers can work on different features simultaneously without causing merge conflicts in massive monolithic files.
3. **Premium UI/UX:** The frontend utilizes a custom-built, modern glassmorphism aesthetic with fluid animations, scroll reveals, and native dark/light mode support. This creates a highly engaging, consumer-grade experience rarely seen in traditional, clunky enterprise school software.
4. **Flexible Grading Configuration:** Unlike rigid grading systems, Alphabet-SMIS uses JSON-backed `GradeConfig` structures, allowing the school to dynamically change how assessments are weighted (e.g., 30% Continuous Assessment, 70% Exam) per class and subject.

---

## 5. Known Trade-offs and Design Constraints

- **JSON Columns for Relational Data:** The system uses MySQL `JSON` columns in several places (e.g., `subjects` and `timetable` in the `Class` model, `permissions` in `AdminProfile`). 
  - *Trade-off:* While this allows for extreme flexibility without needing complex join tables, it sacrifices some database-level referential integrity and makes complex relational queries (like "find all teachers teaching Biology at 10 AM on Monday") harder to optimize.
  - *Reason Accepted:* The flexibility to quickly iterate on timetable structures and teacher subject assignments without writing complex schema migrations outweighed the need for strict relational purity in these specific domains.
- **Stateless JWTs vs. Server-Side Sessions:** 
  - *Trade-off:* JWTs cannot be invalidated immediately upon logout or permission change unless a complex token blocklist is implemented.
  - *Reason Accepted:* It reduces database load significantly, as the backend does not need to query a session table on every single API request. The system mitigates the risk by using short-lived access tokens and rotatable refresh tokens.

---

## 6. System Context Diagram

```mermaid
flowchart TD
    %% External Actors
    Admin([Administrator])
    Teacher([Teacher])
    Student([Student/Guardian])
    HostelOwner([Hostel Owner])

    %% System Boundary
    subgraph Alphabet-SMIS [Alphabet-SMIS Application Context]
        FE[React SPA Frontend\n(Vite, Tailwind, React Router)]
        API[NestJS API Gateway & Services]
        DB[(MySQL Database)]
        
        FE <-->|HTTPS / REST API| API
        API <-->|Prisma Client / TCP| DB
    end

    %% External Services
    Maps[OpenStreetMap / Leaflet]
    Static[Static File Storage\n(Local /uploads)]

    %% Actor Interactions
    Admin -->|Manages all entities,\nfinances, and settings| FE
    Teacher -->|Manages attendance,\ngrades, and classes| FE
    Student -->|Views grades, timetable,\nand campus news| FE
    HostelOwner -->|Manages boarding\ncapacity and residents| FE

    %% External Connections
    FE -->|Fetches Map Tiles| Maps
    API -->|Reads/Writes Images| Static
    FE -->|Requests Image URLs| Static

    %% Styling
    classDef actor fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef system fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef db fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    
    class Admin,Teacher,Student,HostelOwner actor;
    class FE,API system;
    class DB db;
```
