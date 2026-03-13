(function () {
  const { items, sectors, appConfig } = window.JDI_DATA;
  const { formatDate, navigate } = window.JDI_COMMON;
  const voteState = (() => {
    try {
      return JSON.parse(localStorage.getItem("jdi_vote_state")) || window.JDI_DATA.vote;
    } catch (e) {
      return window.JDI_DATA.vote;
    }
  })();

  const fiscalStartMonth = (appConfig && appConfig.fiscalStartMonth) || 4;
  const els = {
    periodPreset: document.getElementById("periodPreset"),
    customDates: document.getElementById("customDates"),
    customStart: document.getElementById("customStart"),
    customEnd: document.getElementById("customEnd"),
    applyPeriod: document.getElementById("applyPeriod"),
    periodLabel: document.getElementById("periodLabel"),
    periodCompareLabel: document.getElementById("periodCompareLabel"),
    compareN1: document.getElementById("compareN1")
  };

  function parseIso(iso) {
    if (!iso) return null;
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function toIso(date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function firstDayOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
  function lastDayOfMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0); }

  function daysBetween(startIso, endIso) {
    const s = parseIso(startIso);
    const e = parseIso(endIso);
    if (!s || !e) return null;
    return Math.round((e - s) / 86400000);
  }

  function ageInDays(startIso) {
    const s = parseIso(startIso);
    if (!s) return null;
    return Math.max(0, Math.round((new Date() - s) / 86400000));
  }

  function pct(part, total) { return total ? `${Math.round((part / total) * 100)}%` : "0%"; }
  function formatNumber(n) { return `${Math.round(n || 0)}`; }

  function getCurrentFiscalStartYear(referenceDate) {
    const y = referenceDate.getFullYear();
    const m = referenceDate.getMonth() + 1;
    return m >= fiscalStartMonth ? y : y - 1;
  }

  function buildFiscalRange(startYear) {
    const start = new Date(startYear, fiscalStartMonth - 1, 1);
    const end = new Date(startYear + 1, fiscalStartMonth - 1, 0);
    return { start, end, label: `Annee fiscale ${startYear}/${startYear + 1}` };
  }

  function resolvePeriod() {
    const preset = els.periodPreset.value;
    const now = new Date();

    if (preset === "currentFY") return buildFiscalRange(getCurrentFiscalStartYear(now));
    if (preset === "previousFY") return buildFiscalRange(getCurrentFiscalStartYear(now) - 1);
    if (preset === "last12") return { start: new Date(now.getFullYear(), now.getMonth() - 11, 1), end: now, label: "12 derniers mois" };

    const customStart = parseIso(els.customStart.value);
    const customEnd = parseIso(els.customEnd.value);
    if (!customStart || !customEnd || customStart > customEnd) return buildFiscalRange(getCurrentFiscalStartYear(now));
    return { start: customStart, end: customEnd, label: "Periode personnalisee" };
  }

  function shiftYear(range, deltaYears) {
    return {
      start: new Date(range.start.getFullYear() + deltaYears, range.start.getMonth(), range.start.getDate()),
      end: new Date(range.end.getFullYear() + deltaYears, range.end.getMonth(), range.end.getDate())
    };
  }

  function inRange(iso, range) {
    const d = parseIso(iso);
    return Boolean(d && d >= range.start && d <= range.end);
  }

  function renderPeriodLabel(range, activityRows) {
    els.periodLabel.textContent = `Periode analysee: ${range.label}, du ${formatDate(toIso(range.start))} au ${formatDate(toIso(range.end))}`;

    if (!els.compareN1.checked) {
      els.periodCompareLabel.textContent = "";
      return;
    }

    const n1Range = shiftYear(range, -1);
    const n1Rows = items.filter((it) => inRange(it.dateOuverture, n1Range));
    const delta = activityRows.length - n1Rows.length;
    const sign = delta > 0 ? "+" : "";
    els.periodCompareLabel.textContent = `Comparaison N-1: ${n1Rows.length} JDI sur la meme periode (${sign}${delta}).`;
  }

  function renderKpis(activityRows, range) {
    const openCount = activityRows.filter((it) => it.statut === "En cours").length;
    const doneCount = activityRows.filter((it) => it.statut === "Complété").length;
    const canceledCount = activityRows.filter((it) => it.statut === "Annulé").length;
    const completedInPeriod = items.filter((it) => it.statut === "Complété" && inRange(it.dateCloture, range));

    const closeDelays = completedInPeriod.map((it) => daysBetween(it.dateOuverture, it.dateCloture)).filter((v) => v !== null && v >= 0);
    const openAges = activityRows.filter((it) => it.statut === "En cours").map((it) => ageInDays(it.dateOuverture)).filter((v) => v !== null);

    const avgClose = closeDelays.length ? Math.round(closeDelays.reduce((s, v) => s + v, 0) / closeDelays.length) : 0;
    const avgOpenAge = openAges.length ? Math.round(openAges.reduce((s, v) => s + v, 0) / openAges.length) : 0;

    const monthCount = Math.max(1, (range.end.getFullYear() - range.start.getFullYear()) * 12 + (range.end.getMonth() - range.start.getMonth()) + 1);
    const donePerMonth = Math.round(doneCount / monthCount);
    const conversion = pct(doneCount, activityRows.length);

    document.getElementById("kpiTotal").textContent = activityRows.length;
    document.getElementById("kpiOpen").textContent = openCount;
    document.getElementById("kpiDone").textContent = doneCount;
    document.getElementById("kpiCanceled").textContent = canceledCount;
    document.getElementById("kpiCloseRate").textContent = pct(doneCount + canceledCount, activityRows.length);
    document.getElementById("kpiAvgCloseDays").textContent = `${avgClose} j`;
    document.getElementById("kpiAvgOpenAge").textContent = `${avgOpenAge} j`;
    document.getElementById("kpiDonePerMonth").textContent = donePerMonth;
    document.getElementById("kpiConversion").textContent = conversion;
  }

  function renderSimpleBars(containerId, rows) {
    const root = document.getElementById(containerId);
    root.innerHTML = "";
    const max = Math.max(...rows.map((r) => r.value), 1);
    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "analyse-bar-row";
      row.innerHTML = `<div class="analyse-bar-label">${r.label}</div><div class="analyse-bar-track"><div class="analyse-bar-fill ${r.cls || ""}" style="width:${Math.round((r.value / max) * 100)}%"></div></div><div class="analyse-bar-value">${r.value}</div>`;
      root.appendChild(row);
    });
  }

  function renderImpact(range) {
    const gainRows = items.filter((it) => it.statut === "Complété" && inRange(it.dateCloture, range));
    const manualRows = gainRows.filter((it) => it.gainMode === "manuel");
    const autoRows = gainRows.filter((it) => it.gainMode === "auto");
    const noneRows = gainRows.filter((it) => it.gainMode === "aucun");
    const rowsWithGain = gainRows.filter((it) => it.gainMode !== "aucun");

    const totalHours = rowsWithGain.reduce((s, it) => s + Number(it.gainTempsHeures || 0), 0);
    const totalEuro = rowsWithGain.reduce((s, it) => s + Number(it.gainEuro || 0), 0);
    const avg = rowsWithGain.length ? Math.round(totalEuro / rowsWithGain.length) : 0;
    const top = rowsWithGain.slice().sort((a, b) => b.gainEuro - a.gainEuro)[0];

    document.getElementById("impactTime").textContent = `${formatNumber(totalHours)} h`;
    document.getElementById("impactEuro").textContent = `${formatNumber(totalEuro)} EUR`;
    document.getElementById("impactCount").textContent = rowsWithGain.length;
    document.getElementById("impactTop").textContent = top ? `${top.numero} (${formatNumber(top.gainEuro)} EUR)` : "-";
    document.getElementById("modeManual").textContent = `Manuel: ${manualRows.length}`;
    document.getElementById("modeAuto").textContent = `Automatique: ${autoRows.length}`;
    document.getElementById("modeNone").textContent = `Sans gain chiffre: ${noneRows.length}`;
    document.getElementById("impactAvg").textContent = `Gain moyen/JDI: ${avg} EUR`;

    const typeMap = {};
    rowsWithGain.forEach((it) => {
      const key = it.typeGain || "Autre";
      typeMap[key] = (typeMap[key] || 0) + 1;
    });
    renderSimpleBars("gainTypeBars", Object.keys(typeMap).map((k) => ({ label: k, value: typeMap[k] })));
  }

  function renderSectorStack(activityRows) {
    const root = document.getElementById("sectorStack");
    root.innerHTML = "";

    sectors.forEach((sector) => {
      const done = activityRows.filter((it) => it.secteur === sector && it.statut === "Complété").length;
      const open = activityRows.filter((it) => it.secteur === sector && it.statut === "En cours").length;
      const canceled = activityRows.filter((it) => it.secteur === sector && it.statut === "Annulé").length;
      const total = done + open + canceled;
      const denom = total || 1;

      const row = document.createElement("div");
      row.className = "analyse-stack-row";
      row.innerHTML = `
        <div class="analyse-stack-label">${sector}</div>
        <div class="analyse-stack-track">
          <span class="stack done" style="width:${Math.round((done / denom) * 100)}%"></span>
          <span class="stack open" style="width:${Math.round((open / denom) * 100)}%"></span>
          <span class="stack cancel" style="width:${Math.max(0, 100 - Math.round((done / denom) * 100) - Math.round((open / denom) * 100))}%"></span>
        </div>
        <div class="analyse-stack-value">${total}</div>
      `;
      root.appendChild(row);
    });

    const legend = document.createElement("div");
    legend.className = "analyse-legend";
    legend.innerHTML = "<span><i class='chip done'></i>Complété</span><span><i class='chip open'></i>En cours</span><span><i class='chip cancel'></i>Annulé</span>";
    root.appendChild(legend);
  }

  function renderStatusBars(activityRows) {
    renderSimpleBars("statusBars", [
      { label: "En cours", value: activityRows.filter((it) => it.statut === "En cours").length, cls: "warn" },
      { label: "Complété", value: activityRows.filter((it) => it.statut === "Complété").length, cls: "ok" },
      { label: "Annulé", value: activityRows.filter((it) => it.statut === "Annulé").length, cls: "cancel" }
    ]);
  }

  function renderMonthlyFlow(range) {
    const root = document.getElementById("monthlyFlow");
    root.innerHTML = "";
    const months = [];
    let cur = firstDayOfMonth(range.start);
    while (cur <= firstDayOfMonth(range.end)) {
      months.push(new Date(cur));
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }

    const rows = months.map((m) => {
      const key = `${m.getFullYear()}-${`${m.getMonth() + 1}`.padStart(2, "0")}`;
      const end = lastDayOfMonth(m);
      const created = items.filter((it) => (it.dateOuverture || "").startsWith(key)).length;
      const closed = items.filter((it) => (it.dateCloture || "").startsWith(key)).length;
      const backlog = items.filter((it) => {
        const o = parseIso(it.dateOuverture);
        const c = parseIso(it.dateCloture);
        return o && o <= end && (!c || c > end);
      }).length;
      return { label: `${`${m.getMonth() + 1}`.padStart(2, "0")}/${m.getFullYear()}`, created, closed, backlog };
    });

    const max = Math.max(...rows.map((r) => Math.max(r.created, r.closed, r.backlog)), 1);
    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "analyse-month-row";
      row.innerHTML = `<div class="analyse-month-label">${r.label}</div><div class="analyse-month-triple"><span class="bar created" style="width:${Math.round((r.created / max) * 100)}%"></span><span class="bar closed" style="width:${Math.round((r.closed / max) * 100)}%"></span><span class="bar backlog" style="width:${Math.round((r.backlog / max) * 100)}%"></span></div><div class="analyse-month-value">C ${r.created} / Cl ${r.closed} / B ${r.backlog}</div>`;
      root.appendChild(row);
    });
  }

  function renderFollowTable(range) {
    const rows = items
      .filter((it) => it.statut === "En cours")
      .filter((it) => parseIso(it.dateOuverture) && parseIso(it.dateOuverture) <= range.end)
      .map((it) => ({ ...it, age: ageInDays(it.dateOuverture) || 0 }))
      .sort((a, b) => b.age - a.age)
      .slice(0, 10);

    const body = document.getElementById("followRows");
    body.innerHTML = "";

    rows.forEach((it) => {
      const tr = document.createElement("tr");
      tr.className = it.age > 60 ? "age-high" : it.age >= 30 ? "age-mid" : "age-normal";
      tr.innerHTML = `
        <td class="mono">${it.numero}</td>
        <td>${it.libelle}</td>
        <td>${it.secteur}</td>
        <td>${formatDate(it.dateOuverture)}</td>
        <td>${it.age} j</td>
        <td><span class="badge en-cours">En cours</span></td>
        <td>${it.responsable || "-"}</td>
        <td>${Math.round(it.gainEuro || 0)} EUR</td>
      `;
      tr.addEventListener("click", () => navigate(`itemvisu.html?id=${encodeURIComponent(it.id)}`));
      body.appendChild(tr);
    });
  }

  function scoreCompleteness(it) {
    let score = 100;
    if (!it.descriptionApres) score -= 20;
    if (!it.presenceImagesAvant || !it.presenceImagesApres) score -= 20;
    if (!it.contributeurs) score -= 20;
    if (it.gainMode === "aucun") score -= 20;
    if (it.statut === "Complété" && !it.dateCloture) score -= 20;
    return Math.max(0, score);
  }

  function renderQualityTable(activityRows) {
    const rows = activityRows
      .map((it) => {
        const reasons = [];
        let level = "";
        const delay = daysBetween(it.dateOuverture, it.dateCloture);

        if ((it.dateCloture && delay !== null && delay < 0) || (it.statut === "Complété" && !it.dateCloture)) {
          level = "Critique";
          reasons.push("Dates/statut incoherents");
        } else if (it.gainMode === "aucun" || !(it.contributeurs || "").trim()) {
          level = "Important";
          if (it.gainMode === "aucun") reasons.push("Sans gain chiffre");
          if (!(it.contributeurs || "").trim()) reasons.push("Sans contributeur");
        } else if (!it.presenceImagesAvant || !it.presenceImagesApres || !(it.descriptionApres || "").trim()) {
          level = "Qualite";
          if (!it.presenceImagesAvant || !it.presenceImagesApres) reasons.push("Sans image");
          if (!(it.descriptionApres || "").trim()) reasons.push("Sans description apres");
        }

        return { ...it, level, reasons, score: scoreCompleteness(it) };
      })
      .filter((it) => it.level)
      .sort((a, b) => ({ Critique: 3, Important: 2, Qualite: 1 }[b.level] - ({ Critique: 3, Important: 2, Qualite: 1 }[a.level])))
      .slice(0, 12);

    const body = document.getElementById("qualityRows");
    body.innerHTML = "";

    rows.forEach((it) => {
      const cls = it.level === "Critique" ? "level-critical" : it.level === "Important" ? "level-important" : "level-quality";
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><span class="severity ${cls}">${it.level}</span></td><td class="mono">${it.numero}</td><td>${it.libelle}</td><td>${it.reasons.join(", ")}</td><td>${it.score}%</td>`;
      tr.addEventListener("click", () => navigate(`formulaire.html?id=${encodeURIComponent(it.id)}`));
      body.appendChild(tr);
    });
  }

  function renderHighlights(range) {
    const cards = items
      .filter((it) => it.statut === "Complété" && inRange(it.dateCloture, range))
      .sort((a, b) => (a.dateCloture < b.dateCloture ? 1 : -1))
      .slice(0, 3);

    const root = document.getElementById("highlightCards");
    root.innerHTML = cards.length ? "" : "<div class='info-box'>Aucune valorisation sur la periode.</div>";

    cards.forEach((it) => {
      const nominatedMonths = voteState.months.filter((m) => (m.nominations || []).includes(it.id)).map((m) => m.key);
      const elected = voteState.months.some((m) => {
        if (m.statutScrutin !== "cloture" || !(m.nominations || []).length) return false;
        const tally = {};
        m.nominations.forEach((id) => { tally[id] = 0; });
        (m.votes || []).forEach((v) => { if (tally[v.jdiId] !== undefined) tally[v.jdiId] += 1; });
        const winner = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
        return tally[winner] > 0 && winner === it.id;
      });
      const badge = elected
        ? "<span class='severity level-important'>JDI du mois</span>"
        : nominatedMonths.length
          ? "<span class='severity level-quality'>Nomme</span>"
          : "";
      const card = document.createElement("article");
      card.className = "highlight-card";
      card.innerHTML = `
        <div class="highlight-head mono">${it.numero}</div>
        <div class="highlight-title">${it.libelle}</div>
        ${badge}
        <div class="highlight-meta">Secteur: ${it.secteur}</div>
        <div class="highlight-meta">Type de gain: ${it.typeGain}</div>
        <div class="highlight-meta">Gain estime: ${Math.round(it.gainEuro || 0)} EUR / ${Math.round(it.gainTempsHeures || 0)} h</div>
        <div class="highlight-images">
          ${it.imageAvant ? `<img src="${it.imageAvant}" alt="Avant">` : "<div class='img-placeholder'>Sans visuel avant</div>"}
          ${it.imageApres ? `<img src="${it.imageApres}" alt="Apres">` : "<div class='img-placeholder'>Sans visuel apres</div>"}
        </div>
      `;
      card.addEventListener("click", () => navigate(`itemvisu.html?id=${encodeURIComponent(it.id)}`));
      root.appendChild(card);
    });
  }

  function refresh() {
    const range = resolvePeriod();
    const activityRows = items.filter((it) => inRange(it.dateOuverture, range));

    renderPeriodLabel(range, activityRows);
    renderKpis(activityRows, range);
    renderImpact(range);
    renderSectorStack(activityRows);
    renderStatusBars(activityRows);
    renderMonthlyFlow(range);
    renderFollowTable(range);
    renderQualityTable(activityRows);
    renderHighlights(range);
  }

  els.periodPreset.addEventListener("change", () => {
    const custom = els.periodPreset.value === "custom";
    els.customDates.style.display = custom ? "grid" : "none";
    if (!custom) refresh();
  });
  els.applyPeriod.addEventListener("click", refresh);
  els.compareN1.addEventListener("change", refresh);

  const now = new Date();
  const defaultRange = buildFiscalRange(getCurrentFiscalStartYear(now));
  els.customStart.value = toIso(defaultRange.start);
  els.customEnd.value = toIso(defaultRange.end);

  refresh();
})();
