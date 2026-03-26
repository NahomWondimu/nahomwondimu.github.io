---
title: ThreatMap CLI
type: Tool
stack: [Go, GTI, VT API]
github: https://github.com
---

## Overview

CLI tool that pulls from Google Threat Intelligence, VirusTotal, and Shodan to build a unified indicator context report. Designed for analysts in terminal-first workflows.

## Supported Indicator Types

- IP addresses
- Domains and FQDNs
- File hashes (MD5, SHA1, SHA256)
- URLs

## Usage

```bash
# Single indicator
threatmap check 185.220.101.47

# Batch from file
threatmap check --file iocs.txt --format json | jq '.[] | select(.score > 70)'

# Pivot on a domain
threatmap pivot --domain evil.example.com --depth 2
```

## Sample Output

```
┌─ 185.220.101.47 ────────────────────────────────────────┐
│ Score        87/100 (MALICIOUS)                          │
│ Tags         tor-exit, c2, botnet                        │
│ GTI          Known C2 — Cobalt Strike (high confidence)  │
│ VT           62/93 engines flagged                       │
│ Shodan       Port 443 open — Cobalt Strike Team Server   │
│ First seen   2023-11-04    Last seen  2024-03-18         │
└──────────────────────────────────────────────────────────┘
```

## Configuration

```bash
export THREATMAP_GTI_KEY=your_key
export THREATMAP_VT_KEY=your_key
export THREATMAP_SHODAN_KEY=your_key
```
