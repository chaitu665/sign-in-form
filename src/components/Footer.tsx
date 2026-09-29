import React from 'react';
import { Flame, ShieldCheck, Github, ExternalLink } from 'lucide-react';
import { firebaseConfig } from '../firebase/config';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-slate-400 font-medium">AuthPortal</span>
          <span className="text-slate-600">|</span>
          <span>Powered by Firebase Auth &amp; Firestore</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Connected: <code className="text-slate-300 font-mono">{firebaseConfig.projectId}</code>
          </span>
          <a
            href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <span>Console</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>
    </footer>
  );
};
