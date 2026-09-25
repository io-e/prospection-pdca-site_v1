/**
 * pdcaCore.ts
 * Logique partagée du cycle PDCA pour la prospection commerciale.
 * Conforme au Référentiel v2.2 et au Schéma d'export v1.1.
 */

import {
  ApplicationCode,
  PDCAExport,
  PhasePDCA,
  PorteeExport,
  StatutIndicateur,
  ContexteParticipant,
  IndicateurResultat
} from '../data/schema';
import { INDICATEURS_REFERENTIEL } from '../data/referentiel';

export interface ModuleSessionState {
  application: ApplicationCode;
  pseudo: string;
  cycleNumero: number;
  contexte: ContexteParticipant;
  etapeActuelle: PhasePDCA;
  fiches: string[];
  etapes: {
    comprendre: Record<string, any>;
    plan: Record<string, any>;
    do: Record<string, any>;
    check: {
      indicateurs: Record<string, IndicateurResultat>;
      analyse_ecarts?: Array<any>;
      points_forts?: string[];
      points_amelioration?: string[];
      notes_evaluation?: string;
      [key: string]: any;
    };
    act: {
      decisions: string[];
      ajustements_methode: Array<{
        ce_qu_on_garde: string;
        ce_qu_on_modifie: string;
        ce_qu_on_arrete: string;
      }>;
      prochain_cycle: {
        numero: number;
        objectif: string;
        fiches_recommandees?: string[];
        date_cible?: string;
      };
      debrief_coin?: {
        c: string;
        o: string;
        i: string;
        n: string;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
  derniereSauvegarde?: string;
  modeIAActive?: boolean;
}

export const pdcaCore = {
  /**
   * Convertit un export PDCA importé en état de session valide
   */
  importToSession(imported: PDCAExport, currentState: ModuleSessionState): ModuleSessionState {
    return {
      ...currentState,
      application: imported.application || currentState.application,
      pseudo: imported.participant?.pseudo || currentState.pseudo,
      cycleNumero: imported.cycle?.numero || currentState.cycleNumero,
      contexte: imported.participant?.contexte || currentState.contexte,
      fiches: imported.fiches || currentState.fiches,
      etapeActuelle: imported.etape_actuelle || currentState.etapeActuelle,
      etapes: {
        comprendre: imported.etapes?.comprendre || currentState.etapes?.comprendre || {},
        plan: imported.etapes?.plan || currentState.etapes?.plan || {},
        do: imported.etapes?.do || currentState.etapes?.do || {},
        check: {
          indicateurs: imported.etapes?.check?.indicateurs || currentState.etapes?.check?.indicateurs || {},
          analyse_ecarts: imported.etapes?.check?.analyse_ecarts || [],
          points_forts: imported.etapes?.check?.points_forts || [],
          points_amelioration: imported.etapes?.check?.points_amelioration || [],
          notes_evaluation: imported.etapes?.check?.notes_evaluation
        },
        act: {
          decisions: imported.etapes?.act?.decisions || currentState.etapes?.act?.decisions || [],
          ajustements_methode: imported.etapes?.act?.ajustements_methode || [],
          prochain_cycle: imported.etapes?.act?.prochain_cycle || {
            numero: (imported.cycle?.numero || 1) + 1,
            objectif: '',
            fiches_recommandees: [],
            date_cible: ''
          },
          debrief_coin: (imported.etapes?.act as any)?.debrief_coin
        }
      }
    };
  },

  /**
   * Initialise un état de session propre pour un module
   */
  initSession(
    application: ApplicationCode,
    fiches: string[],
    pseudo: string = 'participant-1',
    cycleNumero: number = 1,
    contexte?: ContexteParticipant
  ): ModuleSessionState {
    return {
      application,
      pseudo: pseudo || 'participant-1',
      cycleNumero: cycleNumero || 1,
      contexte: contexte || {
        secteur: 'Services B2B & Conseil',
        public_cible: 'Dirigeants de PME / ETI',
        offre: 'Accompagnement à la transition commerciale',
        canal_principal: 'Téléphone & LinkedIn',
        outil_crm: 'CRM standard',
        registre: 'vous'
      },
      etapeActuelle: 'comprendre',
      fiches,
      etapes: {
        comprendre: {
          reponses: {},
          notes: ''
        },
        plan: {
          objectifs_smart: [],
          actions_prevues: [],
          cibles_kpi: {},
          configuration: {}
        },
        do: {
          journal_actions: [],
          blocs_realises: [],
          donnees_brutes: {}
        },
        check: {
          indicateurs: {},
          analyse_ecarts: [],
          points_forts: [],
          points_amelioration: []
        },
        act: {
          decisions: [],
          ajustements_methode: [],
          prochain_cycle: {
            numero: cycleNumero + 1,
            objectif: 'Consolider les acquis et intensifier les créneaux réguliers',
            fiches_recommandees: [],
            date_cible: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
          }
        }
      },
      modeIAActive: false
    };
  },

  /**
   * Clé standard de stockage local
   */
  getStorageKey(application: string, pseudo: string, cycleNumero: number): string {
    const safePseudo = (pseudo || 'draft').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return `pdca:${application}:${safePseudo || 'draft'}:c${cycleNumero || 1}`;
  },

  /**
   * Sauvegarde automatique dans localStorage
   */
  saveDraft(state: ModuleSessionState): void {
    try {
      const key = this.getStorageKey(state.application, state.pseudo, state.cycleNumero);
      const dataToSave = {
        ...state,
        derniereSauvegarde: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Impossible de sauvegarder le brouillon dans localStorage', e);
    }
  },

  /**
   * Récupère un brouillon spécifique
   */
  loadDraft(application: string, pseudo?: string, cycleNumero?: number): ModuleSessionState | null {
    try {
      if (pseudo && cycleNumero) {
        const key = this.getStorageKey(application, pseudo, cycleNumero);
        const item = localStorage.getItem(key);
        if (item) return JSON.parse(item);
      }

      // Recherche du brouillon le plus récent pour cette application
      const prefix = `pdca:${application}:`;
      let latest: { state: ModuleSessionState; timestamp: number } | null = null;

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed: ModuleSessionState = JSON.parse(raw);
              const ts = parsed.derniereSauvegarde
                ? new Date(parsed.derniereSauvegarde).getTime()
                : 0;
              if (!latest || ts > latest.timestamp) {
                latest = { state: parsed, timestamp: ts };
              }
            }
          } catch {
            // Ignorer entrée corrompue
          }
        }
      }

      return latest ? latest.state : null;
    } catch (e) {
      console.warn('Erreur lors du chargement du brouillon', e);
      return null;
    }
  },

