import React from 'react';
import { GraduationCap, Clock, CheckCircle2, AlertOctagon, Lightbulb } from 'lucide-react';

interface FormateurViewProps {
  timingEstime: string;
  objectifsPedagogiques: string[];
  reponsesAttendues: string[];
  piegesFrequents: string[];
  conseilsAnimation: string;
}

export const FormateurView: React.FC<FormateurViewProps> = ({
  timingEstime,
  objectifsPedagogiques,
  reponsesAttendues,
  piegesFrequents,
  conseilsAnimation
}) => {
  return (
    <div className="bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 rounded-xl p-4 sm:p-5 mb-6 text-slate-800 dark:text-slate-200 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-amber-800/60 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 text-white rounded-lg">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm sm:text-base">
              Vue Formateur — Repères d'animation & Débriefing
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Visible uniquement lorsque le mode formateur est activé dans la barre supérieure.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-full border border-amber-300 dark:border-amber-700">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Durée conseillée : {timingEstime}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Objectifs pédagogiques */}
        <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Objectifs d'apprentissage clés :</span>
          </div>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
            {objectifsPedagogiques.map((obj, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Réponses & postures attendues */}
        <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Critères de réussite observables :</span>
          </div>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
            {reponsesAttendues.map((rep, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{rep}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pièges fréquents en salle */}
        <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 mb-2">
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Pièges & dérives courantes des apprenants :</span>
          </div>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
            {piegesFrequents.map((piege, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">⚠</span>
                <span>{piege}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Conseil d'animation & relance */}
        <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300 mb-2">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Posture d'animation suggérée :</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {conseilsAnimation}
          </p>
        </div>
      </div>
    </div>
  );
};
