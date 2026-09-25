import React from 'react';
import { PhasePDCA } from '../data/schema';
import { CheckCircle2, Circle, Compass, Target, Play, BarChart3, RotateCw } from 'lucide-react';

interface ProgressBarProps {
  currentPhase: PhasePDCA | 'synthese';
  onSelectPhase?: (phase: PhasePDCA | 'synthese') => void;
  completedPhases?: (PhasePDCA | 'synthese')[];
}

const PHASES: Array<{
  id: PhasePDCA | 'synthese';
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'comprendre', label: 'Comprendre', sub: 'Diagnostic & Méthodes', icon: Compass },
  { id: 'plan', label: 'Plan', sub: 'Objectifs SMART', icon: Target },
  { id: 'do', label: 'Do', sub: 'Action & Pratique', icon: Play },
  { id: 'check', label: 'Check', sub: 'Mesure & Écarts', icon: BarChart3 },
  { id: 'act', label: 'Act', sub: 'Ajustements & Cap', icon: RotateCw },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentPhase,
  onSelectPhase,
  completedPhases = []
}) => {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 mb-6 shadow-xs">
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 sm:pb-0">
        {PHASES.map((phase, idx) => {
          const isCurrent = phase.id === currentPhase;
          const isCompleted = completedPhases.includes(phase.id) || idx < currentIndex;
          const Icon = phase.icon;

          return (
            <React.Fragment key={phase.id}>
              <button
                type="button"
                onClick={() => onSelectPhase && onSelectPhase(phase.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                    : isCompleted
                    ? 'text-emerald-700 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 border text-xs">
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold leading-tight">{phase.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[90px]">
                    {phase.sub}
                  </div>
                </div>
              </button>

              {idx < PHASES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[12px] sm:min-w-[20px] rounded-full mx-1 ${
                    idx < currentIndex
                      ? 'bg-emerald-500 dark:bg-emerald-600'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
