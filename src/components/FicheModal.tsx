import React from 'react';
import { FICHES_REFERENTIEL } from '../data/referentiel';
import { X, BookOpen, Clock, Target, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface FicheModalProps {
  ficheCode: string | null;
  onClose: () => void;
}

export const FicheModal: React.FC<FicheModalProps> = ({ ficheCode, onClose }) => {
  if (!ficheCode) return null;
  const fiche = FICHES_REFERENTIEL[ficheCode];
  if (!fiche) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              {fiche.code}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {fiche.titre}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {fiche.sous_titre}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la fiche */}
        <div className="p-5 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Métadonnées rapides */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Temps estimé : {fiche.temps_estime}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              <span>Phase dominante : {fiche.phase_dominante}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span>Indicateurs associés : {fiche.kpi_lies.join(', ')}</span>
            </span>
          </div>

          {/* Principe */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Principe fondamental :</span>
            </h4>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              {fiche.principe}
            </p>
          </div>

          {/* Règles d'or */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Règles d'or & heuristiques :</span>
            </h4>
            <ul className="space-y-1.5">
              {fiche.regles.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Questions clés */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              Questions d'auto-évaluation & questionnement :
            </h4>
            <ul className="space-y-1">
              {fiche.questions_cles.map((q, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-500 font-bold">?</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exemple B2B */}
          <div className="bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/80">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">
              Cas d'usage B2B concret :
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
              « {fiche.exemple_b2b} »
            </p>
          </div>

          {/* Pièges fréquents */}
          <div>
            <h4 className="font-bold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Pièges & dérives à éviter :</span>
            </h4>
            <ul className="space-y-1">
              {fiche.pieges.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5 text-rose-700 dark:text-rose-300">
                  <span className="font-bold">✕</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium rounded-lg text-xs cursor-pointer"
          >
            Fermer la fiche
          </button>
        </div>
      </div>
    </div>
  );
};
