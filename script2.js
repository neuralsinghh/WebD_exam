// --- State Management (Multi-User) ---
const state = {
    isLoggedIn: false,
    currentUser: null,

    users: [
        {
        name: "Astaad",
        email: "astaad@nexus.com",
        password: "1234",
        accountNumber: "1001",
        balance: 125000,
        transactions: []
    },
        {
            name: "Rahul",
            email: "rahul@nexus.com",
            password: "1234",
            accountNumber: "1002",
            balance: 85000,
            transactions:[]
        }
    ],

    transactions: []
};

// --- Navigation Logic ---

function navigate(pageId) {
    // Protection: Prevent access to protected pages if not logged in
    const protectedPages = ['dashboard', 'transfer', 'transactions'];
    if (protectedPages.includes(pageId) && !state.isLoggedIn) {
        alert("Please login to access this page.");
        showPage('login');
        return;
    }

    // Update URL hash (optional, for deep linking simulation)
    window.location.hash = pageId;

    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });

    // Show target page
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active-page');
    }

    // Update Navbar Active State
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('onclick').includes(pageId)) {
            link.classList.add('active');
        }
    });

    // Close mobile menu if open
    document.getElementById('navLinks').classList.remove('active');
    
    // Refresh data if entering specific pages
    if (pageId === 'dashboard') loadDashboard();
    if (pageId === 'transactions') loadTransactions();
    if (pageId === 'home') {
         // Update auth buttons based on login state
         updateAuthButtons();
    }
}

function showPage(pageId) {
    navigate(pageId);
}

// Mobile Menu Toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// --- Authentication Logic ---

function handleLogin(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    const user = state.users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        alert("Invalid email or password");
        return;
    }

    // Simulate loading
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Logging in...";
    btn.disabled = true;

    setTimeout(() => {
        state.isLoggedIn = true;
        state.currentUser = user;   // ⭐ MOST IMPORTANT

        updateAuthButtons();
        navigate('dashboard');

        btn.innerText = originalText;
        btn.disabled = false;
        e.target.reset();
    }, 800);
}

function logout() {
    state.isLoggedIn = false;
    state.currentUser = null;
    updateAuthButtons();
    navigate('home');
    alert("Logged out successfully");
}

function updateAuthButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (state.isLoggedIn) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// --- Dashboard Logic ---

function loadDashboard() {

    if (!state.currentUser) return;

    document.getElementById('userName').innerText =
        state.currentUser.name;

    document.getElementById('balanceDisplay').innerText =
        state.currentUser.balance.toFixed(2);

    document.getElementById('accNum').innerText =
        state.currentUser.accountNumber;

    // Recent transactions
    const recentContainer = document.getElementById('recentTransactions');
    recentContainer.innerHTML = '';

const recentTxns = state.currentUser.transactions.slice(0, 3);

    recentTxns.forEach(txn => {
        const row = document.createElement('tr');
        const color = txn.amount > 0 ? 'green' : 'red';

        row.innerHTML = `
            <td>${txn.date}</td>
            <td>${txn.desc}</td>
            <td style="color:${color}; font-weight:bold;">
                ${formatCurrency(txn.amount)}
            </td>
            <td>${txn.type}</td>
        `;
        recentContainer.appendChild(row);
    });
}

// --- Transfer Logic ---



function handleTransfer(e) {
    e.preventDefault();

    const recipient = document.getElementById('recipient').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const note = document.getElementById('note').value;

    if (!recipient || !amount) {
        alert("Please fill all fields");
        return;
    }

    if (amount > state.currentUser.balance) {
        alert("Insufficient balance");
        return;
    }

    // Deduct balance
    state.currentUser.balance -= amount;

    // Create transaction
    const newTxn = {
        id: `TXN-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString().split('T')[0],
        desc: `Transfer to ${recipient} ${note ? '(' + note + ')' : ''}`,
        amount: -amount,
        type: "Debit",
        status: "Completed"
    };

    state.currentUser.transactions.unshift(newTxn);

    alert(`₹${amount} transferred successfully!\nNew Balance: ${formatCurrency(state.currentUser.balance)}`);

    e.target.reset();

    navigate('dashboard');
}

// --- Transactions Page Logic ---

function loadTransactions() {
    const container = document.getElementById('allTransactions');
    container.innerHTML = '';

    state.currentUser.transactions.forEach(txn => {
        const row = document.createElement('tr');
        const color = txn.amount > 0 ? 'var(--success)' : 'var(--danger)';
        
        row.innerHTML = `
            <td>${txn.id}</td>
            <td>${txn.date}</td>
            <td>${txn.desc}</td>
            <td style="color: ${color}; font-weight: 600;">${formatCurrency(txn.amount)}</td>
            <td><span class="status-active">${txn.status}</span></td>
        `;
        container.appendChild(row);
    });
}

// --- Utilities ---

function formatCurrency(num) {
    return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Check if hash exists in URL
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        navigate(hash);
    } else {
        navigate('home');
    }
});

