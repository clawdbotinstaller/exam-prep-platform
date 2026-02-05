# Frontend Guidelines

> **Last Updated:** 2026-02-05
> **Design System:** Modern, Clean, Student-Friendly
> **Primary Style:** Bento Grid + Glassmorphism accents

---

## Philosophy

**"Serious but approachable"**
- Students are stressed - UI should be calming, not overwhelming
- Math is hard - app should feel easy
- Premium feel without intimidation
- Mobile-first (students study on phones)

---

## Color Palette

### Primary Colors
```css
--color-primary: #3B82F6;        /* Blue - trust, focus */
--color-primary-dark: #1D4ED8;   /* Darker blue - hover states */
--color-primary-light: #DBEAFE;  /* Light blue - backgrounds */
```

### Semantic Colors
```css
--color-success: #10B981;        /* Green - correct, success */
--color-warning: #F59E0B;        /* Amber - low credits, warning */
--color-error: #EF4444;          /* Red - errors, incorrect */
--color-info: #06B6D4;           /* Cyan - info, tips */
```

### Neutral Colors
```css
--color-bg: #FFFFFF;             /* White - main background */
--color-bg-secondary: #F8FAFC;   /* Slate 50 - cards, sections */
--color-bg-tertiary: #F1F5F9;    /* Slate 100 - hover, borders */
--color-text: #0F172A;           /* Slate 900 - primary text */
--color-text-secondary: #64748B; /* Slate 500 - secondary text */
--color-text-muted: #94A3B8;     /* Slate 400 - placeholders */
--color-border: #E2E8F0;         /* Slate 200 - borders */
```

### Dark Mode (Future)
```css
--color-bg-dark: #0F172A;
--color-bg-secondary-dark: #1E293B;
--color-text-dark: #F8FAFC;
```

---

## Typography

### Font Stack
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Type Scale
```css
/* Headings */
--text-h1: 2.25rem;    /* 36px - Page titles */
--text-h2: 1.5rem;     /* 24px - Section headers */
--text-h3: 1.25rem;    /* 20px - Card titles */
--text-h4: 1.125rem;   /* 18px - Subsection */

/* Body */
--text-body: 1rem;     /* 16px - Default */
--text-body-sm: 0.875rem; /* 14px - Secondary */
--text-caption: 0.75rem;  /* 12px - Labels */

/* Special */
--text-display: 3rem;  /* 48px - Landing hero */
--text-math: 1.125rem; /* Math expressions - slightly larger */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.25;   /* Headings */
--leading-normal: 1.5;   /* Body */
--leading-relaxed: 1.75; /* Math explanations */
```

---

## Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Large cards, modals */
--radius-full: 9999px;  /* Pills, avatars */
```

---

## Shadows

```css
/* Flat - default state */
--shadow-none: none;

/* Subtle - cards */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Standard - elevated cards */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),
             0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Prominent - modals, dropdowns */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
             0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Special - glassmorphism */
--shadow-glass: 0 8px 32px 0 rgb(0 0 0 / 0.08);
```

---

## Layout Patterns

### Container
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem; /* Mobile padding */
}

@media (min-width: 640px) {
  .container { padding: 0 1.5rem; }
}

@media (min-width: 1024px) {
  .container { padding: 0 2rem; }
}
```

### Bento Grid (Primary Layout)
```css
.bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Card sizes */
.bento-card-small { grid-column: span 1; }
.bento-card-medium { grid-column: span 1; grid-row: span 1; }
.bento-card-large { grid-column: span 2; }
.bento-card-full { grid-column: span 3; }
```

---

## Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
}

.btn-secondary:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-primary);
}
```

#### Credit Button (Special)
```css
.btn-credit {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-weight: var(--font-bold);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
```

### Cards

#### Standard Card
```css
.card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card-hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

#### Glass Card (Special)
```css
.card-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-glass);
}
```

### Forms

#### Input
```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

#### Label
```css
.label {
  display: block;
  font-size: var(--text-body-sm);
  font-weight: var(--font-medium);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}
```

### Credit Badge
```css
.credit-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--color-warning);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-body-sm);
  font-weight: var(--font-bold);
}

.credit-badge-low {
  background: var(--color-error);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

## Animations

### Micro-interactions
```css
/* Button press */
.btn:active {
  transform: scale(0.98);
}

/* Card lift */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Credit deduction flash */
@keyframes credit-flash {
  0% { color: inherit; }
  50% { color: var(--color-error); }
  100% { color: inherit; }
}

.credit-deducted {
  animation: credit-flash 0.5s ease;
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Fade in */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fade-in 0.3s ease;
}
```

---

## Math Content Styling

### Question Display
```css
.math-question {
  font-size: var(--text-math);
  line-height: var(--leading-relaxed);
  font-family: 'Times New Roman', serif; /* For math symbols */
}

/* Ensure math symbols render nicely */
.math-symbol {
  font-style: italic;
}

.fraction {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
}
```

### Solution Steps
```css
.solution-step {
  padding: var(--space-4);
  border-left: 3px solid var(--color-primary);
  background: var(--color-bg-secondary);
  margin-bottom: var(--space-4);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.solution-step-number {
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}
```

---

## Responsive Breakpoints

```css
/* Mobile first - base styles for mobile */

/* sm: 640px */
@media (min-width: 640px) { }

/* md: 768px */
@media (min-width: 768px) { }

/* lg: 1024px */
@media (min-width: 1024px) { }

/* xl: 1280px */
@media (min-width: 1280px) { }
```

---

## Accessibility

- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 minimum
- Focus visible on all interactive elements
- Alt text for all images
- Semantic HTML structure
- Keyboard navigation support

---

## Svelte-Specific Patterns

### Component Structure
```svelte
<script>
  // Props
  export let propName = defaultValue;

  // State
  let localState = $state(initialValue);
  let derivedValue = $derived(compute(localState));

  // Effects
  $effect(() => {
    // Side effects
  });
</script>

<template>
  <!-- HTML -->
</template>

<style>
  /* Scoped styles */
</style>
```

### Transitions
```svelte
{#if show}
  <div transition:fade={{ duration: 200 }}>
    Content
  </div>
{/if}
```

---

## File Naming

- Components: `PascalCase.svelte` (e.g., `CreditBadge.svelte`)
- Utilities: `camelCase.ts` (e.g., `formatCredits.ts`)
- Styles: `kebab-case.css` (e.g., `variables.css`)
- Pages: `+page.svelte` (SvelteKit convention)
- Layouts: `+layout.svelte`

---

## shadcn-svelte Components to Install

```bash
npx shadcn-svelte@latest add button
npx shadcn-svelte@latest add card
npx shadcn-svelte@latest add input
npx shadcn-svelte@latest add label
npx shadcn-svelte@latest add checkbox
npx shadcn-svelte@latest add dialog
npx shadcn-svelte@latest add dropdown-menu
npx shadcn-svelte@latest add progress
npx shadcn-svelte@latest add select
npx shadcn-svelte@latest add separator
npx shadcn-svelte@latest add skeleton
npx shadcn-svelte@latest add tabs
```
