# Parallel Task Plan: Frontend ↔ Arkived Backend Mismatch Report

## Overview
Identify API/contract mismatches between the frontend and the **Arkived remote worker** you are previewing, plus doc drift. Produce a concrete fix list for beta readiness.

## Tasks

### T1: Frontend API Inventory
- **depends_on**: []
- **Description**: Enumerate all frontend API calls, methods, payloads, and expected response shapes.
- **Locations**:
  - frontend/src/**
  - frontend/src/lib/api.ts
- **Acceptance Criteria**:
  - List of endpoints with file references
  - Expected request/response shape summary
- **Validation**: grep/find results captured in report

### T2: Arkived Remote Endpoint Probe
- **depends_on**: []
- **Description**: Probe Arkived remote worker to identify available endpoints, auth requirements, and response shapes.
- **Locations**:
  - https://arkived.clawdbotinstaller.workers.dev
- **Acceptance Criteria**:
  - List of confirmed endpoints + sample status/shape
  - Notes on auth-required endpoints
- **Validation**: curl outputs summarized in report

### T3: Docs Drift Audit
- **depends_on**: []
- **Description**: Read docs and identify outdated or contradictory product/tech details.
- **Locations**:
  - docs/PRD.md
  - docs/APP_FLOW.md
  - docs/TECH_STACK.md
  - docs/CLAUDE_CONTEXT.md
  - docs/IMPLEMENTATION_PLAN.md
  - docs/SEMANTIC_MEMORY_EXPORT.json
  - docs/BACKEND.md
- **Acceptance Criteria**:
  - List of stale sections + proposed updates
- **Validation**: excerpts cited in report

### T4: Mismatch Report + Beta Fix List
- **depends_on**: [T1, T2, T3]
- **Description**: Produce a consolidated mismatch report and prioritized fix list.
- **Acceptance Criteria**:
  - Frontend↔Backend mismatch table
  - Beta-ready checklist
  - High-priority fixes identified
- **Validation**: report delivered in response

## Work Log
- (empty)
