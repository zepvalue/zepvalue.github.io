---
layout: case-study
title: firecomm
project: firecomm
permalink: /apps/firecomm/
summary: A feature library for gRPC-Node. Typed, streaming gRPC services with less boilerplate.
years: "2019"
stats:
  - { value: 1.1k, label: npm downloads / yr }
  - { value: v2.0.5, label: latest version }
  - { value: Apache-2.0, label: license }
---

## Problem

gRPC in Node was powerful but hard to use. You had to load `.proto` files by
hand, and streams, metadata, errors and channel options each had a different API.

## What I built

An open-source library on top of gRPC-Node:

- One `build()` call packages a `.proto` file for servers and client stubs.
- A single chainable API for unary, client-streaming, server-streaming and
  bidirectional calls.
- Event listeners for data, metadata, cancellation, errors and status.
- Express-like middleware on the server and interceptors on the client.
- Access to all 74 gRPC channel options, plus idempotent, cacheable, corked
  and `waitForReady` requests.

## Stack

- Node.js
- gRPC
- Protocol Buffers
- JavaScript

## Results

- Published on npm, with about 1.1k downloads a year.
- Docs site at [firecomm.github.io](https://firecomm.github.io).
- <span class="todo">TODO: team size, your part, what you learned.</span>
