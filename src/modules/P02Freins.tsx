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
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Scale,
  Plus,
  Trash2,
  Trophy,
  HelpCircle
} from 'lucide-react';

interface P02Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P02Freins: React.FC<P02Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P2', pseudo, 1);
    return existing || pdcaCore.initSession('P2', ['M04', 'M05'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Étape Prochaska (M04)
  const [stageProchaska, setStageProchaska] = useState<string>(
    session.etapes.comprendre?.stage_prochaska || 'preparation'
  );

  // Pratique ciblée
  const [pratique, setPratique] = useState<string>(
    session.etapes.comprendre?.pratique || 'Prospection téléphonique directe B2B'
  );

  // Balance décisionnelle (M05)
  const [balance, setBalance] = useState({
    coutsStatuQuo: session.etapes.plan?.balance?.coutsStatuQuo || 'Pipeline vide dans 2 mois, anxiété permanente face au CA',
    beneficesStatuQuo: session.etapes.plan?.balance?.beneficesStatuQuo || 'Confort immédiat, évitement du sentiment de rejet',
    coutsChangement: session.etapes.plan?.balance?.coutsChangement || 'Stress avant le 1er appel, temps de préparation à bloquer',
    beneficesChangement: session.etapes.plan?.balance?.beneficesChangement || '2 nouveaux clients réguliers/mois, autonomie financière retrouvée'
  });

  // Échelle de confiance (1 à 10)
  const [confidenceScore, setConfidenceScore] = useState<number>(
    session.etapes.plan?.confidence_score || 7
  );

  // Journal des victoires (K10)
  const [victoires, setVictoires] = useState<string[]>(
    session.etapes.do?.victoires || ['J\'ai décroché et fait sonner 10 fois sans raccrocher', 'J\'ai reformulé l\'objection sans me braquer']
  );
  const [newVictoire, setNewVictoire] = useState('');

  // Autosave
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      pdcaCore.saveDraft({
        ...session,
        etapes: {
          ...session.etapes,
          comprendre: {
            ...session.etapes.comprendre,
            stage_prochaska: stageProchaska,
            pratique
          },
          plan: {
            ...session.etapes.plan,
            balance,
            confidence_score: confidenceScore
          },
          do: {
            ...session.etapes.do,
            victoires
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K09: {
                code: 'K09',
                nom: 'Score moyen de confiance / sérénité',
                valeur: confidenceScore,
                unite: '/10',
                cible: 8,
                statut: pdcaCore.kpiStatus('K09', confidenceScore),
                formule: 'Auto-évaluation sur l\'échelle de confiance (1 à 10)'
              },
              K10: {
                code: 'K10',
                nom: 'Victoires commerciales enregistrées',
                valeur: victoires.length,
                unite: 'victoires',
                cible: 5,
                statut: pdcaCore.kpiStatus('K10', victoires.length),
                formule: 'Nombre d\'avancées consignées dans le journal des succès'
              },
              K01: {
                code: 'K01',
                nom: 'Taux d\'engagement sur créneaux',
                valeur: confidenceScore >= 7 ? 90 : 60,
                unite: '%',
                cible: 85,
                statut: pdcaCore.kpiStatus('K01', confidenceScore >= 7 ? 90 : 60),
                formule: '(Créneaux tenus / Créneaux planifiés) × 100'
              }
            }
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, stageProchaska, pratique, balance, confidenceScore, victoires]);

  const addVictoire = () => {
    if (!newVictoire.trim()) return;
    setVictoires([...victoires, newVictoire.trim()]);
    setNewVictoire('');
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
        <span className="font-mono text-xs text-slate-500">P02 · Lever mes freins</span>
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
          const draft = pdcaCore.loadDraft('P2', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P2', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P2', ['M04', 'M05'], pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="65 min"
          objectifsPedagogiques={[
            'Désamorcer la culpabilité en identifiant l\'étape exacte de changement de Prochaska.',
            'Faire verbaliser les coûts de l\'inaction (statu quo) souvent sous-estimés.',
            'Vérifier que si la confiance < 7/10, l\'apprenant réduit immédiatement la difficulté de l\'action.'
          ]}
          reponsesAttendues={[
            'Balance décisionnelle équilibrée avec reconnaissance lucide des coûts du statu quo.',
            'Score de confiance ≥ 7/10 après ajustement de la difficulté.',
            'Au moins 2 victoires réelles consignées.'
          ]}
          piegesFrequents={[
            'Pousser à l\'action forcée un apprenant en précontemplation.',
            'Laisser un apprenant planifier un objectif avec un score de confiance à 4/10 sans le simplifier.'
          ]}
          conseilsAnimation="Demandez : « Pourquoi avoir mis 6 et pas 4 ? » Cela oblige l'apprenant à trouver en lui-même les raisons de sa compétence déjà acquise."
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : COMPRENDRE (PROCHASKA) */}
      {session.etapeActuelle === 'comprendre' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Comprendre — Diagnostic de mon stade de changement"
            subtitle="Modèle transthéorique de Prochaska (M04)"
            badge="M04"
            badgeColor="amber"
          >
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pratique de prospection qui me pose une difficulté ou un frein :
                </label>
                <input
                  type="text"
                  value={pratique}
                  onChange={(e) => setPratique(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  À quelle étape de transition vous situez-vous par rapport à cette pratique ?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'precontemplation', title: '1. Précontemplation', desc: '« Je ne vois pas le problème, je n\'ai pas besoin de prospecter. »' },
                    { id: 'contemplation', title: '2. Contemplation', desc: '« Je sais que je devrais le faire, mais j\'hésite et je reporte sans cesse. »' },
                    { id: 'preparation', title: '3. Préparation', desc: '« J\'ai décidé d\'agir cette semaine, je prépare mes listes et mes outils. »' },
                    { id: 'action', title: '4. Action', desc: '« Je suis en train de prospecter activement et d\'expérimenter mes créneaux. »' },
                    { id: 'maintien', title: '5. Maintien', desc: '« La prospection est un rituel régulier installé depuis plusieurs semaines. »' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStageProchaska(st.id)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        stageProchaska === st.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-xs font-semibold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{st.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('plan')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer à la Balance décisionnelle (Plan)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 2 : PLAN (BALANCE DÉCISIONNELLE + ÉCHELLE DE CONFIANCE) */}
      {session.etapeActuelle === 'plan' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="2. Plan — Balance décisionnelle & Échelle de confiance (M05)"
            subtitle="Pesez les coûts réels de l'inaction et ajustez la difficulté de l'action"
            badge="M05"
            badgeColor="blue"
          >
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1.5">
                  <label className="font-bold text-rose-900 dark:text-rose-300 block">
                    Coûts du statu quo (Que me coûte le fait de ne PAS prospecter ?) :
                  </label>
                  <textarea
                    rows={2}
                    value={balance.coutsStatuQuo}
                    onChange={(e) => setBalance({ ...balance, coutsStatuQuo: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Bénéfices du statu quo (Quel confort immédiat cela me procure-t-il ?) :
                  </label>
                  <textarea
                    rows={2}
                    value={balance.beneficesStatuQuo}
                    onChange={(e) => setBalance({ ...balance, beneficesStatuQuo: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1.5">
                  <label className="font-bold text-amber-900 dark:text-amber-300 block">
                    Coûts du changement (Quel effort me demande le passage à l'action ?) :
                  </label>
                  <textarea
                    rows={2}
                    value={balance.coutsChangement}
                    onChange={(e) => setBalance({ ...balance, coutsChangement: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl space-y-1.5">
                  <label className="font-bold text-emerald-900 dark:text-emerald-300 block">
                    Bénéfices du changement (Quels gains tangibles vais-je obtenir ?) :
                  </label>
                  <textarea
                    rows={2}
                    value={balance.beneficesChangement}
                    onChange={(e) => setBalance({ ...balance, beneficesChangement: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Échelle de confiance */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white">
                    Échelle de confiance d'exécution (1 à 10) :
                  </label>
                  <span className="font-mono text-base font-black px-2.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {confidenceScore} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={confidenceScore}
                  onChange={(e) => setConfidenceScore(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Incapable d'agir)</span>
                  <span>7 (Seuil d'action recommandé)</span>
                  <span>10 (Confiance totale)</span>
                </div>

                {confidenceScore < 7 && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-lg text-xs">
                    ⚠️ <strong>Règle M05 :</strong> Votre score est inférieur à 7/10. Réduisez immédiatement la difficulté de l'engagement (ex: faire 5 appels au lieu de 20, ou envoyer 3 messages personnalisés) jusqu'à atteindre au moins 7.
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
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
                  <span>Passer au journal des succès (Do)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 3 : DO (JOURNAL DES VICTOIRES K10) */}
      {session.etapeActuelle === 'do' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="3. Do — Journal des Victoires Commerciales (K10)"
            subtitle="Célébrez chaque geste de progrès pour ancrer la confiance"
            badge="Do"
            badgeColor="emerald"
          >
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newVictoire}
                  onChange={(e) => setNewVictoire(e.target.value)}
                  placeholder="ex: J'ai osé rappeler le prospect qui m'avait dit 'pas le temps' mardi dernier"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addVictoire}
                  disabled={!newVictoire.trim()}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Ajouter une victoire
                </button>
              </div>

              <div className="space-y-2">
                {victoires.map((vic, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{vic}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVictoires(victoires.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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
                  <span>Passer aux KPI (Check)</span>
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
            title="4. Check — Indicateurs de Sérénité et Victoires"
            subtitle="Mesure des KPI K01, K09 et K10"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <IndicatorGauge code="K09" valeur={confidenceScore} cible={8} unite="/10" />
                <IndicatorGauge code="K10" valeur={victoires.length} cible={5} unite="victoires" />
                <IndicatorGauge code="K01" valeur={confidenceScore >= 7 ? 90 : 60} cible={85} unite="%" />
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
                  <span>Passer à l'amélioration (Act)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 5 : ACT */}
      {session.etapeActuelle === 'act' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="5. Act — Capitalisation & Prochain Cycle"
            subtitle="Verrouillez la routine anti-freins"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Vous avez identifié vos freins profonds et rééquilibré la balance décisionnelle.
                Enregistrez votre export pour mesurer vos progrès au prochain cycle.
              </p>

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
