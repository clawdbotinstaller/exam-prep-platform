# Tech Stack Document

> **Last Updated:** 2026-02-06
> **Version:** 1.2
> **Status:** Frozen for MVP

---

## Change Log

**v1.2:** Upgraded frontend tooling to Tailwind CSS 4 + @tailwindcss/vite
**v1.1:** Updated frontend from Svelte to React + GSAP based on existing codebase

---

## Core Philosophy

**React + GSAP + Cloudflare = Fast, Animated, Cheap**

- Zero server management
- Edge deployment globally
- Pay only for what you use
- Scroll-driven animations that impress

---

## Frontend

### Framework: React 19
```
react: ^19.2.0
react-dom: ^19.2.0
```
- Latest React with improved performance
- Hooks-based state management
- TypeScript-first

### Build Tool: Vite 7
```
vite: ^7.2.4
@vitejs/plugin-react: ^5.1.1
```
- Fast HMR
- Optimized production builds
- Native TypeScript support

### Routing: React Router (planned)
```
react-router-dom: ^7.x
```
- Declarative routing
- Route-level code splitting

### Styling: Tailwind CSS 4
```
tailwindcss: ^4.0.0
@tailwindcss/vite: ^4.0.0
```
- Utility-first
- Design tokens via CSS variables
- Purge unused styles automatically

### Animations: GSAP + ScrollTrigger
```
gsap: ^3.12.0
```
- Pinned scroll sections with snap
- Timeline-based entrance/exit animations
- Smooth scrubbing on scroll
- Global scroll snap for pinned sections

### Icons: Lucide React
```
lucide-react: ^0.474.0
```

---

## Backend

### Runtime: Cloudflare Workers
- Edge deployment (200+ locations)
- Zero cold starts
- Free tier: 100k requests/day
- Native TypeScript support

### Database: Cloudflare D1 (SQLite)
```
Built into Cloudflare Workers - no client needed
```
- SQLite at the edge
- Free tier: 5GB storage, 100k queries/day
- Replicates globally within Cloudflare's network

### Auth: Custom JWT
- No Auth0/Clerk (keep it simple)
- bcrypt for password hashing
- jose for JWT signing/verification
- Sessions stored in D1

### Payments: Stripe
```
stripe: ^17.0.0
```
- Checkout hosted pages
- Webhook handling in Workers
- PCI compliance handled by Stripe

### AI: OpenAI API
```
openai: ^4.0.0
```
- GPT-4o-mini for question generation
- Reasoning effort: low (fast, cheap)
- Caching layer to reduce costs

---

## Infrastructure

### Hosting: Cloudflare Pages
- Automatic deployments from git
- Branch previews
- Global CDN
- Free SSL

### DNS: Cloudflare
- Free tier
- DDoS protection
- Analytics included

### Error Tracking: Sentry (free tier)
```
@sentry/react: ^8.0.0
```

### Analytics: Cloudflare Web Analytics
- Free
- Privacy-focused
- No cookie banner needed

---

## Development Tools

### Package Manager: npm
- Standard with Node.js

### Linter: ESLint
```
eslint: ^9.x
```

### Type Checking: TypeScript 5
```
typescript: ~5.9.3
```
- Strict mode enabled

---

## Exact Versions (Lock These)

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "gsap": "^3.12.0",
    "lucide-react": "^0.474.0",
    "stripe": "^17.0.0",
    "openai": "^4.0.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.0.0"
  },
  "devDependencies": {
    "vite": "^7.2.4",
    "@vitejs/plugin-react": "^5.1.1",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "~5.9.3",
    "eslint": "^9.x",
    "wrangler": "^3.0.0"
  }
}
```

---

## Design System

### Color Palette (Engineering Library)
| Token | Hex | Usage |
|-------|-----|-------|
| `--paper-cream` | `#F5F1E8` | Page background |
| `--paper-aged` | `#EDE8DC` | Card backgrounds |
| `--ink-black` | `#1A1A2E` | Primary text |
| `--pencil-gray` | `#4A5568` | Secondary text |
| `--blueprint-navy` | `#1A365D` | Headlines, borders, CTAs |
| `--stamp-red` | `#C53030` | Stamps, warnings, badges |
| `--highlighter` | `#F4D03F` | Text highlight (40% opacity) |
| `--grid-line` | `#D4CFC4` | Graph paper grid |

### Typography
| Use | Font | Fallback |
|-----|------|----------|
| Headlines | Source Serif 4 | Georgia, serif |
| Body | Inter | system-ui, sans-serif |
| Data/Labels | JetBrains Mono | monospace |

### Key UI Patterns
1. **Graph paper grid** - Subtle 20px grid on all sections
2. **Index cards** - Sharp corners, pencil borders, layered shadow
3. **Date stamps** - Rotated -2deg, navy border, monospace
4. **Exam stamps** - Rotated -8deg, red border, "ACTUAL EXAM"
5. **Ruler dividers** - Repeating linear gradient ticks
6. **Highlighter** - Yellow bar behind key text at 40% opacity

---

## Frontend-Backend Integration

### API Client Pattern
```typescript
// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('jwt');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    window.location.href = '/login';
  }

  if (response.status === 402) {
    window.location.href = '/upgrade';
  }

  return response.json();
}
```

### Key Endpoints
| Endpoint | Usage | Credit Cost |
|----------|-------|-------------|
| `POST /api/auth/login` | User login | Free |
| `GET /api/auth/me` | Get current user | Free |
| `GET /api/courses` | List courses | Free |
| `GET /api/courses/:id/analysis` | Exam analysis | 2 credits |
| `GET /api/questions` | List questions (preview) | Free |
| `POST /api/questions/:id/reveal` | Full question + solution | 1 credit |
| `GET /api/credits/balance` | Check credits | Free |
| `POST /api/credits/purchase` | Initiate Stripe checkout | Free |

---

## Project Structure

```
frontend/
├── src/
│   ├── sections/           # Page sections (Hero, Pricing, etc.)
│   │   ├── Navigation.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── TopicFrequency.tsx
│   │   ├── WhatsInside.tsx
│   │   ├── SocialProof.tsx
│   │   ├── Pricing.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   └── api.ts          # API client
│   ├── hooks/
│   │   └── useAuth.ts      # Auth context hook
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css           # Tailwind + custom styles
├── public/
│   └── hero-exam.jpg
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Cost Estimates (Monthly)

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| Cloudflare Workers | 100k/day | 50k/day | $0 |
| D1 | 5GB, 100k queries/day | 1GB, 50k queries/day | $0 |
| Cloudflare Pages | Unlimited | 1 site | $0 |
| OpenAI API | - | $50-100 | ~$75 |
| Stripe | - | $500 revenue | ~$15 (2.9% + $0.30) |
| **Total** | | | **~$90/month** |

---

## Why Not [Alternative]?

| Alternative | Why We Rejected |
|-------------|-----------------|
| Next.js | Server costs, vendor lock-in |
| Supabase Auth | Extra dependency, can build simpler |
| PlanetScale | MySQL overkill, costs scale faster |
| Vercel | Costs at scale, vendor lock-in |
| Firebase | Google dependency, complex pricing |

---

## Migration Path

If we need to scale beyond Cloudflare:
1. Move D1 to dedicated PostgreSQL if needed
2. Add Redis cache layer
3. Workers → Docker containers
4. Keep React (frontend doesn't change)

But this handles 100k+ users easily.
