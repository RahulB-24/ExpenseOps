const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Types for API responses
export interface AuthResponse {
    token: string;
    userId: string;
    tenantId: string;
    email: string;
    name: string;
    role: 'EMPLOYEE' | 'MANAGER' | 'FINANCE' | 'ADMIN';
    tenantName: string;
}

export interface TenantResponse {
    id: string;
    name: string;
    slug: string;
}

export interface CategoryResponse {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export interface ExpenseResponse {
    id: string;
    title: string;
    description: string;
    amount: number;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
    rejectionReason: string | null;
    userId: string;
    userName: string;
    userDepartment: string;
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    receiptUrl: string | null;
    createdAt: string;
    submittedAt: string | null;
    approvedAt: string | null;
    reimbursedAt: string | null;
    expenseDate: string | null;
}

// Helper to get token from localStorage
const getToken = (): string | null => localStorage.getItem('token');

// Helper for authenticated requests
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// API Error handling
class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new ApiError(response.status, error.message || 'Request failed');
    }
    return response.json();
};

// Auth API
export const authApi = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return handleResponse(response);
    },

    register: async (name: string, email: string, password: string, inviteCode?: string, newTenantName?: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, inviteCode, newTenantName })
        });
        return handleResponse(response);
    },

    getTenants: async (): Promise<TenantResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/auth/tenants`);
        return handleResponse(response);
    }
};

// Categories API
export const categoriesApi = {
    getAll: async (): Promise<CategoryResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    create: async (name: string, icon: string, description?: string): Promise<CategoryResponse> => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ name, icon, description })
        });
        return handleResponse(response);
    }
};

// Expenses API
export const expensesApi = {
    getMyExpenses: async (): Promise<ExpenseResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    getPendingApprovals: async (): Promise<ExpenseResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/expenses/pending`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    getApprovedForReimbursement: async (): Promise<ExpenseResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/expenses/approved`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    getApprovalHistory: async (): Promise<ExpenseResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/expenses/approval-history`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    getById: async (id: string): Promise<ExpenseResponse> => {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    create: async (expense: { title: string; description?: string; amount: number; categoryId: string; receiptUrl?: string }): Promise<ExpenseResponse> => {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(expense)
        });
        return handleResponse(response);
    },

    update: async (id: string, expense: { title: string; description?: string; amount: number; categoryId: string; receiptUrl?: string; expenseDate: string }): Promise<ExpenseResponse> => {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(expense)
        });
        return handleResponse(response);
    },

    submit: async (id: string): Promise<ExpenseResponse> => {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}/submit`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    approve: async (id: string): Promise<ExpenseResponse> => {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}/approve`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    reject: async (id: string, reason: string): Promise<ExpenseResponse> => {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}/reject`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ reason })
        });
        return handleResponse(response);
    },

    reimburse: async (id: string): Promise<ExpenseResponse> => {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}/reimburse`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Delete failed' }));
            throw new ApiError(response.status, error.message);
        }
    }
};

// User Response interface
export interface UserResponse {
    id: string;
    name: string;
    email: string;
    department: string | null;
    role: 'EMPLOYEE' | 'MANAGER' | 'FINANCE' | 'ADMIN';
    active: boolean;
    createdAt: string;
}

// Admin API
export const adminApi = {
    getAllUsers: async (): Promise<UserResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    updateUserRole: async (userId: string, role: string): Promise<UserResponse> => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ role })
        });
        return handleResponse(response);
    },

    toggleUserActive: async (userId: string): Promise<UserResponse> => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-active`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    getTenantInviteCode: async (): Promise<{ inviteCode: string }> => {
        const response = await fetch(`${API_BASE_URL}/admin/tenant/invite-code`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    updateUserDepartment: async (userId: string, department: string): Promise<UserResponse> => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/department`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ department })
        });
        return handleResponse(response);
    },

    resetUserPassword: async (userId: string, newPassword: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ newPassword })
        });
        return handleResponse(response);
    },

    // Category Management
    getCategories: async (): Promise<{ id: string; name: string; icon: string; description: string; isActive: boolean }[]> => {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            headers: authHeaders()
        });
        return handleResponse(response);
    },

    createCategory: async (name: string, icon: string, description: string): Promise<{ id: string; name: string; icon: string; description: string; isActive: boolean }> => {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ name, icon, description })
        });
        return handleResponse(response);
    },

    updateCategory: async (categoryId: string, name: string, icon: string, description: string): Promise<{ id: string; name: string; icon: string; description: string; isActive: boolean }> => {
        const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ name, icon, description })
        });
        return handleResponse(response);
    },

    toggleCategoryActive: async (categoryId: string): Promise<{ id: string; name: string; icon: string; description: string; isActive: boolean }> => {
        const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/toggle-active`, {
            method: 'POST',
            headers: authHeaders()
        });
        return handleResponse(response);
    }
};
