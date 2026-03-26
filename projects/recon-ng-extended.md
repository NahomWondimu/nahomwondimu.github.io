---
title: recon-ng-extended
type: Tool
stack: [Python, recon-ng, APIs]
github: https://github.com
---

## Overview

Extended module suite for recon-ng adding passive DNS enumeration, certificate transparency parsing, and ASN mapping for large-scope engagements.

## Modules

### passive-dns
Queries passive DNS providers to enumerate historical records without active resolution. Supports DNSDB, SecurityTrails, and RiskIQ.

### cert-transparency
Parses Certificate Transparency logs via crt.sh and Google's CT API to discover subdomains from issued certificates.

### asn-mapper
Given a target organization, resolves associated ASNs and enumerates owned IP ranges using ARIN/RIPE/APNIC WHOIS.

## Usage

```bash
recon-ng -w workspace
[recon-ng][workspace] > marketplace install passive-dns
[recon-ng][workspace] > modules load recon/domains-hosts/passive-dns
[recon-ng][workspace][passive-dns] > options set SOURCE example.com
[recon-ng][workspace][passive-dns] > run
```

## Installation

```bash
git clone https://github.com/nahomwondimu/recon-ng-extended
cd recon-ng-extended
pip install -r requirements.txt
cp modules/* ~/.recon-ng/modules/recon/
```
