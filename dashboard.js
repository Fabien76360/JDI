(function () {
  const data = window.JDI_DATA;
  const { navigate } = window.JDI_COMMON;
  const config = data.appConfig || {};

  const currentYear = `${new Date().getFullYear()}`;
  const yearlyCompleted = data.items.filter(
    (it) => it.statut === "Complété" && (it.dateCloture || "").startsWith(currentYear)
  ).length;
  document.getElementById("yearCompleted").textContent = yearlyCompleted;
  document.getElementById("openCount").textContent = data.items.filter((it) => it.statut === "En cours").length;
  document.getElementById("cancelCount").textContent = data.items.filter((it) => it.statut === "Annulé").length;
  document.getElementById("gainCount").textContent = data.items.filter((it) => it.gainMode !== "aucun").length;

  const map = document.getElementById("siteMap");
  const positions = config.dashboardSectorPositions || {};
  if (config.sitePlanImage) {
    map.style.backgroundImage = `url('${config.sitePlanImage}')`;
  }

  data.sectors.forEach((sector) => {
    const count = data.items.filter((it) => it.secteur === sector).length;
    const zone = document.createElement("div");
    zone.className = "map-zone";
    zone.style.left = (positions[sector] && positions[sector].left) || "5%";
    zone.style.top = (positions[sector] && positions[sector].top) || "5%";
    zone.title = `Secteur: ${sector}`;
    zone.innerHTML = `
      <div class="zone-name">${sector}</div>
      <span class="zone-count">${count}</span>
    `;
    zone.addEventListener("click", (event) => {
      event.stopPropagation();
      navigate(`liste.html?secteur=${encodeURIComponent(sector)}`);
    });
    map.appendChild(zone);
  });

  map.addEventListener("click", () => {
    navigate("liste.html");
  });

  document.getElementById("newJdiBtn").addEventListener("click", () => {
    navigate("formulaire.html");
  });

  const latestRows = data.items
    .slice()
    .sort((a, b) => (a.dateOuverture < b.dateOuverture ? 1 : -1))
    .slice(0, 6);

  const latestBody = document.getElementById("latestRows");
  latestRows.forEach((it) => {
    const tr = document.createElement("tr");
    const badgeClass = it.statut === "Complété" ? "complete" : it.statut === "Annulé" ? "annule" : "en-cours";
    tr.innerHTML = `
      <td class="mono">${it.numero}</td>
      <td>${it.libelle}</td>
      <td>${it.secteur}</td>
      <td><span class="badge ${badgeClass}">${it.statut}</span></td>
      <td>${it.dateOuverture.split("-").reverse().join("/")}</td>
    `;
    tr.addEventListener("click", () => navigate(`itemvisu.html?id=${encodeURIComponent(it.id)}`));
    latestBody.appendChild(tr);
  });

  const alerts = [];
  data.items.forEach((it) => {
    const opened = new Date(`${it.dateOuverture}T00:00:00`);
    const age = Math.round((Date.now() - opened.getTime()) / 86400000);
    if (it.statut === "En cours" && age > 60) alerts.push({ level: "Critique", txt: `${it.numero} en cours depuis ${age} jours.` });
    if (it.statut === "Complété" && !it.dateCloture) alerts.push({ level: "Critique", txt: `${it.numero} complete sans date de cloture.` });
    if (it.gainMode === "aucun") alerts.push({ level: "Important", txt: `${it.numero} sans gain chiffre.` });
  });

  const alertRoot = document.getElementById("alertList");
  if (!alerts.length) {
    alertRoot.innerHTML = "<div class='info-box'>Aucune alerte prioritaire.</div>";
  } else {
    alertRoot.innerHTML = alerts.slice(0, 8).map((a) => {
      const cls = a.level === "Critique" ? "level-critical" : "level-important";
      return `<div class='dashboard-alert-row'><span class='severity ${cls}'>${a.level}</span><span>${a.txt}</span></div>`;
    }).join("");
  }
})();
