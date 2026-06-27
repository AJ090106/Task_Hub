# Lumora Ai Studio

Lumora Ai Studio is a full-stack task management and automated asynchronous processing platform. Built with a decoupled architecture, it leverages a robust backend pipeline for intensive background jobs combined with a high-performance frontend dashboard powered by a relational database for user session management and data integrity.


## 🔄 System Architecture & Workflow

The platform completely decouples the user-facing dashboard from heavy operations using an asynchronous message-passing pipeline. 

### 📊 Application Data Flow

```text
  ┌────────────────────────────┐
  │  User Interface (Next.js)  │
  └──────────────┬─────────────┘
                 │
        (1) Submits Heavy Task
                 ▼
  ┌────────────────────────────┐       (2) Saves 'PENDING' State
  │     Flask Backend API      ├────────────────────────────────────────┐
  └──────────────┬─────────────┘                                        │
                 │                                                      ▼
        (3) Offloads Task Immediately                         ┌──────────────────┐
                 ▼                                            │   Supabase DB    │
  ┌────────────────────────────┐                              └────────▲─────────┘
  │   Message Queue (Redis)    │                                       │
  └──────────────┬─────────────┘                                       │
                 │                                                     │ (6) State Syncs
        (4) Worker Ingests Job & Sets 'PROCESSING'                     │     to UI
                 ▼                                                     │
  ┌────────────────────────────┐                                       │
  │  Celery Background Worker  │                                       │
  └──────────────┬─────────────┘                                       │
                 │                                                     │
           Spins up module                                             │
                 ▼                                                     │
  ┌────────────────────────────┐                                       │
  │   Image Processor Engine   ├───────────────────────────────────────┘
  └────────────────────────────┘       (5) Saves Output & Flips Status
                                            ('COMPLETED' / 'FAILED')
Operational Breakdown:
Authentication Gate: A custom React state context verifies user identity and determines whether they are assigned standard User permissions or Administrator privileges.

Submitting a Task: When a user uploads an asset or submits a heavy job, the frontend communicates with the backend API. The API instantly records a tracking row with a status of PENDING in the database and hands the computational work to a message queue, responding to the user immediately to avoid UI freezing.

Asynchronous Processing: Dedicated background workers monitor the message queue. A worker picks up the job, changes its status to PROCESSING, and routes the data to a modular processing engine to perform intensive file transformations entirely isolated from the main app server.

Completion Loop: Once calculations finish, the worker updates the database record status to COMPLETED (or FAILED if an error occurs). The frontend automatically reads the updated status and modifies the user's dashboard view in real time.

🛠️ Tech Stack & Operational Usage
💻 Frontend
Next.js & React: Manages the user/admin dashboard layout and drives instant, real-time UI state changes without requiring manual page refreshes.

TypeScript: Enforces strict data models across components to catch potential data type mismatches during development before they hit production.

Tailwind CSS: Powers the sleek, highly responsive UI layout, components, and collapsible navigation sidebar.

🧠 Core API & Storage
Flask (Python): Serves as the rapid-response API gateway that accepts frontend data payloads, immediately routes them to the queue, and hands a quick success signal back to the client.

Supabase (Postgres): Serves as the immutable source of truth for user accounts, permission roles, and automated task-tracking metrics.

⚙️ Distributed Background Compute
Redis: Functions as the high-speed, in-memory message broker holding pending job packets securely in a queue.

Celery: Runs completely separate from the web server, supervising background workers that pull jobs from Redis as soon as they land.

Python Image Modules (image_processor.py): The local execution engine that handles resource-heavy processing operations isolated entirely from the live API thread.

🛡️ Built-in Fallback: Asynchronous Fault Isolation Valve
If a task encounters an unexpected error (such as a corrupted file upload or system timeout), the platform activates its native safety net:

Isolation: The worker traps the runtime crash inside a secure error block, preventing the core background pipeline from freezing.

State Overrides: The fallback logic instantly overrides the task tracking column, marking its status explicitly as FAILED inside Supabase.

Graceful UI Handling: The Next.js dashboard detects the failure status update and cleanly renders an error card, maintaining system stability and preventing infinite loading states.

🚀 Key Feature Matrix
🧠 Core System Backend & Workers
Asynchronous Processing: Offloads compute-heavy executions to a distributed background worker queue, ensuring the main website UI remains fast and responsive.

Unified Status Lifecycle: Enforces a rigid status-key mapping layout (PENDING, PROCESSING, COMPLETED, FAILED) synchronized perfectly across the web application and backend tracking layers.

Modular Compute Engine: A custom algorithmic pipeline optimizing asset buffers cleanly without causing application blockades.

💻 Enterprise Frontend Dashboard
Role-Based Workspaces: Implements separate interactive interfaces for administrators and standard users, isolating privileged analytics metrics, user queues, and system overrides.

Dynamic Context Controls: Grants immediate access to active authentication profiles, state caching, and runtime validation tokens across layout modules.

🗄️ Relational Database & State Management
Database Integration: Connects directly to a cloud database provider, managing user permissions, long-form metadata records, and real-time system event logging.

Immutable Schema Migrations: Declarative definitions in the migrations folder ensure exact state synchronization across local, staging, and production environments.
