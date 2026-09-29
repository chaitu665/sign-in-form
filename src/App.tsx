/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthCard } from './components/AuthCard';
import { Dashboard } from './components/Dashboard';
import { Footer } from './components/Footer';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  Flame, 
  CheckCircle2, 
  KeyRound, 
  Fingerprint,
  Sparkles
} from 'lucide-react';
import { firebaseConfig } from './firebase/config';

const MainContent: React.FC<{ onOpenGuide: () => void }> = ({ onOpenGuide }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
          <Flame className="w-5 h-5 text-orange-400 absolute inset-0 m-auto" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-200">Initializing Firebase Session...</p>
          <p className="text-xs text-slate-500 font-mono">{firebaseConfig.projectId}</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Dashboard />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Value Proposition & Architecture */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Firebase Authentication &amp; Firestore App</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Secure Authentication <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Built with Firebase
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
            A production-ready login, registration, and user portal. Features instant token persistence, real-time password strength evaluation, Google Sign-in integration, and live profile updates.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Email &amp; Password</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Secure registration, validation, and self-service password reset.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Google OAuth 2.0</p>
                <p className="text-[11px] text-slate-400 mt-0.5">One-click popup authentication with automatic profile sync.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Session Persistence</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Token refresh listeners and state restoration across browser tabs.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">User Dashboard</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Authenticated control center with profile and security managers.</p>
              </div>
            </div>
          </div>

          {/* Connected Backend Indicator */}
          <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Targeting Project:</span>
            <code className="text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20 font-mono font-medium">
              {firebaseConfig.projectId}
            </code>
          </div>
        </div>

        {/* Right Column: Interactive Login & Registration Card */}
        <div className="lg:col-span-6 flex justify-center">
          <AuthCard onOpenGuide={onOpenGuide} />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500/30 selection:text-orange-200 font-sans">
        <Navbar onOpenGuide={() => setIsGuideOpen(true)} />
        <main className="flex-1 flex flex-col justify-center">
          <MainContent onOpenGuide={() => setIsGuideOpen(true)} />
        </main>
        <Footer />
        <FirebaseGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </div>
    </AuthProvider>
  );
}
