/**
 * ORDERLY - Authentication Module
 * Mengelola login, register, token storage, dan axios interceptor
 */

const API_BASE_URL = 'http://localhost:5000/api';

// ============ AUTH STATE ============
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.isAuthenticated = !!this.token;
    }

    // Save auth data to localStorage
    saveAuth(token, user) {
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.setupAxiosInterceptor();
    }

    // Clear auth data
    clearAuth() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    }

    // Setup axios interceptor for JWT
    setupAxiosInterceptor() {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        axios.interceptors.response.use(
            response => response,
            error => {
                // Jika token expired (401), clear auth dan redirect ke login
                if (error.response?.status === 401) {
                    this.clearAuth();
                    window.location.href = '/frontend/auth/login.html';
                }
                return Promise.reject(error);
            }
        );
    }

    // Initialize interceptor on app load
    init() {
        if (this.token) {
            this.setupAxiosInterceptor();
        }
    }
}

// ============ REGISTER FUNCTION ============
async function register(name, email, password, role = 'buyer') {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
            name,
            email,
            password,
            role
        });

        showAlert('success', '✅ Pendaftaran berhasil! Silakan login.');
        setTimeout(() => {
            window.location.href = '/frontend/auth/login.html';
        }, 1500);

        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Pendaftaran gagal';
        showAlert('danger', `❌ ${message}`);
        throw error;
    }
}

// ============ LOGIN FUNCTION ============
async function login(email, password) {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password
        });

        const { token, user } = response.data;
        auth.saveAuth(token, user);

        showAlert('success', '✅ Login berhasil!');
        
        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'seller') {
                window.location.href = '/frontend/dashboard/seller.html';
            } else if (user.role === 'admin') {
                window.location.href = '/frontend/dashboard/admin.html';
            } else {
                window.location.href = '/frontend/index.html';
            }
        }, 1000);

        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Login gagal';
        showAlert('danger', `❌ ${message}`);
        throw error;
    }
}

// ============ LOGOUT FUNCTION ============
function logout() {
    auth.clearAuth();
    showAlert('info', 'Anda telah logout');
    setTimeout(() => {
        window.location.href = '/frontend/index.html';
    }, 1000);
}

// ============ GET CURRENT USER ============
async function getCurrentUser() {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`);
        return response.data.user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// ============ UTILITY FUNCTIONS ============
function showAlert(type, message) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = message;

    // Insert at top of body or form
    const form = document.querySelector('.auth-form') || document.querySelector('.container');
    if (form) {
        form.insertBefore(alertDiv, form.firstChild);
        setTimeout(() => alertDiv.remove(), 4000);
    }
}

function formatUserName(user) {
    return user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
}

function isLoggedIn() {
    return auth.isAuthenticated;
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/frontend/auth/login.html';
    }
}

function requireRole(requiredRole) {
    if (!isLoggedIn()) {
        window.location.href = '/frontend/auth/login.html';
        return;
    }

    if (auth.user.role !== requiredRole && auth.user.role !== 'admin') {
        window.location.href = '/frontend/index.html';
    }
}

// ============ INITIALIZE ============
const auth = new AuthManager();
auth.init();
