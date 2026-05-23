# Graph Report - alphabetsmis-II  (2026-05-22)

## Corpus Check
- 133 files · ~1,235,520 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 864 nodes · 1044 edges · 93 communities (50 shown, 43 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]

## God Nodes (most connected - your core abstractions)
1. `TeachersService` - 27 edges
2. `AdminService` - 24 edges
3. `TeachersController` - 23 edges
4. `compilerOptions` - 22 edges
5. `AdminController` - 21 edges
6. `FinanceService` - 20 edges
7. `PrismaService` - 19 edges
8. `compilerOptions` - 17 edges
9. `FinanceController` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Resize Script` --semantically_similar_to--> `Generate Assets Script`  [INFERRED] [semantically similar]
  alphabet-Smis/resize.js → alphabet-Smis/generate_assets.ps1
- `Admin Portal Layout` --semantically_similar_to--> `Teacher Portal Layout`  [INFERRED] [semantically similar]
  alphabet-Smis/src/layouts/AdminLayout.tsx → alphabet-Smis/src/layouts/TeacherLayout.tsx
- `Home Landing Page` --calls--> `Examination Results Page`  [INFERRED]
  alphabet-Smis/src/pages/Home.tsx → alphabet-Smis/src/pages/ExamResults.tsx
- `_generate_intelligent_overrides()` --calls--> `search()`  [INFERRED]
  alphabet-Smis/.agent/skills/ui-ux-pro-max/scripts/design_system.py → alphabet-Smis/.agent/skills/ui-ux-pro-max/scripts/core.py
- `Vite and PWA Configuration` --conceptually_related_to--> `Resize Script`  [INFERRED]
  alphabet-Smis/vite.config.ts → alphabet-Smis/resize.js

## Hyperedges (group relationships)
- **PWA Assets Generation** — resize_js, generate_assets_ps1, vite_config_ts [INFERRED 0.95]
- **Public Portal Navigation Flow** — home_tsx, apply_tsx, explore_campus_tsx, campus_gallery_tsx [INFERRED 0.85]
- **UI/UX Pro Max Tooling** — core_py, design_system_py, search_py [EXTRACTED 1.00]

## Communities (93 total, 43 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (8): AdminModule, AttendanceModule, ClassesModule, FinanceModule, PrismaModule, AppModule, StudentsModule, TeachersModule

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (48): author, dependencies, bcrypt, class-transformer, class-validator, dotenv, @nestjs/common, @nestjs/core (+40 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (32): dependencies, leaflet, lucide-react, react, react-dom, react-leaflet, react-router-dom, devDependencies (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (5): AuthController, AuthModule, AuthService, JwtStrategy, RefreshTokenStrategy

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (24): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (22): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (43): Accessibility, Available Domains, Available Stacks, code:bash (python3 --version || python --version), code:bash (python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" -), code:bash (python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa w), code:bash (# Get UX guidelines for animation and accessibility), code:bash (python3 skills/ui-ux-pro-max/scripts/search.py "layout respo) (+35 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (3): SubjectsController, SubjectsModule, SubjectsService

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (3): FinanceController, randomName, FinanceService

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (21): Additional Forbidden Patterns, Anti-Patterns (Do NOT Use), Buttons, Cards, code:css (@import url('https://fonts.googleapis.com/css2?family=Atkins), code:css (/* Primary Button */), code:css (.card {), code:css (.input {) (+13 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (4): ext, FeedsController, FeedsModule, FeedsService

### Community 18 - "Community 18"
Cohesion: 0.16
Nodes (3): HostelsController, HostelsModule, HostelsService

### Community 19 - "Community 19"
Cohesion: 0.24
Nodes (3): ext, GalleryModule, GalleryService

### Community 20 - "Community 20"
Cohesion: 0.30
Nodes (14): Admin Portal Layout, React App Router, Admissions Form, Campus Gallery Page, Examination Results Page, Explore Campus Feed Detail Page, Explore Campus Feeds Page, Generate Assets Script (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.27
Nodes (4): payments, res, structures, PrismaService

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (4): SubjectEntry, Slot, SubjectEntry, SearchableSelectProps

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (6): moduleFileExtensions, rootDir, testEnvironment, testRegex, transform, ^.+\\.(t|j)s$

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (4): Assessment, ClassConfig, ClassOption, StudentGrade

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 32 - "Community 32"
Cohesion: 0.40
Nodes (3): InTermData, ResultItem, SubjectItem

### Community 43 - "Community 43"
Cohesion: 0.83
Nodes (3): Home(), useCountUp(), useReveal()

### Community 60 - "Community 60"
Cohesion: 1.00
Nodes (3): UI/UX Pro Max Core, Design System Generator, UI/UX Pro Max Search

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (3): App TypeScript Config, Root TypeScript Config, Node TypeScript Config

### Community 63 - "Community 63"
Cohesion: 0.14
Nodes (13): code:bash ($ npm install), code:bash (# development), code:bash (# unit tests), code:bash ($ npm install -g @nestjs/mau), Compile and run the project, Deployment, Description, License (+5 more)

### Community 66 - "Community 66"
Cohesion: 0.19
Nodes (3): EnrollmentController, EnrollmentModule, EnrollmentService

### Community 86 - "Community 86"
Cohesion: 0.33
Nodes (5): code:js (export default defineConfig([), code:js (// eslint.config.js), Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **268 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+263 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TeachersService` connect `Community 7` to `Community 24`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `TeachersController` connect `Community 10` to `Community 24`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `AdminService` connect `Community 2` to `Community 0`, `Community 27`, `Community 21`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _294 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05520614954577219 - nodes in this community are weakly interconnected._