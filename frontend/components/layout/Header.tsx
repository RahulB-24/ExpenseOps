import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../services/store';
import { UserRole } from '../../types';
import { LogOut, User as UserIcon, Receipt, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const { currentUser, logout } = useStore();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentUser) return null;

  const NavLink = ({ to, label }: { to: string, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive
          ? 'border-primary-500 text-slate-900'
          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Nav */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Receipt className="h-8 w-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-slate-900">ExpenseOps</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <NavLink to="/dashboard" label="My Expenses" />
              <NavLink to="/analytics" label="Analytics" />
              {(currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.FINANCE || currentUser.role === UserRole.ADMIN) && (
                <NavLink to="/approvals" label="Approvals" />
              )}
              {(currentUser.role === UserRole.FINANCE || currentUser.role === UserRole.ADMIN) && (
                <NavLink to="/reimbursements" label="Reimbursements" />
              )}
              {currentUser.role === UserRole.ADMIN && (
                <NavLink to="/admin" label="Admin" />
              )}
            </div>
          </div>

          {/* Right side - Profile */}
          <div className="flex items-center">
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-900">{currentUser.name}</span>
                  <span className="text-xs text-slate-500">
                    {currentUser.role} {currentUser.tenantName && `• ${currentUser.tenantName}`}
                  </span>
                </div>
                <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                  <UserIcon className="h-5 w-5" />
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};