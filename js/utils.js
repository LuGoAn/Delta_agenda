/**
 * Delta Calendar - Utilities
 */

// Format date as YYYY-MM-DD
export function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// Format date to local string (e.g. "01 de Junho de 2026")
export function formatLocalDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    // Create date in local timezone to avoid UTC shifts
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Format date to short local string (e.g. "01/06")
export function formatLocalDateShort(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
}

// Add days to a date string (YYYY-MM-DD)
export function addDays(dateStr, days) {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    date.setDate(date.getDate() + days);
    return formatDate(date);
}

// Get difference in days between two date strings
export function getDaysDiff(dateStr1, dateStr2) {
    const parts1 = dateStr1.split('-');
    const parts2 = dateStr2.split('-');
    const d1 = new Date(parseInt(parts1[0]), parseInt(parts1[1]) - 1, parseInt(parts1[2]));
    const d2 = new Date(parseInt(parts2[0]), parseInt(parts2[1]) - 1, parseInt(parts2[2]));
    const diffTime = d2 - d1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// DOM Helper: Select single element
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

// DOM Helper: Select all elements
export function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}

// Generate unique ID
export function generateUUID() {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}
