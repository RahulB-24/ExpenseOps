import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Receipt, Mail, Lock, User, AlertCircle, CheckCircle, Plus, Briefcase, Eye, EyeOff, Hash } from 'lucide-react';

interface RegisterProps {
    onBackToLogin: () => void;
}

const TAGLINES = [
    "Streamline Your Expense Workflow",
    "Track. Submit. Get Reimbursed.",
    "Expenses Made Simple"
];

export const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [newOrgName, setNewOrgName] = useState('');
    const [isCreatingOrg, setIsCreatingOrg] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [taglineIndex, setTaglineIndex] = useState(0);

    // Rotating taglines
    useEffect(() => {
        const interval = setInterval(() => {
            setTaglineIndex(prev => (prev + 1) % TAGLINES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password) {
            setError('Please fill in all required fields');
            return;
        }

        if (isCreatingOrg && !newOrgName) {
            setError('Please enter your organization name');
            return;
        }

        if (!isCreatingOrg && !inviteCode) {
            setError('Please enter your organization invite code');
            return;
        }

        if (!isCreatingOrg && inviteCode.length !== 6) {
            setError('Invite code must be 6 digits');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.register(
                name,
                email,
                password,
                isCreatingOrg ? undefined : inviteCode,
                isCreatingOrg ? newOrgName : undefined
            );
            // Auto-login after successful registration
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.userId,
                name: response.name,
                email: response.email,
                role: response.role,
                tenantId: response.tenantId,
                tenantName: response.tenantName,
            }));
            setSuccess(true);
            // Reload to trigger login
            setTimeout(() => window.location.reload(), 1000);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 animate-fade-in-scale">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                        <Receipt className="h-10 w-10" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 h-5 transition-opacity duration-500">
                        {TAGLINES[taglineIndex]}
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">
                                {isCreatingOrg
                                    ? 'Organization created! You are now the Admin. Logging you in...'
                                    : 'Account created! Logging you in...'}
                            </span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <Input
                            label="Full Name *"
                            type="text"
                            required
                            placeholder="John Doe"
                            icon={<User className="h-5 w-5" />}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <Input
                            label="Email Address *"
                            type="email"
                            required
                            placeholder="you@company.com"
                            icon={<Mail className="h-5 w-5" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {/* Password with show/hide toggle */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password * (min 8 characters)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10 pr-10 py-2 border"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Organization Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Organization *
                            </label>

                            {!isCreatingOrg ? (
                                <>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Hash className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            className="block w-full pl-10 pr-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border tracking-widest font-mono"
                                            placeholder="Enter 6-digit code"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Ask your admin for the 6-digit invite code
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingOrg(true)}
                                        className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Create new organization
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border"
                                            placeholder="Your Company Name"
                                            value={newOrgName}
                                            onChange={(e) => setNewOrgName(e.target.value)}
                                        />
                                    </div>
                                    <div className="mt-2 p-2 bg-primary-50 rounded-md border border-primary-100">
                                        <p className="text-xs text-primary-700">
                                            <strong>🎉 You'll be the Admin!</strong> You can invite team members using your organization's invite code.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreatingOrg(false);
                                            setNewOrgName('');
                                        }}
                                        className="mt-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
                                    >
                                        ← Join existing organization instead
                                    </button>
                                </>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full flex justify-center"
                            isLoading={isLoading}
                        >
                            {isCreatingOrg ? 'Create Organization & Account' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={onBackToLogin}
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            Already have an account? Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
