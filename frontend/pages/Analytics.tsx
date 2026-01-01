import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../services/store';
import { ExpenseCharts } from '../components/charts/ExpenseCharts';
import { BarChart3, Loader2, TrendingUp, TrendingDown, PieChart, Calendar, Clock, Award, ArrowRight, IndianRupee, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { ExpenseStatus, Expense } from '../types';

type DateRange = 'THIS_MONTH' | 'LAST_3_MONTHS' | 'THIS_YEAR' | 'ALL_TIME';

export const Analytics: React.FC = () => {
    const { expenses, fetchExpenses, isLoading, currentUser } = useStore();
    const [dateRange, setDateRange] = useState<DateRange>('ALL_TIME');

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Helper: Format date as dd/mm/yyyy
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Filter expenses by current user
    const myExpenses = useMemo(() => {
        return expenses.filter(e => e.userId === currentUser?.id);
    }, [expenses, currentUser]);

    // Filter expenses by date range
    const filteredExpenses = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOf3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return myExpenses.filter(e => {
            const expenseDate = new Date(e.expenseDate || e.createdAt);
            switch (dateRange) {
                case 'THIS_MONTH':
                    return expenseDate >= startOfMonth;
                case 'LAST_3_MONTHS':
                    return expenseDate >= startOf3MonthsAgo;
                case 'THIS_YEAR':
                    return expenseDate >= startOfYear;
                case 'ALL_TIME':
                default:
                    return true;
            }
        });
    }, [myExpenses, dateRange]);

    // Get last month's expenses for comparison
    const lastMonthExpenses = useMemo(() => {
        const now = new Date();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return myExpenses.filter(e => {
            const expenseDate = new Date(e.expenseDate || e.createdAt);
            return expenseDate >= startOfLastMonth && expenseDate <= endOfLastMonth;
        });
    }, [myExpenses]);

    // Current month expenses
    const thisMonthExpenses = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return myExpenses.filter(e => {
            const expenseDate = new Date(e.expenseDate || e.createdAt);
            return expenseDate >= startOfMonth;
        });
    }, [myExpenses]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const count = filteredExpenses.length;
        const avgPerExpense = count > 0 ? total / count : 0;

        const draft = filteredExpenses.filter(e => e.status === ExpenseStatus.DRAFT).length;
        const pending = filteredExpenses.filter(e => e.status === ExpenseStatus.SUBMITTED).length;
        const approved = filteredExpenses.filter(e => e.status === ExpenseStatus.APPROVED).length;
        const rejected = filteredExpenses.filter(e => e.status === ExpenseStatus.REJECTED).length;
        const reimbursed = filteredExpenses.filter(e => e.status === ExpenseStatus.REIMBURSED).length;

        // Month-over-month calculation
        const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const momChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

        return {
            total,
            count,
            avgPerExpense,
            draft,
            pending,
            approved,
            rejected,
            reimbursed,
            thisMonthTotal,
            lastMonthTotal,
            momChange,
            approvalRate: count > 0 ? ((approved + reimbursed) / count) * 100 : 0
        };
    }, [filteredExpenses, thisMonthExpenses, lastMonthExpenses]);

    // Top Categories (sorted by amount)
    const topCategories = useMemo(() => {
        const categoryMap = new Map<string, { name: string; icon: string; amount: number; count: number }>();

        filteredExpenses.forEach(e => {
            const key = e.categoryName;
            const existing = categoryMap.get(key);
            if (existing) {
                existing.amount += e.amount;
                existing.count += 1;
            } else {
                categoryMap.set(key, {
                    name: e.categoryName,
                    icon: e.categoryIcon || '📁',
                    amount: e.amount,
                    count: 1
                });
            }
        });

        return Array.from(categoryMap.values())
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [filteredExpenses]);

    const maxCategoryAmount = topCategories.length > 0 ? topCategories[0].amount : 1;

    // Biggest Single Expense
    const biggestExpense = useMemo(() => {
        if (filteredExpenses.length === 0) return null;
        return filteredExpenses.reduce((max, e) => e.amount > max.amount ? e : max, filteredExpenses[0]);
    }, [filteredExpenses]);

    // Average Processing Time (Submitted -> Approved)
    const avgProcessingTime = useMemo(() => {
        const processedExpenses = filteredExpenses.filter(e =>
            e.status === ExpenseStatus.APPROVED ||
            e.status === ExpenseStatus.REIMBURSED ||
            e.status === ExpenseStatus.REJECTED
        );

        if (processedExpenses.length === 0) return null;

        let totalDays = 0;
        let validCount = 0;

        processedExpenses.forEach(e => {
            if (e.submittedAt && e.approvedAt) {
                const submitted = new Date(e.submittedAt);
                const approved = new Date(e.approvedAt);
                const diffTime = Math.abs(approved.getTime() - submitted.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalDays += diffDays;
                validCount++;
            }
        });

        return validCount > 0 ? Math.round(totalDays / validCount) : null;
    }, [filteredExpenses]);

    const dateRangeOptions: { value: DateRange; label: string }[] = [
        { value: 'THIS_MONTH', label: 'This Month' },
        { value: 'LAST_3_MONTHS', label: 'Last 3 Months' },
        { value: 'THIS_YEAR', label: 'This Year' },
        { value: 'ALL_TIME', label: 'All Time' },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header with Date Range Filter */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Analytics
                    </h1>
                </div>

                {/* Date Range Filter */}
                <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-white rounded-lg shadow-sm border p-1">
                    {dateRangeOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setDateRange(option.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${dateRange === option.value
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Spent */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <IndianRupee className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-xs text-slate-500 uppercase">Total Spent</p>
                            <p className="text-lg font-bold text-slate-900">₹{stats.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-xs text-slate-500 uppercase">This Month</p>
                            <p className="text-lg font-bold text-slate-900">₹{stats.thisMonthTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>

                {/* Avg Amount */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <PieChart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs text-slate-500 uppercase">Avg. Amount</p>
                            <p className="text-lg font-bold text-slate-900">₹{stats.avgPerExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>

                {/* Approval Rate */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs text-slate-500 uppercase">Approval Rate</p>
                            <p className="text-lg font-bold text-slate-900">{stats.approvalRate.toFixed(0)}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Funnel */}
            <div className="bg-white rounded-lg shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Expense Pipeline</h3>
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                    {[
                        { label: 'Draft', count: stats.draft, color: 'bg-slate-100', textColor: 'text-slate-700' },
                        { label: 'Submitted', count: stats.pending, color: 'bg-amber-100', textColor: 'text-amber-700' },
                        { label: 'Approved', count: stats.approved, color: 'bg-green-100', textColor: 'text-green-700' },
                        { label: 'Reimbursed', count: stats.reimbursed, color: 'bg-blue-100', textColor: 'text-blue-700' },
                    ].map((stage, idx, arr) => (
                        <React.Fragment key={stage.label}>
                            <div className={`flex-1 min-w-[100px] ${stage.color} rounded-lg p-4 text-center`}>
                                <p className={`text-2xl font-bold ${stage.textColor}`}>{stage.count}</p>
                                <p className={`text-xs font-medium ${stage.textColor} uppercase`}>{stage.label}</p>
                            </div>
                            {idx < arr.length - 1 && (
                                <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                            )}
                        </React.Fragment>
                    ))}
                    {stats.rejected > 0 && (
                        <>
                            <div className="w-px h-12 bg-slate-200 mx-2"></div>
                            <div className="flex-1 min-w-[100px] bg-red-100 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                                <p className="text-xs font-medium text-red-700 uppercase">Rejected</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Two Column: Top Categories + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Categories Leaderboard */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Top Categories</h3>
                        <Award className="w-5 h-5 text-amber-500" />
                    </div>
                    {topCategories.length === 0 ? (
                        <p className="text-slate-500 text-sm">No expenses in this period.</p>
                    ) : (
                        <div className="space-y-3">
                            {topCategories.map((cat, idx) => (
                                <div key={cat.name} className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-slate-400 w-6">{idx + 1}</span>
                                    <span className="text-xl">{cat.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                                            <span className="text-sm font-bold text-slate-900">₹{cat.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${(cat.amount / maxCategoryAmount) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{cat.count} expense{cat.count > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Insights Column */}
                <div className="space-y-4">
                    {/* Biggest Expense */}
                    {biggestExpense && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-5 h-5 text-amber-600" />
                                <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Biggest Expense</h3>
                            </div>
                            <p className="text-2xl font-bold text-amber-900">₹{biggestExpense.amount.toLocaleString('en-IN')}</p>
                            <p className="text-sm font-medium text-amber-800 mt-1">{biggestExpense.title}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-amber-700">
                                <span>{biggestExpense.categoryIcon} {biggestExpense.categoryName}</span>
                                <span>•</span>
                                <span>{formatDate(biggestExpense.expenseDate)}</span>
                            </div>
                        </div>
                    )}

                    {/* Average Processing Time */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Hourglass className="w-5 h-5 text-blue-600" />
                            <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Avg. Approval Time</h3>
                        </div>
                        {avgProcessingTime !== null ? (
                            <>
                                <p className="text-2xl font-bold text-blue-900">{avgProcessingTime} day{avgProcessingTime !== 1 ? 's' : ''}</p>
                                <p className="text-xs text-blue-700 mt-1">From submission to approval</p>
                            </>
                        ) : (
                            <p className="text-sm text-blue-700">Not enough data yet</p>
                        )}
                    </div>

                    {/* Claims Count */}
                    <div className="bg-white rounded-lg shadow-sm border p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-slate-500" />
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Total Claims</h3>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats.count}</p>
                        <p className="text-xs text-slate-500 mt-1">In selected period</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
            ) : (
                <ExpenseCharts expenses={filteredExpenses} />
            )}
        </div>
    );
};
