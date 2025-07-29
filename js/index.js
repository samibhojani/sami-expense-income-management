document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab");
    const storageKeys = {
        income: "incomes",
        expenses: "expenses",
        assets: "assets",
        liabilities: "liabilities"
    };

    function switchTab(tabId) {
        tabs.forEach(tab => tab.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
    }
    window.switchTab = switchTab;

    function loadData(type) {
        const list = document.getElementById(`${type}-list`);
        const data = JSON.parse(localStorage.getItem(storageKeys[type]) || "[]");
        list.innerHTML = data.map((item, index) => `
            <li>
                ${Object.values(item).join(" | ")}
                <button onclick="editEntry('${type}', ${index})">Edit</button>
                <button onclick="deleteEntry('${type}', ${index})">Delete</button>
            </li>
        `).join("");
    }

    function addEntry(formId, type) {
        const form = document.getElementById(formId);
        form.addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(form);
            const entry = Object.fromEntries(formData);
            const data = JSON.parse(localStorage.getItem(storageKeys[type]) || "[]");
            const index = form.dataset.editIndex;

            if (index !== undefined && index !== "") {
                data[parseInt(index)] = entry;
                delete form.dataset.editIndex;
            } else {
                data.push(entry);
            }

            localStorage.setItem(storageKeys[type], JSON.stringify(data));
            loadData(type);
            form.reset();
        });
    }

    window.editEntry = function(type, index) {
        const formId = `${type}-form`;
        const form = document.getElementById(formId);
        const data = JSON.parse(localStorage.getItem(storageKeys[type]) || "[]");
        const item = data[index];

        Object.entries(item).forEach(([key, value]) => {
            const field = form.elements.namedItem(key);
            if (field) field.value = value;
        });

        form.dataset.editIndex = index;
    };

    window.deleteEntry = function(type, index) {
        const data = JSON.parse(localStorage.getItem(storageKeys[type]) || "[]");
        data.splice(index, 1);
        localStorage.setItem(storageKeys[type], JSON.stringify(data));
        loadData(type);
    };

    function generateReport() {
        const from = new Date(document.getElementById("report-from").value);
        const to = new Date(document.getElementById("report-to").value);
        const output = document.getElementById("report-output");

        const report = {};
        const monthlySummary = {};

        Object.entries(storageKeys).forEach(([type, key]) => {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            const filtered = data.filter(d => {
                const date = new Date(d.date);
                return (!isNaN(from) ? date >= from : true) && (!isNaN(to) ? date <= to : true);
            });

            const sum = filtered.reduce((acc, cur) => acc + (parseFloat(cur.amount || cur.value || 0)), 0);
            report[type] = sum;

            // Monthly breakdown
            filtered.forEach(item => {
                const date = new Date(item.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!monthlySummary[monthKey]) monthlySummary[monthKey] = { income: 0, expenses: 0 };
                if (type === "income") monthlySummary[monthKey].income += parseFloat(item.amount || 0);
                if (type === "expenses") monthlySummary[monthKey].expenses += parseFloat(item.amount || 0);
            });
        });

        // Net balance
        const netBalance = (report.income || 0) - (report.expenses || 0);

        // Create Monthly Summary HTML
        let monthlyHtml = "<h4>Monthly Summary</h4><ul>";
        for (const [month, data] of Object.entries(monthlySummary)) {
            const net = data.income - data.expenses;
            monthlyHtml += `<li>${month} - Income: ${data.income}, Expenses: ${data.expenses}, Net: ${net}</li>`;
        }
        monthlyHtml += "</ul>";

        output.innerHTML = `
            <h3>Summary</h3>
            <p><strong>Total Income:</strong> ${report.income}</p>
            <p><strong>Total Expenses:</strong> ${report.expenses}</p>
            <p><strong>Total Assets:</strong> ${report.assets}</p>
            <p><strong>Total Liabilities:</strong> ${report.liabilities}</p>
            <p><strong>Net Balance:</strong> ${netBalance}</p>
            ${monthlyHtml}
        `;
    }
    window.generateReport = generateReport;

    addEntry("income-form", "income");
    addEntry("expense-form", "expenses");
    addEntry("asset-form", "assets");
    addEntry("liability-form", "liabilities");

    loadData("income");
    loadData("expenses");
    loadData("assets");
    loadData("liabilities");

    switchTab("income");
});
