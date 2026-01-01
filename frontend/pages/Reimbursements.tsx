import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { Button } from '../components/ui/Button';
import { IndianRupee, Loader2, Banknote } from 'lucide-react';

export const Reimbursements: React.FC = () => {
  const {
    approvedForReimbursement,
    reimburseExpense,
    fetchApprovedForReimbursement,
    isLoading,
    currentUser
  } = useStore();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);

  // Fetch approved expenses on mount
  useEffect(() => {
    fetchApprovedForReimbursement();
  }, []);

  const totalAmount = approvedForReimbursement.reduce((sum, e) => sum + e.amount, 0);

  const handleReimburse = async (id: string) => {
    setProcessingId(id);
    try {
      await reimburseExpense(id);
    } catch (err) {
      console.error('Failed to reimburse:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReimburseAll = async () => {
    setProcessingAll(true);
    try {
      for (const expense of approvedForReimbursement) {
        await reimburseExpense(expense.id);
      }
    } catch (err) {
      console.error('Failed to reimburse all:', err);
    } finally {
      setProcessingAll(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pending Reimbursements</h1>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Total Pending</p>
            <p className="text-2xl font-bold text-primary-600">₹{totalAmount.toFixed(2)}</p>
          </div>
          {approvedForReimbursement.length > 0 && (
            <Button onClick={handleReimburseAll} variant="primary" isLoading={processingAll}>
              <Banknote className="w-4 h-4 mr-2" />
              Process All
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Expense Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Approved Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {approvedForReimbursement.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{expense.userName}</div>
                      <div className="text-sm text-slate-500">{expense.userDepartment || 'No department'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{expense.title}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center">
                        <span className="mr-1">{expense.categoryIcon}</span>
                        {expense.categoryName}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Expense Date: {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : new Date(expense.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {expense.approvedAt ? new Date(expense.approvedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReimburse(expense.id)}
                        isLoading={processingId === expense.id}
                      >
                        <IndianRupee className="w-3 h-3 mr-1" />
                        Mark Reimbursed
                      </Button>
                    </td>
                  </tr>
                ))}
                {approvedForReimbursement.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      No pending reimbursements. All approved expenses have been processed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};