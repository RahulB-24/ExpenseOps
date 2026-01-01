import { UserRole, ExpenseStatus, User, Expense, Category } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'John Employee', email: 'john@acme.com', role: UserRole.EMPLOYEE, department: 'Engineering' },
  { id: '2', name: 'Jane Manager', email: 'jane@acme.com', role: UserRole.MANAGER, department: 'Engineering' },
  { id: '3', name: 'Bob Finance', email: 'bob@acme.com', role: UserRole.FINANCE, department: 'Finance' },
  { id: '4', name: 'Alice Admin', email: 'admin@acme.com', role: UserRole.ADMIN, department: 'IT' },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Travel', icon: '🏨', description: 'Flights, hotels, car rentals' },
  { id: '2', name: 'Meals', icon: '🍽️', description: 'Client dinners, team lunches' },
  { id: '3', name: 'Transport', icon: '🚗', description: 'Uber, Taxi, Fuel' },
  { id: '4', name: 'Software', icon: '💻', description: 'Subscriptions, tools, licenses' },
  { id: '5', name: 'Supplies', icon: '📦', description: 'Office supplies, equipment' },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: '101',
    userId: '1',
    userName: 'John Employee',
    title: 'Hotel Stay - Marriott',
    amount: 450.00,
    category: 'Travel',
    status: ExpenseStatus.SUBMITTED,
    date: '2024-12-28',
    description: '2-night stay for client meeting in NYC.'
  },
  {
    id: '102',
    userId: '1',
    userName: 'John Employee',
    title: 'Client Lunch',
    amount: 85.00,
    category: 'Meals',
    status: ExpenseStatus.APPROVED,
    date: '2024-12-27',
    description: 'Lunch with potential client.'
  },
  {
    id: '103',
    userId: '1',
    userName: 'John Employee',
    title: 'Uber Rides',
    amount: 32.50,
    category: 'Transport',
    status: ExpenseStatus.DRAFT,
    date: '2024-12-26',
    description: 'Transport to airport.'
  },
  {
    id: '104',
    userId: '2',
    userName: 'Jane Manager',
    title: 'Team Building Dinner',
    amount: 1200.00,
    category: 'Meals',
    status: ExpenseStatus.SUBMITTED,
    date: '2024-12-29',
    description: 'Quarterly team dinner.'
  },
  {
    id: '105',
    userId: '1',
    userName: 'John Employee',
    title: 'Figma Subscription',
    amount: 15.00,
    category: 'Software',
    status: ExpenseStatus.REIMBURSED,
    date: '2024-12-01',
    description: 'Monthly license.'
  }
];
