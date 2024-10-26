const incomeDisplay = document.getElementById("income-amount");
const expenseDisplay = document.getElementById("expense-amount");
const balanceDisplay = document.getElementById("balance-amount");
const transactionBody = document.getElementById("transaction-body");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Update the dashboard totals and graphs
function updateDashboard() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  incomeDisplay.textContent = income.toFixed(2);
  expenseDisplay.textContent = expense.toFixed(2);
  balanceDisplay.textContent = balance.toFixed(2);

  renderDonutChart(income, expense);
  renderBarChart();
}

// Add a new transaction
function addTransaction() {
  const date = document.getElementById("transaction-date").value;
  const title = document.getElementById("transaction-title").value;
  const amount = parseFloat(document.getElementById("transaction-amount").value);
  const type = document.getElementById("transaction-type").value;

  if (date && title && amount && type) {
    const transaction = { date, title, amount, type };
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderTransactions();
    updateDashboard();
  }
}

// Render transactions in the table
function renderTransactions() {
  transactionBody.innerHTML = "";
  transactions.forEach((t, index) => {
    const row = `<tr>
      <td>${t.date}</td>
      <td>${t.title}</td>
      <td>${t.amount}</td>
      <td>${t.type}</td>
      <td><button onclick="deleteTransaction(${index})">Delete</button></td>
    </tr>`;
    transactionBody.insertAdjacentHTML("beforeend", row);
  });
}

// Delete a transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  updateDashboard();
}

// Render the Donut Chart (Income vs Expense)
function renderDonutChart(income, expense) {
  const ctx = document.getElementById("summaryChart").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    }
  });
}

// Render the Bar Chart (Monthly Income & Expense Trends)
function renderBarChart() {
  const monthlyData = getMonthlyData();

  const ctx = document.getElementById("monthlyChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: "Income",
          data: Object.values(monthlyData).map(data => data.income),
          backgroundColor: "#4caf50"
        },
        {
          label: "Expense",
          data: Object.values(monthlyData).map(data => data.expense),
          backgroundColor: "#f44336"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Get monthly aggregated data for the Bar Chart
function getMonthlyData() {
  const data = {};

  transactions.forEach(t => {
    const month = t.date.slice(0, 7); // Extract YYYY-MM format

    if (!data[month]) {
      data[month] = { income: 0, expense: 0 };
    }

    if (t.type === "income") {
      data[month].income += t.amount;
    } else if (t.type === "expense") {
      data[month].expense += t.amount;
    }
  });

  return data;
}

// Event listeners
document.getElementById("add-transaction").addEventListener("click", addTransaction);

renderTransactions();
updateDashboard();
