import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Expense, ExpenseStatus, UserRole, Category } from '../types';
import { authApi, expensesApi, categoriesApi, AuthResponse, ExpenseResponse } from './api';

interface StoreContextType {
  currentUser: User | null;
  token: string | null;
  expenses: Expense[];
  pendingApprovals: Expense[];
  approvedForReimbursement: Expense[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchExpenses: () => Promise<void>;
  fetchPendingApprovals: () => Promise<void>;
  fetchApprovedForReimbursement: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createExpense: (expense: { title: string; description?: string; amount: number; categoryId: string; receiptUrl?: string; expenseDate: string }) => Promise<void>;
  updateExpense: (id: string, expense: { title: string; description?: string; amount: number; categoryId: string; receiptUrl?: string; expenseDate: string }) => Promise<void>;
  submitExpense: (id: string) => Promise<void>;
  approveExpense: (id: string) => Promise<void>;
  rejectExpense: (id: string, reason: string) => Promise<void>;
  reimburseExpense: (id: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  clearError: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to convert API response to frontend Expense type
const mapExpenseResponse = (e: ExpenseResponse): Expense => ({
  id: e.id,
  title: e.title,
  description: e.description,
  amount: e.amount,
  status: e.status as ExpenseStatus,
  rejectionReason: e.rejectionReason || undefined,
  userId: e.userId,
  userName: e.userName,
  userDepartment: e.userDepartment,
  categoryId: e.categoryId,
  categoryName: e.categoryName,
  categoryIcon: e.categoryIcon,
  receiptUrl: e.receiptUrl || undefined,
  expenseDate: e.expenseDate || e.createdAt, // Fallback for old records
  createdAt: e.createdAt,
  submittedAt: e.submittedAt || undefined,
  approvedAt: e.approvedAt || undefined,
  reimbursedAt: e.reimbursedAt || undefined,
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Expense[]>([]);
  const [approvedForReimbursement, setApprovedForReimbursement] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await authApi.login(email, password);
      const user: User = {
        id: response.userId,
        name: response.name,
        email: response.email,
        role: response.role as UserRole,
        tenantId: response.tenantId,
        tenantName: response.tenantName,
      };

      // Save to state and localStorage
      setCurrentUser(user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    setExpenses([]);
    setPendingApprovals([]);
    setApprovedForReimbursement([]);
    setCategories([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await expensesApi.getMyExpenses();
      setExpenses(response.map(mapExpenseResponse));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    setIsLoading(true);
    try {
      const response = await expensesApi.getPendingApprovals();
      setPendingApprovals(response.map(mapExpenseResponse));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pending approvals');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApprovedForReimbursement = async () => {
    setIsLoading(true);
    try {
      const response = await expensesApi.getApprovedForReimbursement();
      setApprovedForReimbursement(response.map(mapExpenseResponse));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch approved expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        description: c.description || '',
      })));
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const createExpense = async (expense: { title: string; description?: string; amount: number; categoryId: string; receiptUrl?: string; expenseDate: string }): Promise<Expense> => {
    setIsLoading(true);
    try {
      const response = await expensesApi.create(expense);
      const mapped = mapExpenseResponse(response);
      setExpenses(prev => [mapped, ...prev]);
      return mapped;
    } catch (err: any) {
      setError(err.message || 'Failed to create expense');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async (id: string, expense: { title: string; description?: string; amount: number; categoryId: string; receiptUrl?: string; expenseDate: string }) => {
    setIsLoading(true);
    try {
      const response = await expensesApi.update(id, expense);
      const mapped = mapExpenseResponse(response);
      setExpenses(prev => prev.map(e => e.id === id ? mapped : e));
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const submitExpense = async (id: string) => {
    try {
      const response = await expensesApi.submit(id);
      setExpenses(prev => prev.map(e => e.id === id ? mapExpenseResponse(response) : e));
    } catch (err: any) {
      setError(err.message || 'Failed to submit expense');
      throw err;
    }
  };

  const approveExpense = async (id: string) => {
    try {
      const response = await expensesApi.approve(id);
      // Remove from pending approvals
      setPendingApprovals(prev => prev.filter(e => e.id !== id));
      // Update in expenses list if present
      setExpenses(prev => prev.map(e => e.id === id ? mapExpenseResponse(response) : e));
    } catch (err: any) {
      setError(err.message || 'Failed to approve expense');
      throw err;
    }
  };

  const rejectExpense = async (id: string, reason: string) => {
    try {
      const response = await expensesApi.reject(id, reason);
      // Remove from pending approvals
      setPendingApprovals(prev => prev.filter(e => e.id !== id));
      // Update in expenses list if present
      setExpenses(prev => prev.map(e => e.id === id ? mapExpenseResponse(response) : e));
    } catch (err: any) {
      setError(err.message || 'Failed to reject expense');
      throw err;
    }
  };

  const reimburseExpense = async (id: string) => {
    try {
      const response = await expensesApi.reimburse(id);
      // Remove from approved list
      setApprovedForReimbursement(prev => prev.filter(e => e.id !== id));
      // Update in expenses list if present
      setExpenses(prev => prev.map(e => e.id === id ? mapExpenseResponse(response) : e));
    } catch (err: any) {
      setError(err.message || 'Failed to reimburse expense');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expensesApi.delete(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <StoreContext.Provider value={{
      currentUser,
      token,
      expenses,
      pendingApprovals,
      approvedForReimbursement,
      categories,
      isLoading,
      error,
      login,
      logout,
      fetchExpenses,
      fetchPendingApprovals,
      fetchApprovedForReimbursement,
      fetchCategories,
      createExpense,
      updateExpense,
      submitExpense,
      approveExpense,
      rejectExpense,
      reimburseExpense,
      deleteExpense,
      clearError,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
