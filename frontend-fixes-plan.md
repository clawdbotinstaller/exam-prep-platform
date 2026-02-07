# Frontend Fixes Plan

**Generated**: 2026-02-07

## Issues Identified

### 1. Navigation Bar Covers Content
- **Location**: HeroSection.tsx
- **Issue**: The "2022-2024 Collection" date stamp is covered by the fixed navbar
- **Fix**: Add top padding to hero section to account for navbar height

### 2. ArchiveBrowse Shows Mock Data Instead of Real Questions
- **Location**: ArchiveBrowse.tsx
- **Issue**: Shows 8 hardcoded exam cards instead of fetching from `/api/questions`
- **Fix**: Replace mock data with API call to fetch real questions

### 3. TopicDeepDive May Have Similar Issues
- **Location**: TopicDeepDive.tsx
- **Issue**: Needs verification of data source

### 4. StudyFlow Shows Hardcoded Stats
- **Location**: StudyFlow.tsx
- **Issue**: Claims "80+ questions, 5 years" without verification
- **Fix**: Optional - could fetch stats from API

## Tasks

### T1: Fix Navigation Covering Content
- **depends_on**: []
- **location**: frontend/src/sections/HeroSection.tsx
- **description**: Add pt-20 or similar padding to hero section to prevent navbar overlap
- **validation**: "2022-2024 Collection" text is fully visible below navbar

### T2: Connect ArchiveBrowse to Real API
- **depends_on**: []
- **location**: frontend/src/sections/ArchiveBrowse.tsx
- **description**: Replace hardcoded examCards with API call to /api/featured-question or /api/questions?limit=6
- **validation**: Section displays real questions from database with correct topics, years, and problem text

### T3: Verify TopicDeepDive Data Source
- **depends_on**: []
- **location**: frontend/src/sections/TopicDeepDive.tsx
- **description**: Check if using real API data or mock data, fix if needed
- **validation**: Component fetches from /api/featured-question or similar endpoint

### T4: Test All Changes
- **depends_on**: [T1, T2, T3]
- **location**: All modified files
- **description**: Build and verify all changes work correctly
- **validation**: No TypeScript errors, build succeeds, data displays correctly
