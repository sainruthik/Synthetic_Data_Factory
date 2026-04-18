# Synthetic Data Factory

> Generate realistic, schema-driven synthetic datasets with an AI-powered quality review loop — no backend required.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

---

## Screenshot

> _Add screenshots here after deployment._

<!-- TODO: replace with actual screenshot -->
![App screenshot placeholder](https://placehold.co/1200x630/0f172a/94a3b8?text=Synthetic+Data+Factory)

---

## What It Does

Synthetic Data Factory lets you describe a dataset in plain English — "give me 500 employees with realistic salaries, ages, and hire dates" — and the app will:

1. Use GPT-4o to turn your description into a typed schema automatically
2. Generate thousands of realistic rows using Faker.js
3. Run an AI quality review that flags semantic inconsistencies (e.g. a 22-year-old with 18 years of experience)
4. Automatically patch the flagged rows and re-score — up to 3 rounds — until the dataset reaches a realism score of 80/100 or higher
5. Export the clean dataset in whichever format your pipeline needs

No server. No database. Runs entirely in the browser.

---

## Key Features

### AI Schema Builder
Describe your dataset in the chat and GPT-4o produces a fully typed schema. You can also build or edit the schema manually — field by field — without touching the chat at all.

### 9 Field Types
`string` · `integer` · `float` · `boolean` · `date` · `email` · `phone` · `uuid` · `enum`

Each type supports its own options: min/max ranges, date formats with year bounds, enum value lists, and nullable percentage (0 = never null, 100 = always null).

### 4 Constraint Types
- **Comparison** — enforce ordering between numeric or date fields (e.g. `hire_date < termination_date`)
- **Conditional null** — null a field when another field equals a specific value (e.g. null `termination_date` when `status = "active"`)
- **Unique** — guarantee no duplicate values in a field
- **Custom** — free-text rule description passed to the generator

### Faker.js Generation Engine
Every row is generated with `@faker-js/faker`. Supports a configurable seed for reproducible datasets and a randomize button for one-click re-seeding.

### AI Quality Review Loop (LLM-as-a-Judge)
After generation, click **Run Quality Review**:
- A deterministic 20-row sample is sent to GPT-4o with the full schema
- The model returns a **0–100 realism score**, an overall reasoning summary, and a list of flagged rows with per-field issues and suggested corrections
- Click **Apply Fixes** to have GPT-4o patch the bad rows — changes are applied immutably to the dataset
- The loop re-judges automatically and repeats up to **3 iterations**, stopping early when the score reaches **≥ 80**
- Every iteration is recorded in a score timeline so you can see how the dataset improved

### Dataset Viewer
Paginated table with sortable columns, per-column text filters, column stats (min, max, unique count, null count) on hover, and configurable page sizes (10 / 25 / 50 / 100).

### 6 Export Formats
`JSON` · `JSONL` · `CSV` · `TSV` · `SQL INSERT` · `Markdown table`

SQL export includes an optional `CREATE TABLE` statement. CSV export has an optional UTF-8 BOM for Excel compatibility.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 19 |
| Language | TypeScript 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Data generation | @faker-js/faker 10 |
| AI | OpenAI Chat Completions API (gpt-4o) |
| Routing | React Router 7 |
| Testing | Vitest 4 + Testing Library |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys) with access to `gpt-4o`

### 1. Clone

```bash
git clone https://github.com/sainruthik/Synthetic_Data_Factory.git
cd Synthetic_Data_Factory
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and set your key:

```
VITE_OPENAI_API_KEY=sk-proj-...
```

> **Security note:** `VITE_` prefixed variables are embedded in the client bundle. Use a key with strict spending/usage limits. For production systems with untrusted users, replace the browser-side call with a server-side proxy that holds the key privately.

### 4. Start the dev server

```bash
npm run dev
```

Open [synthetic-data-factory](https://synthetic-data-factory-l8lu-oo0ldynpi-sainruthiks-projects.vercel.app/).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Yes | OpenAI API key. Used for schema generation and quality review. Must have access to `gpt-4o`. |

See [.env.example](.env.example) for the annotated template.

---

## How to Use

### Step 1 — Describe your dataset
Type a description in the AI chat on the left, for example:
> "500 customer records with first name, last name, email, signup date between 2020 and 2024, a subscription tier (free/pro/enterprise), and monthly spend as a float"

GPT-4o will populate the schema editor on the right automatically.

### Step 2 — Review and refine the schema
The schema editor shows every field with its type, nullability, and type-specific options. You can:
- Add, remove, or reorder fields manually
- Change field types and adjust min/max/format options
- Add constraints between fields

### Step 3 — Generate
Set the row count, seed, and export format in the **Generate Data** panel. Click **Generate** — rows appear in the dataset viewer within seconds.

### Step 4 — Run Quality Review
Below the dataset viewer, click **Run Quality Review**. The AI judge scores the dataset and lists any flagged rows with specific field-level issues.

### Step 5 — Apply Fixes (optional)
If the score is below 80 and there are flagged rows, click **Apply Fixes**. The AI patches inconsistent values, and the loop re-judges. This repeats automatically up to 3 rounds.

### Step 6 — Export
Select a format (JSON, CSV, SQL, etc.) and click **Download** to save the file.

---

## Architecture Overview

```
Browser
│
├── ChatPanel              → sends natural-language prompt to GPT-4o
│   └── useChat            → calls /api/openai/v1/chat/completions
│                            parses JSON schema response
│
├── SchemaBuilder          → manual field + constraint editor
│   └── useSchemaReducer   → immutable schema state
│
├── GeneratePage           → orchestrates the full page
│   ├── useGenerate        → runs Faker engine, holds rows + lastExportedSchema
│   └── useQualityReview   → agentic judge/fix loop
│
├── GenerateControls       → row count, seed, format picker
├── FormatPreview          → live format preview (no download)
├── DatasetViewer          → paginated + filtered table
└── QualityReviewPanel     → score badge, flagged rows, iteration history
    └── useQualityReview
        ├── sampleRowsForReview   (deterministic LCG, returns indexMap)
        ├── judgeDataset          (GPT-4o → QualityJudgment)
        ├── fixDataset            (GPT-4o → RowFix[])
        └── applyRowFixes         (immutable patch via indexMap)

