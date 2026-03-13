(function () {
  const ACCESS_KEY = "jdi_vote_access";
  const STATE_KEY = "jdi_vote_state";
  const data = window.JDI_DATA;
  const { navigate } = window.JDI_COMMON;

  const accessZone = document.getElementById("voteAccessZone");
  const contentZone = document.getElementById("voteContent");
  const passwordInput = document.getElementById("votePassword");
  const accessMsg = document.getElementById("voteAccessMsg");

  const monthSelect = document.getElementById("voteMonthSelect");
  const statusSelect = document.getElementById("voteStatusSelect");
  const statusInfo = document.getElementById("voteStatusInfo");
  const nominationList = document.getElementById("nominationList");
  const voteCandidates = document.getElementById("voteCandidates");
  const voteUserSelect = document.getElementById("voteUserSelect");
  const voteJustification = document.getElementById("voteJustification");
  const voteResultRows = document.getElementById("voteResultRows");
  const voteWinnerBanner = document.getElementById("voteWinnerBanner");
  const voteJustifs = document.getElementById("voteJustifs");
  const qualifiedRows = document.getElementById("qualifiedRows");

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(data.vote));
      return JSON.parse(raw);
    } catch (err) {
      return JSON.parse(JSON.stringify(data.vote));
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function isAuthorized() {
    return sessionStorage.getItem(ACCESS_KEY) === "1";
  }

  function setAuthorized(authorized) {
    if (authorized) sessionStorage.setItem(ACCESS_KEY, "1");
    else sessionStorage.removeItem(ACCESS_KEY);
  }

  function getMonthState() {
    return state.months.find((m) => m.key === monthSelect.value) || state.months[0];
  }

  function getItem(id) {
    return data.items.find((it) => it.id === id);
  }

  function computeMonthResults(month) {
    const counts = {};
    month.nominations.forEach((id) => { counts[id] = 0; });
    month.votes.forEach((vote) => {
      if (counts[vote.jdiId] === undefined) counts[vote.jdiId] = 0;
      counts[vote.jdiId] += 1;
    });

    let winnerId = "";
    let maxVotes = -1;
    Object.keys(counts).forEach((id) => {
      if (counts[id] > maxVotes) {
        maxVotes = counts[id];
        winnerId = id;
      }
    });

    if (month.statutScrutin !== "cloture") winnerId = "";

    return { counts, winnerId: maxVotes > 0 ? winnerId : "" };
  }

  function getElectedIds() {
    const ids = new Set();
    state.months.forEach((month) => {
      const result = computeMonthResults(month);
      if (month.statutScrutin === "cloture" && result.winnerId) ids.add(result.winnerId);
    });
    return ids;
  }

  function renderMonthOptions() {
    monthSelect.innerHTML = "";
    state.months.forEach((month) => {
      const opt = document.createElement("option");
      opt.value = month.key;
      opt.textContent = month.label;
      monthSelect.appendChild(opt);
    });
    monthSelect.value = state.months[state.months.length - 1].key;
  }

  function renderStatus() {
    const month = getMonthState();
    statusSelect.value = month.statutScrutin;
    statusInfo.textContent = `Acces autorise. Periode scrutin: ${month.debutScrutin || "-"} au ${month.finScrutin || "-"}`;
  }

  function renderNominations() {
    const month = getMonthState();
    nominationList.innerHTML = "";
    const electedIds = getElectedIds();

    data.items.forEach((item) => {
      const isNominated = month.nominations.includes(item.id);
      const isElected = electedIds.has(item.id);
      const row = document.createElement("label");
      row.className = "vote-list-row";
      row.innerHTML = `
        <input type="checkbox" ${isNominated ? "checked" : ""} ${isElected ? "disabled" : ""} data-id="${item.id}">
        <span class="mono">${item.numero}</span>
        <span>${item.libelle}</span>
        <span class="badge ${item.statut === "Complété" ? "complete" : item.statut === "Annulé" ? "annule" : "en-cours"}">${item.statut}</span>
        ${isElected ? "<span class='severity level-quality'>Deja elu</span>" : ""}
      `;

      const input = row.querySelector("input");
      input.addEventListener("change", () => {
        if (input.checked && !month.nominations.includes(item.id)) {
          month.nominations.push(item.id);
        }
        if (!input.checked) {
          month.nominations = month.nominations.filter((id) => id !== item.id);
          month.votes = month.votes.filter((v) => v.jdiId !== item.id);
        }
        saveState();
        renderAll();
      });

      nominationList.appendChild(row);
    });
  }

  function renderVoteCandidates() {
    const month = getMonthState();
    const currentUser = voteUserSelect.value;
    const existing = month.votes.find((v) => v.utilisateur === currentUser);

    voteCandidates.innerHTML = "";
    if (!month.nominations.length) {
      voteCandidates.innerHTML = "<div class='info-box'>Aucun JDI nomine pour ce mois.</div>";
      return;
    }

    month.nominations.forEach((id) => {
      const item = getItem(id);
      if (!item) return;
      const row = document.createElement("label");
      row.className = "vote-list-row";
      row.innerHTML = `
        <input type="radio" name="voteChoice" value="${id}" ${existing && existing.jdiId === id ? "checked" : ""} ${month.statutScrutin === "cloture" ? "disabled" : ""}>
        <span class="mono">${item.numero}</span>
        <span>${item.libelle}</span>
        <span>${item.secteur}</span>
        <a class="btn secondary" style="padding:4px 8px; font-size:12px;" href="itemvisu.html?id=${encodeURIComponent(id)}">Voir</a>
      `;
      voteCandidates.appendChild(row);
    });

    voteJustification.value = existing ? existing.justification : "";
  }

  function renderResults() {
    const month = getMonthState();
    const { counts, winnerId } = computeMonthResults(month);

    voteResultRows.innerHTML = "";
    month.nominations.forEach((id) => {
      const item = getItem(id);
      if (!item) return;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="mono">${item.numero}</td>
        <td>${item.secteur}</td>
        <td>${counts[id] || 0}</td>
        <td>${winnerId === id ? "<span class='severity level-important'>Gagnant du mois</span>" : "-"}</td>
      `;
      tr.addEventListener("click", () => navigate(`itemvisu.html?id=${encodeURIComponent(id)}`));
      voteResultRows.appendChild(tr);
    });

    if (winnerId) {
      const winItem = getItem(winnerId);
      voteWinnerBanner.innerHTML = `<strong>JDI du mois:</strong> ${winItem.numero} - ${winItem.libelle}`;
    } else {
      voteWinnerBanner.textContent = "Gagnant non defini (scrutin ouvert ou aucun vote).";
    }

    if (!month.votes.length) {
      voteJustifs.textContent = "Aucune justification enregistree pour ce mois.";
    } else {
      voteJustifs.innerHTML = month.votes.map((v) => `• ${v.utilisateur}: ${v.justification}`).join("<br>");
    }
  }

  function renderQualified() {
    qualifiedRows.innerHTML = "";
    state.months.forEach((month) => {
      const { winnerId } = computeMonthResults(month);
      if (month.statutScrutin !== "cloture" || !winnerId) return;
      const item = getItem(winnerId);
      if (!item) return;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${month.label}</td>
        <td class="mono">${item.numero}</td>
        <td>${item.libelle}</td>
        <td>${item.secteur}</td>
        <td>${item.typeGain} / ${Math.round(item.gainEuro || 0)} EUR</td>
      `;
      tr.addEventListener("click", () => navigate(`itemvisu.html?id=${encodeURIComponent(item.id)}`));
      qualifiedRows.appendChild(tr);
    });
  }

  function renderAll() {
    renderStatus();
    renderNominations();
    renderVoteCandidates();
    renderResults();
    renderQualified();
  }

  document.getElementById("voteLoginBtn").addEventListener("click", () => {
    if (passwordInput.value === state.password) {
      setAuthorized(true);
      accessMsg.textContent = "";
      accessZone.style.display = "none";
      contentZone.style.display = "block";
      renderMonthOptions();
      voteUserSelect.innerHTML = data.users.map((u) => `<option value="${u}">${u}</option>`).join("");
      renderAll();
      return;
    }
    accessMsg.textContent = "Mot de passe incorrect.";
  });

  document.getElementById("voteLogoutBtn").addEventListener("click", () => {
    setAuthorized(false);
    contentZone.style.display = "none";
    accessZone.style.display = "block";
    passwordInput.value = "";
  });

  monthSelect.addEventListener("change", renderAll);
  statusSelect.addEventListener("change", () => {
    const month = getMonthState();
    month.statutScrutin = statusSelect.value;
    saveState();
    renderAll();
  });

  voteUserSelect.addEventListener("change", renderVoteCandidates);

  document.getElementById("saveVoteBtn").addEventListener("click", () => {
    const month = getMonthState();
    if (month.statutScrutin === "cloture") {
      alert("Le scrutin est cloture. Vote non modifiable.");
      return;
    }

    const choice = document.querySelector("input[name='voteChoice']:checked");
    const justification = voteJustification.value.trim();
    if (!choice) {
      alert("Selectionner un JDI nomine.");
      return;
    }
    if (!justification) {
      alert("La justification est obligatoire.");
      return;
    }

    const user = voteUserSelect.value;
    const existingIdx = month.votes.findIndex((v) => v.utilisateur === user);
    const payload = { utilisateur: user, jdiId: choice.value, justification };
    if (existingIdx >= 0) month.votes[existingIdx] = payload;
    else month.votes.push(payload);

    saveState();
    renderAll();
    alert("Vote enregistre.");
  });

  if (isAuthorized()) {
    accessZone.style.display = "none";
    contentZone.style.display = "block";
    renderMonthOptions();
    voteUserSelect.innerHTML = data.users.map((u) => `<option value="${u}">${u}</option>`).join("");
    renderAll();
  }
})();
