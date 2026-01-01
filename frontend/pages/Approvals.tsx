import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { adminApi, expensesApi } from '../services/api';
import { Expense } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Check, X, Loader2, Users, FileImage, Eye, CheckCheck, XCircle, History, Clock, FileText } from 'lucide-react';

export const Approvals: React.FC = () => {
  const {
    pendingApprovals,
    approveExpense,
    rejectExpense,
    fetchPendingApprovals,
    isLoading,
    currentUser
  } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'logs'>('pending');
  const [history, setHistory] = useState<Expense[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Pending actions state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState<'approve' | 'reject' | null>(null);
  const [bulkRejectModal, setBulkRejectModal] = useState(false);
  const [bulkApproveModal, setBulkApproveModal] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  // Fetch pending approvals on mount
  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  // Fetch history when tab changes
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await expensesApi.getApprovalHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await approveExpense(id);
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await rejectExpense(rejectId, rejectReason);
      setRejectId(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = () => {
    setBulkApproveModal(true);
  };

  const executeBulkApprove = async () => {
    setBulkProcessing('approve');
    try {
      for (const expense of pendingApprovals) {
        await approveExpense(expense.id);
      }
      setBulkApproveModal(false);
    } catch (err) {
      console.error('Failed to approve all:', err);
    } finally {
      setBulkProcessing(null);
    }
  };

  const handleBulkReject = async () => {
    if (!bulkRejectReason.trim()) return;
    setBulkProcessing('reject');
    try {
      for (const expense of pendingApprovals) {
        await rejectExpense(expense.id, bulkRejectReason);
      }
      setBulkRejectModal(false);
      setBulkRejectReason('');
    } catch (err) {
      console.error('Failed to reject all:', err);
    } finally {
      setBulkProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCheck className="w-3 h-3 mr-1" /> Approved</span>;
      case 'REJECTED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      case 'REIMBURSED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCheck className="w-3 h-3 mr-1" /> Reimbursed</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Approvals</h1>

        {/* Bulk Actions (Only visible in Pending tab) */}
        {activeTab === 'pending' && pendingApprovals.length > 0 && (
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-500 mr-4">
              <Users className="h-4 w-4" />
              <span>{pendingApprovals.length} pending</span>
            </div>
            <Button
              onClick={handleBulkApprove}
              isLoading={bulkProcessing === 'approve'}
              disabled={!!bulkProcessing}
            >
              Approve All
            </Button>
            <Button
              variant="secondary"
              onClick={() => setBulkRejectModal(true)}
              isLoading={bulkProcessing === 'reject'}
              disabled={!!bulkProcessing}
            >
              Reject All
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('pending')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
            <Clock className="w-4 h-4 inline mr-2" />Pending ({pendingApprovals.length})
          </button>
          <button onClick={() => setActiveTab('logs')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'logs' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
            <History className="w-4 h-4 inline mr-2" />Logs & History
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        <>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
          ) : pendingApprovals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="mx-auto h-12 w-12 text-slate-400"><Check className="h-full w-full" /></div>
              <h3 className="mt-2 text-sm font-medium text-slate-900">All caught up!</h3>
              <p className="mt-1 text-sm text-slate-500">No pending expenses to approve.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingApprovals.map((expense) => (
                <div key={expense.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                          {expense.categoryIcon || '📄'}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-900">{expense.title}</h3>
                          <p className="text-xs text-slate-500">{expense.userName}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Submitted
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="text-2xl font-bold text-slate-900">{formatCurrency(expense.amount)}</div>

                      <div className="flex items-center text-xs text-slate-500 space-x-3">
                        <span className="flex items-center" title="Expense Date">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(expense.expenseDate)}
                        </span>
                        <span className="flex items-center" title="Ticket Created">
                          <FileText className="w-3 h-3 mr-1" />
                          Created: {formatDate(expense.createdAt)}
                        </span>
                      </div>

                      {expense.description && <p className="text-sm text-slate-500 line-clamp-2">{expense.description}</p>}
                    </div>

                    {expense.receiptUrl && (
                      <button
                        onClick={() => setViewingReceipt(expense.receiptUrl!)}
                        className="mt-3 flex items-center text-sm text-primary-600 hover:text-primary-700"
                      >
                        <FileImage className="h-4 w-4 mr-1" />
                        View Receipt
                      </button>
                    )}
                  </div>

                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg flex space-x-3 mt-auto">
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(expense.id)}
                      isLoading={isProcessing}
                      disabled={isProcessing}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => setRejectId(expense.id)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* History View */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoadingHistory ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No history found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Expense</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Submitted By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Processed By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Receipt</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {history.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{expense.categoryIcon || '📄'}</span>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{expense.title}</div>
                            <div className="text-xs text-slate-500">{formatDate(expense.expenseDate)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {expense.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(expense.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {/* Show Approved By or Reimbursed By based on status, fallback to manual checking */}
                        {expense.status === 'REJECTED' ? (
                          <span className="text-red-600 font-medium">Rejected</span>
                        ) : expense.approvedByName ? (
                          <div className="flex flex-col">
                            <span>{expense.approvedByName}</span>
                            {expense.reimbursedByName && <span className="text-xs text-blue-600">Reimbursed by: {expense.reimbursedByName}</span>}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {/* Prefer approvedAt for approval log context */}
                        {formatDateTime(expense.approvedAt || expense.reimbursedAt || expense.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {expense.receiptUrl ? (
                          <button onClick={() => setViewingReceipt(expense.receiptUrl!)} className="text-primary-600 hover:text-primary-900"><Eye className="w-4 h-4" /></button>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectId}
        onClose={() => { setRejectId(null); setRejectReason(''); }}
        title="Reject Expense"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => { setRejectId(null); setRejectReason(''); }}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} isLoading={isProcessing} disabled={!rejectReason.trim()}>Reject Expense</Button>
          </div>
        }
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason for rejection <span className="text-red-500">*</span></label>
          <textarea
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm border p-2"
            rows={3}
            placeholder="Please explain why this expense is being rejected..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* Bulk Reject Modal */}
      <Modal
        isOpen={bulkRejectModal}
        onClose={() => { setBulkRejectModal(false); setBulkRejectReason(''); }}
        title="Reject All Pending Expenses"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => { setBulkRejectModal(false); setBulkRejectReason(''); }}>Cancel</Button>
            <Button variant="danger" onClick={handleBulkReject} isLoading={bulkProcessing === 'reject'} disabled={!bulkRejectReason.trim()}>Reject All</Button>
          </div>
        }
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason for rejection <span className="text-red-500">*</span></label>
          <p className="text-sm text-slate-500 mb-2">This reason will be applied to all {pendingApprovals.length} pending expenses.</p>
          <textarea
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm border p-2"
            rows={3}
            placeholder="Please explain why these expenses are being rejected..."
            value={bulkRejectReason}
            onChange={(e) => setBulkRejectReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* Bulk Approve Modal */}
      <Modal
        isOpen={bulkApproveModal}
        onClose={() => setBulkApproveModal(false)}
        title="Approve All Pending Expenses"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setBulkApproveModal(false)}>Cancel</Button>
            <Button onClick={executeBulkApprove} isLoading={bulkProcessing === 'approve'}>Approve All</Button>
          </div>
        }
      >
        <div className="text-slate-700">
          <p>Are you sure you want to approve <strong>{pendingApprovals.length}</strong> pending expenses?</p>
          <p className="mt-2 text-sm text-slate-500">This action cannot be undone efficiently. Each expense must be rejected manually if approved by mistake.</p>
        </div>
      </Modal>

      {/* Receipt Viewer Modal */}
      <Modal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Receipt Viewer"
        maxWidth="4xl"
      >
        {viewingReceipt && (
          <div className="flex justify-center bg-slate-100 rounded-lg overflow-hidden p-4 min-h-[400px]">
            {(viewingReceipt.startsWith('data:application/pdf') || viewingReceipt.toLowerCase().endsWith('.pdf')) ? (
              <iframe src={viewingReceipt} className="w-full h-[600px] border-none" title="Receipt PDF" />
            ) : (
              <img src={viewingReceipt} alt="Receipt" className="max-w-full max-h-[70vh] object-contain" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};