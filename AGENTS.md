# Comprehensive Backend & Full-Stack Architecture: Mianwali Students Hub

## 1. System Overview & Objective

Mianwali Students Hub is a full-stack academic community platform built for local college and university students. It allows users to browse folder-wise notes (Semesters -> Subjects -> Folders -> Files), upload study materials, post requirement requests ("Mujhe yeh chahiye"), and engage in course-specific discussions.

---

## 2. Technology Stack & Runtime Environment

- **Framework:** Next.js (App Router, Server Actions, Server/Client Components)
- **Language:** TypeScript / JavaScript (ES Modules)
- **Database & ODM:** MongoDB Atlas with Mongoose (with global connection caching for serverless environments)
- **Authentication:** Clerk (integrated with Next.js middleware and webhook synchronization)
- **File Storage:** Uploadthing (handling secure multi-format document uploads like PDFs, DOCX, and images)
- **UI & Styling:** Tailwind CSS, shadcn/ui, Lucide Icons

---

## 3. Directory Structure Convention

```text
public/
├── images/...
app/
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
├── api/
│   ├── webhooks/
│   │   └── clerk/route.js
│   ├── semesters/route.js
│   ├── subjects/[subjectId]/route.js
│   ├── notes/route.js
│   └── requests/route.js
├── semesters/
│   └── [semesterId]/
│       └── subjects/
│           └── [subjectId]/page.js
├── requests/
│   └── page.js
└── layout.js
```
