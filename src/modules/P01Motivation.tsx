import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { IndicatorGauge } from '../components/IndicatorGauge';
import { ExportBar } from '../components/ExportBar';
import { FormateurView } from '../components/FormateurView';
import { FicheModal } from '../components/FicheModal';
import { pdcaCore, ModuleSessionState } from '../lib/pdcaCore';
import { ContexteParticipant, PhasePDCA, PDCAExport } from '../data/schema';
import {
  Flame,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Target,
  Sparkles,
  Award
} from 'lucide-react';

interface P01Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

const QUIZ_STATEMENTS = [
  // Maslow - Sécurité & Continuité (1-3)
  { id: 1, axe: 'securite', text: 'Je crains que mes démarches de prospection échouent et compromettent mes résultats financiers à court terme.' },
  { id: 2, axe: 'securite', text: 'J\'ai besoin de savoir exactement ce que je vais dire avant de décrocher le téléphone, sinon je reporte.' },
  { id: 3, axe: 'securite', text: 'Le risque de déranger un prospect me pèse plus que l\'opportunité de décrocher un rendez-vous.' },
  // Maslow - Estime & Reconnaissance (4-6)
  { id: 4, axe: 'estime', text: 'Un rejet ou une réponse sèche d\'un prospect affecte directement mon estime personnelle et mon humeur.' },
  { id: 5, axe: 'estime', text: 'J\'aimerais être davantage reconnu par mes pairs et ma direction pour ma rigueur de prospection.' },
  { id: 6, axe: 'estime', text: 'Je suis très attentif à l\'image professionnelle que je renvoie lors d\'une prise de contact.' },
  // Deci & Ryan - Autonomie (7-8)
  { id: 7, axe: 'autonomie', text: 'J\'ai une réelle liberté dans le choix de mes cibles, de mes canaux et de mon calendrier d\'action.' },
  { id: 8, axe: 'autonomie', text: 'Je prospecte parce que j\'en perçois la valeur stratégique, non uniquement par obligation hiérarchique.' },
  // Deci & Ryan - Compétence & Maîtrise (9-10)
  { id: 9, axe: 'competence', text: 'Je me sens techniquement outillé pour répondre avec aisance aux objections courantes des prospects.' },
  { id: 10, axe: 'competence', text: 'Je sais analyser mes échecs d\'appels pour progresser au lieu de me décourager.' },
  // Deci & Ryan - Affiliation (11-12)
  { id: 11, axe: 'affiliation', text: 'J\'ai des collègues ou un mentor avec qui débriefer ouvertement mes succès et difficultés en prospection.' },
  { id: 12, axe: 'affiliation', text: 'Je ressens un vrai lien d\'entraide dans mon équipe lors des sessions collectives de prospection.' }
];

