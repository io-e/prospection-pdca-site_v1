import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { IndicatorGauge } from '../components/IndicatorGauge';
import { ExportBar } from '../components/ExportBar';
import { FormateurView } from '../components/FormateurView';
import { FicheModal } from '../components/FicheModal';
import { pdcaCore, ModuleSessionState } from '../lib/pdcaCore';
import { ContexteParticipant, PhasePDCA } from '../data/schema';
import {
  Calendar,
  Grid,
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface TaskEisenhower {
  id: string;
  titre: string;
  heuresEstimees: number;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

const DEFAULT_TASKS: TaskEisenhower[] = [
  { id: '1', titre: 'Prospection active (Appels ciblés & LinkedIn)', heuresEstimees: 8, quadrant: 'Q2' },
  { id: '2', titre: 'Préparation et qualification des listes ICP', heuresEstimees: 3, quadrant: 'Q2' },
  { id: '3', titre: 'Rendez-vous clients signés & propositions chaudes', heuresEstimees: 10, quadrant: 'Q1' },
  { id: '4', titre: 'Urgences imprévues et dépannages clients', heuresEstimees: 6, quadrant: 'Q1' },
  { id: '5', titre: 'Répondre aux e-mails et sollicitations internes', heuresEstimees: 7, quadrant: 'Q3' },
  { id: '6', titre: 'Réunions d\'équipe sans ordre du jour précis', heuresEstimees: 3, quadrant: 'Q3' },
  { id: '7', titre: 'Navigation passive sur les réseaux sans prospection', heuresEstimees: 2, quadrant: 'Q4' }
];

interface P05Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P05Semaine: React.FC<P05Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P5', pseudo, 1);
    return existing || pdcaCore.initSession('P5', ['M09', 'M10'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Tâches de la matrice
  const [tasks, setTasks] = useState<TaskEisenhower[]>(
    session.etapes.plan?.tasks_eisenhower || DEFAULT_TASKS
  );

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskHours, setNewTaskHours] = useState(2);
  const [newTaskQuadrant, setNewTaskQuadrant] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q2');

  // Calcul live de K12 (% de temps en Q2)
  const totalHours = tasks.reduce((sum, t) => sum + t.heuresEstimees, 0);
  const q2Hours = tasks.filter((t) => t.quadrant === 'Q2').reduce((sum, t) => sum + t.heuresEstimees, 0);
  const k12Ratio = totalHours > 0 ? Math.round((q2Hours / totalHours) * 100) : 0;

  // Semaine type (M10)
  const [slots, setSlots] = useState<Record<string, string>>({
    mardiMatin: 'Prospection téléphonique active (Q2 - Sanctuarisé)',
    mercrediApresMidi: 'Enrichissement et qualification CRM (Q2)',
    jeudiMatin: 'Relances multicanales et RDV de découverte (Q1/Q2)',
    vendrediFinApresMidi: 'Rétrospective PDCA & Bilan hebdomadaire (Q2)'
  });

  // Autosave
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      pdcaCore.saveDraft({
        ...session,
        etapes: {
          ...session.etapes,
          plan: {
            ...session.etapes.plan,
            tasks_eisenhower: tasks,
            semaine_type: slots
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K12: {
                code: 'K12',
                nom: 'Ratio temps important non-urgent (Q2 Eisenhower)',
                valeur: k12Ratio,
                unite: '%',
                cible: 25,
                statut: pdcaCore.kpiStatus('K12', k12Ratio),
                formule: '(Heures Q2 / Heures totales) × 100'
              },
              K01: {
                code: 'K01',
                nom: 'Taux d\'engagement sur créneaux',
                valeur: 88,
                unite: '%',
                cible: 85,
                statut: 'vert',
                formule: '(Créneaux tenus / Créneaux planifiés) × 100'
              }
            }
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, tasks, slots, k12Ratio]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        titre: newTaskTitle.trim(),
        heuresEstimees: newTaskHours || 1,
        quadrant: newTaskQuadrant
      }
    ]);
    setNewTaskTitle('');
    setNewTaskHours(2);
  };

  const setPhase = (p: PhasePDCA | 'synthese') => {
    setSession((prev) => ({ ...prev, etapeActuelle: p === 'synthese' ? 'act' : p }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
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
        <span className="font-mono text-xs text-slate-500">P05 · Ma semaine claire</span>
      </div>

      <ExportBar
        state={session}
        isSaving={isSaving}
        hasDraftAvailable={hasDraft}
        onImport={(imported) => {
          setSession((prev) => pdcaCore.importToSession(imported, prev));
          if ((imported.etapes?.plan as any)?.tasks_eisenhower) {
            setTasks((imported.etapes.plan as any).tasks_eisenhower);
          }
          setHasDraft(false);
        }}
        onResumeDraft={() => {
          const draft = pdcaCore.loadDraft('P5', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P5', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P5', ['M09', 'M10'], pseudo, 1, contexte));
          setTasks(DEFAULT_TASKS);
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="45 min"
          objectifsPedagogiques={[
            'Faire prendre conscience que la prospection de fond est systématiquement chassée par les urgences Q1/Q3 si elle n\'est pas sanctuarisée.',
            'Calculer en direct l\'indicateur K12 (seuil minimal sain : 25% du temps en Q2).',
            'Bâtir une semaine type réaliste avec des sas d\'imprévus (buffers).'
          ]}
          reponsesAttendues={[
            'Au moins 2 créneaux Q2 sanctuarisés dans la semaine type.',
            'K12 calculé et analysé avec plan d\'élimination des tâches Q4.',
            'Revue hebdomadaire programmée le vendredi après-midi.'
          ]}
          piegesFrequents={[
            'Classer la prospection en Q1 par panique de fin de mois au lieu d\'un investissement régulier en Q2.',
            'Remplir l\'agenda à 100% sans laisser de marges d\'imprévus.'
          ]}
          conseilsAnimation="Demandez à chacun d'identifier une tâche parasite de Q3 ou Q4 qu'il s'engage formellement à refuser dès la semaine prochaine."
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : PLAN (MATRICE D'EISENHOWER & SEMAINE TYPE) */}
      {session.etapeActuelle === 'comprendre' || session.etapeActuelle === 'plan' ? (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Plan — Matrice d'Eisenhower (M09) & Time blocking (M10)"
            subtitle="Classez vos activités pour libérer au moins 25% de votre temps pour la prospection Q2"
            badge="M09 · M10"
            badgeColor="blue"
          >
            <div className="space-y-6 text-xs">
              {/* Ajout d'activité */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Nom de l'activité commerciale..."
                  className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Heures/sem :</span>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(parseInt(e.target.value, 10) || 1)}
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <select
                  value={newTaskQuadrant}
                  onChange={(e) => setNewTaskQuadrant(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Q2">Q2 : Important & Non urgent (Prospection)</option>
                  <option value="Q1">Q1 : Urgent & Important (Crises / Devis chauds)</option>
                  <option value="Q3">Q3 : Urgent & Non important (Interruptions)</option>
                  <option value="Q4">Q4 : Ni urgent ni important (Futilités)</option>
                </select>
                <button
                  type="button"
                  onClick={addTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  Ajouter
                </button>
              </div>

              {/* Rendu des 4 quadrants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Q1 */}
                <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 dark:text-rose-200">
                      Q1 : Urgent & Important (À faire d'urgence)
                    </span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                      {tasks.filter((t) => t.quadrant === 'Q1').reduce((s, t) => s + t.heuresEstimees, 0)} h
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {tasks.filter((t) => t.quadrant === 'Q1').map((t) => (
                      <li key={t.id} className="p-2 bg-white dark:bg-slate-900 rounded border border-rose-100 dark:border-rose-900/40 flex justify-between items-center">
                        <span>{t.titre}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">{t.heuresEstimees}h</span>
                          <button type="button" onClick={() => setTasks(tasks.filter((i) => i.id !== t.id))} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Q2 — LE COEUR DE LA PROSPECTION */}
                <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Q2 : Non urgent & Important (Prospection de fond)
                    </span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100">
                      {q2Hours} h ({k12Ratio}%)
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {tasks.filter((t) => t.quadrant === 'Q2').map((t) => (
                      <li key={t.id} className="p-2 bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                        <span className="font-semibold text-emerald-900 dark:text-emerald-200">{t.titre}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">{t.heuresEstimees}h</span>
                          <button type="button" onClick={() => setTasks(tasks.filter((i) => i.id !== t.id))} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Q3 */}
                <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      Q3 : Urgent & Non important (Déléguer / Réduire)
                    </span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      {tasks.filter((t) => t.quadrant === 'Q3').reduce((s, t) => s + t.heuresEstimees, 0)} h
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {tasks.filter((t) => t.quadrant === 'Q3').map((t) => (
                      <li key={t.id} className="p-2 bg-white dark:bg-slate-900 rounded border border-amber-100 dark:border-amber-900/40 flex justify-between items-center">
                        <span>{t.titre}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">{t.heuresEstimees}h</span>
                          <button type="button" onClick={() => setTasks(tasks.filter((i) => i.id !== t.id))} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Q4 */}
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Q4 : Ni urgent ni important (À éliminer)
                    </span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {tasks.filter((t) => t.quadrant === 'Q4').reduce((s, t) => s + t.heuresEstimees, 0)} h
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {tasks.filter((t) => t.quadrant === 'Q4').map((t) => (
                      <li key={t.id} className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-slate-500 line-through">{t.titre}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">{t.heuresEstimees}h</span>
                          <button type="button" onClick={() => setTasks(tasks.filter((i) => i.id !== t.id))} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Semaine Type (M10) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Sanctuarisation dans ma Semaine Type (M10 Time Blocking) :</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(slots).map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] capitalize">
                        {key.replace(/([A-Z])/g, ' $1')} :
                      </label>
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => setSlots({ ...slots, [key]: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Mesurer le ratio K12 (Check)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* ÉTAPE 2 : CHECK (KPI K12 & K01) */}
      {session.etapeActuelle === 'check' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="2. Check — Indicateur de temps stratégique (K12)"
            subtitle="Mesure du ratio de temps alloué au Quadrant 2"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IndicatorGauge
                  code="K12"
                  valeur={k12Ratio}
                  cible={25}
                  unite="%"
                />
                <IndicatorGauge
                  code="K01"
                  valeur={88}
                  cible={85}
                  unite="%"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('plan')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour au Plan
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('act')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer aux ajustements (Act)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 3 : ACT */}
      {session.etapeActuelle === 'act' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="3. Act — Revue hebdomadaire & Protection du temps"
            subtitle="Verrouillez la semaine type dans votre agenda partagé"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-emerald-950 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Votre semaine claire est prête :</span>
                </div>
                <p>
                  Vous consacrez <strong>{q2Hours}h par semaine (soit {k12Ratio}%)</strong> à la prospection de fond (Quadrant 2).
                  Reportez dès aujourd'hui ces 4 blocs récurrents dans votre agenda pour protéger votre avenir commercial.
                </p>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('check')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour au Check
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const exp = pdcaCore.buildExport(session, 'cycle');
                    pdcaCore.exportJSON(exp);
                    onNavigateHub();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Télécharger JSON & Terminer
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <FicheModal ficheCode={modalFiche} onClose={() => setModalFiche(null)} />
    </div>
  );
};
