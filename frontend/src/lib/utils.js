import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Format date with time
export function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format currency
export function formatCurrency(amount, currency = 'EUR') {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format large numbers
export function formatNumber(num) {
    if (num === null || num === undefined) return '-';
    return new Intl.NumberFormat('en-EU').format(num);
}

// Get bucket color classes
export function getBucketClasses(bucket) {
    const classes = {
        'Prohibited': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900',
        'High-risk': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-900',
        'Limited risk': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900',
        'Minimal risk': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900',
        'Needs clarification': 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
    };
    return classes[bucket] || classes['Needs clarification'];
}

// Get bucket icon name
export function getBucketIcon(bucket) {
    const icons = {
        'Prohibited': 'ban',
        'High-risk': 'alert-triangle',
        'Limited risk': 'alert-circle',
        'Minimal risk': 'check-circle',
        'Needs clarification': 'help-circle'
    };
    return icons[bucket] || 'help-circle';
}

// Get confidence color
export function getConfidenceClasses(confidence) {
    const classes = {
        'High': 'text-green-600 dark:text-green-400',
        'Medium': 'text-amber-600 dark:text-amber-400',
        'Low': 'text-red-600 dark:text-red-400'
    };
    return classes[confidence] || classes['Low'];
}

// Get priority color classes
export function getPriorityClasses(priority) {
    const classes = {
        'P0': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
        'P1': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
        'P2': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
    };
    return classes[priority] || classes['P2'];
}

// Get effort badge classes
export function getEffortClasses(effort) {
    const classes = {
        'S': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
        'M': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
        'L': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
    };
    return classes[effort] || classes['M'];
}

// Truncate text
export function truncate(str, length = 100) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate unique ID
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
