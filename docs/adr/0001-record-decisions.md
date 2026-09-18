# ADR 0001 — Record architecture decisions

- **Status:** accepted
- **Date:** 2026-09-19

## Context

TerraPulse is built by a small team under hackathon timelines but aims at instrument-grade credibility.
Decisions like artifacts-first storage, deterministic pipelines and content-addressed receipts need a durable
explanation for future contributors and judges.

## Decision

We record architecture decisions as lightweight ADRs in `docs/adr/`, one file per decision, numbered
sequentially, updated only by superseding ADRs.

## Consequences

New contributors can reconstruct *why* the system is shaped the way it is without archaeology. See
`docs/architecture.md` §Design decisions for the first six records (D1–D6).
