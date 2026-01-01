import React from 'react';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  FINANCE = 'FINANCE',
  ADMIN = 'ADMIN'
}

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REIMBURSED = 'REIMBURSED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  department?: string;
}

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: ExpenseStatus;
  rejectionReason?: string;
  userId: string;
  userName: string;
  userDepartment?: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  receiptUrl?: string;
  expenseDate: string;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedByName?: string;
  reimbursedAt?: string;
  reimbursedByName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface StatCardProps {
  label: string;
  value: string;
  color: 'slate' | 'yellow' | 'green' | 'red' | 'blue';
  icon: React.ReactNode;
}