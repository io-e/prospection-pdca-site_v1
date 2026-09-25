import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { IndicatorGauge } from '../components/IndicatorGauge';
import { ExportBar } from '../components/ExportBar';
import { FormateurView } from '../components/FormateurView';
import { FicheModal } from '../components/FicheModal';
import { pdcaCore, ModuleSessionState } from '../lib/pdcaCore';
import { geminiService, CritiqueAIDAResult } from '../lib/gemini';
import { ContexteParticipant, PhasePDCA } from '../data/schema';
import {
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Split,
  Calculator,
  ShieldAlert
} from 'lucide-react';

interface P09Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  modeIA: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P09Aida: React.FC<P09Props> = ({
  contexte,
  pseudo,
  isFormateur,
  modeIA,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P9', pseudo, 1);
    return existing || pdcaCore.initSession('P9', ['M18'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Variante A (de base)
  const [varianteA, setVarianteA] = useState({
    attention: 'Bonjour Thomas. Vos délais logistiques sur les retours vous coûtent-ils plus de 10% de marge ?',
    interet: 'La plupart des directeurs supply chain constatent que le traitement manuel des avaries retarde les flux de 48h.',
    desir: 'Notre plateforme automatisée réduit ce délai à 4 heures, avec un retour sur investissement constaté chez ChronoDirect.',
    action: 'Seriez-vous ouvert à un rapide échange de 5 minutes mardi à 10h pour en juger ?'
  });

  // Mode A/B
  const [isAbMode, setIsAbMode] = useState<boolean>(true);
  const [varianteB, setVarianteB] = useState({
    attention: 'Bonjour Thomas. Optimisation des retours logistiques chez vos confrères du secteur :',
    interet: 'La plupart des directeurs supply chain constatent que le traitement manuel des avaries retarde les flux de 48h.',
    desir: 'Notre plateforme automatisée réduit ce délai à 4 heures, avec un retour sur investissement constaté chez ChronoDirect.',
    action: 'Seriez-vous ouvert à un rapide échange de 5 minutes mardi à 10h pour en juger ?'
  });

  // Calculs statistiques A/B (Z-test)
  const [stats, setStats] = useState({
    envoisA: 120,
    reponsesA: 11,
    envoisB: 120,
    reponsesB: 23
  });

  // IA Critique pédagogique
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiCritique, setAiCritique] = useState<CritiqueAIDAResult | null>(null);

  // Vérification de variable unique pour test A/B
  const diffCount = [
    varianteA.attention !== varianteB.attention,
    varianteA.interet !== varianteB.interet,
    varianteA.desir !== varianteB.desir,
    varianteA.action !== varianteB.action
  ].filter(Boolean).length;

  const isStrictSingleVariable = diffCount === 1;

  // Calcul du Z-Score K06
  const zResult = pdcaCore.calculateZScore(
    stats.reponsesA,
    stats.envoisA,
    stats.reponsesB,
    stats.envoisB
  );

  const txReponseA = stats.envoisA > 0 ? Math.round((stats.reponsesA / stats.envoisA) * 100) : 0;
  const txReponseB = stats.envoisB > 0 ? Math.round((stats.reponsesB / stats.envoisB) * 100) : 0;

  // Détection de mots d'hyper-vente
  const spamKeywords = ['révolutionnaire', 'incroyable', 'meilleure offre', 'gratuit', '100% garanti', 'sans risque'];
  const fullTextA = `${varianteA.attention} ${varianteA.interet} ${varianteA.desir} ${varianteA.action}`.toLowerCase();
  const detectedSpams = spamKeywords.filter((w) => fullTextA.includes(w));

  // Nombre de points d'interrogation dans l'Action
  const ctaQuestions = (varianteA.action.match(/\?/g) || []).length;

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
            varianteA,
            varianteB,
            isAbMode
          },
          do: {
            ...session.etapes.do,
            statistiques_ab: stats
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K05: {
                code: 'K05',
                nom: 'Taux de réponse aux messages AIDA',
                valeur: txReponseB,
                unite: '%',
                cible: 12,
                statut: pdcaCore.kpiStatus('K05', txReponseB),
                formule: '(Réponses / Messages envoyés) × 100'
              },
              K06: {
                code: 'K06',
                nom: 'Significativité statistique test A/B',
                valeur: zResult.significance,
                unite: '%',
                cible: 95,
                statut: zResult.isSignificant ? 'vert' : 'orange',
                formule: 'Z-score de comparaison de proportions bilatérale (p < 0.05)'
              }
            }
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, varianteA, varianteB, stats, isAbMode, zResult, txReponseB]);

  const handleAskAiCritique = async () => {
    setLoadingAi(true);
    const res = await geminiService.critiqueAIDA(
      varianteA.attention,
      varianteA.interet,
      varianteA.desir,
      varianteA.action,
      { secteur: contexte.secteur, public: contexte.public_cible }
    );
    setAiCritique(res);
    setLoadingAi(false);
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
        <span className="font-mono text-xs text-slate-500">P09 · Labo AIDA + Test A/B</span>
      </div>

      <ExportBar
        state={session}
        isSaving={isSaving}
        hasDraftAvailable={hasDraft}
        onImport={(imported) => {
          setSession((prev) => pdcaCore.importToSession(imported, prev));
          if (imported.application === 'P8') {
            const tr = pdcaCore.transformP8ToP9(imported);
            setVarianteA((prev) => ({
              ...prev,
              attention: `Bonjour. En tant que ${tr.personaRole}, faites-vous face à ${tr.painPoint.toLowerCase()} ?`,
              interet: `Beaucoup de décideurs confrontés à ${tr.declencheur.toLowerCase()} cherchent à stabiliser leurs flux.`
            }));
          }
          setHasDraft(false);
        }}
        onResumeDraft={() => {
          const draft = pdcaCore.loadDraft('P9', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P9', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P9', ['M18'], pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="30 min"
          objectifsPedagogiques={[
            'Vérifier la discipline d\'un seul appel à l\'action (CTA unique et léger).',
            'Comprendre la rigueur scientifique du test A/B : STRICTEMENT une seule variable modifiée à la fois.',
            'Lire et interpréter le niveau de significativité statistique K06 (Z-score p < 0.05).'
          ]}
          reponsesAttendues={[
            'Aucun mot d\'hyper-vente détecté.',
            'Test A/B avec 1 seule variable différente (ex: uniquement l\'objet).',
            'Significativité K06 validée ≥ 95% avant de trancher sur la variante gagnante.'
          ]}
          piegesFrequents={[
            'Modifier l\'objet ET le corps du message simultanément (invalide scientifiquement).',
            'Arrêter le test sur 10 envois en criant victoire sans échantillon significatif.'
          ]}
          conseilsAnimation="Demandez au groupe de voter pour la variante qu'ils préfèrent avant de dévoiler les chiffres du z-test. L'intuition est souvent démentie par la statistique !"
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : DO (ÉDITEUR AIDA & CONTRÔLES EN DIRECT) */}
      {session.etapeActuelle === 'comprendre' || session.etapeActuelle === 'plan' || session.etapeActuelle === 'do' ? (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Do — Éditeur AIDA en 4 blocs & Contrôles de vigilance (M18)"
            subtitle="Rédigez votre message en respectant la méthode AIDA et l'exigence de sobriété"
            badge="M18 AIDA"
            badgeColor="emerald"
            actions={
              <button
                type="button"
                onClick={handleAskAiCritique}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                <span>{loadingAi ? 'Relecture...' : 'Avis IA (bêta)'}</span>
              </button>
            }
          >
            <div className="space-y-5 text-xs">
              {/* Alertes de vigilance en direct */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                    ctaQuestions === 1
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {ctaQuestions === 1 ? '✓ CTA unique respecté (1 question)' : `⚠ ${ctaQuestions} questions détectées (1 seule requise)`}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                    detectedSpams.length === 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {detectedSpams.length === 0 ? '✓ Zéro mot d\'hyper-vente' : `⚠ Termes à risque : ${detectedSpams.join(', ')}`}
                </span>
              </div>

              {/* Rendu des 4 blocs AIDA pour la Variante A */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>A — Attention (Objet ou 1ère phrase) :</span>
                    <span className="text-[10px] text-slate-400">Le prospect au centre</span>
                  </label>
                  <textarea
                    rows={2}
                    value={varianteA.attention}
                    onChange={(e) => setVarianteA({ ...varianteA, attention: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>I — Intérêt (Reformulation du problème métier) :</span>
                    <span className="text-[10px] text-slate-400">Douleur partagée</span>
                  </label>
                  <textarea
                    rows={2}
                    value={varianteA.interet}
                    onChange={(e) => setVarianteA({ ...varianteA, interet: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>D — Désir (Bénéfice de la solution & Preuve) :</span>
                    <span className="text-[10px] text-slate-400">Projection concrète</span>
                  </label>
                  <textarea
                    rows={2}
                    value={varianteA.desir}
                    onChange={(e) => setVarianteA({ ...varianteA, desir: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                    <span>A — Action (Appel à l'action léger et unique) :</span>
                    <span className="text-[10px] text-indigo-500 font-mono">1 seul CTA</span>
                  </label>
                  <textarea
                    rows={2}
                    value={varianteA.action}
                    onChange={(e) => setVarianteA({ ...varianteA, action: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-950/20 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Rendu de la critique pédagogique IA */}
              {aiCritique && (
                <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-3 text-purple-950 dark:text-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Relecture critique pédagogique (Mode IA) :</span>
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-800">
                      Score indicatif : {aiCritique.score_global_indicatif} / 10
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded border border-purple-100 dark:border-purple-900">
                      <strong>Accroche :</strong> {aiCritique.attention}
                    </div>
                    <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded border border-purple-100 dark:border-purple-900">
                      <strong>Intérêt :</strong> {aiCritique.interet}
                    </div>
                    <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded border border-purple-100 dark:border-purple-900">
                      <strong>Désir :</strong> {aiCritique.desir}
                    </div>
                    <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded border border-purple-100 dark:border-purple-900">
                      <strong>Action :</strong> {aiCritique.action}
                    </div>
                  </div>
                </div>
              )}

              {/* Module Test A/B & Calculateur Z-Score */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Split className="w-4 h-4 text-indigo-500" />
                    <span>Configuration du Test A/B & Validité statistique</span>
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isStrictSingleVariable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {isStrictSingleVariable
                      ? '✓ Strictement 1 différence (Valide)'
                      : `⚠ ${diffCount} différences (Le test A/B n'en tolère qu'une seule)`}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Accroche de la Variante B (Modifiez uniquement ce champ pour tester l'objet) :
                  </label>
                  <input
                    type="text"
                    value={varianteB.attention}
                    onChange={(e) => setVarianteB({ ...varianteB, attention: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Saisie des données de test A/B */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Envois Variante A</span>
                    <input
                      type="number"
                      value={stats.envoisA}
                      onChange={(e) => setStats({ ...stats, envoisA: parseInt(e.target.value, 10) || 1 })}
                      className="w-full text-base font-black font-mono text-slate-900 dark:text-white bg-transparent"
                    />
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Réponses A ({txReponseA}%)</span>
                    <input
                      type="number"
                      value={stats.reponsesA}
                      onChange={(e) => setStats({ ...stats, reponsesA: parseInt(e.target.value, 10) || 0 })}
                      className="w-full text-base font-black font-mono text-slate-900 dark:text-white bg-transparent"
                    />
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Envois Variante B</span>
                    <input
                      type="number"
                      value={stats.envoisB}
                      onChange={(e) => setStats({ ...stats, envoisB: parseInt(e.target.value, 10) || 1 })}
                      className="w-full text-base font-black font-mono text-slate-900 dark:text-white bg-transparent"
                    />
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Réponses B ({txReponseB}%)</span>
                    <input
                      type="number"
                      value={stats.reponsesB}
                      onChange={(e) => setStats({ ...stats, reponsesB: parseInt(e.target.value, 10) || 0 })}
                      className="w-full text-base font-black font-mono text-indigo-600 dark:text-indigo-400 bg-transparent"
                    />
                  </div>
                </div>

                {/* Bannière K06 de significativité */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    zResult.isSignificant
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 shrink-0" />
                    <span className="font-bold">
                      Indicateur K06 (Significativité statistique) : {zResult.significance}% (Z-Score : {zResult.zScore})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80">
                    {zResult.isSignificant ? 'Gagnant certain (p < 0.05)' : 'Échantillon insuffisant'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer aux KPI de réponse (Check)</span>
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
            title="2. Check — Indicateurs de conversion des messages (K05 & K06)"
            subtitle="Analysez le taux de réponse et la validité statistique de vos variantes"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IndicatorGauge code="K05" valeur={txReponseB} cible={12} unite="%" />
                <IndicatorGauge code="K06" valeur={zResult.significance} cible={95} unite="%" />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour à l'Éditeur
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
            title="3. Act — Déploiement de la Variante Gagnante"
            subtitle="Standardisez le message vainqueur pour l'ensemble de la campagne"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-emerald-950 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Test A/B conclu et standardisé :</span>
                </div>
                <p>
                  La variante gagnante surperforme avec <strong>{txReponseB}% de réponse</strong> et un niveau de confiance de <strong>{zResult.significance}%</strong>.
                  Cette version est désormais votre trame de référence pour les prochaines séries de prospection.
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
