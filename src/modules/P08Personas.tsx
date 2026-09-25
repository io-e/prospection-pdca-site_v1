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
  Users,
  Send,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface Persona {
  id: string;
  nom: string;
  role: string;
  douleur_principale: string;
  declencheur: string;
}

interface EtapeSequence {
  jour: string; // ex: "J0", "J+1", "J+4", etc.
  canal: 'LinkedIn' | 'Téléphone' | 'Email';
  action: string;
  objectif: string;
}

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: '1',
    nom: 'Directeur Commercial / VP Sales',
    role: 'Décideur final budget',
    douleur_principale: 'Pipeline irrégulier et baisse de conversion des équipes',
    declencheur: 'Objectifs trimestriels sous tension ou nouvelle levée de fonds'
  },
  {
    id: '2',
    nom: 'Responsable Prospection / Team Lead',
    role: 'Prescripteur opérationnel',
    douleur_principale: 'Démotivation des commerciaux et perte de temps en qualification',
    declencheur: 'Turnover d\'un commercial ou intégration de 2 juniors'
  }
];

const DEFAULT_SEQUENCE: EtapeSequence[] = [
  { jour: 'J0', canal: 'LinkedIn', action: 'Visite discrète du profil + suivi des actualités', objectif: 'Établir la familiarité sans solliciter' },
  { jour: 'J+1', canal: 'Email', action: 'Email d\'accroche personnalisé avec cas d\'usage court', objectif: 'Poser le problème sans forcer l\'offre' },
  { jour: 'J+4', canal: 'Téléphone', action: 'Appel direct 1er essai + message vocal percutant', objectif: 'Tenter le contact direct ou amorcer la relance' },
  { jour: 'J+8', canal: 'LinkedIn', action: 'Message privé avec étude de cas sectorielle offerte', objectif: 'Apporter de la valeur nouvelle' },
  { jour: 'J+14', canal: 'Email', action: 'Relance par email avec chiffre de preuve mesurable', objectif: 'Proposer 10 min de cadrage' },
  { jour: 'J+21', canal: 'Email', action: 'Email de rupture cordial (Break-up mail)', objectif: 'Libérer le prospect et déclencher la réaction' }
];

interface P08Props {
  contexte: ContexteParticipant;
  pseudo: string;
  isFormateur: boolean;
  onNavigateHub: () => void;
  onOpenFiche: (ficheCode: string) => void;
}

