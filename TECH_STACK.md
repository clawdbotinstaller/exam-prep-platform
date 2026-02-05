# Tech Stack Document

> **Last Updated:** 2026-02-05
> **Version:** 1.0
> **Status:** Frozen for MVP

---

## Core Philosophy

**Svelte + Vite + Cloudflare = Fast, Simple, Cheap**

- Zero server management
- Edge deployment globally
- Pay only for what you use
- Developer experience priority

---

## Frontend

### Framework: Svelte 5
```
svelte: ^5.0.0
```
- Runes syntax ($state, $derived, $effect)
- No virtual DOM = faster
- Built-in animations
- Smaller bundle than React

### Build Tool: Vite 6
```
vite: ^6.0.0
@vitejs/plugin-svelte: ^5.0.0
```
- Instant HMR
- Optimized builds
- Native TypeScript support

### Routing: SvelteKit (if needed) or simple router
```
@sveltejs/kit: ^2.0.0
```
- File-based routing
- Server-side rendering option
- API routes in same project

### Styling: Tailwind CSS 4
```
tailwindcss: ^4.0.0
```
- Utility-first
- Design tokens via CSS variables
- Purge unused styles automatically

### UI Components: shadcn-svelte
```
npx shadcn-svelte@latest init
```
- Pre-built accessible components
- Copy-paste into project (own the code)
- Matches Tailwind perfectly

### State Management: Svelte Stores
- Built-in (no extra library)
- $writable for local state
- $readable for derived data

### Icons: Lucide Svelte
```
lucide-svelte: ^0.400.0
```

---

## Backend

### Runtime: Cloudflare Workers
- Edge deployment (200+ locations)
- Zero cold starts
- Free tier: 100k requests/day
- Native TypeScript support

### Database: Turso (LibSQL)
```
@libsql/client: ^0.14.0
```
- SQLite at the edge
- Free tier: 500 databases, 9GB storage
- Replicates globally

### Auth: Custom JWT
- No Auth0/Clerk (keep it simple)
- bcrypt for password hashing
- jose for JWT signing/verification
- Sessions stored in Turso

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
@sentry/svelte: ^8.0.0
```

### Analytics: Cloudflare Web Analytics
- Free
- Privacy-focused
- No cookie banner needed

---

## Development Tools

### Package Manager: pnpm
```
pnpm: ^9.0.0
```
- Faster than npm
- Better disk space usage
- Workspace support (if needed later)

### Linter: ESLint + Prettier
```
eslint: ^9.0.0
prettier: ^3.0.0
```

### Type Checking: TypeScript 5
```
typescript: ^5.5.0
```
- Strict mode enabled
- No implicit any

---

## Exact Versions (Lock These)

```json
{
  "dependencies": {
    "svelte": "^5.0.0",
    "@sveltejs/kit": "^2.5.0",
    "@libsql/client": "^0.14.0",
    "stripe": "^17.0.0",
    "openai": "^4.0.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.0.0",
    "lucide-svelte": "^0.400.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-svelte": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "wrangler": "^3.0.0"
  }
}
```

---

## Cost Estimates (Monthly)

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| Cloudflare Workers | 100k/day | 50k/day | $0 |
| Turso | 9GB, 500 DBs | 1GB, 1 DB | $0 |
| Cloudflare Pages | Unlimited | 1 site | $0 |
| OpenAI API | - | $50-100 | ~$75 |
| Stripe | - | $500 revenue | ~$15 (2.9% + $0.30) |
| **Total** | | | **~$90/month** |

At 100 paid users @ $10 average: $1000 revenue - $90 costs = **$910 profit**

---

## Why Not [Alternative]?

| Alternative | Why We Rejected |
|-------------|-----------------|
| React | Bundle size, complexity |
| Next.js | Server costs, vendor lock-in |
| Supabase Auth | Extra dependency, can build simpler |
| PlanetScale | MySQL overkill, costs scale faster |
| Vercel | Costs at scale, vendor lock-in |
| Firebase | Google dependency, complex pricing |

---

## Migration Path

If we need to scale beyond Cloudflare:
1. Move Turso to dedicated SQLite server
2. Add Redis cache layer
3. Workers → Docker containers
4. Keep Svelte (frontend doesn't change)

But this handles 100k+ users easily.
