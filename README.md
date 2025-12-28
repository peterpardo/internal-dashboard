## App Structure

### `app/`

app/
├─ (public)/
│ ├─ page.tsx # Landing / marketing
│
├─ (auth)/
│ ├─ sign-in/
│ │ ├─ page.tsx
│ │ ├─ layout.tsx
│ │ └─ \_components/
│ │ ├─ sign-in-form.tsx
│ │ └─ oauth-buttons.tsx
│ │
│ ├─ forgot-password/
│ └─ reset-password/
│
├─ (dashboard)/
│ ├─ layout.tsx # App shell (sidebar + header)
│ │
│ ├─ dashboard/
│ │ └─ page.tsx # Overview / metrics
│ │
│ ├─ projects/
│ │ ├─ page.tsx # List
│ │ ├─ [projectId]/
│ │ │ ├─ page.tsx
│ │ │ ├─ settings/
│ │ │ └─ activity/
│ │ └─ \_components/
│ │ ├─ project-table.tsx
│ │ └─ project-card.tsx
│ │
│ ├─ users/
│ │ ├─ page.tsx
│ │ ├─ [userId]/page.tsx
│ │ └─ \_components/
│ │
│ ├─ reports/
│ └─ settings/
│
├─ api/
│ ├─ auth/
│ ├─ users/
│ ├─ projects/
│ └─ webhooks/
│
├─ layout.tsx # Root layout
├─ globals.css
└─ favicon.ico

### `components/`

components/
├─ ui/ # Design-system level (reusable)
│ ├─ button.tsx
│ ├─ input.tsx
│ ├─ modal.tsx
│ └─ data-table.tsx
│
├─ layout/
│ ├─ main-header.tsx
│ ├─ sidebar.tsx
│ └─ breadcrumb.tsx
│
├─ forms/
│ ├─ user-form.tsx
│ └─ project-form.tsx

### `lib/`

lib/
├─ auth/
│ ├─ session.ts
│ ├─ permissions.ts
│ └─ roles.ts
│
├─ db/
│ ├─ index.ts # DB client
│ ├─ schema.ts
│ └─ migrations/
│
├─ services/
│ ├─ user.service.ts
│ ├─ project.service.ts
│ └─ audit-log.service.ts
│
├─ validations/
│ ├─ user.schema.ts
│ └─ project.schema.ts
│
├─ constants/
│ ├─ routes.ts
│ └─ roles.ts
