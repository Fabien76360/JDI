(function () {
  const faqRoot = document.getElementById("faqRoot");

  window.JDI_DATA.faq.forEach((item, index) => {
    const wrap = document.createElement("div");
    wrap.className = "faq-item";
    wrap.innerHTML = `
      <h3 class="faq-q">Q${index + 1}. ${item.q}</h3>
      <div class="faq-a">${item.a}</div>
    `;

    const q = wrap.querySelector(".faq-q");
    const a = wrap.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const visible = a.style.display === "block";
      a.style.display = visible ? "none" : "block";
    });

    faqRoot.appendChild(wrap);
  });
})();
