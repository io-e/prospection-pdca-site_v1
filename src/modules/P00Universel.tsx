import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { IndicatorGauge } from '../components/IndicatorGauge';
import { ExportBar } from '../components/ExportBar';
import { FormateurView } from '../components/FormateurView';
import { FicheModal } from '../components/FicheModal';
import { FICHES_REFERENTIEL, INDICATEURS_REFERENTIEL } from '../data/referentiel';
import { pdcaCore, ModuleSessionState } from '../lib/pdcaCore';
import { geminiService, ExempleGenereResult } from '../lib/gemini';
import { ContexteParticipant, PhasePDCA, PDCAExport } from '../data/schema';
import {
  Sparkles,
  BookOpen,
  Target,
  Play,
  BarChart3,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface P00Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  modeIA: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P00Universel: React.FC<P00Props> = ({
  contexte,
  pseudo,
  isFormateur,
  modeIA,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P0', pseudo, 1);
    return existing || pdcaCore.initSession('P0', ['M01'], pseudo, 1, contexte);
  });

  const [selectedFicheCode, setSelectedFicheCode] = useState<string>(
    session.fiches[0] || 'M01'
  );
  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiExample, setAiExample] = useState<ExempleGenereResult | null>(null);

  // Détection d'un brouillon existant différent
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const draft = pdcaCore.loadDraft('P0', pseudo, session.cycleNumero);
    if (draft && draft.derniereSauvegarde !== session.derniereSauvegarde) {
      setHasDraft(true);
    }
  }, [pseudo, session.cycleNumero]);

  // Debounced autosave
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      pdcaCore.saveDraft({
        ...session,
        fiches: [selectedFicheCode],
        modeIAActive: modeIA
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, selectedFicheCode, modeIA]);

  const currentFiche = FICHES_REFERENTIEL[selectedFicheCode] || FICHES_REFERENTIEL['M01'];

  const setPhase = (phase: PhasePDCA | 'synthese') => {
    setSession((prev) => ({
      ...prev,
      etapeActuelle: phase === 'synthese' ? 'act' : phase
    }));
  };

  const handleGenerateAiExample = async () => {
    setLoadingAi(true);
    const res = await geminiService.generateP0Example(
      currentFiche.code,
      currentFiche.titre,
      currentFiche.principe,
      contexte.secteur,
      contexte.public_cible
    );
    setAiExample(res);
    setLoadingAi(false);
  };

  // Ajout d'objectif SMART
  const [newSmart, setNewSmart] = useState({
    specifique: '',
    mesurable: '',
    atteignable: '',
    realiste: '',
    temporel: ''
  });

  const addSmartGoal = () => {
    if (!newSmart.specifique.trim()) return;
    setSession((prev) => ({
      ...prev,
      etapes: {
        ...prev.etapes,
        plan: {
          ...prev.etapes?.plan,
          objectifs_smart: [
            ...(prev.etapes?.plan?.objectifs_smart || []),
            { ...newSmart, id: Date.now().toString() }
          ]
        }
      }
    }));
    setNewSmart({ specifique: '', mesurable: '', atteignable: '', realiste: '', temporel: '' });
  };

  // Ajout d'une action Do
  const [newAction, setNewAction] = useState({ action: '', resultat: '' });
  const addActionLog = () => {
    if (!newAction.action.trim()) return;
    const item = {
      horodatage: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      action: newAction.action,
      resultat: newAction.resultat || 'Exécuté'
    };
    setSession((prev) => ({
      ...prev,
      etapes: {
        ...prev.etapes,
        do: {
          ...prev.etapes?.do,
          journal_actions: [...(prev.etapes?.do?.journal_actions || []), item]
        }
      }
    }));
    setNewAction({ action: '', resultat: '' });
  };

  // Gestion des indicateurs Check
  const setKpiValue = (code: string, val: number, cibleVal?: number) => {
    const statut = pdcaCore.kpiStatus(code, val);
    const meta = INDICATEURS_REFERENTIEL[code];
    setSession((prev) => ({
      ...prev,
      etapes: {
        ...prev.etapes,
        check: {
          ...prev.etapes?.check,
          indicateurs: {
            ...prev.etapes?.check?.indicateurs,
            [code]: {
              code,
              nom: meta?.nom || code,
              valeur: val,
              cible: cibleVal,
              unite: meta?.unite || '',
              statut,
              formule: meta?.formule || ''
            }
          }
        }
      }
    }));
  };

  // Ajout de décision Act
  const [newDecision, setNewDecision] = useState('');
  const addDecision = () => {
    if (!newDecision.trim()) return;
    setSession((prev) => ({
      ...prev,
      etapes: {
        ...prev.etapes,
        act: {
          ...prev.etapes?.act,
          decisions: [...(prev.etapes?.act?.decisions || []), newDecision]
        }
      }
    }));
    setNewDecision('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Barre de retour et titre */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onNavigateHub}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Hub</span>
        </button>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          P00 · Atelier PDCA universel
        </span>
      </div>

      {/* Rappel d'anonymisation */}
      <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Objectif de l'atelier : appliquer rigoureusement le cycle PDCA à la méthode choisie.
            <strong> N'utilisez pas de données réelles de clients.</strong>
          </span>
        </div>
        <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
          Cycle N°{session.cycleNumero}
        </span>
      </div>

      {/* Export Bar */}
      <ExportBar
        state={session}
        isSaving={isSaving}
        hasDraftAvailable={hasDraft}
        onImport={(imported: PDCAExport) => {
          setSession((prev) => pdcaCore.importToSession(imported, prev));
          if (imported.fiches?.[0]) setSelectedFicheCode(imported.fiches[0]);
          setHasDraft(false);
        }}
        onResumeDraft={() => {
          const draft = pdcaCore.loadDraft('P0', pseudo, session.cycleNumero);
          if (draft) {
            setSession(draft);
            if (draft.fiches?.[0]) setSelectedFicheCode(draft.fiches[0]);
          }
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P0', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P0', [selectedFicheCode], pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {/* Vue Formateur */}
      {isFormateur && (
        <FormateurView
          timingEstime="selon la fiche (45 à 90 min)"
          objectifsPedagogiques={[
            'Comprendre l\'articulation stricte entre diagnostic (Comprendre), hypothèse (Plan), test (Do), mesure (Check) et décision (Act).',
            'Savoir formuler des objectifs d\'action sous son contrôle direct (non de simples voeux pieux).',
            'Éviter le passage prématuré à l\'action sans validation des critères de mesure.'
          ]}
          reponsesAttendues={[
            'Au moins un objectif SMART chiffré et temporellement verrouillé.',
            'Journal d\'actions documentant des faits précis et horodatés.',
            'Décision d\'ajustement distinguant nettement : ce qu\'on garde, ce qu\'on modifie, ce qu\'on arrête.'
          ]}
          piegesFrequents={[
            'Sauter la phase "Comprendre" pour remplir directement des chiffres fictifs dans "Check".',
            'Considérer que le cycle s\'arrête à la mesure sans prendre d\'engagements fermes pour le cycle suivant.'
          ]}
          conseilsAnimation="Demandez à chaque participant de justifier pourquoi il a choisi cette fiche plutôt qu'une autre. En binôme, faites challenger la robustesse de l'objectif SMART."
        />
      )}

      {/* Progress Bar 5 étapes */}
      <ProgressBar
        currentPhase={session.etapeActuelle}
        onSelectPhase={(phase) => setPhase(phase)}
      />

      {/* ÉTAPE 1 : COMPRENDRE */}
      {session.etapeActuelle === 'comprendre' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Comprendre — Choix de la fiche & Diagnostic de départ"
            subtitle="Sélectionnez la méthode de prospection à travailler pour ce cycle"
            badge="Diagnostic"
            badgeColor="purple"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fiche méthodologique à mobiliser :
                </label>
                <select
                  value={selectedFicheCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedFicheCode(code);
                    setSession((prev) => ({
                      ...prev,
                      fiches: [code]
                    }));
                  }}
                  className="w-full sm:w-auto min-w-[280px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {Object.values(FICHES_REFERENTIEL).map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.code} — {f.titre} ({f.temps_estime})
                    </option>
                  ))}
                </select>
              </div>

              {/* Aperçu de la fiche choisie */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {currentFiche.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {currentFiche.titre}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentFiche.sous_titre}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalFiche(currentFiche.code)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
                  >
                    Voir la fiche complète →
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Principe :</strong> {currentFiche.principe}
                </p>

                {/* Bouton IA optionnel pour exemple contextualisé */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Secteur actif : <strong>{contexte.secteur || 'B2B'}</strong> | Cible : <strong>{contexte.public_cible || 'Prospection'}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={handleGenerateAiExample}
                    disabled={loadingAi}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                    <span>{loadingAi ? 'Génération...' : 'Exemple généré (IA)'}</span>
                  </button>
                </div>

                {/* Rendu de l'exemple généré */}
                {aiExample && (
                  <div className="mt-3 p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-lg text-xs space-y-1.5 text-purple-900 dark:text-purple-200">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Exemple généré (illustration pédagogique) :</span>
                    </div>
                    <p className="italic text-slate-700 dark:text-slate-300">
                      « {aiExample.mise_en_situation} »
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Application :</strong> {aiExample.application_principe}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>Attendu :</strong> {aiExample.resultat_attendu}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes personnelles de diagnostic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mes constats & diagnostic de départ sur cette méthode :
                </label>
                <textarea
                  rows={3}
                  value={session.etapes.comprendre?.notes || ''}
                  onChange={(e) =>
                    setSession((prev) => ({
                      ...prev,
                      etapes: {
                        ...prev.etapes,
                        comprendre: {
                          ...prev.etapes.comprendre,
                          notes: e.target.value
                        }
                      }
                    }))
                  }
                  placeholder="Ex : Je constate que mes créneaux d'appels sont souvent reportés faute de préparation des données en amont..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('plan')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer à la phase Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 2 : PLAN */}
      {session.etapeActuelle === 'plan' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="2. Plan — Définition des Objectifs SMART & Hypothèses"
            subtitle="Planifiez l'expérimentation avant de passer à l'action"
            badge="Planification"
            badgeColor="blue"
          >
            <div className="space-y-5">
              {/* Formulaire SMART */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Ajouter un objectif d'action SMART :</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Spécifique (Quelle action claire sous mon contrôle ?) :
                    </label>
                    <input
                      type="text"
                      value={newSmart.specifique}
                      onChange={(e) => setNewSmart({ ...newSmart, specifique: e.target.value })}
                      placeholder="ex: Contacter 15 cibles DRH sur LinkedIn"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Mesurable (Quel indicateur chiffré ?) :
                    </label>
                    <input
                      type="text"
                      value={newSmart.mesurable}
                      onChange={(e) => setNewSmart({ ...newSmart, mesurable: e.target.value })}
                      placeholder="ex: Au moins 15 messages personnalisés"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Atteignable & Réaliste (Ressources disponibles) :
                    </label>
                    <input
                      type="text"
                      value={newSmart.atteignable}
                      onChange={(e) => setNewSmart({ ...newSmart, atteignable: e.target.value })}
                      placeholder="ex: Fichier qualifié la veille"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Temporel (Créneau & échéance ferme) :
                    </label>
                    <input
                      type="text"
                      value={newSmart.temporel}
                      onChange={(e) => setNewSmart({ ...newSmart, temporel: e.target.value })}
                      placeholder="ex: Mardi de 9h à 10h30"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={addSmartGoal}
                    disabled={!newSmart.specifique.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter cet objectif</span>
                  </button>
                </div>
              </div>

              {/* Liste des objectifs SMART planifiés */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
                  Objectifs planifiés pour ce cycle ({session.etapes.plan?.objectifs_smart?.length || 0}) :
                </h4>
                {(!session.etapes.plan?.objectifs_smart || session.etapes.plan.objectifs_smart.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">
                    Aucun objectif SMART n'a encore été saisi pour ce cycle.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {session.etapes.plan.objectifs_smart.map((obj: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {idx + 1}. {obj.specifique}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                            <span>Mesure : <strong>{obj.mesurable}</strong></span>
                            <span>Échéance : <strong>{obj.temporel}</strong></span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSession((prev) => ({
                              ...prev,
                              etapes: {
                                ...prev.etapes,
                                plan: {
                                  ...prev.etapes?.plan,
                                  objectifs_smart: prev.etapes?.plan?.objectifs_smart?.filter((_: any, i: number) => i !== idx)
                                }
                              }
                            }));
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('comprendre')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour au Diagnostic
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer à la phase Do</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 3 : DO */}
      {session.etapeActuelle === 'do' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="3. Do — Journal d'Action & Exécution sur le terrain"
            subtitle="Consignez les actions réelles effectuées pendant votre session"
            badge="Action"
            badgeColor="emerald"
          >
            <div className="space-y-5">
              {/* Formulaire de saisie d'action */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-emerald-600" />
                  <span>Consigner une action réalisée :</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Action concrète effectuée :
                    </label>
                    <input
                      type="text"
                      value={newAction.action}
                      onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                      placeholder="ex: 8 appels passés sur le créneau du matin"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Résultat immédiat observé :
                    </label>
                    <input
                      type="text"
                      value={newAction.resultat}
                      onChange={(e) => setNewAction({ ...newAction, resultat: e.target.value })}
                      placeholder="ex: 3 joints, 1 RDV qualifié"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={addActionLog}
                    disabled={!newAction.action.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enregistrer dans le journal</span>
                  </button>
                </div>
              </div>

              {/* Journal d'actions */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
                  Journal de bord du cycle ({session.etapes.do?.journal_actions?.length || 0}) :
                </h4>
                {(!session.etapes.do?.journal_actions || session.etapes.do.journal_actions.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">
                    Aucune action consignée pour le moment.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {session.etapes.do.journal_actions.map((act: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                            {act.horodatage}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {act.action}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            {act.resultat}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSession((prev) => ({
                              ...prev,
                              etapes: {
                                ...prev.etapes,
                                do: {
                                  ...prev.etapes?.do,
                                  journal_actions: prev.etapes?.do?.journal_actions?.filter((_: any, i: number) => i !== idx)
                                }
                              }
                            }));
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer à la phase Check</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 4 : CHECK */}
      {session.etapeActuelle === 'check' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="4. Check — Mesure des KPI & Évaluation des Écarts"
            subtitle="Confrontez vos résultats observés avec les seuils du référentiel"
            badge="Mesure"
            badgeColor="amber"
          >
            <div className="space-y-5">
              {/* Saisie rapide des KPI associés à la fiche */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2">
                  Indicateurs liés à la fiche {currentFiche.code} ({currentFiche.kpi_lies.join(', ')}) :
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentFiche.kpi_lies.map((kpiCode) => {
                    const saved = session.etapes.check?.indicateurs?.[kpiCode];
                    const currentVal = saved ? saved.valeur : 0;
                    const currentCible = saved?.cible || 80;

                    return (
                      <div key={kpiCode} className="space-y-2">
                        <IndicatorGauge
                          code={kpiCode}
                          valeur={currentVal}
                          cible={currentCible}
                        />
                        <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <label className="text-slate-600 dark:text-slate-400 font-medium">
                            Valeur constatée :
                          </label>
                          <input
                            type="number"
                            value={currentVal}
                            onChange={(e) =>
                              setKpiValue(kpiCode, parseFloat(e.target.value) || 0, currentCible)
                            }
                            className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                          <label className="text-slate-600 dark:text-slate-400 font-medium ml-2">
                            Cible :
                          </label>
                          <input
                            type="number"
                            value={currentCible}
                            onChange={(e) =>
                              setKpiValue(kpiCode, currentVal, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Analyse des écarts */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Analyse des écarts & points d'amélioration constatés :
                </label>
                <textarea
                  rows={3}
                  value={session.etapes.check?.notes_evaluation || ''}
                  onChange={(e) =>
                    setSession((prev) => ({
                      ...prev,
                      etapes: {
                        ...prev.etapes,
                        check: {
                          ...prev.etapes.check,
                          notes_evaluation: e.target.value
                        }
                      }
                    }))
                  }
                  placeholder="Ex : J'ai tenu 75% des créneaux prévus. L'écart provient des sollicitations internes urgentes du jeudi matin..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour au Do
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('act')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer à la phase Act</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 5 : ACT & SYNTHÈSE */}
      {session.etapeActuelle === 'act' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="5. Act — Décisions d'ancrage & Prochain Cycle PDCA"
            subtitle="Ajustez vos pratiques et préparez le cycle suivant"
            badge="Amélioration"
            badgeColor="rose"
          >
            <div className="space-y-5">
              {/* Ajout de décision */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <RotateCw className="w-4 h-4 text-rose-600" />
                  <span>Consigner une décision d'ajustement :</span>
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newDecision}
                    onChange={(e) => setNewDecision(e.target.value)}
                    placeholder="ex: Sanctuariser le créneau de jeudi en désactivant Slack et les emails dès 8h45"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addDecision}
                    disabled={!newDecision.trim()}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Ajouter
                  </button>
                </div>

                {/* Liste des décisions */}
                {session.etapes.act?.decisions && session.etapes.act.decisions.length > 0 && (
                  <ul className="space-y-1.5 pt-2">
                    {session.etapes.act.decisions.map((d, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{d}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSession((prev) => ({
                              ...prev,
                              etapes: {
                                ...prev.etapes,
                                act: {
                                  ...prev.etapes?.act,
                                  decisions: prev.etapes?.act?.decisions?.filter((_: any, idx: number) => idx !== i) || []
                                }
                              }
                            }));
                          }}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Prochain cycle PDCA */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 space-y-3">
                <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-200">
                  Cap pour mon prochain cycle PDCA (Cycle N°{session.cycleNumero + 1}) :
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Objectif prioritaire du prochain cycle :
                    </label>
                    <input
                      type="text"
                      value={session.etapes.act?.prochain_cycle?.objectif || ''}
                      onChange={(e) =>
                        setSession((prev) => ({
                          ...prev,
                          etapes: {
                            ...prev.etapes,
                            act: {
                              ...prev.etapes?.act,
                              prochain_cycle: {
                                ...prev.etapes?.act?.prochain_cycle,
                                numero: prev.cycleNumero + 1,
                                objectif: e.target.value,
                                fiches_recommandees: prev.etapes?.act?.prochain_cycle?.fiches_recommandees || [],
                                date_cible: prev.etapes?.act?.prochain_cycle?.date_cible || ''
                              }
                            }
                          }
                        }))
                      }
                      placeholder="ex: Augmenter le taux de conversion à 20% en renforçant le pitch CABP"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Date cible de revue (Check) :
                    </label>
                    <input
                      type="date"
                      value={session.etapes.act?.prochain_cycle?.date_cible || ''}
                      onChange={(e) =>
                        setSession((prev) => ({
                          ...prev,
                          etapes: {
                            ...prev.etapes,
                            act: {
                              ...prev.etapes?.act,
                              prochain_cycle: {
                                ...prev.etapes?.act?.prochain_cycle,
                                numero: prev.cycleNumero + 1,
                                objectif: prev.etapes?.act?.prochain_cycle?.objectif || '',
                                fiches_recommandees: prev.etapes?.act?.prochain_cycle?.fiches_recommandees || [],
                                date_cible: e.target.value
                              }
                            }
                          }
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Synthèse finale & Export */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                      Cycle N°{session.cycleNumero} complété avec succès !
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const exp = pdcaCore.buildExport(session, 'cycle');
                      pdcaCore.exportJSON(exp);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Télécharger l'export JSON du cycle
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Votre fichier JSON pourra être rechargé pour le cycle suivant ou analysé dans le module <strong>P13 (Comparateur de résultats)</strong>.
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
                  onClick={onNavigateHub}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Terminer & Retourner au Hub
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal d'affichage de fiche */}
      <FicheModal
        ficheCode={modalFiche}
        onClose={() => setModalFiche(null)}
      />
    </div>
  );
};
