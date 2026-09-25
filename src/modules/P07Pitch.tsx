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
  Mic,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Sparkles,
  FileText
} from 'lucide-react';

interface P07Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P07Pitch: React.FC<P07Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P7', pseudo, 1);
    return existing || pdcaCore.initSession('P7', ['M13', 'M14', 'M15'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Méthode CABP (M13)
  const [cabp, setCabp] = useState({
    c: 'Méthodologie d\'amélioration continue PDCA appliquée à la prospection',
    a: 'Permet d\'éliminer les gaspillages de temps et de standardiser les meilleures pratiques',
    b: 'Vous sécurisez au moins 2 nouveaux clients récurrents par mois sans travailler plus d\'heures',
    p: 'Testé et mesuré sur plus de 150 entreprises de services avec les 15 indicateurs clés'
  });

  // Pitch Elevator 30s / 60s (M15)
  const [pitch30s, setPitch30s] = useState(
    `Bonjour. Les dirigeants me confient souvent que la prospection est la tâche la plus anxiogène et la plus repoussée de leur semaine, ce qui crée des creux de trésorerie dangereux. Chez nous, nous appliquons la méthode PDCA pour sanctuariser 2 heures protégées par semaine et doubler le taux de transformation, avec indicateurs mesurables dès J+15. Auriez-vous 10 minutes mardi à 9h30 pour voir comment appliquer ce cadre à votre équipe ?`
  );

  // Mode Prompteur & Minuteur de répétition (30s / 60s / 90s)
  const [prompterDuration, setPrompterDuration] = useState<number>(30);
  const [prompterTimeLeft, setPrompterTimeLeft] = useState<number>(30);
  const [isPrompterRunning, setIsPrompterRunning] = useState<boolean>(false);

  useEffect(() => {
    let int: any = null;
    if (isPrompterRunning && prompterTimeLeft > 0) {
      int = setInterval(() => setPrompterTimeLeft((p) => p - 1), 1000);
    } else if (prompterTimeLeft === 0) {
      setIsPrompterRunning(false);
    }
    return () => clearInterval(int);
  }, [isPrompterRunning, prompterTimeLeft]);

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
            cabp,
            pitch_30s: pitch30s
          },
          do: {
            ...session.etapes.do,
            donnees_brutes: {
              pitch_30s: pitch30s,
              cabp_list: [cabp]
            }
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K13: {
                code: 'K13',
                nom: 'Taux de rétention de l\'attention en pitch',
                valeur: 68,
                unite: '%',
                cible: 65,
                statut: 'vert',
                formule: '(Échanges > 90s / Appels décrochés) × 100'
              },
              K14: {
                code: 'K14',
                nom: 'Précision de détection du profil SONCAS',
                valeur: 75,
                unite: '%',
                cible: 75,
                statut: 'vert',
                formule: '(Profils correctement validés / Entretiens) × 100'
              }
            }
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, cabp, pitch30s]);

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
        <span className="font-mono text-xs text-slate-500">P07 · Studio de pitch</span>
      </div>

      <ExportBar
        state={session}
        isSaving={isSaving}
        hasDraftAvailable={hasDraft}
        onImport={(imported) => {
          setSession((prev) => pdcaCore.importToSession(imported, prev));
          // Vérifier si import depuis P6
          if (imported.application === 'P6') {
            const transformed = pdcaCore.transformP6ToP7(imported);
            setCabp((prev) => ({
              ...prev,
              b: transformed.gains[0] || prev.b,
              p: transformed.argumentsVrio[0] || prev.p
            }));
          }
          setHasDraft(false);
        }}
        onResumeDraft={() => {
          const draft = pdcaCore.loadDraft('P7', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P7', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P7', ['M13', 'M14', 'M15'], pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="90 min"
          objectifsPedagogiques={[
            'Distinguer un avantage d\'un bénéfice prouvé (CABP) : le bénéfice parle au client, la preuve fait taire le scepticisme.',
            'Maîtriser le tempo d\'un elevator pitch de 30 secondes (120 à 140 mots/minute).',
            'Savoir importer un fichier P6 pour vérifier l\'alignement entre la valeur et le verbe.'
          ]}
          reponsesAttendues={[
            'CABP complet avec preuve vérifiable.',
            'Pitch 30s commençant impérativement par le problème du prospect.',
            'Un seul Call to Action précis (date + heure).'
          ]}
          piegesFrequents={[
            'Vouloir vendre toute l\'offre dans le premier appel au lieu de vendre uniquement le rendez-vous.',
            'Parler trop vite et déborder le chronomètre de 30 secondes.'
          ]}
          conseilsAnimation="Mettez les apprenants en binômes avec le mode prompteur activé. Chronométrez et notez les tics de langage."
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : PLAN (CABP & SIMAC) */}
      {session.etapeActuelle === 'comprendre' || session.etapeActuelle === 'plan' ? (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Plan — Atelier CABP (M13) & Structuration de l'Accroche"
            subtitle="Transformez vos fonctionnalités en bénéfices prouvés indiscutables"
            badge="M13 · M15"
            badgeColor="blue"
          >
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    C — Caractéristique (Fait technique ou méthodologique objectif) :
                  </label>
                  <textarea
                    rows={2}
                    value={cabp.c}
                    onChange={(e) => setCabp({ ...cabp, c: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    A — Avantage (Ce que la caractéristique permet concrètement) :
                  </label>
                  <textarea
                    rows={2}
                    value={cabp.a}
                    onChange={(e) => setCabp({ ...cabp, a: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-indigo-700 dark:text-indigo-300 block">
                    B — Bénéfice (Gain personnel, temporel ou financier pour le prospect) :
                  </label>
                  <textarea
                    rows={2}
                    value={cabp.b}
                    onChange={(e) => setCabp({ ...cabp, b: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-200 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-emerald-700 dark:text-emerald-300 block">
                    P — Preuve (Chiffre formel, label, retour d'expérience vérifiable) :
                  </label>
                  <textarea
                    rows={2}
                    value={cabp.p}
                    onChange={(e) => setCabp({ ...cabp, p: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 font-medium"
                  />
                </div>
              </div>

              {/* Rédacteur du pitch 30s */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Texte de mon Elevator Pitch 30s (M15) :</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Longueur : <strong>{pitch30s.split(/\s+/).length} mots</strong> (Idéal : 65-75 mots)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={pitch30s}
                  onChange={(e) => setPitch30s(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer au mode Répétition / Prompteur (Do)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* ÉTAPE 2 : DO (PROMPTEUR INTERACTIF MINUTÉ) */}
      {session.etapeActuelle === 'do' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="2. Do — Mode Répétition Prompteur & Débit vocal (M15)"
            subtitle="Entraînez-vous à voix haute avec le compte à rebours pour calibrer votre rythme"
            badge="Do Prompteur"
            badgeColor="emerald"
          >
            <div className="space-y-6 text-xs">
              {/* Sélecteur de durée & Minuteur */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Format :</span>
                  {[30, 60, 90].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        setPrompterDuration(sec);
                        setPrompterTimeLeft(sec);
                        setIsPrompterRunning(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        prompterDuration === sec
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {sec} secondes
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="font-mono text-3xl font-black text-white">
                    00:{prompterTimeLeft < 10 ? '0' : ''}{prompterTimeLeft}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrompterRunning(!isPrompterRunning)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      isPrompterRunning
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {isPrompterRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPrompterRunning ? 'Pause' : 'Lancer le pitch'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrompterRunning(false);
                      setPrompterTimeLeft(prompterDuration);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Écran Prompteur grand format */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-relaxed font-medium">
                {pitch30s}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('plan')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour au Texte
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer aux KPI de rétention (Check)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 3 : CHECK */}
      {session.etapeActuelle === 'check' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="3. Check — Mesure de la rétention d'attention (K13 & K14)"
            subtitle="Analysez la tenue de l'échange au-delà des 90 premières secondes"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IndicatorGauge code="K13" valeur={68} cible={65} unite="%" />
                <IndicatorGauge code="K14" valeur={75} cible={75} unite="%" />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour à la Répétition
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

      {/* ÉTAPE 4 : ACT */}
      {session.etapeActuelle === 'act' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="4. Act — Ancrage & Transfert vers SONCAS (P10)"
            subtitle="Votre pitch est prêt pour la confrontation aux objections réelles"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-emerald-950 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pitch verrouillé et chronométré avec succès !</span>
                </div>
                <p>
                  Exportez votre session pour injecter directement vos arguments CABP dans le <strong>simulateur SONCAS (P10)</strong>.
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
