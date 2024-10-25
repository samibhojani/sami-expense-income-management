const transactionForm = document.getElementById('transaction-form');
const transactionTable = document.querySelector('#transaction-table tbody');
const incomeAmount = document.getElementById('income-amount');
const expenseAmount = document.getElementById('expense-amount');
const investmentAmount = document.getElementById('investment-amount');
const balanceAmount = document.getElementById('balance-amount');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Update the UI with transactions and amounts
function updateUI() {
  let income = 0, expense = 0, investment = 0;

  transactionTable.innerHTML = ''; // Clear the table before re-populating
  transactions.forEach((transaction, index) => {
    const row = document.createElement('tr');
    row.className = `${transaction.type}-row`;
    row.innerHTML = `
      <td>${transaction.date || 'N/A'}</td>
      <td>${transaction.description || 'N/A'}</td>
      <td>$${transaction.amount.toFixed(2)}</td>
      <td>${transaction.type}</td>
      <td>
        <button onclick="editTransaction(${index})">Edit</button>
        <button onclick="deleteTransaction(${index})">Delete</button>
      </td>
    `;
    transactionTable.appendChild(row);

    // Calculate totals based on transaction type
    if (transaction.type === 'income') income += transaction.amount;
    else if (transaction.type === 'expense') expense += transaction.amount;
    else investment += transaction.amount;
  });

  // Update card amounts
  incomeAmount.textContent = `$${income.toFixed(2)}`;
  expenseAmount.textContent = `$${expense.toFixed(2)}`;
  investmentAmount.textContent = `$${investment.toFixed(2)}`;
  balanceAmount.textContent = `$${(income - expense).toFixed(2)}`;

  // Update graphs
  updateGraphs(income, expense, investment);
}

// Handle form submission
transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  // Add new transaction
  transactions.push({ date, description, amount, type });
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateUI();
  transactionForm.reset();
});

// Edit an existing transaction
function editTransaction(index) {
  const transaction = transactions[index];
  document.getElementById('date').value = transaction.date;
  document.getElementById('description').value = transaction.description;
  document.getElementById('amount').value = transaction.amount;
  document.getElementById('type').value = transaction.type;
  deleteTransaction(index);
}

// Delete a transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateUI();
}

// Update graphs using Chart.js
function updateGraphs(income, expense, investment) {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const investmentTransactions = transactions.filter(t => t.type === 'investment');

  // Income Bar Chart
  new Chart(document.getElementById('incomeGraph'), {
    type: 'bar',
    data: {
      labels: incomeTransactions.map(t => t.description || 'N/A'),
      datasets: [{
        label: 'Income',
        data: incomeTransactions.map(t => t.amount),
        backgroundColor: '#28a745',
      }],
    },
    options: { responsive: true }
  });

  // Expense Bar Chart
  new Chart(document.getElementById('expenseGraph'), {
    type: 'bar',
    data: {
      labels: expenseTransactions.map(t => t.description || 'N/A'),
      datasets: [{
        label: 'Expense',
        data: expenseTransactions.map(t => t.amount),
        backgroundColor: '#dc3545',
      }],
    },
    options: { responsive: true }
  });

  // Investment Bar Chart
  new Chart(document.getElementById('investmentGraph'), {
    type: 'bar',
    data: {
      labels: investmentTransactions.map(t => t.description || 'N/A'),
      datasets: [{
        label: 'Investment',
        data: investmentTransactions.map(t => t.amount),
        backgroundColor: '#007bff',
      }],
    },
    options: { responsive: true }
  });

  // Doughnut Chart for Income vs Expense vs Balance
  new Chart(document.getElementById('balanceComparison'), {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense', 'Balance'],
      datasets: [{
        data: [income, expense, income - expense],
        backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
      }],
    },
    options: { responsive: true }
  });

  // Month-wise Income vs Expense Line Chart
  const months = [...new Set(transactions.map(t => new Date(t.date).toLocaleString('default', { month: 'short' })))];

  const monthlyIncome = months.map(month =>
    transactions.filter(t => t.type === 'income' && new Date(t.date).toLocaleString('default', { month: 'short' }) === month)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const monthlyExpense = months.map(month =>
    transactions.filter(t => t.type === 'expense' && new Date(t.date).toLocaleString('default', { month: 'short' }) === month)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  new Chart(document.getElementById('monthlyTrends'), {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: monthlyIncome,
          borderColor: '#28a745',
          fill: false,
        },
        {
          label: 'Expense',
          data: monthlyExpense,
          borderColor: '#dc3545',
          fill: false,
        },
      ],
    },
    options: { responsive: true }
  });
}

// Initial UI update
updateUI();
