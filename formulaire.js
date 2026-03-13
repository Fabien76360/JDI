(function () {
  const data = window.JDI_DATA;
  const { getQueryParam, navigate } = window.JDI_COMMON;
  const id = getQueryParam("id");
  const editingItem = data.items.find((it) => it.id === id) || null;
  let isDirty = false;
  let pendingLink = null;

  const form = document.getElementById("jdiForm");
  const modalWrap = document.getElementById("leaveModal");
  const secteurSelect = document.getElementById("secteur");
  const typeGainSelect = document.getElementById("typeGain");

  data.sectors.forEach((sector) => {
    const option = document.createElement("option");
    option.value = sector;
    option.textContent = sector;
    secteurSelect.appendChild(option);
  });

  data.gainTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeGainSelect.appendChild(option);
  });

  function toNumber(value) {
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
  }

  function setField(idField, value) {
    const node = document.getElementById(idField);
    if (node) {
      node.value = value === null || value === undefined ? "" : value;
    }
  }

  function getSelectedGainMode() {
    const checked = document.querySelector("input[name='gainMode']:checked");
    return checked ? checked.value : "aucun";
  }

  function updateGainModeVisibility() {
    const mode = getSelectedGainMode();
    document.getElementById("gainManualFields").style.display = mode === "manuel" ? "block" : "none";
    document.getElementById("gainAutoFields").style.display = mode === "auto" ? "block" : "none";
  }

  function computeAutoGain() {
    const tempsGagne = toNumber(document.getElementById("tempsGagne").value);
    const uniteTemps = document.getElementById("uniteTemps").value;
    const occurrences = toNumber(document.getElementById("nombreOccurrences").value);
    const nbOperateurs = Math.max(1, toNumber(document.getElementById("nombreOperateurs").value));
    const coutHoraire = toNumber(document.getElementById("coutHoraire").value);

    const minutes = (uniteTemps === "heure" ? tempsGagne * 60 : tempsGagne) * occurrences * nbOperateurs;
    const hours = Math.round((minutes / 60) * 100) / 100;
    const euros = Math.round(hours * coutHoraire);

    document.getElementById("autoTimeResult").textContent = `${Math.round(hours)} h`;
    document.getElementById("autoEuroResult").textContent = `${euros} EUR`;

    return {
      gainTempsHeures: hours,
      gainEuro: euros
    };
  }

  function renderMockPreview(containerId, src) {
    const box = document.getElementById(containerId);
    if (!src) {
      box.innerHTML = "";
      return;
    }
    const card = document.createElement("div");
    card.className = "preview-card";
    card.innerHTML = `<img src="${src}" alt="Apercu"><button type="button" class="btn secondary">Supprimer</button>`;
    card.querySelector("button").addEventListener("click", () => {
      card.remove();
      isDirty = true;
    });
    box.appendChild(card);
  }

  function bindUpload(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    input.addEventListener("change", () => {
      Array.from(input.files || []).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const card = document.createElement("div");
          card.className = "preview-card";
          card.innerHTML = `<img alt="Image chargee"><button type="button" class="btn secondary">Supprimer</button>`;
          card.querySelector("img").src = event.target.result;
          card.querySelector("button").addEventListener("click", () => {
            card.remove();
            isDirty = true;
          });
          container.appendChild(card);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function updateCharCount(fieldId, counterId, max) {
    const field = document.getElementById(fieldId);
    const counter = document.getElementById(counterId);
    const show = () => {
      counter.textContent = `${field.value.length}/${max}`;
    };
    field.addEventListener("input", show);
    show();
  }

  if (editingItem) {
    document.getElementById("modeLabel").textContent = `Mode edition - ${editingItem.numero}`;
    setField("titre", editingItem.libelle);
    setField("secteur", editingItem.secteur);
    setField("statut", editingItem.statut);
    setField("dateOuverture", editingItem.dateOuverture);
    setField("dateCloture", editingItem.dateCloture);
    setField("descAvant", editingItem.descriptionAvant);
    setField("descApres", editingItem.descriptionApres);
    setField("conditions", editingItem.conditionsReussite);
    setField("contributeurs", editingItem.contributeurs);
    setField("typeGain", editingItem.typeGain || "Autre");

    const mode = editingItem.gainMode || "aucun";
    const modeInput = document.querySelector(`input[name='gainMode'][value='${mode}']`);
    if (modeInput) {
      modeInput.checked = true;
    }

    setField("gainTempsManuel", editingItem.gainMode === "manuel" ? editingItem.gainTempsHeures : "");
    setField("gainEuroManuel", editingItem.gainMode === "manuel" ? editingItem.gainEuro : "");
    setField("gainCommentaireManuel", editingItem.gainMode === "manuel" ? editingItem.gainCommentaire : "");

    setField("tempsGagne", editingItem.tempsGagne);
    setField("uniteTemps", editingItem.uniteTemps || "minute");
    setField("frequence", editingItem.frequence);
    setField("uniteFrequence", editingItem.uniteFrequence || "semaine");
    setField("nombreOccurrences", editingItem.nombreOccurrences);
    setField("nombreOperateurs", editingItem.nombreOperateurs || 1);
    setField("coutHoraire", editingItem.coutHoraire);
    setField("joursParAn", editingItem.joursParAn);
    setField("gainCommentaireAuto", editingItem.gainMode === "auto" ? editingItem.gainCommentaire : "");

    renderMockPreview("beforePreview", editingItem.imageAvant);
    renderMockPreview("afterPreview", editingItem.imageApres);
  }

  updateGainModeVisibility();
  computeAutoGain();

  document.querySelectorAll("input[name='gainMode']").forEach((input) => {
    input.addEventListener("change", () => {
      updateGainModeVisibility();
      isDirty = true;
    });
  });

  ["tempsGagne", "uniteTemps", "nombreOccurrences", "nombreOperateurs", "coutHoraire"].forEach((idField) => {
    document.getElementById(idField).addEventListener("input", () => {
      computeAutoGain();
      isDirty = true;
    });
    document.getElementById(idField).addEventListener("change", () => {
      computeAutoGain();
      isDirty = true;
    });
  });

  updateCharCount("descAvant", "countAvant", 600);
  updateCharCount("descApres", "countApres", 600);
  updateCharCount("conditions", "countConditions", 400);
  bindUpload("imgAvant", "beforePreview");
  bindUpload("imgApres", "afterPreview");

  form.addEventListener("input", () => {
    isDirty = true;
  });
  form.addEventListener("change", () => {
    isDirty = true;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const mode = getSelectedGainMode();
    let payloadGainEuro = 0;
    let payloadGainTempsHeures = 0;
    let gainCommentaire = "";

    if (mode === "manuel") {
      payloadGainTempsHeures = toNumber(document.getElementById("gainTempsManuel").value);
      payloadGainEuro = toNumber(document.getElementById("gainEuroManuel").value);
      gainCommentaire = document.getElementById("gainCommentaireManuel").value.trim();
    } else if (mode === "auto") {
      const computed = computeAutoGain();
      payloadGainTempsHeures = computed.gainTempsHeures;
      payloadGainEuro = computed.gainEuro;
      gainCommentaire = document.getElementById("gainCommentaireAuto").value.trim();
    }

    const payload = {
      id: editingItem ? editingItem.id : "NOUVEAU",
      libelle: document.getElementById("titre").value.trim(),
      secteur: document.getElementById("secteur").value,
      statut: document.getElementById("statut").value,
      dateOuverture: document.getElementById("dateOuverture").value,
      dateCloture: document.getElementById("dateCloture").value,
      descriptionAvant: document.getElementById("descAvant").value.trim(),
      descriptionApres: document.getElementById("descApres").value.trim(),
      conditionsReussite: document.getElementById("conditions").value.trim(),
      contributeurs: document.getElementById("contributeurs").value.trim(),
      typeGain: document.getElementById("typeGain").value,
      gainMode: mode,
      gainTempsHeures: payloadGainTempsHeures,
      gainEuro: payloadGainEuro,
      gainCommentaire
    };

    console.log("Simulation enregistrement JDI", payload);
    isDirty = false;
    alert(`JDI enregistre (simulation locale). Mode gain: ${mode}.`);
    navigate("liste.html");
  });

  document.getElementById("cancelBtn").addEventListener("click", () => {
    if (isDirty) {
      pendingLink = "liste.html";
      modalWrap.style.display = "flex";
      return;
    }
    navigate("liste.html");
  });

  document.querySelectorAll("a[data-guard='true']").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!isDirty) return;
      event.preventDefault();
      pendingLink = link.getAttribute("href");
      modalWrap.style.display = "flex";
    });
  });

  document.getElementById("stayBtn").addEventListener("click", () => {
    modalWrap.style.display = "none";
    pendingLink = null;
  });

  document.getElementById("leaveBtn").addEventListener("click", () => {
    isDirty = false;
    if (pendingLink) navigate(pendingLink);
  });

  window.addEventListener("beforeunload", (event) => {
    if (!isDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
})();
