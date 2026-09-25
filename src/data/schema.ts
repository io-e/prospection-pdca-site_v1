/**
 * Schema_Export_Resultats_PDCA_v1.1.json
 * Type definitions for export and import of PDCA prospecting modules.
 * Note: Key names are strictly in French per specification v1.1.
 */

export type ApplicationCode =
  | 'P0'
  | 'P1'
  | 'P2'
  | 'P3'
  | 'P4'
  | 'P5'
  | 'P6'
  | 'P7'
  | 'P8'
  | 'P9'
  | 'P10'
  | 'P11'
  | 'P12'
  | 'P13';

export type PhasePDCA = 'comprendre' | 'plan' | 'do' | 'check' | 'act';

export type PorteeExport = 'etape' | 'cycle';

export type StatutIndicateur = 'vert' | 'orange' | 'rouge';

export interface ContexteParticipant {
  secteur?: string;
  public_cible?: string;
  offre?: string;
  canal_principal?: string;
  outil_crm?: string;
  registre?: 'tu' | 'vous';
}

export interface Participant {
  pseudo: string;
  role?: 'participant' | 'formateur' | 'observateur';
  contexte?: ContexteParticipant;
}

export interface CyclePDCA {
  numero: number;
  date_debut?: string;
  date_fin?: string;
  nom?: string;
  objectif?: string;
}

export interface IndicateurResultat {
  code: string;
  nom: string;
  valeur: number;
  unite?: string;
  cible?: number;
  statut: StatutIndicateur;
  formule?: string;
  commentaire?: string;
}

export interface EtapeComprendre {
  fiche_utilisee?: string;
  fiches?: string[];
  reponses?: Record<string, any>;
  notes?: string;
  quiz_scores?: Record<string, number>;
  exemples_personnalises?: any[];
}

export interface ObjectifSMART {
  id?: string;
  specifique: string;
  mesurable: string;
  atteignable: string;
  realiste: string;
  temporel: string;
  indicateur_associe?: string;
}

export interface EtapePlan {
  objectifs_smart?: ObjectifSMART[];
  actions_prevues?: Array<{
    id: string;
    titre: string;
    priorite?: 'haute' | 'moyenne' | 'basse';
    echeance?: string;
    responsable?: string;
    quadrant?: string;
  }>;
  hypotheses?: string[];
  cibles_kpi?: Record<string, number>;
  configuration?: Record<string, any>;
}

export interface EtapeDo {
  journal_actions?: Array<{
    horodatage: string;
    action: string;
    details?: any;
    resultat?: string;
  }>;
  blocs_realises?: Array<{
    debut: string;
    fin: string;
    duree_minutes: number;
    contacts_tentes: number;
    contacts_joints: number;
    rdv_obtenus: number;
  }>;
  donnees_brutes?: any;
  conversations?: any[];
  messages_rediges?: any[];
}

export interface EtapeCheck {
  indicateurs?: Record<string, IndicateurResultat>;
  analyse_ecarts?: Array<{
    indicateur: string;
    attendu: number;
    observe: number;
    ecart: number;
    interpretation: string;
  }>;
  points_forts?: string[];
  points_amelioration?: string[];
  notes_evaluation?: string;
}

export interface EtapeAct {
  decisions?: string[];
  ajustements_methode?: Array<{
    ce_qu_on_garde: string;
    ce_qu_on_modifie: string;
    ce_qu_on_arrete: string;
  }>;
  prochain_cycle?: {
    numero: number;
    objectif: string;
    fiches_recommandees?: string[];
    date_cible?: string;
  };
}

export interface EtapesPDCA {
  comprendre?: EtapeComprendre;
  plan?: EtapePlan;
  do?: EtapeDo;
  check?: EtapeCheck;
  act?: EtapeAct;
}

export interface PDCAExport {
  schema: 'prospection-pdca/resultat';
  schema_version: '1.1';
  application: ApplicationCode;
  referentiel: '2.2';
  portee: PorteeExport;
  etape_actuelle?: PhasePDCA;
  date: string;
  participant: Participant;
  cycle: CyclePDCA;
  fiches: string[];
  etapes: EtapesPDCA;
  metadonnees?: {
    exporteur: string;
    version_app: string;
    mode_ia_active?: boolean;
    date_export: string;
  };
}
