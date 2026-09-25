import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hub } from './components/Hub';
import { FicheModal } from './components/FicheModal';
import { ContexteParticipant } from './data/schema';

// Import des 14 modules
import { P00Universel } from './modules/P00Universel';
import { P01Motivation } from './modules/P01Motivation';
import { P02Freins } from './modules/P02Freins';
import { P03Cockpit } from './modules/P03Cockpit';
import { P04Pareto } from './modules/P04Pareto';
import { P05Semaine } from './modules/P05Semaine';
import { P06Valeur } from './modules/P06Valeur';
import { P07Pitch } from './modules/P07Pitch';
import { P08Personas } from './modules/P08Personas';
import { P09Aida } from './modules/P09Aida';
import { P10Soncas } from './modules/P10Soncas';
import { P11Observation } from './modules/P11Observation';
import { P12Dashboard } from './modules/P12Dashboard';
import { P13Comparateur } from './modules/P13Comparateur';

export default function App() {
  // Navigation par hash URL (#/p0, #/p1...) pour compatibilité bouton retour navigateur
  const getModuleFromHash = (): string => {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (!hash || hash === 'hub') return 'hub';
    const valid = [
      'p0', 'p00', 'p1', 'p01', 'p2', 'p02', 'p3', 'p03',
      'p4', 'p04', 'p5', 'p05', 'p6', 'p06', 'p7', 'p07',
      'p8', 'p08', 'p9', 'p09', 'p10', 'p11', 'p12', 'p13'
    ];
    if (valid.includes(hash)) {
      // Normaliser p00 -> p0, p01 -> p1, etc.
      return hash.replace(/^p0(\d)/, 'p$1');
    }
    return 'hub';
  };

  const [currentModule, setCurrentModule] = useState<string>(getModuleFromHash);
  const [isFormateur, setIsFormateur] = useState<boolean>(false);
  const [modeIA, setModeIA] = useState<boolean>(false);
  const [pseudo, setPseudo] = useState<string>('participant-1');
  const [modalFiche, setModalFiche] = useState<string | null>(null);

  const [contexte, setContexte] = useState<ContexteParticipant>({
    secteur: 'Services B2B & Conseil',
    public_cible: 'Dirigeants de PME / ETI',
    offre: 'Accompagnement à la transition commerciale PDCA',
    canal_principal: 'Téléphone & LinkedIn',
    outil_crm: 'CRM standard',
    registre: 'vous'
  });

  // Synchronisation avec l'historique du navigateur
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentModule(getModuleFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (mod: string) => {
    setCurrentModule(mod);
    window.location.hash = mod === 'hub' ? '' : `#/${mod}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Barre de navigation supérieure */}
      <Navbar
        currentModule={currentModule}
        onSelectModule={navigateTo}
        isFormateur={isFormateur}
        onToggleFormateur={() => setIsFormateur(!isFormateur)}
        pseudo={pseudo}
        onChangePseudo={setPseudo}
        contexte={contexte}
        onChangeContexte={setContexte}
        modeIA={modeIA}
        onToggleModeIA={() => setModeIA(!modeIA)}
      />

      {/* Corps principal : Hub ou module sélectionné */}
      <main className="flex-1 pb-16">
        {currentModule === 'hub' && (
          <Hub
            onSelectModule={navigateTo}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p0' && (
          <P00Universel
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            modeIA={modeIA}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p1' && (
          <P01Motivation
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p2' && (
          <P02Freins
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p3' && (
          <P03Cockpit
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p4' && (
          <P04Pareto
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p5' && (
          <P05Semaine
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p6' && (
          <P06Valeur
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p7' && (
          <P07Pitch
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p8' && (
          <P08Personas
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p9' && (
          <P09Aida
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            modeIA={modeIA}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p10' && (
          <P10Soncas
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            modeIA={modeIA}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p11' && (
          <P11Observation
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p12' && (
          <P12Dashboard
            contexte={contexte}
            pseudo={pseudo}
            isFormateur={isFormateur}
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}

        {currentModule === 'p13' && (
          <P13Comparateur
            onNavigateHub={() => navigateTo('hub')}
            onOpenFiche={(f) => setModalFiche(f)}
          />
        )}
      </main>

      {/* Modal Fiche globale */}
      <FicheModal
        ficheCode={modalFiche}
        onClose={() => setModalFiche(null)}
      />
    </div>
  );
}
