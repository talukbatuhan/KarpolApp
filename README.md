# Next-Gen Internal Management Panel

A modern, high-performance internal management dashboard built with Next.js 14, Supabase, and Shadcn UI.

## Features

- **Dynamic Tables:** Create and manage Excel-like tables with custom schemas.
- **Task Management:** Assign tasks to departments with automatic rollover logic.
- **Real-Time Updates:** See changes instantly as validaiton occurs.
- **Audit Logs:** Track every action taken within the system.
- **Role-Based Access:** Secure access control for Admins and Standard Users.

## tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **UI:** Tailwind CSS, Shadcn UI, Lucide React
- **State Management:** Zustand, React Query (via simple fetch/server actions)
- **Table Core:** TanStack Table v8

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd internal-panel
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Rename `.env.example` to `.env.local` and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    ```

4.  **Database Setup:**
    Run the SQL migrations found in `supabase/migrations` in your Supabase SQL Editor in order:
    1. `20240101000000_init_schema.sql`
    2. `20240101000001_add_tasks.sql`
    3. `20240101000002_audit_and_realtime.sql`

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## deployment

The easiest way to deploy is using **Vercel**.

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Add the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, etc.) in the Vercel project settings.
4.  Click **Deploy**.
