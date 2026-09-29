import React from 'react';
import { X, ExternalLink, Key, CheckCircle, Info, Copy, Check } from 'lucide-react';
import { firebaseConfig } from '../firebase/config';

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                <Key className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-white">Firebase Project Configuration</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active configuration credentials for project: <span className="text-orange-400 font-mono font-medium">{firebaseConfig.projectId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-5 text-sm text-slate-300 pr-1">
          {/* Status Box */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-300">Firebase SDK Initialized</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Firebase Web SDK v11 is initialized using your custom project credentials. Authentication sessions, token lifecycle, and registration requests communicate with your Firebase backend.
              </p>
            </div>
          </div>

          {/* Setup checklist in Firebase Console */}
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-400" />
              Firebase Console Sign-In Provider Setup
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              If registration or sign-in yields an <code className="text-amber-300">auth/operation-not-allowed</code> message, ensure the desired sign-in methods are toggled ON in your Firebase project console:
            </p>
            <ol className="text-xs space-y-2 list-decimal list-inside text-slate-300">
              <li>
                Open the Firebase Console for your project:
                <a
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-orange-400 hover:underline ml-1 font-medium"
                >
                  Firebase Auth Providers <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Under <strong>Sign-in method</strong>, enable <strong>Email/Password</strong>.</li>
              <li>Optionally enable <strong>Google</strong> provider if you wish to use one-click Google Sign-in.</li>
              <li>Save changes and you are ready to test registration and login immediately!</li>
            </ol>
          </div>

          {/* Credential Specs */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Configured Parameters
            </h4>
            <div className="space-y-2 font-mono text-xs">
              {[
                { label: 'Project ID', val: firebaseConfig.projectId },
                { label: 'Auth Domain', val: firebaseConfig.authDomain },
                { label: 'Storage Bucket', val: firebaseConfig.storageBucket },
                { label: 'Messaging Sender ID', val: firebaseConfig.messagingSenderId },
                { label: 'App ID', val: firebaseConfig.appId },
                { label: 'API Key', val: `${firebaseConfig.apiKey.slice(0, 10)}...${firebaseConfig.apiKey.slice(-6)}`, fullVal: firebaseConfig.apiKey },
              ].map(({ label, val, fullVal }) => (
                <div key={label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">{label}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200">{val}</span>
                    <button
                      onClick={() => handleCopy(label, fullVal || val)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy value"
                    >
                      {copiedKey === label ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
