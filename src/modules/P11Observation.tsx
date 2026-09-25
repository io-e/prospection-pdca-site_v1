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
  Headphones,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Users,
  MessageSquare,
  FileCheck
} from 'lucide-react';

interface CritereObs {
  id: string;
  nom: string;
  desc: string;
  noteObs1: number; // 1 à 4
  noteObs2: number; // 1 à 4
}

const DEFAULT_CRITERIA: CritereObs[] = [
  { id: '1', nom: 'Accroche initiale (30s)', desc: 'Clarté, débit posé, le problème du prospect posé dès la 2e phrase', noteObs1: 3, noteObs2: 3 },
  { id: '2', nom: 'Écoute active & Reformulation', desc: 'Ratio de parole prospect > 60%, pas d\'interruption intempestive', noteObs1: 4, noteObs2: 3 },
  { id: '3', nom: 'Découverte des besoins & Budget', desc: 'Questions ouvertes de cadrage posées avec tact', noteObs1: 3, noteObs2: 3 },
  { id: '4', nom: 'Traitement des objections', desc: 'Écouter, accuser réception, isoler et répondre sans contredire', noteObs1: 2, noteObs2: 2 },
  { id: '5', nom: 'Pertinence du pitch CABP', desc: 'Avantage relié à un bénéfice client prouvé par un chiffre concret', noteObs1: 3, noteObs2: 4 },
  { id: '6', nom: 'Prise de rendez-vous ferme', desc: 'Proposition alternative de 2 créneaux d\'agenda précis', noteObs1: 4, noteObs2: 4 }
];

