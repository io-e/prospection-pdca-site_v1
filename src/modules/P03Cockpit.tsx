import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { IndicatorGauge } from '../components/IndicatorGauge';
import { ExportBar } from '../components/ExportBar';
import { FormateurView } from '../components/FormateurView';
import { FicheModal } from '../components/FicheModal';
import { pdcaCore, ModuleSessionState } from '../lib/pdcaCore';
import { ContexteParticipant, PhasePDCA } from '../data/schema';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Square,
  Phone,
  PhoneCall,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Flame
} from 'lucide-react';

interface P03Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P03Cockpit: React.FC<P03Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P3', pseudo, 1);
    return existing || pdcaCore.initSession('P3', ['M06', 'M08'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Checklist de préparation (Plan)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    listePrete: true,
    notificationsOff: true,
    eauEtScript: true,
    objectifsDefinis: true
  });

  // Chronomètre Pomodoro (25 min d'action / 5 min de pause)
  const [timerMode, setTimerMode] = useState<'action' | 'pause'>('action');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);

  // Compteurs en direct pendant le bloc d'action
  const [tentatives, setTentatives] = useState<number>(12);
  const [joints, setJoints] = useState<number>(5);
  const [rdv, setRdv] = useState<number>(2);

  // Boîte 2-minutes / Boîte d'atterrissage des interruptions (M08)
  const [twoMinTasks, setTwoMinTasks] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: '1', text: 'Envoyer l\'invitation agenda à M. Martin', done: true },
    { id: '2', text: 'Mettre à jour le statut du lead sur le CRM', done: false }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      if (timerMode === 'action') {
        setPomodoroCount((prev) => prev + 1);
        setTimerMode('pause');
        setTimeLeft(5 * 60);
      } else {
        setTimerMode('action');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calcul live des KPI
  const joignabilite = tentatives > 0 ? Math.round((joints / tentatives) * 100) : 0;
  const conversionRdv = joints > 0 ? Math.round((rdv / joints) * 100) : 0;

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
            checklist
          },
          do: {
            ...session.etapes.do,
            blocs_realises: [
              {
                debut: 'Session Pomodoro',
                fin: `${pomodoroCount} blocs terminés`,
                duree_minutes: pomodoroCount * 25,
                contacts_tentes: tentatives,
                contacts_joints: joints,
                rdv_obtenus: rdv
              }
            ],
            boite_deux_minutes: twoMinTasks
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K01: {
                code: 'K01',
                nom: 'Taux d\'engagement sur créneaux',
                valeur: pomodoroCount > 0 ? 100 : 80,
                unite: '%',
                cible: 85,
                statut: pdcaCore.kpiStatus('K01', pomodoroCount > 0 ? 100 : 80),
                formule: '(Créneaux tenus / Créneaux planifiés) × 100'
              },
              K02: {
                code: 'K02',
                nom: 'Volume de contacts bruts traités',
                valeur: tentatives,
                unite: 'contacts/semaine',
                cible: 40,
                statut: pdcaCore.kpiStatus('K02', tentatives),
                formule: 'Contacts uniques approchés'
              },
              K03: {
                code: 'K03',
                nom: 'Taux de joignabilité / ouverture',
                valeur: joignabilite,
                unite: '%',
                cible: 35,
                statut: pdcaCore.kpiStatus('K03', joignabilite),
                formule: '(Contacts joints / Contacts tentés) × 100'
              },
              K04: {
                code: 'K04',
                nom: 'Taux de conversion en rendez-vous qualifié',
                valeur: conversionRdv,
                unite: '%',
                cible: 15,
                statut: pdcaCore.kpiStatus('K04', conversionRdv),
                formule: '(RDV obtenus / Contacts joints) × 100'
              }
            }
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, checklist, pomodoroCount, tentatives, joints, rdv, twoMinTasks, joignabilite, conversionRdv]);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setTwoMinTasks([
      ...twoMinTasks,
      { id: Date.now().toString(), text: newTaskText.trim(), done: false }
    ]);
    setNewTaskText('');
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
        <span className="font-mono text-xs text-slate-500">P03 · Cockpit anti-procrastination</span>
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
          const draft = pdcaCore.loadDraft('P3', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P3', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P3', ['M06', 'M08'], pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="55 min"
          objectifsPedagogiques={[
            'Vivre l\'expérience d\'un bloc sanctuarisé de 25 minutes sans multitâche.',
            'Distinguer les micro-tâches immédiates (< 2 min) de celles à consigner dans la boîte d\'atterrissage.',
            'Mesurer le ratio d\'efficacité joignabilité / conversion en rendez-vous qualifié.'
          ]}
          reponsesAttendues={[
            'Au moins 1 Pomodoro de 25 min intégralement respecté sans interruption.',
            'Boîte 2-minutes utilisée pour vider le flux mental parasite.',
            'Saisie rigoureuse des compteurs d\'appels en temps réel.'
          ]}
          piegesFrequents={[
            'Préparer son fichier d\'appels pendant les 25 minutes au lieu de le faire en amont.',
            'Consulter ses e-mails ou LinkedIn pendant la pause de 5 minutes.'
          ]}
          conseilsAnimation="Lancez un Pomodoro collectif en salle avec compte à rebours visible. Tout le monde prospecte ou s'exerce simultanément en silence."
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : PLAN (CHECKLIST DE PRÉPARATION) */}
      {session.etapeActuelle === 'comprendre' || session.etapeActuelle === 'plan' ? (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="Planification — Checklist de mise en condition (M06)"
            subtitle="Avant de lancer le chronomètre, verrouillez votre environnement de travail"
            badge="M06 Pomodoro"
            badgeColor="blue"
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'listePrete', label: 'Ma liste de contacts qualifiés et leurs numéros directs sont sous mes yeux' },
                  { key: 'notificationsOff', label: 'Mon smartphone est en mode NPD, messagerie et Slack sont fermés' },
                  { key: 'eauEtScript', label: 'Verre d\'eau, trame de pitch et feuille de notes vierge sont prêts' },
                  { key: 'objectifsDefinis', label: 'Mon objectif d\'action est fixé (ex: passer au moins 8 appels dans ce bloc)' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setChecklist({ ...checklist, [item.key]: !checklist[item.key] })}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      checklist[item.key]
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {checklist[item.key] ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span className="font-semibold text-xs">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Entrer dans le Cockpit d'Action (Do)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* ÉTAPE 2 : DO (CHRONOMÈTRE ACTIF & COMPTEURS D'APPELS) */}
      {session.etapeActuelle === 'do' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne Gauche : Minuteur Pomodoro */}
            <div className="lg:col-span-1 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between items-center text-center shadow-lg">
              <div className="space-y-1">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    timerMode === 'action'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  {timerMode === 'action' ? 'Bloc Action (25 min)' : 'Pause Déconnectée (5 min)'}
                </span>
                <p className="text-slate-400 text-xs mt-1">
                  Blocs validés : <strong className="text-white font-mono">{pomodoroCount}</strong>
                </p>
              </div>

              {/* Affichage Chiffres du Chrono */}
              <div className="my-6">
                <div className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  {isRunning ? 'Chrono en cours · Focus total' : 'Chronomètre en pause'}
                </div>
              </div>

              {/* Commandes du Chrono */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-transform hover:scale-105 cursor-pointer ${
                    isRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? 'Mettre en pause' : 'Démarrer le bloc'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(timerMode === 'action' ? 25 * 60 : 5 * 60);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  title="Réinitialiser le bloc"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Colonne Droite : Compteurs d'action et Boîte 2-minutes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Compteurs d'appels */}
              <Card title="Compteurs en direct du bloc" subtitle="Incrémentez après chaque geste">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {/* Tentatives */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Tentatives</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {tentatives}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTentatives(Math.max(0, tentatives - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 text-xs"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setTentatives(tentatives + 1)}
                        className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Contacts joints */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Joints</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {joints}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setJoints(Math.max(0, joints - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 text-xs"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setJoints(joints + 1);
                          if (tentatives <= joints) setTentatives(joints + 1);
                        }}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* RDV Obtenus */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>RDV fixés</span>
                    </div>
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {rdv}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setRdv(Math.max(0, rdv - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 text-xs"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRdv(rdv + 1);
                          if (joints <= rdv) setJoints(rdv + 1);
                          if (tentatives <= rdv) setTentatives(rdv + 1);
                        }}
                        className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                  <span>Joignabilité (K03) : <strong className="text-slate-900 dark:text-white">{joignabilite}%</strong></span>
                  <span>Conversion RDV (K04) : <strong className="text-slate-900 dark:text-white">{conversionRdv}%</strong></span>
                </div>
              </Card>

              {/* Boîte 2-minutes (M08) */}
              <Card
                title="Boîte des 2 minutes & Atterrissage des idées (M08)"
                subtitle="Notez les interruptions parasites pour ne pas couper votre élan"
              >
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="ex: Rappeler la comptabilité après le bloc..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addTask}
                      disabled={!newTaskText.trim()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {twoMinTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setTwoMinTasks(
                              twoMinTasks.map((item) =>
                                item.id === t.id ? { ...item, done: !item.done } : item
                              )
                            );
                          }}
                          className="flex items-center gap-2 text-left cursor-pointer"
                        >
                          {t.done ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                          <span className={t.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                            {t.text}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTwoMinTasks(twoMinTasks.filter((item) => item.id !== t.id))}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPhase('plan')}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              ← Retour à la Checklist
            </button>
            <button
              type="button"
              onClick={() => setPhase('check')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <span>Passer au débriefing (Check)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 3 : CHECK (DÉBRIEFING IMMÉDIAT DU BLOC) */}
      {session.etapeActuelle === 'check' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="4. Check — Débriefing immédiat du Cockpit"
            subtitle="Mesure des indicateurs de conversion et d'efficacité"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <IndicatorGauge code="K02" valeur={tentatives} cible={40} unite="contacts" />
                <IndicatorGauge code="K03" valeur={joignabilite} cible={35} unite="%" />
                <IndicatorGauge code="K04" valeur={conversionRdv} cible={15} unite="%" />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour au Cockpit Do
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('act')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer aux rituels d'ancrage (Act)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 4 : ACT */}
      {session.etapeActuelle === 'act' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="5. Act — Bilan & Rituel de fin de session"
            subtitle="Videz la boîte d'atterrissage et ancrez la victoire"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-emerald-950 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-2 text-sm">
                  <span>Bravo pour la tenue de ce bloc !</span>
                </div>
                <p>
                  Vous avez traité <strong>{tentatives} tentatives</strong> et décroché <strong>{rdv} rendez-vous</strong>.
                  Prenez 2 minutes maintenant pour traiter les tâches restantes de votre boîte d'atterrissage.
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
