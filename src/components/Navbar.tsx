import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User, Flame, ExternalLink, CheckCircle2 } from 'lucide-react';
import { firebaseConfig } from '../firebase/config';

interface NavbarProps {
  onOpenGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGuide }) => {
  const { currentUser, userProfile, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AuthPortal
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Firebase Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Connected to <code className="text-orange-400 font-mono">{firebaseConfig.projectId}</code>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-800/40"
              title="Firebase Console Setup Guide"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Firebase Docs</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    (userProfile?.displayName || currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <p className="font-medium text-slate-200 truncate max-w-[130px]">
                    {userProfile?.displayName || currentUser.displayName || 'Authenticated User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">SSL &amp; OAuth Ready</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
