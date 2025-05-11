// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the BroadcastChannel for real-time sync across tabs
    const expenseChannel = new BroadcastChannel('expense_tracker_channel');
    
    // DOM Elements
    const expenseForm = document.getElementById('expense-form');
    const amountInput = document.getElementById('expense-amount');
    const categoryInput = document.getElementById('expense-category');
    const dateInput = document.getElementById('expense-date');
    const descriptionInput = document.getElementById('expense-description');
    const expensesList = document.getElementById('expenses-list');
    const totalAmountElement = document.getElementById('total-amount');
    const weekAmountElement = document.getElementById('week-amount');
    const todayAmountElement = document.getElementById('today-amount');
    const balanceAmountElement = document.getElementById('balance-amount');
    const savingsAmountElement = document.getElementById('savings-amount');
    const dateFilter = document.getElementById('date-filter');
    const categoryFilter = document.getElementById('category-filter');
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-label');
    
    // User info elements
    const userInfoForm = document.getElementById('user-info-form');
    const userNameInput = document.getElementById('user-name');
    const userSalaryInput = document.getElementById('user-salary');
    const displayNameElement = document.getElementById('display-name');
    const displaySalaryElement = document.getElementById('display-salary');
    const userInfoContainer = document.getElementById('user-info-container');
    const mainContent = document.querySelector('main');
    
    // Charts
    let categoryChart;
    let trendChart;
    
    // Initialize expenses array from localStorage or empty array if none exists
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // Initialize user info from localStorage or set defaults
    let userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'User', salary: 0 };
    
    // Set default date to current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Initialize theme based on localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
        themeLabel.textContent = 'Light Mode';
    }
    
    // Always show the user info form first when the page loads
    userInfoContainer.classList.remove('hidden');
    mainContent.classList.add('hidden');
    
    // If user info exists, populate the form fields
    if (userInfo.name !== 'User' && userInfo.salary > 0) {
        userNameInput.value = userInfo.name;
        userSalaryInput.value = userInfo.salary;
        displayNameElement.textContent = userInfo.name;
        displaySalaryElement.textContent = `$${parseFloat(userInfo.salary).toFixed(2)}`;
    }
    
    // Edit user info button
    const editUserInfoBtn = document.getElementById('edit-user-info');
    editUserInfoBtn.addEventListener('click', function() {
        // Show the user info form but keep the main content visible
        userInfoContainer.classList.remove('hidden');
        userNameInput.focus();
    });
    
    // Handle user info form submission
    userInfoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate inputs
        if (!userNameInput.value.trim() || !userSalaryInput.value || parseFloat(userSalaryInput.value) <= 0) {
            alert('Please enter your name and a valid salary amount.');
            return;
        }
        
        // Update user info
        userInfo = {
            name: userNameInput.value.trim(),
            salary: parseFloat(userSalaryInput.value)
        };
        
        // Save to localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // Update display
        displayNameElement.textContent = userInfo.name;
        displaySalaryElement.textContent = `$${userInfo.salary.toFixed(2)}`;
        
        // Broadcast the user info update to other tabs
        expenseChannel.postMessage({
            type: 'updateUserInfo',
            userInfo: userInfo
        });
        
        // Update summary to reflect new salary
        updateSummary();
        
        // Hide the form after submission
        userInfoContainer.classList.add('hidden');
        
        // Show the expense tracker
        mainContent.classList.remove('hidden');
        
        // Show success message
        alert('User information saved successfully! You can now proceed to track your expenses.');
    });
    
    // Theme toggle functionality
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeLabel.textContent = 'Light Mode';
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeLabel.textContent = 'Dark Mode';
        }
        
        // Update charts with new theme colors
        updateCharts();
    });
    
    // Handle form submission
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Create new expense object
        const newExpense = {
            id: Date.now().toString(),
            amount: parseFloat(amountInput.value),
            category: categoryInput.value,
            date: dateInput.value,
            description: descriptionInput.value || categoryInput.value,
            timestamp: new Date(dateInput.value).getTime()
        };
        
        // Add to expenses array
        expenses.push(newExpense);
        
        // Save to localStorage
        saveExpenses();
        
        // Broadcast the new expense to other tabs
        expenseChannel.postMessage({
            type: 'add',
            expense: newExpense
        });
        
        // Reset form
        expenseForm.reset();
        dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        // Update UI
        renderExpenses();
        updateSummary();
        updateCharts();
    });
    
    // Listen for broadcast messages from other tabs
    expenseChannel.onmessage = function(event) {
        const message = event.data;
        
        if (message.type === 'add') {
            // Add new expense from another tab
            expenses.push(message.expense);
            saveExpenses();
            renderExpenses();
            updateSummary();
            updateCharts();
        } else if (message.type === 'delete') {
            // Remove expense deleted in another tab
            expenses = expenses.filter(expense => expense.id !== message.id);
            saveExpenses();
            renderExpenses();
            updateSummary();
            updateCharts();
        } else if (message.type === 'updateUserInfo') {
            // Update user info from another tab
            userInfo = message.userInfo;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            // Update form fields
            userNameInput.value = userInfo.name;
            userSalaryInput.value = userInfo.salary;
            
            // Update display elements
            displayNameElement.textContent = userInfo.name;
            displaySalaryElement.textContent = `$${userInfo.salary.toFixed(2)}`;
            
            // Always show the user info form first
            userInfoContainer.classList.remove('hidden');
            mainContent.classList.add('hidden');
            
            updateSummary();
        }
    };
    
    // Filter change event listeners
    dateFilter.addEventListener('change', function() {
        renderExpenses();
        updateCharts();
    });
    
    categoryFilter.addEventListener('change', function() {
        renderExpenses();
        updateCharts();
    });
    
    // Save expenses to localStorage
    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }
    
    // Delete expense
    function deleteExpense(id) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        
        // Broadcast delete action to other tabs
        expenseChannel.postMessage({
            type: 'delete',
            id: id
        });
        
        renderExpenses();
        updateSummary();
        updateCharts();
    }
    
    // Filter expenses based on selected filters
    function getFilteredExpenses() {
        let filtered = [...expenses];
        
        // Apply date filter
        const selectedDateFilter = dateFilter.value;
        if (selectedDateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
            
            if (selectedDateFilter === 'today') {
                filtered = filtered.filter(expense => {
                    const expenseDate = new Date(expense.date).getTime();
                    return expenseDate >= today;
                });
            } else if (selectedDateFilter === 'week') {
                filtered = filtered.filter(expense => {
                    const expenseDate = new Date(expense.date).getTime();
                    return expenseDate >= weekAgo;
                });
            } else if (selectedDateFilter === 'month') {
                filtered = filtered.filter(expense => {
                    const expenseDate = new Date(expense.date).getTime();
                    return expenseDate >= monthAgo;
                });
            }
        }
        
        // Apply category filter
        const selectedCategoryFilter = categoryFilter.value;
        if (selectedCategoryFilter !== 'all') {
            filtered = filtered.filter(expense => expense.category === selectedCategoryFilter);
        }
        
        return filtered;
    }
    
    // Render expenses to the table
    function renderExpenses() {
        expensesList.innerHTML = '';
        
        const filteredExpenses = getFilteredExpenses();
        
        // Sort expenses by date (newest first)
        filteredExpenses.sort((a, b) => b.timestamp - a.timestamp);
        
        if (filteredExpenses.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="5" style="text-align: center;">No expenses found</td>';
            expensesList.appendChild(emptyRow);
            return;
        }
        
        filteredExpenses.forEach(expense => {
            const row = document.createElement('tr');
            
            // Format date for display
            const expenseDate = new Date(expense.date);
            const formattedDate = expenseDate.toLocaleDateString() + ' ' + 
                                 expenseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td><button class="delete-btn" data-id="${expense.id}">Delete</button></td>
            `;
            
            expensesList.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteExpense(id);
            });
        });
    }
    
    // Update summary cards
    function updateSummary() {
        // Calculate total amount
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalAmountElement.textContent = `$${total.toFixed(2)}`;
        
        // Calculate balance (salary - total expenses)
        const balance = userInfo.salary - total;
        balanceAmountElement.textContent = `$${balance.toFixed(2)}`;
        
        // Calculate monthly savings
        // Get expenses from the current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
        
        const monthlyExpenses = expenses
            .filter(expense => new Date(expense.date).getTime() >= firstDayOfMonth)
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        const monthlySavings = userInfo.salary - monthlyExpenses;
        savingsAmountElement.textContent = `$${monthlySavings.toFixed(2)}`;
        
        // Calculate this week's amount
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
        
        const weekTotal = expenses
            .filter(expense => new Date(expense.date).getTime() >= weekAgo)
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        weekAmountElement.textContent = `$${weekTotal.toFixed(2)}`;
        
        // Calculate today's amount
        const todayTotal = expenses
            .filter(expense => new Date(expense.date).getTime() >= today)
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        todayAmountElement.textContent = `$${todayTotal.toFixed(2)}`;
    }
    
    // Initialize and update charts
    function updateCharts() {
        const filteredExpenses = getFilteredExpenses();
        
        // Get theme-specific colors
        const isDarkMode = document.body.hasAttribute('data-theme');
        const gridColor = getComputedStyle(document.body).getPropertyValue('--chart-grid-color').trim();
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
        
        // Category chart data preparation
        const categoryData = {};
        filteredExpenses.forEach(expense => {
            if (categoryData[expense.category]) {
                categoryData[expense.category] += expense.amount;
            } else {
                categoryData[expense.category] = expense.amount;
            }
        });
        
        const categoryLabels = Object.keys(categoryData);
        const categoryAmounts = Object.values(categoryData);
        
        // Generate colors for categories
        const categoryColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
            '#FF9F40', '#8AC249', '#EA526F', '#23B5D3', '#7E909A'
        ];
        
        // Update category chart
        if (categoryChart) {
            categoryChart.destroy();
        }
        
        const categoryCtx = document.getElementById('category-chart').getContext('2d');
        categoryChart = new Chart(categoryCtx, {
            type: 'pie',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryAmounts,
                    backgroundColor: categoryColors.slice(0, categoryLabels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // Trend chart data preparation
        // Group expenses by day for the trend chart
        const trendData = {};
        
        // Sort expenses by date
        const sortedExpenses = [...filteredExpenses].sort((a, b) => a.timestamp - b.timestamp);
        
        // Group by day
        sortedExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            if (trendData[day]) {
                trendData[day] += expense.amount;
            } else {
                trendData[day] = expense.amount;
            }
        });
        
        const trendLabels = Object.keys(trendData);
        const trendAmounts = Object.values(trendData);
        
        // Update trend chart
        if (trendChart) {
            trendChart.destroy();
        }
        
        const trendCtx = document.getElementById('trend-chart').getContext('2d');
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: trendLabels,
                datasets: [{
                    label: 'Daily Spending',
                    data: trendAmounts,
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Initial render
    renderExpenses();
    updateSummary();
    updateCharts();
});