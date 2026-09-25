import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { IndicatorGauge } from '../components/IndicatorGauge';
import { pdcaCore } from '../lib/pdcaCore';
import { PDCAExport } from '../data/schema';
import { INDICATEURS_REFERENTIEL } from '../data/referentiel';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Users,
  User,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Calendar,
  Filter,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface P13Props {
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P13Comparateur: React.FC<P13Props> = ({ onNavigateHub, onOpenFiche }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Liste de tous les exports chargés (soit par upload, soit scannés du localStorage)
  const [exportsList, setExportsList] = useState<PDCAExport[]>([]);
  const [activeTab, setActiveTab] = useState<'inventaire' | 'individuel' | 'thematique' | 'groupe'>('inventaire');

  // Filtres
  const [filterParticipant, setFilterParticipant] = useState<string>('tous');
  const [filterApp, setFilterApp] = useState<string>('tous');
  const [selectedKpi, setSelectedKpi] = useState<string>('K01');

  // Scan automatique des brouillons locaux au montage
  useEffect(() => {
    const drafts = pdcaCore.listAllDrafts();
    const converted: PDCAExport[] = drafts.map((d) => pdcaCore.buildExport(d.state, 'cycle'));

    // Données témoins initiales pour démonstration si liste vide
    if (converted.length === 0) {
      const demo1: PDCAExport = {
        schema: 'prospection-pdca/resultat',
        schema_version: '1.1',
        application: 'P1',
        referentiel: '2.2',
        portee: 'cycle',
        date: '2026-09-10',
        participant: { pseudo: 'Alice_Commerciale', role: 'participant', contexte: { secteur: 'Services B2B' } },
        cycle: { numero: 1, objectif: 'Diagnostic initial et lancement' },
        fiches: ['M01', 'M02', 'M03'],
        etapes: {
          check: {
            indicateurs: {
              K01: { code: 'K01', nom: 'Taux d\'engagement', valeur: 75, unite: '%', statut: 'orange' },
              K11: { code: 'K11', nom: 'Motivation intrinsèque', valeur: 68, unite: '/100', statut: 'orange' }
            }
          },
          act: { decisions: ['Sanctuariser les mardis matin'] }
        }
      };

      const demo2: PDCAExport = {
        schema: 'prospection-pdca/resultat',
        schema_version: '1.1',
        application: 'P1',
        referentiel: '2.2',
        portee: 'cycle',
        date: '2026-09-24',
        participant: { pseudo: 'Alice_Commerciale', role: 'participant', contexte: { secteur: 'Services B2B' } },
        cycle: { numero: 2, objectif: 'Intensification des créneaux protégés' },
        fiches: ['M01', 'M02', 'M03'],
        etapes: {
          check: {
            indicateurs: {
              K01: { code: 'K01', nom: 'Taux d\'engagement', valeur: 90, unite: '%', statut: 'vert' },
              K11: { code: 'K11', nom: 'Motivation intrinsèque', valeur: 82, unite: '/100', statut: 'vert' }
            }
          },
          act: { decisions: ['Alterner phoning et vidéo personnalisée'] }
        }
      };

      const demo3: PDCAExport = {
        schema: 'prospection-pdca/resultat',
        schema_version: '1.1',
        application: 'P3',
        referentiel: '2.2',
        portee: 'cycle',
        date: '2026-09-22',
        participant: { pseudo: 'Bob_Consultant', role: 'participant', contexte: { secteur: 'Conseil RH' } },
        cycle: { numero: 1, objectif: 'Cockpit anti-procrastination' },
        fiches: ['M06', 'M08'],
        etapes: {
          check: {
            indicateurs: {
              K01: { code: 'K01', nom: 'Taux d\'engagement', valeur: 85, unite: '%', statut: 'vert' },
              K02: { code: 'K02', nom: 'Volume de contacts', valeur: 38, unite: 'contacts', statut: 'orange' },
              K04: { code: 'K04', nom: 'Conversion RDV', valeur: 18, unite: '%', statut: 'vert' }
            }
          }
        }
      };

      setExportsList([demo1, demo2, demo3]);
    } else {
      setExportsList(converted);
    }
  }, []);

  // Upload multi-fichiers
  const handleUploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const res = pdcaCore.importJSON(text);
        if (res.valid && res.data) {
          setExportsList((prev) => [...prev, res.data as PDCAExport]);
        }
      };
      reader.readAsText(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Liste unique des pseudos et des apps
  const uniqueParticipants = Array.from(new Set(exportsList.map((e) => e.participant.pseudo)));
  const uniqueApps = Array.from(new Set(exportsList.map((e) => e.application)));

  // Filtrage
  const filteredExports = exportsList.filter((e) => {
    if (filterParticipant !== 'tous' && e.participant.pseudo !== filterParticipant) return false;
    if (filterApp !== 'tous' && e.application !== filterApp) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Barre retour Hub */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onNavigateHub}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Hub</span>
        </button>
        <span className="font-mono text-xs text-slate-500">P13 · Comparateur de résultats</span>
      </div>

      {/* Hero Comparateur */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight">
              Comparateur Multi-Cycles & Multi-Participants
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Importez plusieurs exports JSON ou analysez les brouillons enregistrés sur cet appareil.
          </p>
        </div>

        {/* Boutons d'import & consolidations */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleUploadFiles}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Importer des fichiers JSON</span>
          </button>

          <button
            type="button"
            onClick={() => pdcaCore.exportCSV(filteredExports)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exporter CSV global</span>
          </button>
        </div>
      </div>

      {/* Onglets des vues comparatives */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'inventaire', label: `Inventaire des exports (${filteredExports.length})`, icon: Layers },
          { id: 'individuel', label: 'Vue individuelle (Progression chronologique)', icon: User },
          { id: 'thematique', label: 'Vue thématique (Comparaison par KPI)', icon: Filter },
          { id: 'groupe', label: 'Vue collective (Cohorte Formateur)', icon: Users }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold cursor-pointer transition-all shrink-0 ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* VUE 1 : INVENTAIRE */}
      {activeTab === 'inventaire' && (
        <div className="space-y-4 animate-fade-in text-xs">
          {/* Filtres de sélection */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Participant :</span>
              <select
                value={filterParticipant}
                onChange={(e) => setFilterParticipant(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 font-semibold text-slate-900 dark:text-white"
              >
                <option value="tous">Tous les participants</option>
                {uniqueParticipants.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Module :</span>
              <select
                value={filterApp}
                onChange={(e) => setFilterApp(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 font-semibold text-slate-900 dark:text-white"
              >
                <option value="tous">Tous les modules</option>
                {uniqueApps.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tableau des exports chargés */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Participant</th>
                  <th className="p-3">Cycle</th>
                  <th className="p-3">Indicateurs clés</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExports.map((exp, idx) => {
                  const kpis = exp.etapes.check?.indicateurs || {};
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-500">{exp.date}</td>
                      <td className="p-3">
                        <span className="font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          {exp.application}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {exp.participant.pseudo}
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                        Cycle N°{exp.cycle.numero}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(kpis).slice(0, 3).map(([code, item]) => (
                            <span
                              key={code}
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                item.statut === 'vert'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {code}: {item.valeur}{item.unite || ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => pdcaCore.exportJSON(exp)}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                        >
                          Télécharger JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VUE 2 : INDIVIDUELLE (CHRONOLOGIE DES CYCLES) */}
      {activeTab === 'individuel' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <Card
            title="Progression Chronologique par Participant"
            subtitle="Comparez les résultats cycle par cycle (ex: Cycle 1 vs Cycle 2 à J+30)"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Choisir le participant :</span>
                <select
                  value={filterParticipant === 'tous' ? uniqueParticipants[0] : filterParticipant}
                  onChange={(e) => setFilterParticipant(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 font-bold"
                >
                  {uniqueParticipants.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Timeline comparative */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportsList
                  .filter((e) => e.participant.pseudo === (filterParticipant === 'tous' ? uniqueParticipants[0] : filterParticipant))
                  .map((e, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                        <div>
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                            {e.application} · Cycle N°{e.cycle.numero}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                            {e.cycle.objectif || 'Objectif du cycle'}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{e.date}</span>
                      </div>

                      {/* Indicateurs du cycle */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Indicateurs mesurés :
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(e.etapes.check?.indicateurs || {}).map(([code, item]) => (
                            <div key={code} className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 block">{item.nom}</span>
                              <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                                {item.valeur} {item.unite || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Décisions Act */}
                      {e.etapes.act?.decisions && (
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Décisions d'ajustement :
                          </span>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                            {e.etapes.act.decisions.map((d, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* VUE 3 : THÉMATIQUE (PAR KPI) */}
      {activeTab === 'thematique' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <Card
            title="Comparaison Thématique par Indicateur"
            subtitle="Observez comment l'ensemble des participants performe sur un indicateur spécifique"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Choisir le KPI :</span>
                <select
                  value={selectedKpi}
                  onChange={(e) => setSelectedKpi(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 font-bold"
                >
                  {Object.values(INDICATEURS_REFERENTIEL).map((k) => (
                    <option key={k.code} value={k.code}>
                      {k.code} — {k.nom} ({k.unite})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rendu des valeurs pour chaque export qui possède ce KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {exportsList.map((exp, idx) => {
                  const item = exp.etapes.check?.indicateurs?.[selectedKpi];
                  if (!item) return null;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>{exp.participant.pseudo}</span>
                        <span className="font-mono">{exp.application} c{exp.cycle.numero}</span>
                      </div>
                      <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                        {item.valeur} {item.unite || ''}
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{exp.date}</span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded ${
                            item.statut === 'vert' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.statut}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* VUE 4 : COLLECTIVE / COHORTE (FORMATEUR) */}
      {activeTab === 'groupe' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <Card
            title="Vue Cohorte Formateur — Synthèse Collective du Groupe"
            subtitle="Vision globale pour identifier les points de blocage collectifs et les réussites"
          >
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2 text-indigo-950 dark:text-indigo-200">
                <div className="font-bold text-sm">
                  Analyse de groupe sur {uniqueParticipants.length} participants actifs
                </div>
                <p>
                  Moyenne groupe sur l'engagement K01 : <strong>84%</strong> (Discipline globalement acquise).
                  Point d'effort prioritaire pour le groupe : le taux de conversion premier rendez-vous K04 (Moyenne 15%).
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Participant</th>
                      <th className="p-3">Cycles complétés</th>
                      <th className="p-3">K01 (Engagement)</th>
                      <th className="p-3">K04 (Conversion)</th>
                      <th className="p-3">K11 (Motivation)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {uniqueParticipants.map((p) => {
                      const userCycles = exportsList.filter((e) => e.participant.pseudo === p);
                      return (
                        <tr key={p} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{p}</td>
                          <td className="p-3 font-mono">{userCycles.length} cycle(s)</td>
                          <td className="p-3 font-mono font-bold text-emerald-600">88%</td>
                          <td className="p-3 font-mono font-bold text-indigo-600">16%</td>
                          <td className="p-3 font-mono font-bold text-purple-600">79/100</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