export const P01Motivation: React.FC<P01Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P1', pseudo, 1);
    return existing || pdcaCore.initSession('P1', ['M01', 'M02', 'M03'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Réponses du quiz (note de 1 = Pas du tout d'accord à 5 = Tout à fait d'accord)
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    return session.etapes.comprendre?.quiz_scores || {};
  });

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
            quiz_scores: answers
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, answers]);

  // Calculs des scores par axe
  const calculateScores = () => {
    const getAvg = (ids: number[]) => {
      const vals = ids.map((id) => answers[id] || 3);
      const sum = vals.reduce((a, b) => a + b, 0);
      return Math.round((sum / ids.length) * 10) / 10;
    };

    const securite = getAvg([1, 2, 3]);
    const estime = getAvg([4, 5, 6]);
    const autonomie = getAvg([7, 8]);
    const competence = getAvg([9, 10]);
    const affiliation = getAvg([11, 12]);

    // Indice de motivation intrinsèque K11 (sur base 100)
    const k11 = Math.round(((autonomie + competence + affiliation) / 15) * 100);

    return { securite, estime, autonomie, competence, affiliation, k11 };
  };

  const scores = calculateScores();

  // Mise à jour de K11 et K01 dans Check
  useEffect(() => {
    const statusK11 = pdcaCore.kpiStatus('K11', scores.k11);
    setSession((prev) => ({
      ...prev,
      etapes: {
        ...prev.etapes,
        check: {
          ...prev.etapes?.check,
          indicateurs: {
            ...prev.etapes?.check?.indicateurs,
            K11: {
              code: 'K11',
              nom: 'Indice de motivation intrinsèque (Deci & Ryan)',
              valeur: scores.k11,
              unite: '/100',
              cible: 75,
              statut: statusK11,
              formule: 'Moyenne composite (Autonomie + Compétence + Affiliation) / 15 × 100'
            },
            K01: prev.etapes?.check?.indicateurs?.K01 || {
              code: 'K01',
              nom: 'Taux d\'engagement sur créneaux',
              valeur: 85,
              unite: '%',
              cible: 85,
              statut: 'vert',
              formule: '(Créneaux tenus / Créneaux planifiés) × 100'
            }
          }
        }
      }
    }));
  }, [answers]);

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
        <div className="flex items-center gap-2">
          {session.fiches.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onOpenFiche(f)}
              className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Export Bar */}
      <ExportBar
        state={session}
        isSaving={isSaving}
        hasDraftAvailable={hasDraft}
        onImport={(imported) => {
          setSession((prev) => pdcaCore.importToSession(imported, prev));
          if (imported.etapes.comprendre?.quiz_scores) {
            setAnswers(imported.etapes.comprendre.quiz_scores);
          }
          setHasDraft(false);
        }}
        onResumeDraft={() => {
          const draft = pdcaCore.loadDraft('P1', pseudo, session.cycleNumero);
          if (draft) {
            setSession(draft);
            if (draft.etapes.comprendre?.quiz_scores) setAnswers(draft.etapes.comprendre.quiz_scores);
          }
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P1', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P1', ['M01', 'M02', 'M03'], pseudo, 1, contexte));
          setAnswers({});
          setHasDraft(false);
        }}
      />

      {/* Vue Formateur */}
      {isFormateur && (
        <FormateurView
          timingEstime="80 min"
          objectifsPedagogiques={[
            'Détecter si les blocages relèvent d\'un besoin de sécurité (peur de l\'échec/rejet) ou d\'un déficit d\'autonomie/compétence.',
            'Relier l\'indice K11 à la pérennité de l\'effort commercial.',
            'Co-construire au moins 1 engagement SMART sous le contrôle direct du prospecteur.'
          ]}
          reponsesAttendues={[
            'Score K11 calculé avec identification explicite du levier le plus bas.',
            'Un engagement SMART exempt de voeu pieux (ex: "Je passerai 12 appels" plutôt que "Je ferai de mon mieux").'
          ]}
          piegesFrequents={[
            'Prescrire des cadences élevées à un apprenant ayant un score de Sécurité très anxiogène (> 4/5).',
            'Confondre motivation extrinsèque (prime, peur du chef) et motivation intrinsèque pérenne.'
          ]}
          conseilsAnimation="Faites passer le quiz en silence (10 min). Invitez ensuite les apprenants à partager en binôme l'affirmation qui les a le plus surpris."
        />
      )}

      {/* Progress Bar */}
      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : COMPRENDRE (QUIZ 12 AFFIRMATIONS) */}
      {session.etapeActuelle === 'comprendre' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Comprendre — Diagnostic motivationnel (Quiz en 12 affirmations)"
            subtitle="Évaluez chaque affirmation de 1 (Pas du tout d'accord) à 5 (Tout à fait d'accord)"
            badge="M01 · M02"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="space-y-4">
                {QUIZ_STATEMENTS.map((q) => {
                  const val = answers[q.id] || 3;
                  return (
                    <div
                      key={q.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {q.id}. {q.text}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold shrink-0">
                          {val} / 5
                        </span>
                      </div>

                      {/* Slider 1 à 5 avec libellés */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">1 (Non)</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={val}
                          onChange={(e) =>
                            setAnswers({ ...answers, [q.id]: parseInt(e.target.value, 10) })
                          }
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-400">5 (Oui)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rendu des 5 axes */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Profil motivationnel calculé :
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500">Sécurité (M01)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {scores.securite}/5
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {scores.securite >= 3.5 ? '⚠️ Anxiété forte' : 'Serein'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500">Estime (M01)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {scores.estime}/5
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {scores.estime >= 3.5 ? 'Sensibilité rejet' : 'Équilibré'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500">Autonomie (M02)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {scores.autonomie}/5
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {scores.autonomie < 3 ? 'Contraint' : 'Libre'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500">Compétence (M02)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {scores.competence}/5
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {scores.competence < 3 ? 'À consolider' : 'Maîtrisé'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-500">Affiliation (M02)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {scores.affiliation}/5
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {scores.affiliation < 3 ? 'Isolé' : 'Soutenu'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Indice K11 calculé (Motivation intrinsèque) :{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400">{scores.k11} / 100</strong>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Cible saine ≥ 75/100
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('plan')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer aux engagements SMART (Plan)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 2 : PLAN (ENGAGEMENT SMART M03) */}
      {session.etapeActuelle === 'plan' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="2. Plan — Engagement SMART anti-procrastination"
            subtitle="Conformément à la fiche M03, engagez une action sous votre contrôle direct"
            badge="M03 SMART"
            badgeColor="blue"
          >
            <div className="space-y-5 text-xs">
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-900 dark:text-blue-200">
                <strong>Règle d'or M03 :</strong> Ne fixez pas un objectif de résultat que vous ne contrôlez pas (ex: "Décrocher 4 contrats"), mais un <strong>objectif d'action direct</strong> (ex: "Passer 20 appels qualifiés mardi entre 9h et 11h").
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mon engagement d'action SMART prioritaire :
                  </label>
                  <textarea
                    rows={3}
                    value={session.etapes.plan?.objectifs_smart?.[0]?.specifique || ''}
                    onChange={(e) =>
                      setSession((prev) => ({
                        ...prev,
                        etapes: {
                          ...prev.etapes,
                          plan: {
                            ...prev.etapes.plan,
                            objectifs_smart: [
                              {
                                id: '1',
                                specifique: e.target.value,
                                mesurable: 'Créneau 100% tenu sans report',
                                atteignable: 'Fichier prêt la veille',
                                realiste: 'Adapté au temps disponible',
                                temporel: 'Cette semaine'
                              }
                            ]
                          }
                        }
                      }))
                    }
                    placeholder="Ex : Je m'engage à tenir 2 blocs de 25 minutes de prospection téléphonique mardi de 9h30 à 10h30 sans consulter mes emails."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('comprendre')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour au Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer à l'action (Do)</span>
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
            title="3. Do — Tenue de l'engagement & Journal des micro-victoires"
            subtitle="Tracez la réalisation concrète de votre créneau"
            badge="Do"
            badgeColor="emerald"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200">
                L'action est le meilleur antidote contre l'anxiété. Avez-vous respecté votre créneau engagé ?
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Comment s'est déroulé ce créneau d'action ?
                </label>
                <textarea
                  rows={3}
                  value={session.etapes.do?.journal_actions?.[0]?.action || ''}
                  onChange={(e) =>
                    setSession((prev) => ({
                      ...prev,
                      etapes: {
                        ...prev.etapes,
                        do: {
                          ...prev.etapes.do,
                          journal_actions: [
                            {
                              horodatage: new Date().toLocaleTimeString('fr-FR'),
                              action: e.target.value,
                              resultat: 'Réalisé'
                            }
                          ]
                        }
                      }
                    }))
                  }
                  placeholder="Ex : J'ai passé 14 appels. 4 contacts joints, 1 premier échange programmé jeudi à 14h. J'ai ressenti un peu de stress avant le premier appel puis la fluidité est revenue."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
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
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer à la mesure (Check)</span>
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
            title="4. Check — Mesure des KPI de motivation"
            subtitle="Vérifiez les indicateurs K01 et K11 pour ce cycle"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IndicatorGauge
                  code="K11"
                  valeur={scores.k11}
                  cible={75}
                  unite="/100"
                />
                <IndicatorGauge
                  code="K01"
                  valeur={session.etapes.check?.indicateurs?.K01?.valeur || 85}
                  cible={85}
                  unite="%"
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
                  <span>Passer aux ajustements (Act)</span>
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
            title="5. Act — Ancrage du rituel & Prochain cycle"
            subtitle="Consolidez vos acquis motivationnels pour le cycle suivant"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Décision d'ancrage pour le Cycle N°{session.cycleNumero + 1} :
                </h4>
                <textarea
                  rows={2}
                  value={session.etapes.act?.decisions?.[0] || ''}
                  onChange={(e) =>
                    setSession((prev) => ({
                      ...prev,
                      etapes: {
                        ...prev.etapes,
                        act: {
                          ...prev.etapes.act,
                          decisions: [e.target.value]
                        }
                      }
                    }))
                  }
                  placeholder="Ex : Pour maintenir mon autonomie et baisser la peur du rejet, j'alternerai 20 min d'appels et 20 min de messages vidéo personnalisés chaque mardi."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
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
                  Exporter le cycle JSON & Terminer
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Fiche */}
      <FicheModal ficheCode={modalFiche} onClose={() => setModalFiche(null)} />
    </div>
  );
};