export const P08Personas: React.FC<P08Props> = ({
  contexte,
  pseudo,
  isFormateur,
  onNavigateHub,
  onOpenFiche
}) => {
  const [session, setSession] = useState<ModuleSessionState>(() => {
    const existing = pdcaCore.loadDraft('P8', pseudo, 1);
    return existing || pdcaCore.initSession('P8', ['M16', 'M17'], pseudo, 1, contexte);
  });

  const [modalFiche, setModalFiche] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // ICP Definition
  const [icp, setIcp] = useState({
    taille: 'PME / ETI de 50 à 250 salariés',
    secteur: contexte.secteur || 'Services B2B & Conseil',
    zone: 'France entière (priorité métropoles)',
    signauxAffaires: 'Recrutement de commerciaux, nouvelle direction, refonte de site',
    exclusions: 'Entreprises < 10 salariés sans budget ou grands comptes avec cycle > 18 mois'
  });

  // Personas
  const [personas, setPersonas] = useState<Persona[]>(
    session.etapes.do?.donnees_brutes?.personas || DEFAULT_PERSONAS
  );

  // Séquence
  const [sequence, setSequence] = useState<EtapeSequence[]>(
    session.etapes.do?.donnees_brutes?.sequence || DEFAULT_SEQUENCE
  );

  // Checklist de conformité RGPD / CNIL (M17)
  const [compliance, setCompliance] = useState<Record<string, boolean>>({
    b2bDirectOnly: true,
    optoutVisible: true,
    donneesPro: true,
    frequenceEspacee: true
  });

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
            icp,
            compliance
          },
          do: {
            ...session.etapes.do,
            donnees_brutes: {
              personas,
              sequence
            }
          },
          check: {
            ...session.etapes.check,
            indicateurs: {
              K02: {
                code: 'K02',
                nom: 'Volume de contacts bruts traités',
                valeur: 45,
                unite: 'contacts/semaine',
                cible: 40,
                statut: 'vert',
                formule: 'Contacts uniques engagés dans la séquence'
              },
              K03: {
                code: 'K03',
                nom: 'Taux de joignabilité / ouverture',
                valeur: 38,
                unite: '%',
                cible: 35,
                statut: 'vert',
                formule: '(Contacts joints / Tentatives) × 100'
              },
              K05: {
                code: 'K05',
                nom: 'Taux de réponse aux messages AIDA',
                valeur: 14,
                unite: '%',
                cible: 12,
                statut: 'vert',
                formule: '(Réponses / Messages) × 100'
              },
              K08: {
                code: 'K08',
                nom: 'Taux d\'abandon de séquence',
                valeur: 12,
                unite: '%',
                cible: 15,
                statut: 'vert',
                formule: '(Séquences interrompues / Séquences initiées) × 100'
              }
            }
          }
        }
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session, icp, personas, sequence, compliance]);

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
        <span className="font-mono text-xs text-slate-500">P08 · Personas + Séquence multicanale</span>
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
          const draft = pdcaCore.loadDraft('P8', pseudo, session.cycleNumero);
          if (draft) setSession(draft);
          setHasDraft(false);
        }}
        onResetDraft={() => {
          pdcaCore.removeDraft('P8', pseudo, session.cycleNumero);
          setSession(pdcaCore.initSession('P8', ['M16', 'M17'], pseudo, 1, contexte));
          setHasDraft(false);
        }}
      />

      {isFormateur && (
        <FormateurView
          timingEstime="80 min"
          objectifsPedagogiques={[
            'Comprendre qu\'une séquence sans ICP strict est une perte de temps massive.',
            'Vérifier que chaque étape apporte une valeur neuve et n\'est jamais une "simple relance pour savoir si vous avez lu mon mail".',
            'Faire appliquer sans concession la conformité CNIL / RGPD B2B.'
          ]}
          reponsesAttendues={[
            'Au moins 2 critères d\'exclusion explicites dans l\'ICP.',
            'Séquence cadencée sur 21 jours alternant 3 canaux (Téléphone, LinkedIn, Email).',
            'Taux d\'abandon de séquence K08 sous la barre des 15%.'
          ]}
          piegesFrequents={[
            'Harceler un prospect sur le même canal 3 jours d\'affilée.',
            'Omettre le lien de désinscription ou le motif professionnel B2B.'
          ]}
          conseilsAnimation="Faites rédiger le Break-up mail de J+21 : il doit être élégant, respectueux et redonner au prospect l'envie de répondre."
        />
      )}

      <ProgressBar currentPhase={session.etapeActuelle} onSelectPhase={(p) => setPhase(p)} />

      {/* ÉTAPE 1 : PLAN (ICP & PERSONAS M16) */}
      {session.etapeActuelle === 'comprendre' || session.etapeActuelle === 'plan' ? (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="1. Plan — Profil de Client Idéal (ICP) & Personas B2B (M16)"
            subtitle="Définissez les caractéristiques firmographiques et les déclencheurs d'achat"
            badge="M16"
            badgeColor="blue"
          >
            <div className="space-y-5 text-xs">
              {/* Formulaire ICP */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Cadre ICP (Entreprise Cible) :</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Taille d'entreprise :</label>
                    <input
                      type="text"
                      value={icp.taille}
                      onChange={(e) => setIcp({ ...icp, taille: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Secteur d'activité :</label>
                    <input
                      type="text"
                      value={icp.secteur}
                      onChange={(e) => setIcp({ ...icp, secteur: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Déclencheurs d'achat (Trigger events) :</label>
                    <input
                      type="text"
                      value={icp.signauxAffaires}
                      onChange={(e) => setIcp({ ...icp, signauxAffaires: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-rose-600 dark:text-rose-400 font-bold block mb-1">
                      Critères d'exclusion formels (Qui NE PAS prospecter) :
                    </label>
                    <input
                      type="text"
                      value={icp.exclusions}
                      onChange={(e) => setIcp({ ...icp, exclusions: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Cartes Personas */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Personas cibles priorisés ({personas.length} / 4 max) :</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {personas.map((pers) => (
                    <div
                      key={pers.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{pers.nom}</span>
                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                          {pers.role}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        <strong>Douleur :</strong> {pers.douleur_principale}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        <strong>Déclencheur :</strong> {pers.declencheur}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer à la Séquence multicanale (Do)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* ÉTAPE 2 : DO (SÉQUENCE J0 À J21 & CONFORMITÉ CNIL) */}
      {session.etapeActuelle === 'do' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="2. Do — Séquence Multicanale Cadencée (J0 à J21 - M17)"
            subtitle="Orchestrez vos points de contact Téléphone, LinkedIn et Email sans harcèlement"
            badge="M17 Séquence"
            badgeColor="emerald"
          >
            <div className="space-y-6 text-xs">
              {/* Timeline des étapes */}
              <div className="space-y-2.5">
                {sequence.map((step, idx) => {
                  const canalColors = {
                    LinkedIn: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200',
                    Téléphone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200',
                    Email: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200'
                  };

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                          {step.jour}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${canalColors[step.canal]}`}>
                          {step.canal}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {step.action}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 italic">
                        Objectif : {step.objectif}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Garde-fous de conformité CNIL / RGPD */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Garde-fous de conformité légale CNIL / RGPD B2B :</span>
                  </h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Conforme CNIL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'b2bDirectOnly', label: 'Prospection stricte en B2B (en rapport direct avec la fonction du contact)' },
                    { key: 'optoutVisible', label: 'Lien de désinscription facile et effectif en bas de chaque email' },
                    { key: 'donneesPro', label: 'Utilisation exclusive de coordonnées professionnelles directes' },
                    { key: 'frequenceEspacee', label: 'Espacement minimal de 2 à 4 jours ouvrés entre chaque relance' }
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setCompliance({ ...compliance, [g.key]: !compliance[g.key] })}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left cursor-pointer"
                    >
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${compliance[g.key] ? 'text-emerald-500' : 'text-slate-300'}`} />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('plan')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour à l'ICP
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('check')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Passer aux KPI de campagne (Check)</span>
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
            title="3. Check — Mesure de la campagne multicanale"
            subtitle="Indicateurs de volume, réponse et abandon de séquence (K02, K03, K05, K08)"
            badge="Check"
            badgeColor="amber"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <IndicatorGauge code="K02" valeur={45} cible={40} unite="contacts" />
                <IndicatorGauge code="K03" valeur={38} cible={35} unite="%" />
                <IndicatorGauge code="K05" valeur={14} cible={12} unite="%" />
                <IndicatorGauge code="K08" valeur={12} cible={15} unite="%" />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPhase('do')}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  ← Retour à la Séquence
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

      {/* ÉTAPE 4 : ACT */}
      {session.etapeActuelle === 'act' && (
        <div className="space-y-6 animate-fade-in">
          <Card
            title="4. Act — Transfert vers Labo AIDA (P09)"
            subtitle="Vos personas et déclencheurs sont prêts à être rédigés en AIDA"
            badge="Act"
            badgeColor="rose"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-emerald-950 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Séquence cadencée prête pour l'exportation !</span>
                </div>
                <p>
                  Exportez votre cycle pour injecter vos personas dans le <strong>Labo AIDA (P09)</strong> ou le <strong>simulateur SONCAS (P10)</strong>.
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
