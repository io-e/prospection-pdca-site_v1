import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { IndicatorGauge } from '../components/IndicatorGauge';
import { ExportBar } from '../components/ExportBar';
import { FormateurView } from '../components/FormateurView';
import { FicheModal } from '../components/FicheModal';
import { pdcaCore, ModuleSessionState } from '../lib/pdcaCore';
import { geminiService } from '../lib/gemini';
import { ContexteParticipant, PhasePDCA } from '../data/schema';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Send,
  HelpCircle,
  Award
} from 'lucide-react';

const MOTIVES = ['Sécurité', 'Orgueil', 'Nouveauté', 'Confort', 'Argent', 'Sympathie'] as const;

interface DialogueTurn {
  emetteur: 'commercial' | 'prospect';
  texte: string;
}

interface P10Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  modeIA: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P10Soncas: React.FC<P10Props> = ({
  contexte,
  pseudo,
  isFormateur,
  modeIA,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P10', pseudo, 1);
    return existing || pdcaCore.initSession('P10', ['M19'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Mobile caché tiré au sort (Sécurité par défaut)
  const [hiddenMotive, setHiddenMotive] = useState<typeof MOTIVES[number]>('Sécurité');
  const [showTrainerMotive, setShowTrainerMotive] = useState(false);

  // Historique des 6 tours
  const [dialogue, setDialogue] = useState<DialogueTurn[]>([
    {
      emetteur: 'prospect',
      texte: "Bonjour. Écoutez, je ne dispose que de 2 minutes. Nous avons déjà un contrat cadre avec un prestataire historique depuis 4 ans, pourquoi devrais-je prendre le risque de changer ?"
    }
  ]);
  const [inputReply, setInputReply] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);

  // Devinette de l'apprenant
  const [guessedMotive, setGuessedMotive] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Tirage d'un nouveau prospect
  const drawNewProspect = () => {
    const random = MOTIVES[Math.floor(Math.random() * MOTIVES.length)];
    setHiddenMotive(random);
    setGuessedMotive(null);
    setIsRevealed(false);

    const initialReplies: Record<string, string> = {
      Sécurité: "Bonjour. Je suis très prudent avec les nouveaux prestataires : quelles garanties et certifications formelles m'apportez-vous ?",
      Orgueil: "Bonjour. Notre entreprise est leader incontesté sur son marché. J'espère que vous n'allez pas me proposer une solution générique pour débutants.",
      Nouveauté: "Bonjour. Je suis curieux de savoir ce que vous apportez de réellement disruptif par rapport aux approches classiques de prospection.",
      Confort: "Bonjour. Je croule sous les dossiers opérationnels. Si votre solution demande de la complexité ou 10h de formation, je vous arrête tout de suite.",
      Argent: "Bonjour. Soyons directs : quel est le coût et en combien de semaines mesurons-nous un retour sur investissement tangible ?",
      Sympathie: "Bonjour ! C'est toujours agréable d'échanger avec des personnes à l'écoute. Comment concevez-vous la relation de travail au quotidien ?"
    };

    setDialogue([
      { emetteur: 'prospect', texte: initialReplies[random] || initialReplies['Sécurité'] }
    ]);
  };

  // Envoi d'une réplique commerciale
  const handleSendReply = async () => {
    if (!inputReply.trim()) return;
    const newHist: DialogueTurn[] = [...dialogue, { emetteur: 'commercial', texte: inputReply.trim() }];
    setDialogue(newHist);
    setInputReply('');
    setLoadingReply(true);

    try {
      const res = await geminiService.generateSoncasReply(
        hiddenMotive,
        newHist,
        inputReply.trim()
      );
      setDialogue([...newHist, { emetteur: 'prospect', texte: res.replique }]);
    } catch {
      // repli statique déjà géré dans le service
    } finally {
      setLoadingReply(false);
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
          do: {
            ...session.etapes.do,
            dialogue,
            hidden_motive: hiddenMotive,
            guessed_motive: guessedMotive
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K14: {
                code: 'K14',
                nom: 'Précision de détection du profil SONCAS',
                valeur: guessedMotive === hiddenMotive ? 100 : 50,
                unite: '%',
                cible: 75,
                statut: guessedMotive === hiddenMotive ? 'vert' : 'orange',
                formule: '(Profils correctement validés / Entretiens) × 100'
              },
              K04: {
                code: 'K04',
                nom: 'Taux de conversion premier rendez-vous',
                valeur: 20,
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
  }, [session, dialogue, hiddenMotive, guessedMotive]);

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
        <span className="font-mono text-xs text-slate-500">P10 · Simulateur SONCAS</span>
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
          const draft = pdcaCore.loadDraft('P10', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P10', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P10', ['M19'], pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="40 min"
          objectifsPedagogiques={[
            'Entraîner le réflexe d\'écoute active des indices lexicaux trahissant le mobile SONCAS dominant.',
            'Bannir l\'erreur classique consistant à projeter ses propres motivations (ex: parler argent à un profil orgueil).',
            'Neutraliser l\'objection en 4 temps : Écouter, Accuser réception, Isoler, Traiter.'
          ]}
          reponsesAttendues={[
            'Détection correcte du profil SONCAS caché (K14).',
            'Réponses commerciales adaptées au registre lexical du prospect.',
            'Conclusion avec proposition de créneau sans se démonter.'
          ]}
          piegesFrequents={[
            'Contredire le prospect frontalement (« Mais non vous avez tort »).',
            'Baisser le prix immédiatement dès que l\'acheteur hésite.'
          ]}
          conseilsAnimation="Utilisez la vue binôme : l'un joue le prospect avec le mobile affiché, l'autre joue le commercial et tente de deviner."
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : DO (SIMULATEUR DE DIALOGUE EN 6 TOURS) */}
      {session.etapeActuelle === 'comprendre' || session.etapeActuelle === 'plan' || session.etapeActuelle === 'do' ? (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Do — Simulateur SONCAS & Traitement des Objections (M19)"
            subtitle="Engagez le dialogue avec le prospect et décelez son mobile dominant masqué"
            badge="M19 SONCAS"
            badgeColor="emerald"
            actions={
              <button
                type="button"
                onClick={drawNewProspect}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Tirer un autre prospect
              </button>
            }
          >
            <div className="space-y-5 text-xs">
              {/* Vue Formateur / Binôme (Révélation du mobile secret) */}
              {isFormateur && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                    <span className="font-bold">Vue formateur (mobile secret) :</span>
                    <span className="font-mono text-xs font-black bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded">
                      {hiddenMotive}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    Visible car Vue formateur est activée
                  </span>
                </div>
              )}

              {/* Fil de discussion interactif */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 max-h-96 overflow-y-auto">
                {dialogue.map((turn, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${turn.emetteur === 'commercial' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 font-semibold mb-1">
                      {turn.emetteur === 'commercial' ? 'Vous (Commercial)' : 'Prospect B2B'}
                    </span>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl leading-relaxed text-xs ${
                        turn.emetteur === 'commercial'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-xs'
                      }`}
                    >
                      {turn.texte}
                    </div>
                  </div>
                ))}

                {loadingReply && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Le prospect rédige sa réponse...</span>
                  </div>
                )}
              </div>

              {/* Zone de saisie commerciale */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputReply}
                  onChange={(e) => setInputReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply();
                  }}
                  placeholder="Rédigez votre réplique pour écouter, isoler et traiter l'objection..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={!inputReply.trim() || loadingReply}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Répondre</span>
                </button>
              </div>

              {/* Bouton de diagnostic du mobile : "Je pense que c'est..." */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    🎯 Détection du mobile SONCAS dominant : quel est le profil de cet acheteur ?
                  </span>
                  {guessedMotive && (
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Choix : {guessedMotive}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {MOTIVES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setGuessedMotive(m);
                        setIsRevealed(true);
                      }}
                      className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer transition-all ${
                        guessedMotive === m
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {isRevealed && (
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      guessedMotive === hiddenMotive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold">
                        {guessedMotive === hiddenMotive
                          ? '✓ Bravo ! Vous avez parfaitement décodé le mobile dominant.'
                          : `✕ Erreur : le mobile caché était en réalité « ${hiddenMotive} ».`}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {hiddenMotive === 'Sécurité' && 'Les signaux : recherche de certifications, peur du risque, mention de l\'ancienneté.'}
                        {hiddenMotive === 'Orgueil' && 'Les signaux : revendication de leadership, rejet des solutions basiques, valorisation du statut.'}
                        {hiddenMotive === 'Nouveauté' && 'Les signaux : curiosité pour la rupture technologique, attrait pour l\'inédit.'}
                        {hiddenMotive === 'Confort' && 'Les signaux : refus de la complexité, manque de temps, demande d\'une solution clé en main.'}
                        {hiddenMotive === 'Argent' && 'Les signaux : obsession pour le ROI, le coût direct et les délais de rentabilité.'}
                        {hiddenMotive === 'Sympathie' && 'Les signaux : valorisation de l\'écoute, du partenariat humain et de la proximité.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer aux KPI de détection (Check)</span>
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
            title="2. Check — Indicateurs de détection SONCAS (K14)"
            subtitle="Mesurez votre précision d'analyse des mobiles d'achat"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IndicatorGauge
                  code="K14"
                  valeur={guessedMotive === hiddenMotive ? 100 : 50}
                  cible={75}
                  unite="%"
                />
                <IndicatorGauge
                  code="K04"
                  valeur={20}
                  cible={15}
                  unite="%"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour au Simulateur
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
            title="3. Act — Bilan & Ancrage du Traitement d'Objections"
            subtitle="Consolidez votre grille de réponses types par mobile SONCAS"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-emerald-950 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Session de simulation SONCAS validée !</span>
                </div>
                <p>
                  Exportez votre résultat pour conserver la trace de vos détections et enrichir votre comparateur à J+30.
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
