/**
 * Delta Calendar - Authentication Module
 */

const USERS_KEY = 'delta_users';
const SESSION_KEY = 'delta_current_user';

// Get list of all registered users from localStorage
function getUsers() {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
}

// Save list of users to localStorage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Register a new user
export function signup(username, password) {
    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser || !password) {
        return { success: false, message: 'Nome de usuário e senha são obrigatórios.' };
    }

    const users = getUsers();
    if (users[trimmedUser]) {
        return { success: false, message: 'Este nome de usuário já está em uso.' };
    }

    // Save credentials (plain text for simplicity of demo, but in production we would hash it)
    users[trimmedUser] = {
        username: username.trim(), // Keep original casing for display
        password: password
    };
    saveUsers(users);

    // Auto log in after signup
    return login(username, password);
}

// Log in an existing user
export function login(username, password) {
    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser || !password) {
        return { success: false, message: 'Nome de usuário e senha são obrigatórios.' };
    }

    const users = getUsers();
    const user = users[trimmedUser];

    if (!user || user.password !== password) {
        return { success: false, message: 'Usuário ou senha incorretos.' };
    }

    // Set active session
    localStorage.setItem(SESSION_KEY, user.username);
    return { success: true, username: user.username };
}

// Log out the current user
export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

// Get the currently logged-in user name
export function getCurrentUser() {
    return localStorage.getItem(SESSION_KEY);
}

// Check if a user is currently authenticated
export function isAuthenticated() {
    return !!getCurrentUser();
}
