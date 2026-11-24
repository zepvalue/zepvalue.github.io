---
layout: case-study
title: zippy-fit
project: zippy-fit
permalink: /apps/zippy-fit/
summary: The fitness game you play with a partner. Miss a day and you both feel it.
years: "2026"
stats:
  - { value: "2", label: players per duo }
  - { value: iOS · Android, label: platforms }
---

## Problem

Workout plans fail when nobody notices you skipped a day. Streaks work well in
apps like language learners, but you keep them alone.

## What I built

A co-op fitness game. Two people make a **duo** with a 4-character invite code
and do a daily challenge together.

- **Streaks and hearts.** If one partner misses a day, the duo loses a heart.
- **Journey map.** A day-by-day path of the duo's progress.
- **Grimoire.** Each workout unlocks a short fitness fact.
- **Nudge and spot.** Poke your partner, or ask for a spot when you can't train.
- **Auth and real-time sync** with Convex.

## Stack

- React Native
- Expo Router
- TypeScript
- Convex
- FastAPI
- Reanimated

## Results

- Runs end to end on Expo, with a local FastAPI backend and a Convex dev deployment.
- Next: native builds and tester builds with Fastlane and Firebase App Distribution.