API calls (/api/openai/*)
├── Dev:  Vite proxy  →  https://api.openai.com  (key in env)
└── Prod: Vercel rewrite  →  https://api.openai.com  (key in Vercel env vars)
```

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

Coverage thresholds (enforced in CI):

| Metric | Threshold |
|--------|-----------|
| Lines | 80% |
| Functions | 80% |
| Branches | 80% |
| Statements | 80% |

Tests use **Vitest** with **@testing-library/react** and **jsdom**. No real API calls are made in tests — all OpenAI responses are mocked.

---

## Deployment

### Vercel (recommended)

1. Push this repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add the environment variable in the Vercel dashboard:
   - **Key:** `VITE_OPENAI_API_KEY`
   - **Value:** your OpenAI key
4. Deploy — Vercel reads `vercel.json` which rewrites `/api/openai/*` → `https://api.openai.com/*` so the proxy works identically to dev

> The production guard in `vite.config.ts` will fail the build with a clear error if `VITE_OPENAI_API_KEY` is missing, so misconfigured deployments are caught before they go live.

### Other hosts

Any static host works (Netlify, Cloudflare Pages, GitHub Pages). You will need to configure an equivalent rewrite/proxy rule for `/api/openai/*` → `https://api.openai.com/*`, or replace the browser call with a server-side function.

---

## Project Structure

```
src/
├── components/
│   ├── chat/              # ChatPanel, MessageBubble, TypingIndicator
│   ├── dataset-viewer/    # DatasetViewer, ViewerTable, pagination, toolbar
│   ├── generate/          # GenerateControls, FormatPreview, ViolationBanner
│   ├── quality-review/    # QualityReviewPanel, ScoreBadge, FlaggedRowCard, IterationHistory
│   ├── schema-builder/    # SchemaBuilder, FieldRow, ConstraintEditor, TypeOptions
│   └── ui/                # Button, Card, Textarea, ScrollArea, Avatar
├── engine/
│   ├── generators/        # Per-type Faker wrappers (string, integer, date, email …)
│   ├── generateDataset.ts # Main generation loop + constraint enforcement
│   └── writers/           # Format serializers (json, csv, sql, markdown …)
├── hooks/
│   ├── useChat.ts         # AI schema chat
│   ├── useGenerate.ts     # Generation state + export
│   ├── useQualityReview.ts# Agentic judge/fix loop
│   └── useSchemaReducer.ts# Immutable schema editor state
├── lib/
│   ├── api.ts             # OpenAI fetch wrapper
│   ├── parseSchema.ts     # LLM response → ExportedSchema
│   └── qualityReview.ts   # Prompt builders, parsers, row patcher
├── pages/
│   ├── GeneratePage.tsx   # Main app page
│   └── HomePage.tsx       # Landing
└── types/
    ├── schema.ts          # Field, constraint, and schema types
    └── qualityReview.ts   # Judge/fix response types
```

---

## Roadmap

- [ ] **Python export backend** — move generation to a FastAPI service for larger datasets (100k+ rows) without blocking the browser
- [ ] **Streaming generation** — stream rows to the viewer as they are produced instead of waiting for the full batch
- [ ] **Multi-table schemas** — define foreign-key relationships between tables and generate referentially consistent data
- [ ] **Authentication** — save schemas and datasets to a personal account via Supabase Auth
- [ ] **Schema library** — community-shared schema templates (e-commerce orders, healthcare records, financial transactions)
- [ ] **More AI providers** — plug in Anthropic Claude or local models (Ollama) as the judge/schema assistant

---

## License

MIT — see [LICENSE](LICENSE) for details.
