(function () {
  const data = window.JDI_DATA;
  const { getQueryParam, formatDate, statusMeta, navigate } = window.JDI_COMMON;
  const id = getQueryParam("id") || data.items[0].id;
  const item = data.items.find((it) => it.id === id) || data.items[0];

  document.getElementById("sheetTitle").textContent = `${item.numero || item.id} - ${item.libelle || item.titre}`;
  document.getElementById("metaSecteur").textContent = item.secteur;
  document.getElementById("metaDateOuverture").textContent = formatDate(item.dateOuverture);
  document.getElementById("metaDateCloture").textContent = formatDate(item.dateCloture);
  document.getElementById("metaStatus").textContent = statusMeta(item.statut).label;
  document.getElementById("txtAvant").textContent = item.descriptionAvant || item.avant;
  document.getElementById("txtApres").textContent = item.descriptionApres || item.apres || "-";
  document.getElementById("txtConditions").textContent = item.conditionsReussite || item.conditions;
  document.getElementById("txtContributeurs").textContent = item.contributeurs;
  if (item.gainMode === "aucun") {
    document.getElementById("txtGains").textContent = `${item.typeGain || item.typeGains} - sans gain chiffre`;
  } else {
    document.getElementById("txtGains").textContent = `${item.typeGain || item.typeGains} - ${Math.round(item.gainEuro || 0)} EUR / ${Math.round(item.gainTempsHeures || 0)} h (${item.gainMode})`;
  }
  document.getElementById("imgAvant").src = item.imageAvant || "img/avant1.svg";
  document.getElementById("imgApres").src = item.imageApres || "img/apres1.svg";

  document.getElementById("backBtn").addEventListener("click", () => {
    navigate("liste.html");
  });

  document.getElementById("editBtn").addEventListener("click", () => {
    navigate(`formulaire.html?id=${encodeURIComponent(item.id)}`);
  });

  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("captureBtn").addEventListener("click", () => {
    alert("Capture PNG non activee dans cette maquette locale. Utiliser le bouton Imprimer / PDF.");
  });
})();
