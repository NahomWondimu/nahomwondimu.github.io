---
title: gohttp-fuzz
type: Open Source
stack: [Go, Fuzzing]
github: https://github.com
---

## Overview

High-throughput HTTP fuzzer written in Go. Supports custom wordlists, mutation strategies, and structured JSON/CSV output for integration into CI pipelines. 900+ GitHub stars, used by several red teams.

## Features

- **Concurrent requests** — configurable worker pool, tested to 50k req/s on loopback
- **Mutation engine** — character substitution, encoding variations, path traversal sequences
- **Structured output** — JSON lines for piping into jq, Splunk, or custom tooling
- **Response filtering** — filter by status code, content length, response time, regex match

## Quick Start

```bash
go install github.com/nahomwondimu/gohttp-fuzz@latest

gohttp-fuzz -u https://target.com/FUZZ \
  -w wordlists/common.txt \
  -t 50 \
  -fc 404 \
  -o results.json
```

## Output Format

```json
{"url":"https://target.com/admin","status":200,"length":4821,"words":312,"lines":89,"duration_ms":142}
{"url":"https://target.com/api","status":301,"length":0,"words":0,"lines":0,"duration_ms":38}
```

## CI Integration

```yaml
- name: Fuzz API surface
  run: |
    gohttp-fuzz -u ${{ env.TARGET }}/FUZZ \
      -w wordlists/api-endpoints.txt \
      -fc 404,403 -mc 200,201,301 \
      -o fuzz-results.json
```
