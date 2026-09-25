import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { IndicatorGauge } from '../components/IndicatorGauge';
import { ExportBar } from '../components/ExportBar';
import { FormateurView } from '../components/FormateurView';
import { FicheModal } from '../components/FicheModal';
import { pdcaCore, ModuleSessionState } from '../lib/pdcaCore';
import { INDICATEURS_REFERENTIEL } from '../data/referentiel';
import { ContexteParticipant, PhasePDCA } from '../data/schema';
import {
  BarChart2,
  TrendingUp,
  Filter,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface P12Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

// Données types de 12 semaines pour visualiser les tendances
const DEFAULT_12_WEEKS = [
  { semaine: 'S1', k01: 70, k02: 25, k03: 22, k04: 8, k11: 60, k12: 12 },
  { semaine: 'S2', k01: 75, k02: 30, k03: 25, k04: 10, k11: 65, k12: 15 },
  { semaine: 'S3', k01: 80, k02: 35, k03: 28, k04: 11, k11: 70, k12: 18 },
  { semaine: 'S4', k01: 85, k02: 42, k03: 35, k04: 14, k11: 75, k12: 22 },
  { semaine: 'S5', k01: 90, k02: 45, k03: 38, k04: 16, k11: 80, k12: 26 },
  { semaine: 'S6', k01: 88, k02: 40, k03: 36, k04: 15, k11: 78, k12: 25 }
];

export const P12Dashboard: React.FC<P12Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P12', pseudo, 1);
    return existing || pdcaCore.initSession('P12', Object.keys(INDICATEURS_REFERENTIEL), pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Valeurs actuelles des 15 KPI
  const [kpiValues, setKpiValues] = useState<Record<string, number>>({
    K01: 88,
    K02: 45,
    K03: 38,
    K04: 16,
    K05: 14,
    K06: 96,
    K07: 68,
    K08: 12,
    K09: 8.2,
    K10: 6,
    K11: 80,
    K12: 26,
    K13: 72,
    K14: 78,
    K15: 0.76
  });

  // Filtre par catégorie de KPI
  const [selectedCategory, setSelectedCategory] = useState<'tous' | 'discipline' | 'conversion' | 'psychologie'>('tous');

  // Autosave
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      const formattedIndicateurs: Record<string, any> = {};
      Object.entries(kpiValues).forEach(([code, val]) => {
        const meta = INDICATEURS_REFERENTIEL[code];
        formattedIndicateurs[code] = {
          code,
          nom: meta?.nom || code,
          valeur: val,
          unite: meta?.unite || '',
          cible: meta?.seuils?.vert?.min || 80,
          statut: pdcaCore.kpiStatus(code, val),
          formule: meta?.formule || ''
        };
      });

      pdcaCore.saveDraft({
        ...session,
        etapes: {
          ...session.etapes,
          check: {
            ...session.etapes.check,
            indicateurs: formattedIndicateurs
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, kpiValues]);

  const setPhase = (p: PhasePDCA | 'synthese') => {
    setSession((prev) => ({ ...prev, etapeActuelle: p === 'synthese' ? 'act' : p }));
  };

  // Filtrage des KPI
  const filterCodes = () => {
    if (selectedCategory === 'discipline') return ['K01', 'K02', 'K07', 'K08', 'K12'];
    if (selectedCategory === 'conversion') return ['K03', 'K04', 'K05', 'K06', 'K13', 'K14'];
    if (selectedCategory === 'psychologie') return ['K09', 'K10', 'K11', 'K15'];
    return Object.keys(INDICATEURS_REFERENTIEL);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Retour Hub */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onNavigateHub}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Hub</span>
        </button>
        <span className="font-mono text-xs text-slate-500">P12 · Tableau de bord PDCA</span>
      </div>

      <ExportBar
        state={session}
        isSaving={isSaving}
        hasDraftAvailable={hasDraft}
        onImport={(imported) => {
          setSession((prev) => pdcaCore.importToSession(imported, prev));
          setHasDraft(false);
        }}
        onResumeDraft={() => {
          const draft = pdcaCore.loadDraft('P12', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P12', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P12', Object.keys(INDICATEURS_REFERENTIEL), pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="15 min / semaine"
          objectifsPedagogiques={[
            'Piloter la prospection comme une chaîne de production industrielle (sans affect ni jugement culpabilisant).',
            'Repérer le goulot d\'étranglement exact dans l\'entonnoir : joignabilité (K03), conversion pitch (K04) ou abandon de séquence (K08).',
            'Prescrire la fiche méthodologique réparatrice appropriée (ex: si K04 < 8%, travailler M15 et M19).'
          ]}
          reponsesAttendues={[
            'Mise à jour hebdomadaire des 15 KPI avec calcul des statuts vert/orange/rouge.',
            'Diagnostic de funnel chiffré.',
            'Décision d\'action corrective ciblée pour le cycle suivant.'
          ]}
          piegesFrequents={[
            'Se concentrer uniquement sur le chiffre d\'affaires final en ignorant les KPI amont (K01, K02).',
            'Laisser des indicateurs en rouge pendant 3 semaines consécutives sans modifier la méthode.'
          ]}
          conseilsAnimation="Faites projeter ce tableau de bord chaque vendredi à 16h pour la rétrospective d'équipe. Les indicateurs parlent à la place du chef."
        />
      )}

      {/* Diagnostic de l'entonnoir (Funnel) */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Diagnostic de l'Entonnoir de Prospection Commerciale</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Conversion globale : <strong className="text-white">~35% décroché → 16% RDV</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="text-[10px] text-slate-400">1. Contacts bruts (K02)</div>
            <div className="text-2xl font-black text-white font-mono mt-1">45 / sem</div>
            <div className="text-[10px] text-emerald-400 mt-1">Cible ≥ 40</div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="text-[10px] text-slate-400">2. Joignabilité (K03)</div>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1">38%</div>
            <div className="text-[10px] text-slate-400 mt-1">17 joints réels</div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="text-[10px] text-slate-400">3. Taux RDV (K04)</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">16%</div>
            <div className="text-[10px] text-slate-400 mt-1">3 RDV qualifiés</div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="text-[10px] text-slate-400">4. Abandon (K08)</div>
            <div className="text-2xl font-black text-emerald-300 font-mono mt-1">12%</div>
            <div className="text-[10px] text-emerald-400 mt-1">Conforme (&lt; 15%)</div>
          </div>
        </div>
      </div>

      {/* Filtres de catégorie */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold shrink-0">Filtrer par domaine :</span>
        {[
          { id: 'tous', label: 'Tous les 15 KPI' },
          { id: 'discipline', label: 'Discipline & Temps (K01, K02, K07, K08, K12)' },
          { id: 'conversion', label: 'Conversion & Pitch (K03, K04, K05, K06, K13, K14)' },
          { id: 'psychologie', label: 'Psychologie & Posture (K09, K10, K11, K15)' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 cursor-pointer transition-colors ${
              selectedCategory === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grille des 15 jauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filterCodes().map((code) => {
          const val = kpiValues[code] || 0;
          const meta = INDICATEURS_REFERENTIEL[code];
          return (
            <div key={code} className="space-y-1">
              <IndicatorGauge
                code={code}
                valeur={val}
                cible={meta?.seuils?.vert?.min}
              />
              <div className="flex items-center gap-2 px-2 text-[11px] text-slate-500">
                <span>Ajuster :</span>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => setKpiValues({ ...kpiValues, [code]: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-1.5 py-0.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Courbes de tendance sur 6 semaines */}
      <Card title="Évolution tendancielle sur 6 semaines" subtitle="Visualisation des progrès de discipline et de conversion">
        <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2 border-b border-l border-slate-200 dark:border-slate-700">
          {DEFAULT_12_WEEKS.map((w, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <div className="w-full flex items-end justify-center gap-1 h-full">
                <div
                  className="w-3 bg-indigo-500 rounded-t"
                  style={{ height: `${w.k01}%` }}
                  title={`K01 Créneaux : ${w.k01}%`}
                />
                <div
                  className="w-3 bg-emerald-500 rounded-t"
                  style={{ height: `${w.k04 * 4}%` }}
                  title={`K04 Conversion RDV : ${w.k04}%`}
                />
                <div
                  className="w-3 bg-purple-500 rounded-t"
                  style={{ height: `${w.k11}%` }}
                  title={`K11 Motivation : ${w.k11}`}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 mt-1">{w.semaine}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-500 mt-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> K01 Taux d'engagement</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> K04 Conversion RDV</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> K11 Motivation intrinsèque</span>
        </div>
      </Card>

      {/* Footer & Actions */}
      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onNavigateHub}
          className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Retour au Hub
        </button>
        <button
          type="button"
          onClick={() => {
            const exp = pdcaCore.buildExport(session, 'cycle');
            pdcaCore.exportJSON(exp);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          Télécharger l'Export JSON du Tableau de Bord
        </button>
      </div>

      <FicheModal ficheCode={modalFiche} onClose={() => setModalFiche(null)} />
    </div>
  );
};
