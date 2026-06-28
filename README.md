# 🦸‍♂️ Community Hero

> **A Hyperlocal Citizen Resolution Center & Community Verification Hub with Gamified Civic Engagement.**

Community Hero is a next-generation civic empowerment platform designed to bridge the gap between citizens, neighborhood conditions, and municipal dispatches. Utilizing cutting-edge **Generative AI diagnostics**, **hyperlocal location triangulation**, **interactive spatial map grids**, and a **decentralized verification ledger**, Community Hero gamifies neighborhood advocacy.

Citizens report real-world incidents, verify peer-submitted issues, promote consensus queue priority, and climb localized leaderboards, turning community stewardship into a collaborative, rewarding experience.

---

## 🗺️ Live App URLs & Previews
- **Development Environment URL:** [AI Studio Development Hub](https://ais-dev-bzbdyqx5xdaip5pvprdq2v-968670335473.asia-east1.run.app)
- **Shared Production Preview:** [AI Studio Shared Preview](https://ais-pre-bzbdyqx5xdaip5pvprdq2v-968670335473.asia-east1.run.app)

---

## 🌟 Core Feature Suite (In-Depth)

### 1. 🤖 Server-Side Gemini AI Diagnostics
*   **Intelligent Classification:** Automatically extracts, parses, and categories raw user reports into official municipal departments (e.g., *Infrastructure*, *Utilities*, *Waste Management*, *Public Safety*, *Transportation*, *Environment*, *Streetlights*, etc.).
*   **Automated Severity Grading:** Scores structural urgency across *LOW*, *MEDIUM*, *HIGH*, and *CRITICAL* thresholds using combined text descriptions and image context.
*   **Dual-Model Failover Resilience:** Alternates between **Gemini 3.5 Flash** and **Gemini 2.5 Flash** to maintain high availability and route around model-capacity spikes or localized API rate limits.
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

### 5. 🏆 Gamified Civic Progression (Leaderboards)
*   **Karma Score Ledger:** Earn Karma Points (+15 for filing issues, +10 for validating queue tickets, +20 for supporting verified duplicates).
*   **Rank Progression Levels:** Progress across citizen tiers (e.g., Level 1: Civic Novice up to Level 10: Neighborhood Hero).
*   **Community Leaderboard:** A real-time, interactive board tracking top neighborhood contributors to spark friendly local advocacy.

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

## 📡 API Documentation

### **POST** `/api/gemini/analyze`
Submits raw citizen reports and an optional media attachment for advanced neural categorization and structural analysis.

#### **Request Headers**
`Content-Type: multipart/form-data`

#### **Request Parameters (FormData)**
*   `description` (text string, optional/required if image absent): Detailed citizen description.
*   `image` (binary file stream, optional/required if description absent): Photo file of physical incident.

#### **Successful Response Format (`200 OK`)**
```json
{
  "category": "INFRASTRUCTURE",
  "severity": "HIGH",
  "summary": "Large active sinkhole forming on the northwest lane of 16th and Mission.",
  "confidence": 94,
  "isValidIssue": true,
  "reason": "Visible subsurface cavitation on active public roadways presents an immediate threat to transit structures and vehicles.",
  "suggestedAction": "Deploy immediate emergency transit barricades and alert the municipal public works division for rapid cement stabilization."
}
```

#### **Error Response Format (`400 Bad Request` / `500 Server Error`)**
```json
{
  "error": "Either a description or an image is required for analysis."
}
```

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
