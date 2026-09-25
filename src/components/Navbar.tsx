import React, { useState } from 'react';
import {
  Compass,
  GraduationCap,
  Download,
  Settings,
  Sparkles,
  ChevronDown,
  Layers,
  FileJson,
  User,
  RotateCcw
} from 'lucide-react';
import { ContexteParticipant } from '../data/schema';
import { FICHES_REFERENTIEL, INDICATEURS_REFERENTIEL } from '../data/referentiel';

interface NavbarProps {
  currentModule: string; // 'hub', 'p0', 'p1', etc.
  onSelectModule: (moduleId: string) => void;
  isFormateur: boolean;
  onToggleFormateur: () => void;
  pseudo: string;
  onChangePseudo: (pseudo: string) => void;
  contexte: ContexteParticipant;
  onChangeContexte: (contexte: ContexteParticipant) => void;
  modeIA: boolean;
  onToggleModeIA: () => void;
}

const MODULES_LIST = [
  { id: 'hub', label: 'Hub — Vue d\'ensemble', group: 'Accueil' },
  { id: 'p0', label: 'P0 Atelier PDCA universel', group: 'Universel' },
  { id: 'p1', label: 'P1 Diagnostic motivationnel', group: 'Motivation' },
  { id: 'p2', label: 'P2 Lever mes freins', group: 'Motivation' },
  { id: 'p3', label: 'P3 Cockpit anti-procrastination', group: 'Temps' },
  { id: 'p4', label: 'P4 Analyse Pareto / ABC', group: 'Temps' },
  { id: 'p5', label: 'P5 Ma semaine claire (Eisenhower)', group: 'Temps' },
  { id: 'p6', label: 'P6 Canevas de valeur + VRIO', group: 'Offre' },
  { id: 'p7', label: 'P7 Studio de pitch (CABP / SIMAC)', group: 'Offre' },
  { id: 'p8', label: 'P8 Personas + Séquence multicanale', group: 'Canaux' },
  { id: 'p9', label: 'P9 Labo AIDA + Test A/B', group: 'Canaux' },
  { id: 'p10', label: 'P10 Simulateur SONCAS', group: 'Canaux' },
  { id: 'p11', label: 'P11 Grille d\'observation + COIN', group: 'Canaux' },
  { id: 'p12', label: 'P12 Tableau de bord PDCA', group: 'Transversal' },
  { id: 'p13', label: 'P13 Comparateur de résultats', group: 'Transversal' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  onSelectModule,
  isFormateur,
  onToggleFormateur,
  pseudo,
  onChangePseudo,
  contexte,
  onChangeContexte,
  modeIA,
  onToggleModeIA
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showModulesDropdown, setShowModulesDropdown] = useState(false);

  const downloadReferentielJSON = () => {
    const data = {
      version: '2.2',
      nom: 'Référentiel Méthodes & Indicateurs Prospection PDCA',
      fiches: FICHES_REFERENTIEL,
      indicateurs: INDICATEURS_REFERENTIEL
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Referentiel_Methodes_Prospection_PDCA_v2.2.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadExportSchemaJSON = () => {
    const schemaExample = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Schéma d\'export résultats PDCA prospection commerciale',
      version: '1.1',
      properties: {
        schema: { type: 'string', const: 'prospection-pdca/resultat' },
        schema_version: { type: 'string', const: '1.1' },
        application: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13'] },
        referentiel: { type: 'string', const: '2.2' },
        portee: { type: 'string', enum: ['etape', 'cycle'] },
        date: { type: 'string', format: 'date' },
        participant: {
          type: 'object',
          required: ['pseudo'],
          properties: {
            pseudo: { type: 'string' },
            role: { type: 'string' },
            contexte: { type: 'object' }
          }
        },
        cycle: {
          type: 'object',
          required: ['numero'],
          properties: {
            numero: { type: 'integer' },
            objectif: { type: 'string' }
          }
        },
        fiches: { type: 'array', items: { type: 'string' } },
        etapes: { type: 'object' }
      }
    };
    const blob = new Blob([JSON.stringify(schemaExample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Schema_Export_Resultats_PDCA_v1.1.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentModObj = MODULES_LIST.find((m) => m.id === currentModule) || MODULES_LIST[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Navigation Accueil */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectModule('hub')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-sm">
                    Prospection PDCA
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                    v2.2
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                  Plan · Do · Check · Act
                </div>
              </div>
            </button>

            {/* Sélecteur de module actuel */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModulesDropdown(!showModulesDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span className="max-w-[130px] sm:max-w-[200px] truncate">
                  {currentModObj.label}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showModulesDropdown && (
                <div className="absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-2 text-xs space-y-1">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Modules de prospection
                  </div>
                  {MODULES_LIST.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectModule(m.id);
                        setShowModulesDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        currentModule === m.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{m.label}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {m.group}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Outils & Options (Formateur, IA, Paramètres, Téléchargements) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Toggle Vue Formateur */}
            <button
              type="button"
              onClick={onToggleFormateur}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isFormateur
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-transparent'
              }`}
              title="Activer/désactiver les repères pédagogiques et critères attendus"
            >
              <GraduationCap className={`w-3.5 h-3.5 ${isFormateur ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="hidden md:inline">Vue formateur</span>
            </button>

            {/* Mode IA (bêta) toggle */}
            <button
              type="button"
              onClick={onToggleModeIA}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                modeIA
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-transparent'
              }`}
              title="Activer le mode IA (bêta) sur P0, P9 et P10 (repli automatique garanti)"
            >
              <Sparkles className={`w-3.5 h-3.5 ${modeIA ? 'text-purple-600 animate-spin-slow' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">Mode IA (bêta)</span>
            </button>

            {/* Téléchargements Référentiel & Schéma */}
            <button
              type="button"
              onClick={downloadReferentielJSON}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Télécharger le référentiel des 21 fiches et 15 indicateurs (JSON)"
            >
              <FileJson className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden xl:inline">Réf. v2.2</span>
            </button>

            <button
              type="button"
              onClick={downloadExportSchemaJSON}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Télécharger le schéma JSON d'export des résultats v1.1"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden xl:inline">Schéma v1.1</span>
            </button>

            {/* Paramètres contexte */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Personnaliser mon contexte d'entraînement"
              aria-label="Paramètres"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal Paramètres & Contexte */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Contexte d'entraînement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pseudo du participant (anonymisé obligatoire) :
                </label>
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => onChangePseudo(e.target.value)}
                  placeholder="ex: participant-1, commercial-nord"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ Ne jamais saisir de données réelles nominatives ou de vrais noms de clients.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Secteur d'activité :
                </label>
                <input
                  type="text"
                  value={contexte.secteur || ''}
                  onChange={(e) => onChangeContexte({ ...contexte, secteur: e.target.value })}
                  placeholder="ex: Services informatiques B2B, Formation pro"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Public prospecté (Cible) :
                </label>
                <input
                  type="text"
                  value={contexte.public_cible || ''}
                  onChange={(e) => onChangeContexte({ ...contexte, public_cible: e.target.value })}
                  placeholder="ex: DRH de grands groupes, Dirigeants PME"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Offre de service principale :
                </label>
                <input
                  type="text"
                  value={contexte.offre || ''}
                  onChange={(e) => onChangeContexte({ ...contexte, offre: e.target.value })}
                  placeholder="ex: Audit cybersécurité et formation continue"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Canal principal :
                  </label>
                  <select
                    value={contexte.canal_principal || 'Téléphone'}
                    onChange={(e) => onChangeContexte({ ...contexte, canal_principal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Téléphone">Téléphone</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Email">Email</option>
                    <option value="Terrain">Terrain</option>
                    <option value="Multicanal">Multicanal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registre d'adresse :
                  </label>
                  <select
                    value={contexte.registre || 'vous'}
                    onChange={(e) => onChangeContexte({ ...contexte, registre: e.target.value as 'tu' | 'vous' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="vous">Vous (formel)</option>
                    <option value="tu">Tu (informel)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs cursor-pointer"
              >
                Enregistrer les paramètres
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
