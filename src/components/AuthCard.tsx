import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getFriendlyAuthErrorMessage, firebaseConfig } from '../firebase/config';

type AuthMode = 'signin' | 'signup' | 'forgot';

interface PasswordScore {
  score: number; // 0 to 4
  label: string;
  color: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function calculatePasswordStrength(pass: string): PasswordScore {
  const hasLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);

  let score = 0;
  if (hasLength) score++;
  if (hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  if (pass.length === 0) {
    return { score: 0, label: '', color: 'bg-slate-700', hasLength, hasUpper, hasNumber, hasSpecial };
  }
  if (score <= 1) {
    return { score: 1, label: 'Weak', color: 'bg-rose-500', hasLength, hasUpper, hasNumber, hasSpecial };
  }
  if (score === 2) {
    return { score: 2, label: 'Fair', color: 'bg-amber-500', hasLength, hasUpper, hasNumber, hasSpecial };
  }
  if (score === 3) {
    return { score: 3, label: 'Good', color: 'bg-sky-500', hasLength, hasUpper, hasNumber, hasSpecial };
  }
  return { score: 4, label: 'Strong', color: 'bg-emerald-500', hasLength, hasUpper, hasNumber, hasSpecial };
}

interface AuthCardProps {
  onOpenGuide: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onOpenGuide }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; actionHint?: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = mode === 'signup' && password.length > 0 && password === confirmPassword;

  // Clear messages on mode switch
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorInfo(null);
    setSuccessMessage(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorInfo({ title: 'Name Required', message: 'Please enter your full name.' });
        return;
      }
      if (password.length < 6) {
        setErrorInfo({ title: 'Password Too Short', message: 'Password must be at least 6 characters.' });
        return;
      }
      if (password !== confirmPassword) {
        setErrorInfo({ title: 'Passwords Do Not Match', message: 'Please verify that both passwords are identical.' });
        return;
      }
      if (!acceptTerms) {
        setErrorInfo({ title: 'Terms Acceptance Required', message: 'Please agree to the Terms of Service to proceed.' });
        return;
      }
    }

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorInfo({ title: 'Email Required', message: 'Please provide your account email to receive a password reset link.' });
        return;
      }
      try {
        setIsSubmitting(true);
        await resetPassword(email.trim());
        setSuccessMessage(`Password reset link successfully dispatched to ${email.trim()}. Check your inbox or spam folder.`);
      } catch (err: any) {
        setErrorInfo(getFriendlyAuthErrorMessage(err?.message || err?.code || 'Failed to send reset email'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === 'signup') {
        await registerWithEmail(name.trim(), email.trim(), password);
        setSuccessMessage('Account registered successfully! Welcome aboard.');
      } else {
        await loginWithEmail(email.trim(), password);
        setSuccessMessage('Logged in successfully!');
      }
    } catch (err: any) {
      const parsed = getFriendlyAuthErrorMessage(err?.code || err?.message || 'Authentication failed');
      setErrorInfo(parsed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorInfo(null);
    setSuccessMessage(null);
    try {
      setIsGoogleSubmitting(true);
      await loginWithGoogle();
      setSuccessMessage('Signed in with Google!');
    } catch (err: any) {
      setErrorInfo(getFriendlyAuthErrorMessage(err?.code || err?.message || 'Google sign-in failed'));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Decorative top pill */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs shadow-sm backdrop-blur-md">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Project: <strong className="text-white font-mono">{firebaseConfig.projectId}</strong></span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden p-6 sm:p-8 transition-all">
        {/* Header Tabs */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer text-center ${
              mode === 'signin'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer text-center ${
              mode === 'signup'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          {mode === 'forgot' && (
            <button
              type="button"
              className="flex-1 pb-3 text-sm font-semibold border-b-2 border-orange-500 text-white cursor-pointer text-center"
            >
              Reset
            </button>
          )}
        </div>

        {/* Title & subtitle */}
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {mode === 'signin' && 'Enter your credentials to access your secure dashboard.'}
            {mode === 'signup' && 'Register a new account backed by Firebase Authentication.'}
            {mode === 'forgot' && 'We will send a secure password reset link to your email.'}
          </p>
        </div>

        {/* Error Banner */}
        {errorInfo && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">{errorInfo.title}</p>
                <p className="mt-0.5 leading-relaxed text-rose-300/90">{errorInfo.message}</p>
                {errorInfo.actionHint && (
                  <p className="mt-2 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    💡 <strong>Tip:</strong> {errorInfo.actionHint}
                  </p>
                )}
                {errorInfo.title.includes('Sign-in Method Disabled') && (
                  <button
                    onClick={onOpenGuide}
                    className="mt-2 text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    View Firebase Console Setup Instructions <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <p className="font-semibold text-emerald-200">Operation Successful</p>
              <p className="mt-0.5 text-emerald-300/90">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Google One-Click Button (for signin and signup) */}
        {mode !== 'forgot' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {isGoogleSubmitting ? 'Connecting with Google...' : 'Continue with Google'}
            </button>

            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Or with email
              </span>
            </div>
          </div>
        )}

        {/* Primary Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {/* Full Name for Registration */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Password field (only for signin and signup) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter for registration */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password strength:</span>
                    <span className={`font-semibold ${
                      passwordStrength.score >= 3 ? 'text-emerald-400' : passwordStrength.score === 2 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                    <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                    <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
                    <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'}`} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 mt-1">
                    <span className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Check className="w-2.5 h-2.5" /> 8+ chars
                    </span>
                    <span className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Check className="w-2.5 h-2.5" /> Uppercase
                    </span>
                    <span className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Check className="w-2.5 h-2.5" /> Number
                    </span>
                    <span className={`flex items-center gap-1 ${passwordStrength.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Check className="w-2.5 h-2.5" /> Symbol
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password field for registration */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 bg-slate-950/60 border rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none transition-all ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-emerald-500/80 focus:ring-1 focus:ring-emerald-500'
                        : 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-700/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-[11px] mt-1 flex items-center gap-1 ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {passwordsMatch ? (
                    <>
                      <Check className="w-3 h-3" /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Passwords do not match yet
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Checkboxes */}
          {mode === 'signin' && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-orange-500 focus:ring-orange-500/30"
                />
                <span>Remember this session</span>
              </label>
              <span className="text-[11px] text-slate-500">Persistent storage</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="text-xs text-slate-400 pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-orange-500 focus:ring-orange-500/30 mt-0.5"
                />
                <span className="leading-relaxed">
                  I agree to the <span className="text-slate-200">Terms of Service</span> and <span className="text-slate-200">Privacy Policy</span>.
                </span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In to Account'}
                  {mode === 'signup' && 'Create Free Account'}
                  {mode === 'forgot' && 'Send Password Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode switch helper footer */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'signin' && (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-orange-400 font-semibold hover:text-orange-300 transition-colors"
              >
                Sign up now
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-orange-400 font-semibold hover:text-orange-300 transition-colors"
              >
                Sign in here
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-orange-400 font-semibold hover:text-orange-300 transition-colors"
              >
                Return to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
