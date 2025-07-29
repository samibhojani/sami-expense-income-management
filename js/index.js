document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  const sections = ["income", "expense", "zurainsol", "assets", "liabilities"];

  sections.forEach(section => {
    const form = document.getElementById(`${section}-form`);
    const table = document.getElementById(`${section}-table`);

    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = new FormData(form);
      const entry = Object.fromEntries(data.entries());
      entry.id = Date.now();
      const entries = JSON.parse(localStorage.getItem(section) || "[]");
      entries.push(entry);
      localStorage.setItem(section, JSON.stringify(entries));
      form.reset();
      loadTable(section, table);
      updateStats();
    });

    loadTable(section, table);
  });

  function loadTable(section, table) {
    const data = JSON.parse(localStorage.getItem(section) || "[]");
    table.innerHTML = "";
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
    const rows = data.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join("")}</tr>`).join("");
    table.innerHTML = thead + rows;
  }

  function updateStats() {
    const income = JSON.parse(localStorage.getItem("income") || "[]");
    const expense = JSON.parse(localStorage.getItem("expense") || "[]");
    const zurainsol = JSON.parse(localStorage.getItem("zurainsol") || "[]");
    const assets = JSON.parse(localStorage.getItem("assets") || "[]");
    const liabilities = JSON.parse(localStorage.getItem("liabilities") || "[]");

    const totalIncome = income.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalExpense = expense.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const zsIncome = zurainsol.reduce((sum, e) => sum + parseFloat(e.income), 0);
    const zsDue = zurainsol.reduce((sum, e) => sum + parseFloat(e.due), 0);
    const assetValue = assets.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const roi = assets.reduce((sum, e) => sum + (parseFloat(e.amount) * parseFloat(e.roi || 0) / 100), 0);
    const liability = liabilities.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    document.getElementById("stats-content").innerHTML = `
      <p><strong>Total Income:</strong> Rs. ${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expense:</strong> Rs. ${totalExpense.toFixed(2)}</p>
      <p><strong>ZurainSol Income:</strong> Rs. ${zsIncome.toFixed(2)}</p>
      <p><strong>ZurainSol Dues:</strong> Rs. ${zsDue.toFixed(2)}</p>
      <p><strong>Assets Value:</strong> Rs. ${assetValue.toFixed(2)}</p>
      <p><strong>Total ROI:</strong> Rs. ${roi.toFixed(2)}</p>
      <p><strong>Total Liabilities:</strong> Rs. ${liability.toFixed(2)}</p>
      <p><strong>Net Worth:</strong> Rs. ${(totalIncome + zsIncome + roi + assetValue - totalExpense - liability).toFixed(2)}</p>
    `;
  }

  updateStats();
});
