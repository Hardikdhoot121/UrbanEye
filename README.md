# 🦸‍♂️ Community Hero

> **A Hyperlocal Citizen Resolution Center & Community Verification Hub with Gamified Civic Engagement.**

Community Hero is a next-generation civic empowerment platform designed to bridge the gap between citizens, neighborhood conditions, and municipal dispatches. Utilizing cutting-edge **Generative AI diagnostics**, **hyperlocal location triangulation**, **interactive spatial map grids**, and a **decentralized verification ledger**, Community Hero gamifies neighborhood advocacy.

Citizens report real-world incidents, verify peer-submitted issues, promote consensus queue priority, and climb localized leaderboards, turning community stewardship into a collaborative, rewarding experience.

---

## 🗺️ Live App URLs & Previews
- **Development Environment URL:** [AI Studio Development Hub](https://ais-dev-bzbdyqx5xdaip5pvprdq2v-968670335473.asia-east1.run.app)
- **Shared Production Preview:** [AI Studio Shared Preview](https://ais-pre-bzbdyqx5xdaip5pvprdq2v-968670335473.asia-east1.run.app)

---

## 🚀 Step-by-Step Development Journey

This application evolved from a simple concept into a highly robust, multi-layered full-stack civic ecosystem. Below is the step-by-step chronology of how we built and engineered Community Hero:

```
┌──────────────────────────────────────┐
│  Phase 1: Architecture & Bootstrapping│ ──► Core schemas, layout, Express + Vite configuration
└──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│   Phase 2: Server-Side Gemini API   │ ──► Dual-Model fallback (3.5 & 2.5 Flash), exponential retries
└──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│   Phase 3: Spatial Map Integration   │ ──► Leaflet map projections, details drawers, reactive pins
└──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  Phase 4: Consensus Ledger Queue     │ ──► Peer auditing votes, citizen Karma levels, leaderboards
└──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  Phase 5: Intelligent Duplicate HUD  │ ──► Haversine (≤50m), Jaccard text similarity, endorsement logs
└──────────────────────────────────────┘
```

### 1️⃣ Phase 1: Core Architecture & Bootstrapping
*   **Monolith Setup:** Configured Express v4 as our Node runtime environment coupled with Vite v6 to handle hot-module client asset rendering.
*   **Data Models & Schemas:** Designed type-safe TypeScript interfaces inside `/src/types/` representing nested entities:
    *   `Issue`: Tracks unique ID, description, coordinates, category, severity status, image URL, voter consensus logs, potential duplicate markers, and owner reporter details.
    *   `UserProfile` & `VerificationVote`: Coordinates gamification metrics, Karma levels, level-badges, and voter signatures.
*   **Seed Injection:** Written a local database seeder (`/src/services/mockService.ts`) to initialize high-fidelity mock reports across San Francisco to simulate active neighborhoods on startup.

### 2️⃣ Phase 2: Server-Side Gemini API Orchestration
*   **Strict Security Proxies:** Kept high-value AI credentials fully protected inside Express backend routes, completely hidden from client inspection.
*   **Dual-Model Failover Resilience:** Configured the `@google/genai` TypeScript SDK with automated retry handlers. If Gemini 3.5 Flash reaches rate caps, our pipeline instantly rolls over to Gemini 2.5 Flash.
*   **JSON Schema Constraints:** Passed strict prompt parameters enforcing exact structured JSON output formats matching our classification schemas, returning categorization, confidence score, Urgency levels, reason, and suggested action blocks.

### 3️⃣ Phase 3: Spatial Map Integration
*   **Geospatial Mapping:** Integrated **Leaflet** maps with high-contrast slate skinning.
*   **Dynamic Pin Clustering:** Multi-colored pins translate severity ratings visually (High is a dark orange pulse, Critical is deep crimson).
*   **Detail Canvas Drawers:** Engineered slide-out drawer components presenting granular logs, photo evidence, current support counts, and consensus metrics.

### 4️⃣ Phase 4: Decentralized Consensus & Gamification
*   **Peer Validation Queue:** Developed a localized ledger allowing nearby citizens to review pending reports and cast votes (Verify/Reject).
*   **Karma Progression Loop:** Awarded +15 karma points for new reports, +10 for active audit reviews, and +20 for supporting duplicated logs, triggering automatic citizen level-ups (Novice to Neighborhood Hero).
*   **Community Leaderboard:** Designed high-contrast rankings boards updating in real time.

### 5️⃣ Phase 5: Intelligent Duplicate HUD (Current Stage)
*   **Haversine Distance Check:** Computes precise terrestrial spacing in meters between candidate and existing issues.
*   **Jaccard Text Matching:** Created an algorithmic parser to clean descriptions, strip punctuation, remove stop-words, and gauge textual overlap.
*   **Interactive Dual Action HUD:** If an issue matches category, severity, and sits under 50m:
    *   The user gets presented with an immediate comparison dashboard.
    *   **Support & Endorse Option:** Increments voter consensus on the existing issue, promoting it to municipal visibility without cluttering the map.
    *   **Create Anyway Option:** Files a new ticket flagged permanently with a transparent `Potential Duplicate` marker.

---

## 🗺️ Application Routing, Views & Navigation Paths

Since Community Hero operates as a high-fidelity Single Page Application (SPA) inside a unified map-hub interface, routing and viewstates are managed cleanly using a secure state machine that routes users across different panels in a fluid, performance-optimized layout.

### 🌐 Client-Side Views & Tab Paths

Our client application handles routing states cleanly via the persistent global sidebar:

| Route Key | Path / View Panel | Primary Purpose | Components Rendered |
| :--- | :--- | :--- | :--- |
| `dashboard` | `/` (Citizen Home HUD) | Primary dashboard summarizing municipal conditions, local stats, citizen levels, karma badges, and recent neighborhood logs. | `DashboardPanel` |
| `issues` | `/issues` (Interactive Map) | Renders full-screen interactive Leaflet map canvas with custom filters, reactive pins, and comprehensive detail sliders. | `MapVisualizer` |
| `verification` | `/verification` (Audit Queue) | Community peer-led audit ledger display showing unverified incidents pending community consensus. | `VerificationQueue`, `QueueCard` |
| `report` | `/report` (Filing Wizard) | Drag-and-drop intake wizard handling Gemini analysis, coordinates triangulation, and intelligent duplicate alerts. | `ReportWizard`, `ImageUpload`, `DuplicateDetectionCard` |
| `leaderboard` | `/leaderboard` (High Scores) | Interactive community standings detailing neighborhood citizen rankings and accumulated karma metrics. | `Leaderboard` |

### 📡 Server-Side API Endpoint Mapping

The Express application exposes dedicated backend proxy pathways to secure APIs and assets:

*   **`POST /api/gemini/analyze`**
    *   **Payload Type:** `multipart/form-data`
    *   **Incoming Data:** `image` (Binary Stream Buffer), `description` (Plain text input).
    *   **Action:** Validates input integrity, runs failover routing models (Gemini 3.5 -> Gemini 2.5), enforces structured prompt JSON outputs, and returns categorized incident metadata.
*   **`GET *` (SPA Fallback)**
    *   **Action:** Captures any external deep-links or page reloads in production, routing them gracefully to compiled `/dist/index.html` static assets to maintain client-side state stability.

---

## 🌟 Core Feature Suite (In-Depth)

### 1. 🤖 Server-Side Gemini AI Diagnostics
*   **Intelligent Classification:** Automatically extracts, parses, and categories raw user reports into official municipal departments (e.g., *Infrastructure*, *Utilities*, *Waste Management*, *Public Safety*, *Transportation*, *Environment*, *Streetlights*, etc.).
*   **Automated Severity Grading:** Scores structural urgency across *LOW*, *MEDIUM*, *HIGH*, and *CRITICAL* thresholds using combined text descriptions and image context.
*   **Exponential Backoff Retries:** Intercepts transient 429 and 503 errors, executing delayed retry blocks to guarantee API transaction completion.
*   **Valid Issue Auditing:** Detects spam, duplicates, or non-civic photos to maintain high system data integrity.

### 2. 🔍 Intelligent Duplicate Detection Engine
*   **Hyperlocal Proximity Check:** Calculates distance between new reports and existing records using the high-accuracy **Haversine Formula** (distance constraint set strictly at $\le 50$ meters).
*   **Semantic Text Similarity Analysis:** Implements a localized Jaccard Overlap and tokenization processor (ignoring stop-words, punctuation, and casing) to determine description overlaps without demanding premium vector database query layers.
*   **Interactive Decision HUD Card:** If a prospective duplicate exists within 50m:
    *   Displays conflicting **Issue ID**, **Title**, **Relative Distance (meters)**, **Consensus Score**, **Status**, and **AI Similarity Score (%)**.
    *   **Support & Endorse Option:** Allows the user to endorse the existing ticket instead. This increments the issue's supporter count, escalates its trust ranking, and adds +5 to its Consensus Score (preventing database clutter).
    *   **Create Anyway Option:** Permits submitting a unique issue while auto-marking its registry profile with a persistent `Potential Duplicate` flag for audit transparency.

### 3. 🗺️ Hyperlocal Interactive Map Visualizer
*   **Leaflet Integration:** Renders high-performance interactive maps centered around municipal hubs.
*   **Visual Status Indicators:** Employs color-coded markers matching issue severity (Critical is deep crimson, Low is soft slate) and status states (*Pending Verification*, *Verified*, *Resolved*, *Rejected*).
*   **Custom Map Drawers:** Clicking a map pin glides open an intensive detailing drawer summarizing citizen data, AI diagnostics reports, karma credentials, photo attachments, and consensus progress logs.
*   **Filters Panel:** Instantly filter mapping records by category, department, or urgency levels using optimized dynamic React memoizations.

### 4. ⚖️ Peer Verification Queue & Consensus
*   **Decentralized Verification Protocol:** Issues enter a public verification ledger as "Pending". Citizens vote *Verify* or *Reject* based on community accuracy.
*   **Consensus Score Accumulator:** Tallies community validation flags, adjusting local Trust Scores dynamically. Once a score climbs past the +70 Consensus threshold, the ticket is officially promoted to "Verified" status.
*   **Proof-of-Stewardship Logs:** Visualizes voting tracks with clear progress bars and validation milestones.

---

## 🛠️ Technology Stack

| Technology | Layer | Purpose |
| :--- | :--- | :--- |
| **React 19 (TypeScript)** | Client | Component-driven UI framework with type safety |
| **Express 4** | Server | Backend server layer proxying AI operations and assets |
| **Vite 6** | Build & Dev Server | Fast modern build runner and assets compiler |
| **Tailwind CSS 4** | Styling | Utility-first CSS compiling and design styling |
| **@google/genai SDK** | AI Engine | Modern Google GenAI TypeScript client library |
| **Esbuild** | Packaging | Bundles backend `server.ts` into a unified production file |
| **Leaflet & @types/leaflet** | Geographic | Renders interactive spatial maps, pins, and custom canvases |
| **Multer** | Asset Pipeline | Handles multipart form uploads (images) in server endpoints |
| **Motion (React)** | Animation | Fluid page transitions, drawer slides, and micro-interactions |
| **Lucide React** | Design | Modern visual outline and filled icons |

---

## 📁 Repository Folder Structure

```
├── .env.example                # Example environment variables (secrets excluded)
├── .gitignore                  # Visual assets and compiled files build ignore
├── assets/                     # Global static graphic and media components
├── index.html                  # Core single-page entry layout
├── metadata.json               # Frame permission scopes and capability manifests
├── package.json                # Project dependencies, dev, build, and start runner definitions
├── tsconfig.json               # Typescript compilation parameters
├── vite.config.ts              # Vite configuration and Tailwind compilation integrations
├── server.ts                   # Express server, Gemini API gateway, & static asset router
├── dist/                       # Output folder for production builds (bundled client & server)
└── src/
    ├── App.tsx                 # Base entry component orchestration
    ├── main.tsx                # Client-side DOM mounting hub
    ├── index.css               # Global styling, Tailwind v4 directives, custom font imports
    ├── types/                  # Typed schema manifests
    │   ├── index.ts            # Entry types exports
    │   ├── issue.ts            # Issue categorizations, statuses, coordinates, and AI analysis interfaces
    │   └── user.ts             # Profile parameters, Level badges, and Karma specifications
    ├── context/
    │   └── AppContext.tsx      # Core state provider (persists mock data, synchronizes localStorage)
    ├── services/
    │   └── mockService.ts      # Seeding mock civic issues, user metrics, and leaderboard profiles
    ├── components/
    │   └── ui/                 # Basic modular UI elements (Buttons, Inputs, Cards)
    ├── hooks/                  # Custom react hook abstractions
    ├── utils/                  # Universal helper libraries
    └── features/               # Domain-driven feature architecture
        ├── dashboard/
        │   └── DashboardPanel.tsx    # Citizen main HUD, profile indicators, statistics grid
        ├── gamification/
        │   └── Leaderboard.tsx       # Live community leaderboard rankings cards
        ├── map/
        │   └── MapVisualizer.tsx     # Leaflet interactive map, custom popups, drawer panels
        ├── reporting/
        │   ├── ReportWizard.tsx      # Multi-step report wizard orchestrator
        │   ├── components/
        │   │   ├── ImageUpload.tsx     # Drag-and-drop image file handler
        │   │   ├── AIAnalysisCard.tsx  # Dynamic AI feedback UI, parameters confirmation
        │   │   ├── DuplicateDetectionCard.tsx  # Hyperlocal matching HUD for duplicate events
        │   │   ├── LoadingState.tsx    # Processing/scanning animations
        │   │   └── ErrorState.tsx      # Fallback UI for upload/API issues
        │   └── utils/
        │       └── similarity.ts       # Haversine distance calculations & Jaccard token checkers
        └── verification/
            ├── VerificationQueue.tsx   # Peer-led audit table overview
            └── components/
                └── QueueCard.tsx       # Interactive voting cards with real-time feedback
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have the following installed on your developer machine:
*   **Node.js:** `v18.x` or higher (LTS recommended)
*   **npm:** `v9.x` or higher

### ⚙️ Environment Variables Setup
Create a `.env` file at the root level of your workspace. Never commit your `.env` file to version control.

Add your credentials according to the template in `.env.example`:
```env
# Google Gemini API key used server-side (do not prefix with VITE_)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Runtime control (Automatically configured in container envs)
NODE_ENV=development
```

### 📥 Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/community-hero.git
    cd community-hero
    ```

2.  **Install Base Dependencies:**
    ```bash
    npm install
    ```

### 🏃‍♂️ Running the Application

*   **Development Mode (Direct TypeScript Execution with hot-reloading asset pipelines):**
    ```bash
    npm run dev
    ```
    This launches the Express backend on port `3000` via `tsx` and mounts Vite as active middleware inside development. Access the viewport directly at `http://localhost:3000`.

*   **Production Compilation:**
    ```bash
    npm run build
    ```
    This compiles the client-side SPA bundle into `/dist` via Vite, and bundles the server-side `server.ts` into a standalone, optimized CommonJS file at `dist/server.cjs` via `esbuild`.

*   **Start Production Server:**
    ```bash
    npm run start
    ```
    Launches the compiled server. Access on `http://localhost:3000`.

---

## ⚡ Performance & Optimization Strategies

1.  **Memory-Optimized File Streams:** Multer handles incoming binary images inside memory buffers, discarding temporary file buffers instantly upon API transaction completion to prevent storage leaks.
2.  **Leaflet Render Layer Caching:** Avoids redrawing the interactive map canvas during state changes by checking and caching existing coordinate references and clustering markers effectively.
3.  **Local Indexing Search (Jaccard Overlap):** Rather than running expensive, heavy database scans or paying high vector search latency overheads, description matching utilizes pre-filtered, tokenized arrays to deliver lightning-fast proximity comparisons instantly.
4.  **Debounced Resize Handlers:** Uses a `ResizeObserver` framework to recalculate layout dimensions inside the interactive Map viewports only when genuine container grid shifts take place.

---

## 🛡️ Credits & Contact
*   **Built By:** Google AI Studio (DeepMind Coding Agent & Antigravity)
*   **Contributor Email:** `hardikdhoot121@gmail.com`
*   **License:** MIT License

---

*Made with 💖 for local communities and civic heroes everywhere.*