  /**
   * Liste tous les brouillons sauvegardés pour toutes les applications (utilisé par P13)
   */
  listAllDrafts(): Array<{ key: string; state: ModuleSessionState }> {
    const results: Array<{ key: string; state: ModuleSessionState }> = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('pdca:')) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.application) {
                results.push({ key: k, state: parsed });
              }
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      console.warn('Erreur lors du listage des brouillons', e);
    }
    return results;
  },

  /**
   * Supprime un brouillon
   */
  removeDraft(application: string, pseudo: string, cycleNumero: number): void {
    try {
      const key = this.getStorageKey(application, pseudo, cycleNumero);
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Erreur lors de la suppression du brouillon', e);
    }
  },

  /**
   * Évalue le statut d'un indicateur selon les seuils du référentiel
   */
  kpiStatus(kpiCode: string, value: number): StatutIndicateur {
    const meta = INDICATEURS_REFERENTIEL[kpiCode];
    if (!meta || isNaN(value)) return 'orange';

    const { vert, orange, rouge } = meta.seuils;

    // Règle d'inversion pour K08 (Taux d'abandon où le plus bas est le meilleur)
    if (kpiCode === 'K08') {
      if (vert.max !== undefined && value <= vert.max) return 'vert';
      if (rouge.min !== undefined && value >= rouge.min) return 'rouge';
      return 'orange';
    }

    if (vert.min !== undefined && value >= vert.min) return 'vert';
    if (rouge.max !== undefined && value <= rouge.max) return 'rouge';
    if (orange.min !== undefined && orange.max !== undefined) {
      if (value >= orange.min && value <= orange.max) return 'orange';
    }
    return 'orange';
  },

  /**
   * Construit un objet conforme au Schéma d'export v1.1
   */
  buildExport(state: ModuleSessionState, portee: PorteeExport = 'cycle'): PDCAExport {
    const today = new Date().toISOString().split('T')[0];

    return {
      schema: 'prospection-pdca/resultat',
      schema_version: '1.1',
      application: state.application,
      referentiel: '2.2',
      portee,
      etape_actuelle: state.etapeActuelle,
      date: today,
      participant: {
        pseudo: state.pseudo || 'anonyme',
        role: 'participant',
        contexte: state.contexte
      },
      cycle: {
        numero: state.cycleNumero || 1,
        nom: `Cycle ${state.cycleNumero || 1} - ${state.application}`,
        objectif: state.etapes?.act?.prochain_cycle?.objectif || 'Optimisation continue de prospection'
      },
      fiches: state.fiches,
      etapes: {
        comprendre: state.etapes?.comprendre || {},
        plan: state.etapes?.plan || {},
        do: state.etapes?.do || {},
        check: state.etapes?.check || { indicateurs: {} },
        act: state.etapes?.act || { decisions: [], ajustements_methode: [], prochain_cycle: { numero: 2, objectif: '', fiches_recommandees: [], date_cible: '' } }
      },
      metadonnees: {
        exporteur: 'Prospection PDCA AI Studio',
        version_app: '1.0.0',
        mode_ia_active: state.modeIAActive,
        date_export: new Date().toISOString()
      }
    };
  },

  /**
   * Nom de fichier standardisé : {application}_{pseudo}_c{cycle}_{etape|cycle}_{YYYY-MM-DD}.json
   */
  generateFilename(exportData: PDCAExport): string {
    const safeApp = (exportData.application || 'P0').toUpperCase();
    const safePseudo = (exportData.participant.pseudo || 'anonyme')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');
    const cycle = exportData.cycle.numero || 1;
    const portee = exportData.portee || 'cycle';
    const date = exportData.date || new Date().toISOString().split('T')[0];
    return `${safeApp}_${safePseudo}_c${cycle}_${portee}_${date}.json`;
  },

  /**
   * Télécharge un objet JSON en fichier local
   */
  exportJSON(exportData: PDCAExport, customFilename?: string): void {
    const filename = customFilename || this.generateFilename(exportData);
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Valide un objet importé contre le schéma minimal
   */
  validateImport(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Le fichier importé n\'est pas un objet JSON valide.'] };
    }

    if (data.schema !== 'prospection-pdca/resultat') {
      errors.push(`Schéma invalide : attendu "prospection-pdca/resultat", reçu "${data.schema}".`);
    }

    if (!data.application || typeof data.application !== 'string') {
      errors.push('Identifiant de module (application) manquant ou invalide.');
    }

    if (!data.participant || !data.participant.pseudo) {
      errors.push('Identité du participant (pseudo) manquante.');
    }

    if (!data.cycle || typeof data.cycle.numero !== 'number') {
      errors.push('Numéro de cycle PDCA manquant.');
    }

    if (!data.etapes || typeof data.etapes !== 'object') {
      errors.push('Structure des étapes PDCA manquante.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Parse et valide un texte JSON importé
   */
  importJSON(jsonString: string): { valid: boolean; data?: PDCAExport; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const validation = this.validateImport(parsed);
      if (!validation.valid) {
        return {
          valid: false,
          error: validation.errors.join(' | ')
        };
      }
      return { valid: true, data: parsed as PDCAExport };
    } catch (e: any) {
      return {
        valid: false,
        error: `Erreur de syntaxe JSON : ${e?.message || 'fichier non lisible'}`
      };
    }
  },

  /**
   * Génère un rapport de synthèse au format Markdown
   */
  syntheseMarkdown(data: PDCAExport): string {
    const p = data.participant;
    const c = data.cycle;
    const today = data.date || new Date().toISOString().split('T')[0];

    let md = `# Synthèse de cycle PDCA — Prospection Commerciale\n\n`;
    md += `**Module :** ${data.application} | **Cycle :** N°${c.numero} | **Date :** ${today}\n`;
    md += `**Participant :** ${p.pseudo} (${p.contexte?.secteur || 'Secteur non spécifié'})\n`;
    md += `**Fiches méthodologiques mobilisées :** ${data.fiches.join(', ') || 'N/A'}\n\n`;
    md += `---\n\n`;

    md += `## 1. Comprendre & Diagnostic\n`;
    if (data.etapes.comprendre?.notes) {
      md += `${data.etapes.comprendre.notes}\n\n`;
    } else {
      md += `*Diagnostic réalisé sur la base des fiches de référence.*\n\n`;
    }

    md += `## 2. Plan (Planification & Engagements)\n`;
    const smarts = data.etapes.plan?.objectifs_smart || [];
    if (smarts.length > 0) {
      md += `### Objectifs SMART retenus :\n`;
      smarts.forEach((obj, idx) => {
        md += `- **Objectif ${idx + 1} :** ${obj.specifique}\n`;
        md += `  - *Mesure :* ${obj.mesurable} | *Délai :* ${obj.temporel}\n`;
      });
      md += `\n`;
    }

    md += `## 3. Do (Mise en Action & Pratique)\n`;
    const actions = data.etapes.do?.journal_actions || [];
    if (actions.length > 0) {
      md += `### Actions enregistrées (${actions.length}) :\n`;
      actions.slice(-5).forEach((act) => {
        md += `- [${act.horodatage}] **${act.action}** : ${act.resultat || 'Effectué'}\n`;
      });
      md += `\n`;
    } else {
      md += `*Pratique et simulation consignées dans le journal d'activité.*\n\n`;
    }

    md += `## 4. Check (Mesure & Évaluation des Écarts)\n`;
    const indicateurs = data.etapes.check?.indicateurs || {};
    const kpiEntries = Object.entries(indicateurs);
    if (kpiEntries.length > 0) {
      md += `| Indicateur | Valeur observée | Cible | Statut |\n`;
      md += `|---|---|---|---|\n`;
      kpiEntries.forEach(([code, item]) => {
        const badge = item.statut === 'vert' ? '🟢 Conforme' : item.statut === 'orange' ? '🟠 Attention' : '🔴 Alerte';
        md += `| ${code} - ${item.nom} | **${item.valeur}${item.unite || ''}** | ${item.cible ? item.cible + (item.unite || '') : '-'} | ${badge} |\n`;
      });
      md += `\n`;
    }

    md += `## 5. Act (Ajustements & Prochain Cycle)\n`;
    const decisions = data.etapes.act?.decisions || [];
    if (decisions.length > 0) {
      md += `### Décisions d'ancrage et d'ajustement :\n`;
      decisions.forEach((d) => {
        md += `- ${d}\n`;
      });
      md += `\n`;
    }

    const next = data.etapes.act?.prochain_cycle;
    if (next) {
      md += `### Cap pour le Cycle N°${next.numero} :\n`;
      md += `> **Objectif :** ${next.objectif}\n`;
      if (next.fiches_recommandees && next.fiches_recommandees.length > 0) {
        md += `> **Méthodes recommandées :** ${next.fiches_recommandees.join(', ')}\n`;
      }
      if (next.date_cible) {
        md += `> **Date cible de revue :** ${next.date_cible}\n`;
      }
    }

    return md;
  },

  /**
   * Exporte les indicateurs en CSV tabulaire
   */
  exportCSV(exports: PDCAExport | PDCAExport[]): void {
    const list = Array.isArray(exports) ? exports : [exports];
    let csv = `Date,Application,Participant,Cycle,Indicateur,Nom,Valeur,Unite,Cible,Statut\n`;

    list.forEach((item) => {
      const d = item.date || '';
      const app = item.application || '';
      const pseudo = item.participant.pseudo || '';
      const cycle = item.cycle.numero || 1;
      const kpis = item.etapes.check?.indicateurs || {};

      Object.entries(kpis).forEach(([code, k]) => {
        csv += `"${d}","${app}","${pseudo}",${cycle},"${code}","${k.nom.replace(/"/g, '""')}",${k.valeur},"${k.unite || ''}",${k.cible || ''},"${k.statut}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synthese_pdca_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Calcul du Z-Score pour comparaison A/B de taux de conversion (K06)
   */
  calculateZScore(
    successA: number,
    totalA: number,
    successB: number,
    totalB: number
  ): { zScore: number; pValue: number; significance: number; isSignificant: boolean } {
    if (totalA <= 0 || totalB <= 0) {
      return { zScore: 0, pValue: 1, significance: 0, isSignificant: false };
    }

    const p1 = successA / totalA;
    const p2 = successB / totalB;
    const pPool = (successA + successB) / (totalA + totalB);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / totalA + 1 / totalB));

    if (se === 0) {
      return { zScore: 0, pValue: 1, significance: 0, isSignificant: false };
    }

    const z = (p2 - p1) / se;
    // Approximation standard de la p-value bilatérale
    const absZ = Math.abs(z);
    const pValue = 2 * (1 - this.approximateNormCDF(absZ));
    const significance = Math.max(0, Math.min(100, Math.round((1 - pValue) * 1000) / 10));

    return {
      zScore: Math.round(z * 100) / 100,
      pValue: Math.round(pValue * 1000) / 1000,
      significance,
      isSignificant: pValue < 0.05
    };
  },

  /**
   * Fonction de répartition normale centrée réduite approximée
   */
  approximateNormCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * x);
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const prob =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return 1 - prob;
  },

  // ==========================================
  // CONTRATS DE TRANSFERT INTER-MODULES
  // ==========================================

  /**
   * Transfert P6 (Valeur + VRIO) vers P7 (Studio de Pitch)
   */
  transformP6ToP7(p6Export: PDCAExport): {
    pains: string[];
    gains: string[];
    argumentsVrio: string[];
    offre: string;
  } {
    const doData = p6Export.etapes.do?.donnees_brutes || {};
    return {
      pains: doData.pains || ['Manque de temps et dispersion', 'Faible taux de réponse aux sollicitations'],
      gains: doData.gains || ['Augmentation du nombre de rendez-vous qualifiés', 'Visibilité sereine sur le pipe'],
      argumentsVrio: doData.arguments_retenus || ['Méthodologie d\'approche éprouvée sur 150 comptes', 'Garantie de non-redondance'],
      offre: p6Export.participant.contexte?.offre || 'Accompagnement commercial stratégique'
    };
  },

  /**
   * Transfert P7 (Pitch) vers P10 (SONCAS)
   */
  transformP7ToP10(p7Export: PDCAExport): {
    pitchAccroche: string;
    argumentsCabp: Array<{ c: string; a: string; b: string; p: string }>;
  } {
    const doData = p7Export.etapes.do?.donnees_brutes || {};
    return {
      pitchAccroche: doData.pitch_30s || '',
      argumentsCabp: doData.cabp_list || []
    };
  },

  /**
   * Transfert P8 (Personas + Séquence) vers P9 (AIDA)
   */
  transformP8ToP9(p8Export: PDCAExport): {
    personaNom: string;
    personaRole: string;
    painPoint: string;
    declencheur: string;
  } {
    const doData = p8Export.etapes.do?.donnees_brutes || {};
    const personas = doData.personas || [];
    const mainPersona = personas[0] || {};
    return {
      personaNom: mainPersona.nom || 'Directeur Commercial',
      personaRole: mainPersona.role || 'Décideur final',
      painPoint: mainPersona.douleur_principale || 'Pipeline irrégulier et perte d\'énergie',
      declencheur: mainPersona.declencheur || 'Objectifs de croissance annuels non atteints'
    };
  }
};
