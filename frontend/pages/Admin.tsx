import React, { useState, useEffect, useMemo } from 'react';
import { adminApi, UserResponse } from '../services/api';
import { useStore } from '../services/store';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Users, UserCheck, UserX, Loader2, AlertCircle, Copy, Check, Key, ChevronDown, FolderOpen, Plus, Edit2, ToggleLeft, ToggleRight, Trash2, RefreshCcw } from 'lucide-react';

const ROLES = ['EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN'] as const;
const ROLE_PRIORITY: Record<string, number> = { 'ADMIN': 0, 'FINANCE': 1, 'MANAGER': 2, 'EMPLOYEE': 3 };

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'bg-red-100 text-red-800';
    case 'FINANCE': return 'bg-blue-100 text-blue-800';
    case 'MANAGER': return 'bg-purple-100 text-purple-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

type SortField = 'name' | 'department' | 'role' | 'status';
type SortOrder = 'asc' | 'desc';
type AdminTab = 'users' | 'categories';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
}

export const Admin: React.FC = () => {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('role');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // New department modal
  const [newDeptModal, setNewDeptModal] = useState<{ userId: string; name: string } | null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState('');

  // Password reset modal
  const [passwordModal, setPasswordModal] = useState<{ userId: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Category modal
  const [categoryModal, setCategoryModal] = useState<{ mode: 'create' | 'edit'; category?: CategoryItem } | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '', description: '' });

  useEffect(() => {
    fetchUsers();
    fetchInviteCode();
    fetchCategories();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchInviteCode = async () => {
    try {
      const data = await adminApi.getTenantInviteCode();
      setInviteCode(data.inviteCode);
    } catch (err) {
      console.error('Failed to fetch invite code:', err);
    }
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get unique departments from users
  const existingDepartments = useMemo(() => {
    return [...new Set(users.map(u => u.department).filter(d => d && !d.startsWith('__')))] as string[];
  }, [users]);

  // Sorted users with role hierarchy
  const sortedUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      let compare = 0;
      switch (sortField) {
        case 'name':
          compare = a.name.localeCompare(b.name);
          break;
        case 'department':
          compare = (a.department || 'zzz').localeCompare(b.department || 'zzz');
          break;
        case 'role':
          compare = ROLE_PRIORITY[a.role] - ROLE_PRIORITY[b.role];
          break;
        case 'status':
          compare = (a.active === b.active) ? 0 : a.active ? -1 : 1;
          break;
      }
      return sortOrder === 'asc' ? compare : -compare;
    });
    return sorted;
  }, [users, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessingId(userId);
    try {
      const updatedUser = await adminApi.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setProcessingId(null);
    }
  };

  const [removeUserModal, setRemoveUserModal] = useState<UserResponse | null>(null);

  const handleToggleActive = async (userId: string) => {
    setProcessingId(userId);
    try {
      const updatedUser = await adminApi.toggleUserActive(userId);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const confirmRemoveUser = async () => {
    if (!removeUserModal) return;
    await handleToggleActive(removeUserModal.id);
    setRemoveUserModal(null);
  };

  const handleDepartmentChange = async (userId: string, department: string) => {
    if (department === '__add_new__') {
      const user = users.find(u => u.id === userId);
      if (user) {
        setNewDeptModal({ userId: user.id, name: user.name });
        setNewDepartmentName('');
      }
      return;
    }
    setProcessingId(userId);
    try {
      const updatedUser = await adminApi.updateUserDepartment(userId, department);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (err: any) {
      alert(err.message || 'Failed to update department');
    } finally {
      setProcessingId(null);
    }
  };

  const handleNewDeptSave = async () => {
    if (!newDeptModal || !newDepartmentName.trim()) return;
    setProcessingId(newDeptModal.userId);
    try {
      const updatedUser = await adminApi.updateUserDepartment(newDeptModal.userId, newDepartmentName.trim());
      setUsers(prev => prev.map(u => u.id === newDeptModal.userId ? updatedUser : u));
      setNewDeptModal(null);
      setNewDepartmentName('');
    } catch (err: any) {
      alert(err.message || 'Failed to update department');
    } finally {
      setProcessingId(null);
    }
  };

  const openPasswordModal = (user: UserResponse) => {
    setPasswordModal({ userId: user.id, name: user.name });
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handlePasswordReset = async () => {
    if (!passwordModal) return;
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setProcessingId(passwordModal.userId);
    try {
      await adminApi.resetUserPassword(passwordModal.userId, newPassword);
      alert('Password updated successfully');
      setPasswordModal(null);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to reset password');
    } finally {
      setProcessingId(null);
    }
  };

  // Category handlers
  const openCategoryModal = (mode: 'create' | 'edit', category?: CategoryItem) => {
    setCategoryModal({ mode, category });
    setCategoryForm(category ? { name: category.name, icon: category.icon, description: category.description || '' } : { name: '', icon: '📋', description: '' });
  };

  const handleCategorySave = async () => {
    if (!categoryForm.name.trim()) return;
    setProcessingId('category');
    try {
      if (categoryModal?.mode === 'create') {
        const newCat = await adminApi.createCategory(categoryForm.name, categoryForm.icon || '📋', categoryForm.description);
        setCategories(prev => [...prev, newCat]);
      } else if (categoryModal?.category) {
        const updated = await adminApi.updateCategory(categoryModal.category.id, categoryForm.name, categoryForm.icon, categoryForm.description);
        setCategories(prev => prev.map(c => c.id === categoryModal.category!.id ? updated : c));
      }
      setCategoryModal(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleCategory = async (categoryId: string) => {
    setProcessingId(categoryId);
    try {
      const updated = await adminApi.toggleCategoryActive(categoryId);
      setCategories(prev => prev.map(c => c.id === categoryId ? updated : c));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle category');
    } finally {
      setProcessingId(null);
    }
  };

  const SortHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && <ChevronDown className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />}
      </div>
    </th>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">{users.length} users</span>
      </div>

      {/* Invite Code Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Organization Invite Code</h3>
            <p className="text-primary-100 text-sm mt-1">Share this code with new team members</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-3xl font-mono font-bold tracking-widest">{inviteCode || '------'}</span>
            </div>
            <button onClick={copyInviteCode} className="bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3" title="Copy">
              {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('users')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
            <Users className="w-4 h-4 inline mr-2" />Users ({users.length})
          </button>
          <button onClick={() => setActiveTab('categories')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
            <FolderOpen className="w-4 h-4 inline mr-2" />Categories ({categories.length})
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
          <Button size="sm" variant="ghost" onClick={fetchUsers} className="ml-auto">Retry</Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
      ) : activeTab === 'users' ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">User Management</h3>
            <span className="text-sm text-slate-500">Click column headers to sort</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <SortHeader field="name" label="User" />
                  <SortHeader field="department" label="Department" />
                  <SortHeader field="role" label="Role" />
                  <SortHeader field="status" label="Status" />
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-slate-50 ${!user.active ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${user.active ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-500'}`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 flex items-center">
                            {user.name}
                            {user.id === currentUser?.id && <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">You</span>}
                          </div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2 py-1" value={user.department || ''} onChange={(e) => handleDepartmentChange(user.id, e.target.value)} disabled={processingId === user.id}>
                        <option value="">No department</option>
                        {existingDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        <option value="__add_new__">+ Add new department</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select className={`text-xs font-semibold rounded-full px-3 py-1 border-none cursor-pointer ${getRoleBadgeColor(user.role)}`} value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} disabled={user.id === currentUser?.id || processingId === user.id}>
                        {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.active ? <><UserCheck className="w-3 h-3 mr-1" /> Active</> : <><UserX className="w-3 h-3 mr-1" /> Inactive</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.id !== currentUser?.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openPasswordModal(user)} className="text-slate-500 hover:text-primary-600 p-1.5 rounded hover:bg-slate-100" title="Reset Password"><Key className="w-4 h-4" /></button>

                          {user.active ? (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setRemoveUserModal(user)}
                              isLoading={processingId === user.id}
                              className="px-2"
                              title="Remove from Organization"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleToggleActive(user.id)}
                              isLoading={processingId === user.id}
                              className="px-2"
                              title="Restore Access"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">Category Management</h3>
            <Button onClick={() => openCategoryModal('create')}><Plus className="w-4 h-4 mr-2" />Add Category</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Icon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className={`hover:bg-slate-50 ${!cat.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-2xl">{cat.icon}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{cat.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openCategoryModal('edit', cat)} className="text-slate-500 hover:text-primary-600 p-1.5 rounded hover:bg-slate-100" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleToggleCategory(cat.id)} className="text-slate-500 hover:text-primary-600 p-1.5 rounded hover:bg-slate-100" title={cat.isActive ? 'Deactivate' : 'Activate'} disabled={processingId === cat.id}>
                          {cat.isActive ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Remove User Modal */}
      <Modal
        isOpen={!!removeUserModal}
        onClose={() => setRemoveUserModal(null)}
        title="Remove User from Organization"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setRemoveUserModal(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={confirmRemoveUser}
              isLoading={!!processingId}
            >
              Remove User
            </Button>
          </div>
        }
      >
        <div className="text-slate-700">
          <p>Are you sure you want to remove <strong>{removeUserModal?.name}</strong> from the organization?</p>
          <p className="mt-2 text-sm text-slate-500">
            They will immediately lose access to their account. Their expense history will be preserved.
            <br />You can restore their access later if needed.
          </p>
        </div>
      </Modal>

      {/* New Department Modal */}
      <Modal isOpen={!!newDeptModal} onClose={() => setNewDeptModal(null)} title={`Add New Department for ${newDeptModal?.name}`}
        footer={<div className="flex flex-row-reverse gap-2 w-full"><Button onClick={handleNewDeptSave} isLoading={!!processingId} disabled={!newDepartmentName.trim()}>Save</Button><Button variant="secondary" onClick={() => setNewDeptModal(null)}>Cancel</Button></div>}>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label><input type="text" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" placeholder="e.g. Engineering, Finance" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} autoFocus /></div>
      </Modal>

      {/* Password Reset Modal */}
      <Modal isOpen={!!passwordModal} onClose={() => setPasswordModal(null)} title={`Reset Password for ${passwordModal?.name}`}
        footer={<div className="flex flex-row-reverse gap-2 w-full"><Button onClick={handlePasswordReset} isLoading={!!processingId}>Reset</Button><Button variant="secondary" onClick={() => setPasswordModal(null)}>Cancel</Button></div>}>
        <div className="space-y-4">
          {passwordError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{passwordError}</div>}
          <div><label className="block text-sm font-medium text-slate-700 mb-1">New Password</label><input type="password" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" placeholder="Min 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label><input type="password" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={!!categoryModal} onClose={() => setCategoryModal(null)} title={categoryModal?.mode === 'create' ? 'Add Category' : 'Edit Category'}
        footer={<div className="flex flex-row-reverse gap-2 w-full"><Button onClick={handleCategorySave} isLoading={processingId === 'category'} disabled={!categoryForm.name.trim()}>Save</Button><Button variant="secondary" onClick={() => setCategoryModal(null)}>Cancel</Button></div>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Icon (emoji)</label><input type="text" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 text-2xl" placeholder="📋" value={categoryForm.icon} onChange={(e) => setCategoryForm(f => ({ ...f, icon: e.target.value }))} maxLength={4} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input type="text" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" placeholder="e.g. Travel, Meals" value={categoryForm.name} onChange={(e) => setCategoryForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><input type="text" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" placeholder="Optional description" value={categoryForm.description} onChange={(e) => setCategoryForm(f => ({ ...f, description: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
};