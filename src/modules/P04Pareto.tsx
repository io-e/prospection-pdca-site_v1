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
  PieChart,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ProspectItem {
  id: string;
  nom: string;
  valeur: number; // CA potentiel ou points d'opportunité
  classe?: 'A' | 'B' | 'C';
  cumulPct?: number;
}

const DEFAULT_PROSPECTS: ProspectItem[] = [
  { id: '1', nom: 'Groupe Alpha Logistique', valeur: 85000 },
  { id: '2', nom: 'Industries Mecatech', valeur: 52000 },
  { id: '3', nom: 'Pharmalab B2B', valeur: 38000 },
  { id: '4', nom: 'Banque Regionale Ouest', valeur: 24000 },
  { id: '5', nom: 'Cabinet Conseil Nexus', valeur: 15000 },
  { id: '6', nom: 'Agro Distribution', valeur: 9500 },
  { id: '7', nom: 'Transport Express 24', valeur: 6200 },
  { id: '8', nom: 'Eco Energie Solutions', valeur: 4100 },
  { id: '9', nom: 'Atelier Precision', valeur: 2500 },
  { id: '10', nom: 'Services Nettoyage Pro', valeur: 1200 }
];

interface P04Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P04Pareto: React.FC<P04Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P4', pseudo, 1);
    return existing || pdcaCore.initSession('P4', ['M07'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Liste de données brutes
  const [prospects, setProspects] = useState<ProspectItem[]>(
    session.etapes.do?.donnees_brutes?.prospects || DEFAULT_PROSPECTS
  );
  const [csvText, setCsvText] = useState('');
  const [showCsvBox, setShowCsvBox] = useState(false);

  // Temps alloué aux comptes A (K07)
  const [tempsCompteA, setTempsCompteA] = useState<number>(
    session.etapes.plan?.temps_compte_a || 65
  );

  // Critères du profil A
  const [critereA1, setCritereA1] = useState('Effectif > 50 salariés ou CA > 5 M€');
  const [critereA2, setCritereA2] = useState('Projet stratégique de transformation identifié');
  const [critereA3, setCritereA3] = useState('Décideur final joignable directement');

  // Calculs ABC
  const sorted = [...prospects].sort((a, b) => b.valeur - a.valeur);
  const totalVal = sorted.reduce((sum, item) => sum + item.valeur, 0);

  let runSum = 0;
  const analyzed: ProspectItem[] = sorted.map((p) => {
    runSum += p.valeur;
    const cumulPct = totalVal > 0 ? Math.round((runSum / totalVal) * 100) : 0;
    let classe: 'A' | 'B' | 'C' = 'C';
    if (cumulPct <= 80) classe = 'A';
    else if (cumulPct <= 95) classe = 'B';
    return { ...p, classe, cumulPct };
  });

  const countA = analyzed.filter((p) => p.classe === 'A').length;
  const countB = analyzed.filter((p) => p.classe === 'B').length;
  const countC = analyzed.filter((p) => p.classe === 'C').length;

  const valA = analyzed.filter((p) => p.classe === 'A').reduce((s, p) => s + p.valeur, 0);
  const valB = analyzed.filter((p) => p.classe === 'B').reduce((s, p) => s + p.valeur, 0);
  const valC = analyzed.filter((p) => p.classe === 'C').reduce((s, p) => s + p.valeur, 0);

  const pctValA = totalVal > 0 ? Math.round((valA / totalVal) * 100) : 0;
  const pctCountA = analyzed.length > 0 ? Math.round((countA / analyzed.length) * 100) : 0;

  // Import CSV simple
  const handleParseCsv = () => {
    if (!csvText.trim()) return;
    const lines = csvText.split('\n');
    const parsed: ProspectItem[] = [];
    lines.forEach((l, idx) => {
      const parts = l.split(/[,;\t]/);
      if (parts.length >= 2) {
        const nom = parts[0].trim();
        const val = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
        if (nom && !isNaN(val)) {
          parsed.push({ id: idx.toString(), nom, valeur: val });
        }
      }
    });
    if (parsed.length > 0) {
      setProspects(parsed);
      setShowCsvBox(false);
      setCsvText('');
    }
  };

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
            temps_compte_a: tempsCompteA,
            criteres_profil_a: [critereA1, critereA2, critereA3]
          },
          do: {
            ...session.etapes.do,
            donnees_brutes: { prospects }
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K07: {
                code: 'K07',
                nom: 'Part du temps alloué aux comptes A (Pareto)',
                valeur: tempsCompteA,
                unite: '%',
                cible: 60,
                statut: pdcaCore.kpiStatus('K07', tempsCompteA),
                formule: '(Heures passées sur cibles A / Heures totales de prospection) × 100'
              },
              K04: {
                code: 'K04',
                nom: 'Taux de conversion premier rendez-vous',
                valeur: 18,
                unite: '%',
                cible: 15,
                statut: 'vert',
                formule: '(RDV obtenus / Contacts joints) × 100'
              }
            }
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, prospects, tempsCompteA, critereA1, critereA2, critereA3]);

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
        <span className="font-mono text-xs text-slate-500">P04 · Analyse Pareto / ABC</span>
      </div>

      <ExportBar
        state={session}
        isSaving={isSaving}
        hasDraftAvailable={hasDraft}
        onImport={(imported) => {
          setSession((prev) => pdcaCore.importToSession(imported, prev));
          if (imported.etapes.do?.donnees_brutes?.prospects) {
            setProspects(imported.etapes.do.donnees_brutes.prospects);
          }
          setHasDraft(false);
        }}
        onResumeDraft={() => {
          const draft = pdcaCore.loadDraft('P4', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P4', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P4', ['M07'], pseudo, 1, contexte));
          setProspects(DEFAULT_PROSPECTS);
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="30 min"
          objectifsPedagogiques={[
            'Démontrer mathématiquement la loi 80/20 sur son propre portefeuille de cibles.',
            'Identifier que la dispersion d\'énergie sur les comptes C est la principale cause d\'épuisement.',
            'Sanctuariser au moins 60% du temps de prospection active sur le profil A (K07).'
          ]}
          reponsesAttendues={[
            'Segmentation ABC calculée avec seuils de 80% (A) et 95% (B).',
            '3 critères d\'exclusion objectifs pour éviter les faux comptes A.',
            'K07 planifié ≥ 60%.'
          ]}
          piegesFrequents={[
            'Considérer comme compte A un prospect très bavard mais qui n\'a aucun budget.',
            'Refuser d\'automatiser ou d\'espacer les relances sur les comptes C.'
          ]}
          conseilsAnimation="Invitez un apprenant à coller son export de CRM en direct. Projetez la courbe et faites débattre sur la bascule A/B."
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : COMPRENDRE & SAISIE (DONNÉES BRUTES) */}
      {session.etapeActuelle === 'comprendre' || session.etapeActuelle === 'plan' ? (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Comprendre & Saisie — Portefeuille de prospects & Loi 80/20 (M07)"
            subtitle="Saisissez ou collez vos comptes pour générer automatiquement l'analyse ABC"
            badge="M07 Pareto"
            badgeColor="blue"
            actions={
              <button
                type="button"
                onClick={() => setShowCsvBox(!showCsvBox)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
                <span>Coller CSV</span>
              </button>
            }
          >
            <div className="space-y-4 text-xs">
              {showCsvBox && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Collez vos données (Format : Nom, Valeur par ligne) :
                  </label>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="Entreprise A, 50000&#10;Entreprise B, 25000&#10;Entreprise C, 8000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 font-mono text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCsvBox(false)}
                      className="px-3 py-1 text-slate-500 hover:text-slate-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleParseCsv}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold"
                    >
                      Importer les lignes
                    </button>
                  </div>
                </div>
              )}

              {/* Résumé des classes ABC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">Classe A (Top 80% valeur)</span>
                    <span className="font-mono text-xs font-black bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.2 rounded">
                      {countA} comptes ({pctCountA}%)
                    </span>
                  </div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-2 font-mono">
                    {valA.toLocaleString('fr-FR')} € ({pctValA}%)
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1">
                    Cibles prioritaires : approche sur-mesure multicanale.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 dark:text-blue-300">Classe B (80% à 95%)</span>
                    <span className="font-mono text-xs font-black bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-1.5 py-0.2 rounded">
                      {countB} comptes
                    </span>
                  </div>
                  <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-2 font-mono">
                    {valB.toLocaleString('fr-FR')} €
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-1">
                    Séquences semi-personnalisées.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Classe C (Derniers 5%)</span>
                    <span className="font-mono text-xs font-black bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.2 rounded">
                      {countC} comptes
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-2 font-mono">
                    {valC.toLocaleString('fr-FR')} €
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Automatisation, webinaires, e-mailing groupé.
                  </p>
                </div>
              </div>

              {/* Courbe de Pareto Interactive SVG */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Courbe cumulative de Pareto (Loi 80/20)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Ligne verte = Seuil 80% (Classe A)
                  </span>
                </div>

                <div className="w-full h-48 relative border-b border-l border-slate-300 dark:border-slate-700 mt-4 flex items-end">
                  {/* Seuil horizontal 80% */}
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-emerald-500 z-10"
                    style={{ bottom: '80%' }}
                  >
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded absolute -top-3 left-1">
                      Seuil A (80%)
                    </span>
                  </div>

                  {/* Barres et ligne de cumul */}
                  <div className="w-full h-full flex items-end justify-between px-2 gap-1">
                    {analyzed.map((item, idx) => {
                      const hVal = totalVal > 0 ? (item.valeur / totalVal) * 100 * 2.5 : 0;
                      const hCumul = item.cumulPct || 0;
                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center justify-end h-full group relative"
                        >
                          {/* Info-bulle au survol */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] p-1.5 rounded shadow pointer-events-none whitespace-nowrap">
                            <strong>{item.nom}</strong>: {item.valeur.toLocaleString()} € (Cumul: {hCumul}%)
                          </div>

                          {/* Point de cumul */}
                          <div
                            className={`w-2 h-2 rounded-full absolute z-10 ${
                              item.classe === 'A'
                                ? 'bg-emerald-500 ring-2 ring-emerald-200'
                                : item.classe === 'B'
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ bottom: `${hCumul}%` }}
                          />

                          {/* Barre de valeur brute */}
                          <div
                            className={`w-full rounded-t transition-all ${
                              item.classe === 'A'
                                ? 'bg-emerald-200 dark:bg-emerald-800'
                                : item.classe === 'B'
                                ? 'bg-blue-200 dark:bg-blue-800'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                            style={{ height: `${Math.max(4, Math.min(100, hVal))}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 px-1">
                  <span>1er compte (forte valeur)</span>
                  <span>Dernier compte (faible valeur)</span>
                </div>
              </div>

              {/* Critères du profil A */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  3 critères stricts caractérisant mon « Prospect de Profil A » :
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={critereA1}
                    onChange={(e) => setCritereA1(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={critereA2}
                    onChange={(e) => setCritereA2(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={critereA3}
                    onChange={(e) => setCritereA3(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Mesurer les KPI d'allocation de temps (Check)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* ÉTAPE 2 : CHECK (KPI K07) */}
      {session.etapeActuelle === 'check' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="2. Check — Indicateurs d'allocation du temps (K07)"
            subtitle="Vérifiez que votre énergie commerciale est concentrée sur les comptes A"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IndicatorGauge
                  code="K07"
                  valeur={tempsCompteA}
                  cible={60}
                  unite="%"
                />
                <IndicatorGauge
                  code="K04"
                  valeur={18}
                  cible={15}
                  unite="%"
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Ajuster mon pourcentage cible de temps consacré aux comptes A :
                  </label>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {tempsCompteA}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={tempsCompteA}
                  onChange={(e) => setTempsCompteA(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Recommandation M07 : allouer au minimum 60% de votre temps aux 20% de comptes clés.
                </p>
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
                  <span>Passer aux décisions (Act)</span>
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
            title="3. Act — Décisions d'arbitrage de portefeuille"
            subtitle="Engagements pour cesser de gaspiller votre temps sur les comptes C"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-emerald-950 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Votre répartition Pareto est verrouillée :</span>
                </div>
                <p>
                  Vos <strong>{countA} comptes de classe A</strong> représentent à eux seuls <strong>{pctValA}% de votre valeur potentielle</strong>.
                  Consacrez-leur vos créneaux d'or et automatisez le reste.
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
