import React, { useState } from 'react';
import { INDICATEURS_REFERENTIEL } from '../data/referentiel';
import { pdcaCore } from '../lib/pdcaCore';
import { HelpCircle, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface IndicatorGaugeProps {
  code: string; // e.g. "K01"
  valeur: number;
  cible?: number;
  unite?: string;
  titrePersonnalise?: string;
  taille?: 'compact' | 'standard' | 'large';
}

export const IndicatorGauge: React.FC<IndicatorGaugeProps> = ({
  code,
  valeur,
  cible,
  unite,
  titrePersonnalise,
  taille = 'standard'
}) => {
  const [showFormula, setShowFormula] = useState(false);
  const meta = INDICATEURS_REFERENTIEL[code];
  const statut = pdcaCore.kpiStatus(code, valeur);

  const displayUnite = unite || meta?.unite || '';
  const nom = titrePersonnalise || meta?.nom || code;
  const formule = meta?.formule || 'Formule non spécifiée';
  const recommandation = meta?.recommandation || '';

  const statusConfig = {
    vert: {
      border: 'border-emerald-200 dark:border-emerald-800/80',
      bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
      label: 'Conforme',
      icon: CheckCircle2
    },
    orange: {
      border: 'border-amber-200 dark:border-amber-800/80',
      bg: 'bg-amber-50/60 dark:bg-amber-950/20',
      text: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
      label: 'À surveiller',
      icon: AlertTriangle
    },
    rouge: {
      border: 'border-rose-200 dark:border-rose-800/80',
      bg: 'bg-rose-50/60 dark:bg-rose-950/20',
      text: 'text-rose-700 dark:text-rose-300',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
      label: 'Alerte',
      icon: AlertCircle
    }
  };

  const currentConfig = statusConfig[statut];
  const StatusIcon = currentConfig.icon;

  // Calcul visuel du pourcentage pour la jauge
  let percent = 50;
  if (cible && cible > 0) {
    percent = Math.min(100, Math.max(0, (valeur / cible) * 100));
  } else if (displayUnite.includes('%')) {
    percent = Math.min(100, Math.max(0, valeur));
  } else if (displayUnite.includes('/10')) {
    percent = Math.min(100, Math.max(0, valeur * 10));
  }

  return (
    <div
      className={`border rounded-xl p-4 transition-all relative ${currentConfig.border} ${currentConfig.bg}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {code}
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={nom}>
            {nom}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded"
          title="Afficher la formule et les seuils"
          aria-label="Afficher la formule"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-baseline justify-between mt-1 mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isNaN(valeur) ? '-' : valeur}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {displayUnite}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {cible !== undefined && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Cible : <span className="font-semibold text-slate-700 dark:text-slate-300">{cible}{displayUnite}</span>
            </span>
          )}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${currentConfig.badge}`}>
            <StatusIcon className="w-3 h-3" />
            {currentConfig.label}
          </span>
        </div>
      </div>

      {/* Barre de jauge visuelle */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            statut === 'vert'
              ? 'bg-emerald-500'
              : statut === 'orange'
              ? 'bg-amber-500'
              : 'bg-rose-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Détail formule & recommandation en tooltip / panneau repliable */}
      {showFormula && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Formule : </span>
            <code className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
              {formule}
            </code>
          </div>
          {recommandation && (
            <div className="pt-1 text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Conseil : </span>
              {recommandation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
