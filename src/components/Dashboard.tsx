import React, { useState } from 'react';
import { useAuth, UserProfileData } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Lock, 
  Key, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  RefreshCw,
  Edit3,
  Building,
  Briefcase,
  Phone,
  FileText,
  LogOut,
  Flame
} from 'lucide-react';
import { firebaseConfig, getFriendlyAuthErrorMessage } from '../firebase/config';

type DashboardTab = 'overview' | 'profile' | 'security' | 'firebase';

export const Dashboard: React.FC = () => {
  const { 
    currentUser, 
    userProfile, 
    logout, 
    resendVerificationEmail, 
    updateProfileData, 
    changePassword, 
    refreshUser 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Profile form state
  const [displayName, setDisplayName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [role, setRole] = useState(userProfile?.role || 'Developer');
  const [company, setCompany] = useState(userProfile?.company || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // UI state
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedParam, setCopiedParam] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleCopyUid = () => {
    if (currentUser?.uid) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleCopyConfig = (name: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedParam(name);
    setTimeout(() => setCopiedParam(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      showNotification('success', 'User session and status reloaded.');
    } catch {
      showNotification('error', 'Could not refresh user session.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResendVerification = async () => {
    setIsSendingVerification(true);
    try {
      await resendVerificationEmail();
      showNotification('success', 'Verification email sent! Check your inbox or spam folder.');
    } catch (err: any) {
      const parsed = getFriendlyAuthErrorMessage(err?.message || 'Failed to send');
      showNotification('error', parsed.message);
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfileData({
        displayName: displayName.trim(),
        role: role.trim(),
        company: company.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      });
      showNotification('success', 'Profile information updated successfully.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showNotification('error', 'New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(newPassword);
      setNewPassword('');
      setConfirmNewPassword('');
      showNotification('success', 'Password successfully changed! Use your new password on next login.');
    } catch (err: any) {
      const parsed = getFriendlyAuthErrorMessage(err?.code || err?.message || 'Failed to update password');
      showNotification('error', parsed.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const creationDate = currentUser?.metadata.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  const lastSignInDate = currentUser?.metadata.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Now';

  const isGoogleUser = currentUser?.providerData?.some(p => p.providerId === 'google.com');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top duration-200 shadow-xl ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-75 hover:opacity-100 ml-4 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User Hero Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Identifiers */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-indigo-600 p-0.5 shadow-xl shadow-orange-500/10">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                  {currentUser?.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {(userProfile?.displayName || currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white" title="Active">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {userProfile?.displayName || currentUser?.displayName || 'Registered User'}
                </h1>
                {currentUser?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Email Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" /> Unverified Email
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentUser?.email}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-mono text-[11px]">
                  <span>UID: {currentUser?.uid.slice(0, 8)}...{currentUser?.uid.slice(-6)}</span>
                  <button
                    onClick={handleCopyUid}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Copy Full UID"
                  >
                    {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-500">
                  Joined: {creationDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
              title="Refresh auth profile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Email verification action reminder banner */}
        {!currentUser?.emailVerified && !isGoogleUser && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Your email address has not been verified yet. Check your inbox for the verification link.</span>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={isSendingVerification}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-medium transition-colors cursor-pointer shrink-0"
            >
              {isSendingVerification ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview', icon: Shield },
          { id: 'profile', label: 'Edit Profile', icon: Edit3 },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'firebase', label: 'Firebase Backend', icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Auth Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Authentication</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Active Session</p>
              <p className="text-xs text-slate-400 mt-1">
                Provider: <span className="text-slate-200 font-medium">{isGoogleUser ? 'Google OAuth 2.0' : 'Email & Password'}</span>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Token Persistence</span>
              <span className="text-emerald-400 font-medium">Browser LocalStorage</span>
            </div>
          </div>

          {/* Card 2: Account Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Timeline</span>
              <Calendar className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{creationDate}</p>
              <p className="text-xs text-slate-400 mt-1">Account registration date</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Last Signed In</span>
              <span className="text-slate-200 font-medium">{lastSignInDate}</span>
            </div>
          </div>

          {/* Card 3: Backend Project */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Firebase Cloud</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white font-mono truncate">{firebaseConfig.projectId}</p>
              <p className="text-xs text-slate-400 mt-1">Configured cloud instance</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Auth Domain</span>
              <span className="text-orange-400 truncate max-w-[150px]">{firebaseConfig.authDomain}</span>
            </div>
          </div>

          {/* Large Summary Card */}
          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              User Information Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">Display Name</span>
                <span className="font-semibold text-slate-200 text-sm">
                  {userProfile?.displayName || currentUser?.displayName || 'Not specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">Role / Designation</span>
                <span className="font-semibold text-slate-200 text-sm">
                  {userProfile?.role || 'Member'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">Company / Team</span>
                <span className="font-semibold text-slate-200 text-sm">
                  {userProfile?.company || 'None'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">Email Verification</span>
                <span className={`font-semibold text-sm ${currentUser?.emailVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentUser?.emailVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>

            {userProfile?.bio && (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
                <span className="text-slate-500 font-semibold block mb-1">About / Bio</span>
                <p className="text-slate-300 leading-relaxed">{userProfile.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-3xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Edit Profile Details</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Update your account display information and personal metadata.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/30 border border-slate-800 rounded-xl text-slate-400 text-xs sm:text-sm cursor-not-allowed"
                    title="Email is managed through Firebase Auth"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Registered Firebase Auth identifier</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Role / Job Title
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Lead Engineer, Product Designer"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Biography / Notes
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio or notes about your profile..."
                  className="w-full p-3 bg-slate-950/60 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password update form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-400" />
                Change Password
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your new password to update your Firebase credentials.
              </p>
            </div>

            {isGoogleUser ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
                <p className="text-slate-200 font-medium">Google Account Authentication</p>
                <p>
                  You are currently logged in with your Google account. Password management is handled directly through your Google account security settings.
                </p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>

          {/* Security Recommendations & Health */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Account Security Health
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Encrypted Transport</p>
                  <p className="text-slate-400 mt-0.5">
                    All authentication payloads and tokens are transmitted over TLS/SSL with SHA-256 encryption.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Firebase Token Lifecycle</p>
                  <p className="text-slate-400 mt-0.5">
                    JWT access tokens refresh automatically in the background through the Firebase Web SDK.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                {currentUser?.emailVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-slate-200">Email Verification</p>
                  <p className="text-slate-400 mt-0.5">
                    {currentUser?.emailVerified
                      ? 'Your email address has been verified with Firebase Auth.'
                      : 'Verification pending. Click "Resend Verification Email" to secure your account.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FIREBASE BACKEND TAB */}
      {activeTab === 'firebase' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Live Firebase Project Credentials
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                These credentials were configured directly into this application.
              </p>
            </div>
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/overview`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition-colors"
            >
              <span>Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {[
              { label: 'Project ID', value: firebaseConfig.projectId },
              { label: 'Auth Domain', value: firebaseConfig.authDomain },
              { label: 'Storage Bucket', value: firebaseConfig.storageBucket },
              { label: 'Messaging Sender ID', value: firebaseConfig.messagingSenderId },
              { label: 'App ID', value: firebaseConfig.appId },
              { label: 'API Key', value: firebaseConfig.apiKey },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] text-slate-500 block font-sans">{label}</span>
                  <span className="text-slate-300 text-xs select-all">{value}</span>
                </div>
                <button
                  onClick={() => handleCopyConfig(label, value)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy"
                >
                  {copiedParam === label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-200">Need to manage users or authentication rules?</h4>
            <p className="leading-relaxed">
              You can view and delete registered users, ban accounts, toggle authentication providers, and configure email templates in the Firebase Console under <strong>Authentication &gt; Users</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
