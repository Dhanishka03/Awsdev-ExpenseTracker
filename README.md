# Real-Time Expense Tracker Dashboard

A web application that allows users to track and visualize their expenses in real-time. The application features:

- Add and categorize expenses
- Real-time synchronization across multiple tabs using BroadcastChannel API
- Interactive charts for expense visualization using Chart.js
- Filter expenses by date (daily/weekly)
- Responsive design with dark mode support

## Features

- **Live Expense Input Form**: Add expenses with amount, category, and timestamp
- **Summary Dashboard**: View total expenses and category breakdown
- **Interactive Charts**: Visualize spending patterns with pie/bar charts
- **Real-time Sync**: Changes in one tab reflect instantly in other open tabs
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js for data visualization
- BroadcastChannel API for cross-tab communication

## How to Use

1. Open `index.html` in your web browser
2. Use the form on the left to add new expenses
3. View your expense summary and charts on the right
4. Filter expenses by date range or category
5. Toggle between light and dark mode using the switch in the header
6. Open multiple tabs to see real-time synchronization in action

## Testing

The application includes a simple test suite to verify core functionality:

1. Open the application in your web browser
2. Open the browser's developer console (F12 or right-click > Inspect > Console)
3. Run the tests by typing: `window.runExpenseTrackerTests()`
4. View the test results in the console

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS styling including dark mode
- `app.js` - Core application functionality
- `tests.js` - Simple test suite

## Local Storage

The application uses the browser's localStorage to persist expense data between sessions. No server-side storage is used, so all data remains on your local device.

## Cross-Tab Communication

The BroadcastChannel API is used to synchronize data between multiple open tabs. When you add or delete an expense in one tab, the changes will be reflected in all other open tabs of the application.