interface P11Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P11Observation: React.FC<P11Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P11', pseudo, 1);
    return existing || pdcaCore.initSession('P11', ['M20', 'M21'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Grille multicritères
  const [criteres, setCriteres] = useState<CritereObs[]>(
    session.etapes.do?.donnees_brutes?.criteres || DEFAULT_CRITERIA
  );

  // Débriefing COIN (M21)
  const [coin, setCoin] = useState({
    c: session.etapes.act?.debrief_coin?.c || 'Appel de prospection de mardi 10h15 avec le Directeur Logistique',
    o: session.etapes.act?.debrief_coin?.o || 'À la 2e minute, lorsque le prospect a dit « nous n\'avons pas de budget », tu as immédiatement proposé une remise de 20% sans questionner.',
    i: session.etapes.act?.debrief_coin?.i || 'Le prospect a conclu que ton prix initial était artificiel et a écourté l\'échange.',
    n: session.etapes.act?.debrief_coin?.n || 'Au prochain appel, nous appliquerons la question miroir : « Qu\'entendez-vous par pas de budget ? » pour faire expliciter le contexte.'
  });

  // Calcul du coefficient Kappa de Cohen (K15)
  const calculateKappa = () => {
    let agreements = 0;
    criteres.forEach((c) => {
      if (c.noteObs1 === c.noteObs2) agreements++;
    });
    const po = agreements / criteres.length;
    const pe = 0.25; // 4 niveaux de notation (1 chance sur 4 par pur hasard)
    const kappa = (po - pe) / (1 - pe);
    return Math.round(kappa * 100) / 100;
  };

  const kappaVal = calculateKappa();

  // Autosave
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      pdcaCore.saveDraft({
        ...session,
        etapes: {
          ...session.etapes,
          do: {
            ...session.etapes.do,
            donnees_brutes: { criteres }
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K15: {
                code: 'K15',
                nom: 'Indice de concordance inter-observateurs (Kappa)',
                valeur: kappaVal,
                unite: 'score',
                cible: 0.7,
                statut: pdcaCore.kpiStatus('K15', kappaVal),
                formule: 'Coefficient Kappa de Cohen : (Po - Pe) / (1 - Pe)'
              }
            }
          },
          act: {
            ...session.etapes.act,
            debrief_coin: coin
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, criteres, coin, kappaVal]);

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
        <span className="font-mono text-xs text-slate-500">P11 · Grille d'observation + COIN</span>
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
          const draft = pdcaCore.loadDraft('P11', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P11', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P11', ['M20', 'M21'], pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="60 min"
          objectifsPedagogiques={[
            'Supprimer la subjectivité du jugement lors de la double écoute grâce à la grille multicritères standardisée (M20).',
            'Mesurer l\'accord inter-juges via le Kappa de Cohen (K15 ≥ 0.70).',
            'Maîtriser la méthode COIN : bannir les jugements de valeur au profit de faits datés et indiscutables.'
          ]}
          reponsesAttendues={[
            'Grille notée de 1 à 4 pour chaque critère par les deux observateurs.',
            'Kappa calculé et interprété.',
            'Restitution COIN complète avec engagement sur le Next step.'
          ]}
          piegesFrequents={[
            'Donner un avis global flou (« C\'était pas mal ») au lieu d\'un fait précis.',
            'Assommer l\'apprenant avec 10 critiques simultanées au lieu de se concentrer sur 1 geste clé.'
          ]}
          conseilsAnimation="Faites écouter un appel témoin enregistré. Chaque participant note en silence, puis calculez le Kappa moyen de la salle."
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : DO (GRILLE D'OBSERVATION M20 & DOUBLE ÉCOUTE) */}
      {session.etapeActuelle === 'comprendre' || session.etapeActuelle === 'plan' || session.etapeActuelle === 'do' ? (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Do — Grille d'observation en double écoute (M20)"
            subtitle="Évaluez chaque critère de 1 (Insuffisant) à 4 (Maîtrisé) pour l'Observateur 1 et 2"
            badge="M20 Grille"
            badgeColor="emerald"
          >
            <div className="space-y-5 text-xs">
              <div className="space-y-3">
                {criteres.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.id}. {c.nom}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {c.desc}
                        </p>
                      </div>

                      {/* Notations Observateur 1 et 2 */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500">Obs. 1 :</span>
                          <select
                            value={c.noteObs1}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10);
                              setCriteres(criteres.map((item, i) => (i === idx ? { ...item, noteObs1: n } : item)));
                            }}
                            className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 font-bold"
                          >
                            <option value={1}>1 - Insuffisant</option>
                            <option value={2}>2 - Fragile</option>
                            <option value={3}>3 - Conforme</option>
                            <option value={4}>4 - Remarquable</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-indigo-500 font-semibold">Obs. 2 :</span>
                          <select
                            value={c.noteObs2}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10);
                              setCriteres(criteres.map((item, i) => (i === idx ? { ...item, noteObs2: n } : item)));
                            }}
                            className="px-2 py-1 border border-indigo-200 dark:border-indigo-800 rounded bg-indigo-50/40 dark:bg-indigo-950/40 font-bold text-indigo-700 dark:text-indigo-300"
                          >
                            <option value={1}>1 - Insuffisant</option>
                            <option value={2}>2 - Fragile</option>
                            <option value={3}>3 - Conforme</option>
                            <option value={4}>4 - Remarquable</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bannière Kappa */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Indice de concordance Kappa de Cohen (K15) : <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">{kappaVal}</strong>
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    kappaVal >= 0.7 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {kappaVal >= 0.7 ? '✓ Accord solide (K15 ≥ 0.70)' : '⚠ Écart d\'appréciation entre observateurs'}
                </span>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer aux KPI de débriefing (Check)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* ÉTAPE 2 : CHECK */}
      {session.etapeActuelle === 'check' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="2. Check — Indicateur de Concordance Inter-Observateurs (K15)"
            subtitle="Validation de l'alignement des critères d'évaluation"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IndicatorGauge code="K15" valeur={kappaVal} cible={0.7} unite="score" />
                <IndicatorGauge code="K04" valeur={25} cible={15} unite="%" />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour à la Grille
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('act')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer au Débriefing COIN (Act)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ÉTAPE 3 : ACT (MÉTHODE COIN M21) */}
      {session.etapeActuelle === 'act' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="3. Act — Débriefing Bienveillant selon la Méthode COIN (M21)"
            subtitle="Contexte, Observation factuelle, Impact direct et Next step engageant"
            badge="M21 COIN"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    C — Contexte (Date, appel, prospect précis) :
                  </label>
                  <input
                    type="text"
                    value={coin.c}
                    onChange={(e) => setCoin({ ...coin, c: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
                  <label className="font-bold text-amber-900 dark:text-amber-200 block">
                    O — Observation factuelle (Fait neutre, sans adjectif accusateur ni procès d'intention) :
                  </label>
                  <textarea
                    rows={2}
                    value={coin.o}
                    onChange={(e) => setCoin({ ...coin, o: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 space-y-1">
                  <label className="font-bold text-rose-900 dark:text-rose-200 block">
                    I — Impact (Conséquence directe sur le prospect ou la vente) :
                  </label>
                  <textarea
                    rows={2}
                    value={coin.i}
                    onChange={(e) => setCoin({ ...coin, i: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <label className="font-bold text-emerald-900 dark:text-emerald-200 block">
                    N — Next Step (Geste concret coconstruit pour le prochain appel) :
                  </label>
                  <textarea
                    rows={2}
                    value={coin.n}
                    onChange={(e) => setCoin({ ...coin, n: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                </div>
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
