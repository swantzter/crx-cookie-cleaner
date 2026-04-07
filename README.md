# Cookie Cleaner

Firefox extension that removes cookies and stored data for Microsoft domains.

## What it clears

**Cookies** for these domains and all their subdomains:
- `cloud.microsoft`
- `microsoft.com`
- `microsoftonline.com`
- `office.com`
- `office365.com`

**Stored data** (cache, localStorage, indexedDB, service workers) for hostnames found during the cookie scan, plus the base domains above.

## Install

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json` from this directory

For permanent install, package as `.xpi` and sign via [addons.mozilla.org](https://addons.mozilla.org).

## Firefox only

Uses Firefox-specific APIs (`firstPartyDomain` in the cookies API, `hostnames` in `browsingData.remove`) that have no Chrome equivalent.
