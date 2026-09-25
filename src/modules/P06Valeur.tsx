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
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Link,
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react';

interface P06Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P06Valeur: React.FC<P06Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P6', pseudo, 1);
    return existing || pdcaCore.initSession('P6', ['M11', 'M12'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Profil client (M11)
  const [jobs, setJobs] = useState<string[]>(['Assurer la croissance du chiffre d\'affaires B2B', 'Recruter et fidéliser des commerciaux performants']);
  const [pains, setPains] = useState<Array<{ text: string; intensity: number }>>([
    { text: 'Irrégularité chronique du pipeline commercial', intensity: 5 },
    { text: 'Temps perdu sur des leads non qualifiés', intensity: 4 }
  ]);
  const [gains, setGains] = useState<string[]>(['Visibilité prévisible à 3 mois sur les signatures', 'Sérénité de l\'équipe de vente']);

  // Carte de valeur (M11)
  const [produits, setProduits] = useState<string[]>(['Diagnostic commercial 360°', 'Accompagnement intensif au pitch et prospection PDCA']);
  const [relievers, setRelievers] = useState<string[]>(['Sanctuarisation de 2 créneaux d\'appels hebdomadaires protégés', 'Filtrage strict selon l\'ICP et segmentation ABC']);

  // Filtres VRIO sur l'argument phare (M12)
  const [vrioTests, setVrioTests] = useState<{ v: boolean; r: boolean; i: boolean; o: boolean }>({
    v: true,
    r: true,
    i: true,
    o: true
  });
  const [mainArgument, setMainArgument] = useState(
    'Notre méthodologie exclusive PDCA intègre un retour sur investissement garanti en 90 jours avec suivi des 15 indicateurs clés.'
  );

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
            vrio: vrioTests,
            main_argument: mainArgument
          },
          do: {
            ...session.etapes.do,
            donnees_brutes: {
              jobs,
              pains: pains.map((p) => p.text),
              gains,
              produits,
              relievers,
              arguments_retenus: [mainArgument]
            }
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K13: {
                code: 'K13',
                nom: 'Taux de rétention de l\'attention en pitch',
                valeur: 72,
                unite: '%',
                cible: 65,
                statut: 'vert',
                formule: '(Échanges > 90s / Appels décrochés) × 100'
              },
              K14: {
                code: 'K14',
                nom: 'Précision de détection du profil SONCAS',
                valeur: 78,
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
  }, [session, jobs, pains, gains, produits, relievers, vrioTests, mainArgument]);

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
        <span className="font-mono text-xs text-slate-500">P06 · Canevas de valeur + VRIO</span>
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
          const draft = pdcaCore.loadDraft('P6', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P6', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P6', ['M11', 'M12'], pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="75 min"
          objectifsPedagogiques={[
            'Partir impérativement des maux clients (Pains) avant d\'énoncer une seule fonctionnalité produit.',
            'Vérifier que chaque argument phare passe les 4 filtres VRIO pour ne pas vendre de la parité banale.',
            'Préparer le terrain pour le transfert direct vers le Studio de pitch (P07).'
          ]}
          reponsesAttendues={[
            'Pains notés selon leur intensité (1 à 5).',
            'Alignement strict : 1 pain majeur résolu par 1 soulageur précis.',
            'Argumentaire VRIO validé sur Rareté et Inimitabilité.'
          ]}
          piegesFrequents={[
            'Décrire les caractéristiques techniques internes de son entreprise au lieu de soulager la douleur du client.',
            'Affirmer "nous sommes réactifs" sans aucune preuve de rareté VRIO.'
          ]}
          conseilsAnimation="Demandez à un apprenant de lire son argument phare et demandez au groupe : « Si un concurrent disait exactement la même chose, le prospect verrait-il la différence ? »"
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : PLAN (CANVAS DE VALEUR M11) */}
      {session.etapeActuelle === 'comprendre' || session.etapeActuelle === 'plan' ? (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Plan — Value Proposition Canvas (M11)"
            subtitle="Confrontez le profil de votre client cible à votre proposition de valeur"
            badge="M11 Canvas"
            badgeColor="blue"
          >
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profil Client */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>1. Profil Client (Le Monde du Prospect)</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      {contexte.public_cible || 'Cible B2B'}
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Missions & "Jobs to be done" :
                    </label>
                    <ul className="space-y-1">
                      {jobs.map((j, idx) => (
                        <li key={idx} className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                          {j}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="font-semibold text-rose-700 dark:text-rose-300 block mb-1">
                      Douleurs & Maux (Pains) + Intensité (1 à 5) :
                    </label>
                    <ul className="space-y-1.5">
                      {pains.map((p, idx) => (
                        <li key={idx} className="p-2 bg-rose-50/50 dark:bg-rose-950/20 rounded border border-rose-200 dark:border-rose-900/40 flex justify-between items-center">
                          <span>{p.text}</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                            {p.intensity} / 5
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-1">
                      Gains espérés :
                    </label>
                    <ul className="space-y-1">
                      {gains.map((g, idx) => (
                        <li key={idx} className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Carte de Valeur */}
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/80 space-y-3">
                  <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
                    <span>2. Carte de Valeur (Mon Offre)</span>
                    <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-900 dark:text-indigo-200">
                      {contexte.offre || 'Solution'}
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Produits & Services concrets :
                    </label>
                    <ul className="space-y-1">
                      {produits.map((pr, idx) => (
                        <li key={idx} className="p-1.5 bg-white dark:bg-slate-900 rounded border border-indigo-100 dark:border-indigo-900/40">
                          {pr}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="font-semibold text-indigo-900 dark:text-indigo-300 block mb-1">
                      Soulageurs de douleurs (Pain Relievers) :
                    </label>
                    <ul className="space-y-1">
                      {relievers.map((rel, idx) => (
                        <li key={idx} className="p-2 bg-white dark:bg-slate-900 rounded border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200 font-medium">
                          <Link className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{rel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Filtre VRIO (M12) */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Test VRIO de solidité concurrentielle (M12) :</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Les 4 critères de l'avantage durable
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Mon argument phare formulé :
                  </label>
                  <textarea
                    rows={2}
                    value={mainArgument}
                    onChange={(e) => setMainArgument(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { key: 'v', label: 'V - Valeur', desc: 'Apporte un gain économique clair' },
                    { key: 'r', label: 'R - Rareté', desc: 'Peu de rivaux peuvent le prétendre' },
                    { key: 'i', label: 'I - Inimitable', desc: 'Très coûteux ou long à copier' },
                    { key: 'o', label: 'O - Organisation', desc: 'Process interne prêt à délivrer' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setVrioTests({ ...vrioTests, [item.key]: !vrioTests[item.key as 'v' | 'r' | 'i' | 'o'] })}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        vrioTests[item.key as 'v' | 'r' | 'i' | 'o']
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{item.label}</span>
                        {vrioTests[item.key as 'v' | 'r' | 'i' | 'o'] ? '✓' : '✕'}
                      </div>
                      <div className="text-[10px] mt-0.5 text-slate-500 dark:text-slate-400">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer aux KPI de pertinence (Check)</span>
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
            title="2. Check — Indicateurs d'impact du pitch et de l'offre"
            subtitle="Mesure des KPI K13 et K14"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IndicatorGauge code="K13" valeur={72} cible={65} unite="%" />
                <IndicatorGauge code="K14" valeur={78} cible={75} unite="%" />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('plan')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour au Canevas
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('act')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer à l'export & transfert (Act)</span>
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
            title="3. Act — Transfert vers le Studio de Pitch (P07)"
            subtitle="Vos arguments VRIO sont prêts pour être déclinés en CABP et SIMAC"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-emerald-950 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Canevas de valeur verrouillé avec succès !</span>
                </div>
                <p>
                  En exportant ce fichier, vous pourrez directement l'importer dans <strong>P07 (Studio de Pitch)</strong> pour générer automatiquement vos trames d'accroche 30s/60s/90s.
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
