import React, { useState } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Expense } from '../../types';
import { Calendar } from 'lucide-react';

interface ExpenseChartsProps {
    expenses: Expense[];
}

interface MonthData {
    month: string;
    monthFull: string;
    year: number;
    amount: number;
    count: number;
    sortKey: number;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses }) => {
    const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);

    // Calculate category breakdown for pie chart
    const categoryData = expenses.reduce((acc, expense) => {
        const category = expense.categoryName || 'Other';
        const existing = acc.find(item => item.name === category);
        if (existing) {
            existing.value += expense.amount;
        } else {
            acc.push({ name: category, value: expense.amount, icon: expense.categoryIcon || '📁' });
        }
        return acc;
    }, [] as { name: string; value: number; icon: string }[]);

    // Calculate monthly data for area chart
    const monthlyData = expenses.reduce((acc, expense) => {
        const date = new Date(expense.expenseDate || expense.createdAt);
        const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
        const monthFull = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        const monthKey = `${monthShort} '${String(year).slice(-2)}`;
        const sortKey = year * 100 + date.getMonth();

        const existing = acc.find(item => item.month === monthKey);
        if (existing) {
            existing.amount += expense.amount;
            existing.count += 1;
        } else {
            acc.push({ month: monthKey, monthFull, year, amount: expense.amount, count: 1, sortKey });
        }
        return acc;
    }, [] as MonthData[]);

    // Sort chronologically
    monthlyData.sort((a, b) => a.sortKey - b.sortKey);

    // Get expenses for selected month
    const selectedMonthExpenses = selectedMonth ? expenses.filter(e => {
        const date = new Date(e.expenseDate || e.createdAt);
        const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        const monthKey = `${monthShort} '${String(year).slice(-2)}`;
        return monthKey === selectedMonth.month;
    }) : [];

    const totalAmount = categoryData.reduce((sum, item) => sum + item.value, 0);

    // Format date helper
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleMonthClick = (monthData: MonthData) => {
        setSelectedMonth(prev => prev?.month === monthData.month ? null : monthData);
    };

    if (expenses.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-500">
                <p>No expense data to display charts. Create some expenses to see analytics!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Two Column: Pie Chart + Area Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Expenses by Category</h3>
                        <span className="text-sm font-medium text-slate-400">Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    animationDuration={1000}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        padding: '8px 12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {categoryData.map((item, index) => (
                            <div key={item.name} className="flex items-center p-2 rounded-lg hover:bg-slate-50">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="mr-1">{item.icon}</span>
                                <span className="text-sm text-slate-700 truncate flex-1">{item.name}</span>
                                <span className="text-sm font-semibold text-slate-900 ml-auto">
                                    ₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Spending Trend - Area Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Monthly Trend</h3>
                        <span className="text-xs text-slate-500">Click a month below for details</span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                    width={45}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload as MonthData;
                                            return (
                                                <div className="bg-white rounded-lg shadow-lg border p-3">
                                                    <p className="font-semibold text-slate-800">{data.monthFull} {data.year}</p>
                                                    <p className="text-primary-600 font-bold">₹{data.amount.toLocaleString('en-IN')}</p>
                                                    <p className="text-xs text-slate-500">{data.count} expense{data.count > 1 ? 's' : ''}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#colorAmount)"
                                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#4f46e5' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Month Pills - Clickable */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {monthlyData.map((m) => (
                            <button
                                key={m.month}
                                onClick={() => handleMonthClick(m)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedMonth?.month === m.month
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {m.month}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Selected Month Details */}
            {selectedMonth && (
                <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl border border-primary-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{selectedMonth.monthFull} {selectedMonth.year}</h4>
                                <p className="text-sm text-slate-600">{selectedMonth.count} expense{selectedMonth.count > 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase">Total</p>
                            <p className="text-xl font-bold text-primary-700">₹{selectedMonth.amount.toLocaleString('en-IN')}</p>
                        </div>
                        <button
                            onClick={() => setSelectedMonth(null)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Expense List for Selected Month */}
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {selectedMonthExpenses.slice(0, 10).map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 text-sm text-slate-800">{expense.title}</td>
                                        <td className="px-4 py-2 text-sm text-slate-600">
                                            <span className="mr-1">{expense.categoryIcon}</span>
                                            {expense.categoryName}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-slate-500">{formatDate(expense.expenseDate)}</td>
                                        <td className="px-4 py-2 text-sm font-semibold text-slate-900 text-right">₹{expense.amount.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {selectedMonthExpenses.length > 10 && (
                            <div className="px-4 py-2 text-center text-xs text-slate-500 bg-slate-50">
                                + {selectedMonthExpenses.length - 10} more expenses
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
