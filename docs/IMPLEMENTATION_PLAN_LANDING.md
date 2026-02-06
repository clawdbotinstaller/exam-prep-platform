# Landing Page Implementation Plan

> **Strategy:** Use Kimi React app as base, enhance with Stitch design elements
> **Status:** Completed (landing already implemented)
>
> **Base:** `/Users/muadhsambul/exam-prep-platform/UI-choose design/app/`
> **Target:** `/Users/muadhsambul/exam-prep-platform/frontend/`
> **Approach:** Copy → Update colors → Add Stitch elements

---

## Why This Approach

The Kimi app already has:
- ✅ Working React + Vite + TypeScript setup
- ✅ GSAP ScrollTrigger with pinned sections
- ✅ Global scroll snap behavior
- ✅ Horizontal navigation (no sideways text!)
- ✅ All section components
- ✅ CSS with design tokens

**We just need to:**
1. Copy files to frontend directory
2. Update color scheme (cream/navy/red from Stitch)
3. Add Stitch elements (exam stamps, library checkout card)
4. Tweak animations

---

## Task 1: Copy Kimi App to Frontend

**Files to copy:**
```
FROM: /Users/muadhsambul/exam-prep-platform/UI-choose design/app/
TO:   /Users/muadhsambul/exam-prep-platform/frontend/

- package.json (merge dependencies)
- tailwind.config.js
- vite.config.ts
- src/index.css
- src/App.tsx
- src/main.tsx
- src/sections/*.tsx
- src/components/ui/*.tsx
- src/hooks/*.ts
- src/lib/*.ts
- public/*.jpg
```

**Step 1: Backup current frontend**
```bash
cd /Users/muadhsambul/exam-prep-platform/frontend
mv src src.backup
mv package.json package.json.backup
```

**Step 2: Copy Kimi files**
```bash
cp -r /Users/muadhsambul/exam-prep-platform/UI-choose\ design/app/src .
cp /Users/muadhsambul/exam-prep-platform/UI-choose\ design/app/package.json .
cp /Users/muadhsambul/exam-prep-platform/UI-choose\ design/app/tailwind.config.js .
cp /Users/muadhsambul/exam-prep-platform/UI-choose\ design/app/vite.config.ts .
cp -r /Users/muadhsambul/exam-prep-platform/UI-choose\ design/app/public/* public/
```

**Step 3: Install dependencies**
```bash
npm install
```

**Step 4: Test it works**
```bash
npm run dev
```

**Step 5: Commit**
```bash
git add .
git commit -m "feat: copy Kimi app as base for landing page"
```

---

## Task 2: Update Color Scheme

**Changes to `src/index.css`:**

Update CSS variables to match Stitch design:
```css
:root {
  /* Engineering Library Color Palette - UPDATED */
  --paper-cream: #F5F1E8;
  --paper-aged: #EDE8DC;
  --ink-black: #1A1A2E;
  --pencil-gray: #4A5568;        /* Changed from #3D3D3D */
  --blueprint-navy: #1A365D;     /* Changed from #1E3A5F */
  --highlighter-yellow: #F4D03F; /* Used at 40% opacity */
  --stamp-red: #C53030;          /* NEW - for exam stamps */
  --red-pen: #C0392B;
}
```

**Step 1: Update index.css**
- Change `--pencil-gray` to `#4A5568`
- Change `--blueprint-navy` to `#1A365D`
- Add `--stamp-red: #C53030`

**Step 2: Update highlighter opacity**
```css
.hand-highlight::after {
  opacity: 0.4; /* Changed from 0.5 for more subtlety */
}
```

**Step 3: Test colors look right**
```bash
npm run dev
```

**Step 4: Commit**
```bash
git commit -m "style: update color scheme to match Stitch design"
```

---

## Task 3: Add Stitch Design Elements

### Add Red "Actual Exam" Stamp

**File:** `src/index.css`

Add new CSS class:
```css
/* Red exam stamp - from Stitch */
.exam-stamp {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--stamp-red);
  border: 2px solid var(--stamp-red);
  padding: 4px 12px;
  border-radius: 2px;
  display: inline-block;
  transform: rotate(-8deg);
  opacity: 0.9;
}
```

### Update HeroSection with Stamp

**File:** `src/sections/HeroSection.tsx`

