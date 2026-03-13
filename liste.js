(function () {
  const data = window.JDI_DATA;
  const { formatDate, statusMeta, navigate, getQueryParam } = window.JDI_COMMON;
  const secteurSelect = document.getElementById("secteurFilter");
  const tbody = document.getElementById("jdiRows");
  const initialSector = getQueryParam("secteur") || "";

  data.sectors.forEach((sector) => {
    const option = document.createElement("option");
    option.value = sector;
    option.textContent = sector;
    secteurSelect.appendChild(option);
  });
  secteurSelect.value = initialSector;

  function renderRows() {
    const current = secteurSelect.value;
    const rows = data.items.filter((it) => !current || it.secteur === current);
    tbody.innerHTML = "";

    rows.forEach((it) => {
      const tr = document.createElement("tr");
      const meta = statusMeta(it.statut);
      tr.innerHTML = `
        <td>${it.numero || it.id}</td>
        <td>${it.libelle || it.titre}</td>
        <td>${it.secteur}</td>
        <td><span class="badge ${meta.className}">${meta.label}</span></td>
        <td>${formatDate(it.dateOuverture)}</td>
      `;
      tr.addEventListener("click", () => {
        navigate(`itemvisu.html?id=${encodeURIComponent(it.id)}`);
      });
      tbody.appendChild(tr);
    });

    document.getElementById("rowCount").textContent = `${rows.length} JDI affiche(s)`;
  }

  secteurSelect.addEventListener("change", renderRows);
  renderRows();
})();
