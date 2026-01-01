import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { ExpenseStatus, Expense } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Plus, Search, Filter, IndianRupee, Clock, CheckCircle, XCircle, Loader2, Upload, X, FileText, ArrowUpDown, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

type SortField = 'TITLE' | 'EXPENSE_DATE' | 'CREATED_AT' | 'AMOUNT' | 'STATUS' | 'CATEGORY' | 'DEFAULT';
type SortOrder = 'ASC' | 'DESC';
type ModalMode = 'CREATE' | 'EDIT' | 'VIEW';

export const Dashboard: React.FC = () => {
    const {
        expenses,
        categories,
        createExpense,
        updateExpense,
        submitExpense,
        deleteExpense,
        fetchExpenses,
        fetchCategories,
        currentUser,
        isLoading
    } = useStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('CREATE');
    const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortField>('DEFAULT');
    const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        categoryId: '',
        description: '',
        receiptUrl: '',
        expenseDate: new Date().toISOString().split('T')[0],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    // Fetch data on mount
    useEffect(() => {
        fetchExpenses();
        fetchCategories();
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

    // Helpers
    const openCreateModal = () => {
        setModalMode('CREATE');
        setFormData({
            title: '',
            amount: '',
            categoryId: '',
            description: '',
            receiptUrl: '',
            expenseDate: new Date().toISOString().split('T')[0],
        });
        setReceiptPreview(null);
        setSelectedExpenseId(null);
        setIsModalOpen(true);
    };

    const openExpenseDetail = (expense: Expense) => {
        setSelectedExpenseId(expense.id);

        // Decide mode based on status
        if (expense.status === ExpenseStatus.DRAFT) {
            setModalMode('EDIT');
        } else {
            setModalMode('VIEW');
        }

        // Populate form
        setFormData({
            title: expense.title,
            amount: expense.amount.toString(),
            categoryId: expense.categoryId,
            description: expense.description || '',
            receiptUrl: expense.receiptUrl || '',
            expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : new Date(expense.createdAt).toISOString().split('T')[0],
        });
        setReceiptPreview(expense.receiptUrl || null);
        setIsModalOpen(true);
    };

    // Logic
    const myExpenses = expenses.filter(e => e.userId === currentUser?.id);

    const stats = {
        total: myExpenses.reduce((sum, e) => sum + e.amount, 0),
        pending: myExpenses.filter(e => e.status === ExpenseStatus.SUBMITTED).reduce((sum, e) => sum + e.amount, 0),
        approved: myExpenses.filter(e => e.status === ExpenseStatus.APPROVED || e.status === ExpenseStatus.REIMBURSED).reduce((sum, e) => sum + e.amount, 0),
        rejected: myExpenses.filter(e => e.status === ExpenseStatus.REJECTED).reduce((sum, e) => sum + e.amount, 0),
    };

    const filteredExpenses = myExpenses
        .filter(e => {
            const matchesFilter = filter === 'ALL' || e.categoryId === filter;
            const term = search.toLowerCase().trim();
            if (!term) return matchesFilter;

            // Build a comprehensive searchable string
            const expenseDate = e.expenseDate ? new Date(e.expenseDate) : new Date(e.createdAt);
            const createdDate = new Date(e.createdAt);

            const dateFormats = [
                expenseDate.getDate().toString(),
                expenseDate.toLocaleString('default', { month: 'long' }).toLowerCase(),
                expenseDate.toLocaleString('default', { month: 'short' }).toLowerCase(),
                `${expenseDate.getDate()} ${expenseDate.toLocaleString('default', { month: 'long' }).toLowerCase()}`,
                `${expenseDate.toLocaleString('default', { month: 'long' }).toLowerCase()} ${expenseDate.getDate()}`,
                `${expenseDate.getDate()} ${expenseDate.toLocaleString('default', { month: 'short' }).toLowerCase()}`,
                `${expenseDate.toLocaleString('default', { month: 'short' }).toLowerCase()} ${expenseDate.getDate()}`,
                formatDate(e.expenseDate),
                formatDate(e.createdAt),
            ].join(' ');

            const searchableText = [
                e.title,
                e.categoryName,
                e.status,
                e.description || '',
                e.rejectionReason || '',
                dateFormats
            ].join(' ').toLowerCase();

            return matchesFilter && searchableText.includes(term);
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'EXPENSE_DATE':
                    const dateA = a.expenseDate ? new Date(a.expenseDate).getTime() : new Date(a.createdAt).getTime();
                    const dateB = b.expenseDate ? new Date(b.expenseDate).getTime() : new Date(b.createdAt).getTime();
                    comparison = dateA - dateB;
                    break;
                case 'CREATED_AT':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'AMOUNT':
                    comparison = a.amount - b.amount;
                    break;
                case 'STATUS':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'CATEGORY':
                    comparison = a.categoryName.localeCompare(b.categoryName);
                    break;
                case 'TITLE':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'DEFAULT':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Always newest first by default
            }
            return sortOrder === 'ASC' ? comparison : -comparison;
        });

    const handleSave = async (submitImmediately: boolean = false) => {
        if (!formData.title || !formData.amount || !formData.categoryId || !formData.expenseDate) {
            alert('Please fill in all required fields');
            return;
        }

        if (submitImmediately) setIsSubmitting(true);
        else setIsSaving(true);

        try {
            const payload = {
                title: formData.title,
                amount: parseFloat(formData.amount),
                categoryId: formData.categoryId,
                description: formData.description || undefined,
                receiptUrl: formData.receiptUrl || undefined,
                expenseDate: formData.expenseDate,
            };

            if (modalMode === 'CREATE') {
                const expense = await createExpense(payload);
                if (submitImmediately && expense) {
                    await submitExpense(expense.id);
                }
            } else if (modalMode === 'EDIT' && selectedExpenseId) {
                await updateExpense(selectedExpenseId, payload);
                if (submitImmediately) {
                    await submitExpense(selectedExpenseId);
                }
            }

            setIsModalOpen(false);
            setReceiptPreview(null);
        } catch (err) {
            console.error('Failed to save expense:', err);
            alert('Failed to save expense. Please try again.');
        } finally {
            setIsSaving(false);
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setFormData(prev => ({ ...prev, receiptUrl: base64 }));
                setReceiptPreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveReceipt = () => {
        setFormData(prev => ({ ...prev, receiptUrl: '' }));
        setReceiptPreview(null);
    };

    const handleQuickSubmit = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click
        try {
            await submitExpense(id);
        } catch (err) {
            console.error('Failed to submit expense:', err);
        }
    };

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; expenseId: string | null }>({
        isOpen: false,
        expenseId: null
    });

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click
        setDeleteConfirm({ isOpen: true, expenseId: id });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.expenseId) return;
        try {
            await deleteExpense(deleteConfirm.expenseId);
        } catch (err) {
            console.error('Failed to delete expense:', err);
        }
    };

    const toggleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortOrder('DESC'); // Default to DESC for new sorts usually
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-50" />;
        return sortOrder === 'ASC' ? <ChevronUp className="w-3 h-3 text-primary-600" /> : <ChevronDown className="w-3 h-3 text-primary-600" />;
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-slate-900">My Expenses</h1>
                <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Expense
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[{
                    label: 'Total Expenses', value: stats.total, icon: IndianRupee, bg: 'bg-slate-100', color: 'text-slate-600'
                }, {
                    label: 'Pending', value: stats.pending, icon: Clock, bg: 'bg-amber-100', color: 'text-amber-600'
                }, {
                    label: 'Approved', value: stats.approved, icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600'
                }, {
                    label: 'Rejected', value: stats.rejected, icon: XCircle, bg: 'bg-red-100', color: 'text-red-600'
                }].map((stat, idx) => (
                    <div key={idx} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 ${stat.bg} rounded-md p-3`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-slate-500 truncate">{stat.label}</dt>
                                        <dd className="text-lg font-bold text-slate-900">₹{stat.value.toFixed(2)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls: Search & Filters (Stacked Layout) */}
            <div className="bg-white shadow rounded-lg p-4 space-y-3">
                {/* Row 1: Search Bar (Full Width) */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Search by title, category, status, or date (e.g., 'December 31', 'Approved')..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Row 2: Filters & Sort */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Left: Category Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                        <select
                            className="block w-full sm:w-48 pl-3 pr-8 py-2 text-sm border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Right: Sort Controls */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 hidden sm:inline">Sort:</span>
                        <select
                            className="block flex-1 sm:flex-none sm:w-40 pl-3 pr-8 py-2 text-sm border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value as SortField);
                                setSortOrder('DESC');
                            }}
                        >
                            <option value="DEFAULT">Newest First</option>
                            <option value="EXPENSE_DATE">Expense Date</option>
                            <option value="CREATED_AT">Created Date</option>
                            <option value="AMOUNT">Amount</option>
                            <option value="STATUS">Status</option>
                            <option value="CATEGORY">Category</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                            className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                            title={sortOrder === 'ASC' ? 'Ascending' : 'Descending'}
                        >
                            {sortOrder === 'ASC' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            {!isLoading && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    {[
                                        { label: 'Title', key: 'TITLE' },
                                        { label: 'Category', key: 'CATEGORY' },
                                        { label: 'Expense Date', key: 'EXPENSE_DATE' },
                                        { label: 'Created On', key: 'CREATED_AT' },
                                        { label: 'Amount', key: 'AMOUNT' },
                                        { label: 'Status', key: 'STATUS' },
                                    ].map(({ label, key }) => (
                                        <th
                                            key={key}
                                            scope="col"
                                            onClick={() => toggleSort(key as SortField)}
                                            className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 group select-none transition-colors border-b border-transparent hover:border-slate-200"
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                {label}
                                                {getSortIcon(key as SortField)}
                                            </div>
                                        </th>
                                    ))}
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Approver Comments
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredExpenses.map((expense) => (
                                    <tr
                                        key={expense.id}
                                        className="hover:bg-indigo-50/30 cursor-pointer transition-colors"
                                        onClick={() => openExpenseDetail(expense)}
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap max-w-[200px]">
                                            <div className="text-sm font-medium text-slate-900 truncate" title={expense.title}>{expense.title}</div>
                                            {expense.description && (
                                                <div className="text-sm text-slate-500 truncate" title={expense.description}>{expense.description}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-slate-700">
                                                <span className="mr-2">{expense.categoryIcon}</span>
                                                {expense.categoryName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                                            {formatDate(expense.expenseDate)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {formatDate(expense.createdAt)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            ₹{expense.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <Badge status={expense.status} />
                                        </td>
                                        {/* Approver Comments Column */}
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 max-w-xs text-center">
                                            {expense.rejectionReason ? (
                                                <span className="text-red-600 font-medium truncate block" title={expense.rejectionReason}>
                                                    {expense.rejectionReason}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                                                {expense.status === ExpenseStatus.DRAFT ? (
                                                    <>
                                                        <Button size="sm" variant="ghost" onClick={(e) => handleQuickSubmit(e, expense.id)}>
                                                            Submit
                                                        </Button>
                                                        <button
                                                            onClick={(e) => handleDeleteClick(e, expense.id)}
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete Draft"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-400">View Only</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                                            No expenses found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
            }

            {/* Expense Modal (Create / Edit / View) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="max-w-2xl"
                title={
                    modalMode === 'CREATE' ? 'Create New Expense' :
                        modalMode === 'EDIT' ? 'Edit Expense' : 'Expense Details'
                }
                footer={
                    modalMode === 'VIEW' ? (
                        <div className="flex justify-end w-full">
                            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                        </div>
                    ) : (
                        <div className="flex flex-row-reverse gap-2 w-full">
                            <Button onClick={() => handleSave(true)} isLoading={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                {modalMode === 'CREATE' ? 'Submit' : 'Update & Submit'}
                            </Button>
                            <Button variant="secondary" onClick={() => handleSave(false)} isLoading={isSaving}>
                                {modalMode === 'CREATE' ? 'Save Draft' : 'Update Draft'}
                            </Button>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    )
                }
            >
                <div className="space-y-4">
                    {modalMode === 'VIEW' && (
                        <div className="bg-slate-50 p-3 rounded-md border text-sm text-slate-600 mb-4">
                            This expense is <strong>{selectedExpenseId && expenses.find(e => e.id === selectedExpenseId)?.status}</strong> and cannot be edited.
                        </div>
                    )}
                    <Input
                        label="Title"
                        placeholder="e.g. Client dinner"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        disabled={modalMode === 'VIEW'}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Amount (₹)"
                            type="number"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            disabled={modalMode === 'VIEW'}
                        />
                        <Input
                            label="Date"
                            type="date"
                            value={formData.expenseDate}
                            onChange={e => setFormData({ ...formData, expenseDate: e.target.value })}
                            disabled={modalMode === 'VIEW'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border disabled:bg-slate-100 disabled:text-slate-500"
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            disabled={modalMode === 'VIEW'}
                        >
                            <option value="">Select...</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 disabled:bg-slate-100 disabled:text-slate-500"
                            rows={3}
                            placeholder="Optional details about this expense"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            disabled={modalMode === 'VIEW'}
                        ></textarea>
                    </div>

                    {/* Receipt Upload/View */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Receipt</label>
                        {!receiptPreview ? (
                            modalMode === 'VIEW' ? (
                                <div className="text-sm text-slate-500 italic">No receipt attached.</div>
                            ) : (
                                <label className="cursor-pointer flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition">
                                    <Upload className="w-5 h-5 mr-2" />
                                    Click to upload receipt
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                {receiptPreview.startsWith('data:application/pdf') ? (
                                    <div className="h-12 w-12 flex items-center justify-center bg-red-100 rounded border border-red-200">
                                        <FileText className="h-6 w-6 text-red-600" />
                                    </div>
                                ) : (
                                    <img src={receiptPreview} alt="Receipt" className="h-12 w-12 object-cover rounded border" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-700 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        {receiptPreview.startsWith('data:application/pdf') ? 'PDF Attached' : 'Receipt Attached'}
                                    </p>
                                    {modalMode !== 'VIEW' && <p className="text-xs text-green-600">Click remove to change</p>}
                                </div>
                                {modalMode !== 'VIEW' && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveReceipt}
                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                                        title="Remove receipt"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* View Full Receipt Button */}
                        {receiptPreview && (
                            <div className="mt-2">
                                <a
                                    href={receiptPreview}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-primary-600 hover:text-primary-800 underline flex items-center"
                                >
                                    <FileText className="w-4 h-4 mr-1" />
                                    Open Receipt in New Tab
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, expenseId: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Draft"
                message="Are you sure you want to delete this draft? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div >
    );
};