Add stamp to the image card:
```tsx
<div
  ref={imageRef}
  className="index-card overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[56vh] rotate-1 relative"
>
  <img
    src="/hero-exam.jpg"
    alt="Exam booklet and drafting tools"
    className="w-full h-full object-cover"
  />
  {/* ADD THIS: Stitch exam stamp */}
  <div className="absolute top-4 right-4 exam-stamp bg-paper-cream/90">
    Actual Exam
  </div>
</div>
```

### Update Pricing Section with Library Checkout Card

**File:** `src/sections/ContactSection.tsx` (or create new Pricing.tsx)

Transform the pricing into Stitch's library checkout card style:
```tsx
<div className="index-card p-1 border border-black/10 shadow-2xl max-w-xl mx-auto">
  <div className="border-2 border-blueprint-navy p-8 space-y-6 bg-paper-cream">
    <div className="flex justify-between items-end border-b-2 border-blueprint-navy pb-4">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-tighter text-blueprint-navy">
          Full Archive Access
        </h2>
        <p className="font-mono text-[10px] uppercase text-pencil-gray">
          Form: PERMANENT CHECKOUT
        </p>
      </div>
      <div className="text-4xl font-mono font-bold text-blueprint-navy">
        $12
      </div>
    </div>

    <div className="space-y-2 font-mono text-xs uppercase">
      <div className="flex justify-between">
        <span className="text-pencil-gray">Due Date:</span>
        <span className="font-semibold text-blueprint-navy">END OF SEMESTER</span>
      </div>
      <div className="flex justify-between">
        <span className="text-pencil-gray">Renewals:</span>
        <span className="font-semibold text-blueprint-navy">UNLIMITED</span>
      </div>
      <div className="flex justify-between">
        <span className="text-pencil-gray">Late Fees:</span>
        <span className="font-semibold text-blueprint-navy">NONE</span>
      </div>
    </div>

    <button className="w-full bg-blueprint-navy text-white py-4 font-bold uppercase tracking-widest hover:bg-highlighter hover:text-blueprint-navy transition-colors">
      Confirm Membership
    </button>

    <div className="text-center">
      <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-blueprint-navy border border-blueprint-navy px-3 py-1 opacity-70">
        APPROVED FOR RELEASE
      </span>
    </div>
  </div>
</div>
```

**Step 1: Add exam-stamp CSS to index.css**

**Step 2: Update HeroSection with stamp**

**Step 3: Update ContactSection with library checkout card**

**Step 4: Test**
```bash
npm run dev
```

**Step 5: Commit**
```bash
git commit -m "feat: add Stitch design elements (exam stamp, library checkout card)"
```

---

## Task 4: Add "Drawing No." Technical Footer

**File:** `src/sections/Footer.tsx` or create if missing

Add technical document footer:
```tsx
<div className="mt-8 pt-4 border-t border-pencil-gray/20 flex flex-col md:flex-row justify-between items-center gap-4">
  <div className="font-mono text-[8px] text-pencil-gray/60 uppercase tracking-tighter">
    Drawing No. CALC-II-2024-REF // Technical Document // No. 0082-C2
  </div>
  <div className="flex items-center gap-6 font-mono text-[8px] text-blueprint-navy font-bold">
    <span>SYSTEM: STABLE</span>
    <span>DATA_STREAM: ACTIVE</span>
  </div>
</div>
```

**Step 1: Update Footer.tsx**

**Step 2: Commit**
```bash
git commit -m "feat: add technical document footer with drawing number"
```

---

## Task 5: Build and Verify

**Step 1: Build for production**
```bash
npm run build
```

**Step 2: Verify dist folder exists**
```bash
ls -la dist/
```

**Step 3: Commit**
```bash
git add .
git commit -m "chore: production build"
```

---

## Summary of Changes

| Element | Kimi Base | Stitch Enhancement |
|---------|-----------|-------------------|
| **Framework** | React + GSAP | Keep |
| **Navigation** | Horizontal | Keep (already good!) |
| **Colors** | Cream/navy | Adjust navy to #1A365D, add red #C53030 |
| **Hero** | Index card image | Add "Actual Exam" red stamp |
| **Pricing** | Basic card | Library checkout card style |
| **Footer** | Simple | Technical "Drawing No." footer |

---

## Quick Reference: Color Mapping

| Use | Kimi | Stitch (Final) |
|-----|------|----------------|
| Background | `#F5F1E8` | `#F5F1E8` (same) |
| Navy | `#1E3A5F` | `#1A365D` (darker) |
| Gray | `#3D3D3D` | `#4A5568` (bluer) |
| Red | `#C0392B` | `#C53030` (slightly different) |
| Highlighter | 50% opacity | 40% opacity (more subtle) |
