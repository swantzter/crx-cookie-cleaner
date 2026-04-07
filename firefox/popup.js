const TARGET_DOMAINS = [
  "cloud.microsoft",
  "microsoft.com",
  "microsoftonline.com",
  "office.com",
  "office365.com",
];

function matches(domain) {
  const d = domain.startsWith(".") ? domain.slice(1) : domain;
  return TARGET_DOMAINS.some((t) => d === t || d.endsWith("." + t));
}

document.getElementById("clean").addEventListener("click", async () => {
  const result = document.getElementById("result");
  result.textContent = "Scanning...";
  result.className = "";

  try {
    // 1. Remove cookies via cookies API (supports firstPartyDomain)
    const cookies = await browser.cookies.getAll({
      firstPartyDomain: null,
    });
    const targets = cookies.filter((c) => matches(c.domain));

    const results = await Promise.allSettled(
      targets.map((cookie) => {
        const protocol = cookie.secure ? "https" : "http";
        const domain = cookie.domain.startsWith(".")
          ? cookie.domain.slice(1)
          : cookie.domain;
        const url = `${protocol}://${domain}${cookie.path}`;
        return browser.cookies.remove({
          url,
          name: cookie.name,
          storeId: cookie.storeId,
          firstPartyDomain: cookie.firstPartyDomain || "",
        });
      })
    );

    let removed = 0;
    const errors = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        removed++;
      } else {
        const c = targets[i];
        errors.push(`  ${c.name} (${c.domain}): ${r.reason.message}`);
      }
    });

    // 2. Remove other stored data via browsingData API
    //    hostnames requires exact matches (no subdomain wildcarding),
    //    so collect actual hostnames from the cookies we found.
    const hostnames = [
      ...new Set(
        targets.map((c) =>
          c.domain.startsWith(".") ? c.domain.slice(1) : c.domain
        )
      ),
    ];
    // Include the base TARGET_DOMAINS too (may have storage without cookies)
    for (const d of TARGET_DOMAINS) {
      if (!hostnames.includes(d)) hostnames.push(d);
    }

    await browser.browsingData.remove(
      { hostnames },
      {
        cache: true,
        indexedDB: true,
        localStorage: true,
        serviceWorkers: true,
        pluginData: true,
      }
    );

    let msg = `Cookies: removed ${removed}`;
    if (removed > 0) {
      msg += `\n${targets.map((c) => `  ${c.name} (${c.domain})`).join("\n")}`;
    }
    msg += `\nStorage: cleared for ${hostnames.length} hostnames`;
    if (errors.length) {
      msg += `\n\nFailed (${errors.length}):\n${errors.join("\n")}`;
    }
    result.textContent = msg;
    result.className = errors.length ? "error" : "success";
  } catch (e) {
    result.textContent = `Error: ${e.message}`;
    result.className = "error";
  }
});
