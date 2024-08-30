document.addEventListener('DOMContentLoaded', () => {
  const expenseForm = document.getElementById('expense-form');
  const expenseList = document.getElementById('expense-list');
  const totalAmount = document.getElementById('total-amount');
  const summaryDiv = document.getElementById('summary');
  const categoryFilter = document.getElementById('category-filter');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');
  let expenseChart;

  let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

  function addExpense(e) {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const expense = { id: Date.now(), description, amount, category, date };
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    displayExpenses();
    updateSummary();
    updateCategoryFilter();
    updateChart();

    expenseForm.reset();
  }

  function displayExpenses(filteredExpenses = expenses) {
    expenseList.innerHTML = '';

    filteredExpenses.forEach(expense => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${expense.description}</td>
        <td>₹${expense.amount.toFixed(2)}</td>
        <td>${expense.category}</td>
        <td>${expense.date}</td>
        <td>
          <button class="edit" onclick="editExpense(${expense.id})">Edit</button>
          <button class="delete" onclick="deleteExpense(${expense.id})">Delete</button>
        </td>
      `;
      expenseList.appendChild(tr);
    });

    const total = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);
    totalAmount.textContent = total.toFixed(2);
  }

  function updateSummary() {
    const summary = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    summaryDiv.innerHTML = Object.entries(summary)
      .map(([category, total]) => `<p>${category}: ₹${total.toFixed(2)}</p>`)
      .join('');
  }

  function sortExpenses(criteria) {
    if (criteria === 'amount') {
      expenses.sort((a, b) => a.amount - b.amount);
    } else if (criteria === 'date') {
      expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    displayExpenses();
  }

  function searchExpenses(keyword) {
    const filteredExpenses = expenses.filter(expense =>
      expense.description.toLowerCase().includes(keyword.toLowerCase())
    );
    displayExpenses(filteredExpenses);
  }

  function filterByCategory(category) {
    const filteredExpenses = category ? expenses.filter(expense => expense.category === category) : expenses;
    displayExpenses(filteredExpenses);
  }

  function filterByDateRange(startDate, endDate) {
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
    });
    displayExpenses(filteredExpenses);
  }

  function updateCategoryFilter() {
    const categories = [...new Set(expenses.map(expense => expense.category))];
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  const darkModeToggle = document.getElementById('dark-mode-toggle');
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.container').classList.toggle('dark-mode');
    document.querySelectorAll('th').forEach(th => th.classList.toggle('dark-mode'));
    document.querySelectorAll('.total-amount').forEach(ta => ta.classList.toggle('dark-mode'));
  });

  function updateChart() {
    const summary = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    const labels = Object.keys(summary);
    const data = Object.values(summary);

    if (expenseChart) {
      expenseChart.destroy();
    }

    expenseChart = new Chart(expenseChartCtx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Expense Distribution',
          data,
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0'],
        }]
      }
    });
  }

  window.editExpense = function(id) {
    const expense = expenses.find(exp => exp.id === id);

    document.getElementById('description').value = expense.description;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;
    document.getElementById('date').value = expense.date;

    expenses = expenses.filter(exp => exp.id !== id);
    displayExpenses();
    updateSummary();
    updateCategoryFilter();
    updateChart();
  };

  window.deleteExpense = function(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    displayExpenses();
    updateSummary();
    updateCategoryFilter();
    updateChart();
  };

  expenseForm.addEventListener('submit', addExpense);

  document.getElementById('sort-by-amount').addEventListener('click', () => sortExpenses('amount'));
  document.getElementById('sort-by-date').addEventListener('click', () => sortExpenses('date'));
  document.getElementById('search-input').addEventListener('input', (e) => searchExpenses(e.target.value));
  categoryFilter.addEventListener('change', (e) => filterByCategory(e.target.value));
  document.getElementById('filter-by-date').addEventListener('click', () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    filterByDateRange(startDate, endDate);
  });

  displayExpenses();
  updateSummary();
  updateCategoryFilter();
  updateChart();
});
