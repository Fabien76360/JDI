(function () {
  const RELOAD_TIMEOUT_MS = 18001 * 1000;
  let inactivityTimer;

  function scheduleReload() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      window.location.reload();
    }, RELOAD_TIMEOUT_MS);
  }

  function formatDate(isoDate) {
    if (!isoDate) {
      return "-";
    }
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function navigate(url) {
    window.location.href = url;
  }

  function statusMeta(status) {
    if (status === "Complété") {
      return { label: "Complété", className: "complete" };
    }
    if (status === "Annulé") {
      return { label: "Annulé", className: "annule" };
    }
    return { label: "En cours", className: "en-cours" };
  }

  ["click", "keydown", "mousemove", "scroll", "touchstart"].forEach((evt) => {
    window.addEventListener(evt, scheduleReload, { passive: true });
  });
  scheduleReload();

  const userNameNode = document.getElementById("currentUser");
  if (userNameNode) {
    userNameNode.textContent = "Utilisateur: fabien.genet";
  }

  window.JDI_COMMON = {
    formatDate,
    getQueryParam,
    navigate,
    statusMeta
  };
})();
