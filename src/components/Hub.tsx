import React from 'react';
import {
  Sparkles,
  Compass,
  Flame,
  Clock,
  Briefcase,
  Send,
  BarChart2,
  ArrowRight,
  ShieldAlert,
  BookOpen,
  Share2,
  Workflow
} from 'lucide-react';
import { FICHES_REFERENTIEL } from '../data/referentiel';

interface HubProps {
  onSelectModule: (moduleId: string) => void;
  onOpenFiche: (ficheCode: string) => void;
}

interface ModuleCardItem {
  id: string;
  code: string;
  titre: string;
  description: string;
  fiches: string[];
  duree: string;
  phaseDominante: 'Plan' | 'Do' | 'Check' | 'Act' | 'Universel';
  kpis: string[];
}

interface ModuleGroup {
  id: string;
  titre: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  modules: ModuleCardItem[];
}

export const Hub: React.FC<HubProps> = ({ onSelectModule, onOpenFiche }) => {
  const groups: ModuleGroup[] = [
    {
      id: 'universel',
      titre: 'Atelier Universel',
      description: 'Déclinaison guidée des 5 phases PDCA pour n\'importe quelle fiche méthodologique',
      icon: Compass,
      color: 'indigo',
      modules: [
        {
          id: 'p0',
          code: 'P0',
          titre: 'Atelier PDCA universel',
          description: 'Structurez n\'importe quel chantier de prospection en 5 phases rigoureuses avec la fiche de votre choix.',
          fiches: ['Toute fiche'],
          duree: 'selon la fiche',
          phaseDominante: 'Universel',
          kpis: ['Variable']
        }
      ]
    },
    {
      id: 'motivation',
      titre: '1. La motivation',
      description: 'Identifier les moteurs psychologiques profonds et débloquer les passages à l\'action',
      icon: Flame,
      color: 'amber',
      modules: [
        {
          id: 'p1',
          code: 'P1',
          titre: 'Diagnostic motivationnel',
          description: 'Quiz en 12 affirmations, radar Maslow & Deci/Ryan, et formulation d\'engagements SMART sous contrôle direct.',
          fiches: ['M01', 'M02', 'M03'],
          duree: '80 min',
          phaseDominante: 'Plan',
          kpis: ['K01', 'K11']
        },
        {
          id: 'p2',
          code: 'P2',
          titre: 'Lever mes freins',
          description: 'Arbre décisionnel de Prochaska, balance décisionnelle, échelle de confiance 1-10 et journal des succès.',
          fiches: ['M04', 'M05'],
          duree: '65 min',
          phaseDominante: 'Plan',
          kpis: ['K01', 'K09', 'K10']
        }
      ]
    },
    {
      id: 'temps',
      titre: '2. L\'optimisation du temps',
      description: 'Neutraliser la procrastination, prioriser les comptes à forte valeur et verrouiller l\'agenda',
      icon: Clock,
      color: 'emerald',
      modules: [
        {
          id: 'p3',
          code: 'P3',
          titre: 'Cockpit anti-procrastination',
          description: 'Session interactive au chronomètre Pomodoro 25/5 min, règle des 2 minutes, boîte d\'atterrissage et débriefing immédiat.',
          fiches: ['M06', 'M08'],
          duree: '55 min',
          phaseDominante: 'Do',
          kpis: ['K01', 'K02', 'K03', 'K08', 'K09']
        },
        {
          id: 'p4',
          code: 'P4',
          titre: 'Analyse Pareto / ABC',
          description: 'Calcul des classes ABC, courbe cumulative de Pareto interactive, profil A prioritaire et répartition cible du temps.',
          fiches: ['M07'],
          duree: '30 min',
          phaseDominante: 'Plan',
          kpis: ['K04', 'K07']
        },
        {
          id: 'p5',
          code: 'P5',
          titre: 'Ma semaine claire',
          description: 'Tri des tâches dans la matrice d\'Eisenhower, calcul en direct du ratio K12, semaine type et time-blocking.',
          fiches: ['M09', 'M10'],
          duree: '45 min',
          phaseDominante: 'Plan',
          kpis: ['K01', 'K03', 'K04', 'K12']
        }
      ]
    },
    {
      id: 'offre',
      titre: '3. L\'offre de service',
      description: 'Bâtir une proposition de valeur inattaquable et des pitchs ultra-percutants',
      icon: Briefcase,
      color: 'blue',
      modules: [
        {
          id: 'p6',
          code: 'P6',
          titre: 'Canevas de valeur + VRIO',
          description: 'Value Proposition Canvas (Pains/Gains), intensité des maux, test des 4 filtres VRIO et sélection des 3 arguments phares.',
          fiches: ['M11', 'M12'],
          duree: '75 min',
          phaseDominante: 'Plan',
          kpis: ['K13', 'K14']
        },
        {
          id: 'p7',
          code: 'P7',
          titre: 'Studio de pitch',
          description: 'Atelier CABP, structure SIMAC, elevator pitch 30s/60s/90s et répétition guidée avec prompteur minuté.',
          fiches: ['M13', 'M14', 'M15'],
          duree: '90 min',
          phaseDominante: 'Do',
          kpis: ['K13', 'K14']
        }
      ]
    },
    {
      id: 'canaux',
      titre: '4. Canaux et moyens de prospection',
      description: 'Cibler les comptes clés, concevoir des séquences multicanales et simuler les interactions',
      icon: Send,
      color: 'purple',
      modules: [
        {
          id: 'p8',
          code: 'P8',
          titre: 'Personas + séquence multicanale',
          description: 'Définition de l\'ICP, cartographie des personas, séquence J0→J21 cadencée et checklist stricte de conformité CNIL/RGPD.',
          fiches: ['M16', 'M17'],
          duree: '80 min',
          phaseDominante: 'Plan',
          kpis: ['K02', 'K03', 'K05', 'K08']
        },
        {
          id: 'p9',
          code: 'P9',
          titre: 'Labo AIDA + test A/B',
          description: 'Éditeur en 4 blocs, contrôles de vigilance (CTA unique, filtres anti-spam), test A/B scientifique et calculateur Z-score.',
          fiches: ['M18'],
          duree: '30 min',
          phaseDominante: 'Do',
          kpis: ['K03', 'K05', 'K06']
        },
        {
          id: 'p10',
          code: 'P10',
          titre: 'Simulateur SONCAS',
          description: 'Tirage d\'un prospect au profil masqué, dialogue interactif en 6 tours, détection du mobile dominant et levée d\'objections.',
          fiches: ['M19'],
          duree: '40 min',
          phaseDominante: 'Do',
          kpis: ['K04', 'K14']
        },
        {
          id: 'p11',
          code: 'P11',
          titre: 'Grille d\'observation + COIN',
          description: 'Grille multicritères pour double écoute, calcul du coefficient Kappa de concordance et débriefing structuré selon la méthode COIN.',
          fiches: ['M20', 'M21'],
          duree: '60 min',
          phaseDominante: 'Check',
          kpis: ['K15']
        }
      ]
    },
    {
      id: 'transversal',
      titre: 'Transversal — suivi et comparaison',
      description: 'Pilotage continu des 15 KPI clés et comparaison multi-cycles / multi-participants',
      icon: BarChart2,
      color: 'slate',
      modules: [
        {
          id: 'p12',
          code: 'P12',
          titre: 'Tableau de bord PDCA',
          description: 'Saisie hebdomadaire des KPI K01–K15, diagnostic des points de rupture du funnel, alertes d\'écart et cap d\'amélioration.',
          fiches: ['Toutes'],
          duree: '15 min/semaine',
          phaseDominante: 'Check',
          kpis: ['K01 à K15']
        },
        {
          id: 'p13',
          code: 'P13',
          titre: 'Comparateur de résultats',
          description: 'Import multi-fichiers, scan des brouillons locaux, vues individuelle, thématique et collective (cohorte formateur).',
          fiches: ['Toutes'],
          duree: '10 min',
          phaseDominante: 'Act',
          kpis: ['K01 à K15']
        }
      ]
    }
  ];

  const phaseColors: Record<string, string> = {
    Plan: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Do: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Check: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Act: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    Universel: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold">
          <Workflow className="w-3.5 h-3.5" />
          <span>Méthode PDCA · Plan · Do · Check · Act</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Prospection commerciale et amélioration continue
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          14 applications interactives pour diagnostiquer, planifier, agir et progresser.
          Chaque outil suit le cycle PDCA et produit des exports comparables.
        </p>
      </div>

      {/* Avertissement pédagogique & sécurité */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl p-4 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-sm text-amber-950 dark:text-amber-100">
            Avertissement méthodologique & protection des données
          </div>
          <p className="leading-relaxed">
            Tout ce que l'application produit est une <strong>aide à la réflexion et à la décision</strong>, jamais un verdict automatisé.
            <strong> N'utilisez aucune donnée réelle de prospects ou de clients</strong> : anonymisez systématiquement (ex : « Client A », « Société de conseil 20 salariés »).
            Les exports JSON permettent la comparaison portable inter-cycles et inter-apprenants.
          </p>
        </div>
      </div>

      {/* Boîte des Enchaînements conseillés */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-base text-white tracking-tight">
            Enchaînements conseillés & parcours d'apprentissage
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 hover:border-indigo-400 transition-colors">
            <span className="text-indigo-300 font-bold block mb-1">Parcours Offre & Pitch :</span>
            <div className="font-mono text-sm font-semibold text-white mb-1">
              P6 → P7 → P10
            </div>
            <p className="text-slate-300 text-[11px]">
              Structurer la valeur (P6), monter le pitch CABP/SIMAC (P7) puis simuler l'objection SONCAS (P10).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 hover:border-indigo-400 transition-colors">
            <span className="text-indigo-300 font-bold block mb-1">Parcours Campagne & Mesure :</span>
            <div className="font-mono text-sm font-semibold text-white mb-1">
              P8 → P9 → P12
            </div>
            <p className="text-slate-300 text-[11px]">
              Définir l'ICP et la séquence (P8), tester l'AIDA en A/B (P9) puis consolider les 15 KPI (P12).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 hover:border-indigo-400 transition-colors">
            <span className="text-indigo-300 font-bold block mb-1">Parcours Suivi & Rétrospective :</span>
            <div className="font-mono text-sm font-semibold text-white mb-1">
              Toutes → P13
            </div>
            <p className="text-slate-300 text-[11px]">
              Comparer l'évolution des pratiques à J+30 et consolider les exports d'un groupe en formation.
            </p>
          </div>
        </div>
      </div>

      {/* Grille des groupes de modules */}
      <div className="space-y-8">
        {groups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <section key={group.id} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  <GroupIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {group.titre}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {group.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                  >
                    <div>
                      {/* En-tête de carte */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                          {mod.code}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              phaseColors[mod.phaseDominante] || phaseColors['Plan']
                            }`}
                          >
                            {mod.phaseDominante}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            ⏱ {mod.duree}
                          </span>
                        </div>
                      </div>

                      {/* Titre & Description */}
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {mod.titre}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    {/* Fiches mobilisées & Bouton d'accès */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-medium">Fiches :</span>
                        {mod.fiches.map((f, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (f !== 'Toute fiche' && f !== 'Toutes') {
                                onOpenFiche(f);
                              }
                            }}
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                              f.startsWith('M')
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                          KPI : {mod.kpis.join(' · ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectModule(mod.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform cursor-pointer"
                        >
                          <span>Lancer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer conforme */}
      <footer className="pt-8 pb-12 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Référentiel v2.2 · Schéma d'export v1.1 · Méta-prompt AI Studio v1
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Cycle PDCA pour la prospection commerciale · Conforme aux préconisations CNIL & RGPD en B2B
        </p>
      </footer>
    </div>
  );
};
