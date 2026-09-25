/**
 * gemini.ts
 * Wrapper côté client pour les fonctionnalités optionnelles "Mode IA (bêta)".
 * Dégradable sans blocage : en cas d'absence de clé, d'erreur serveur ou de réseau,
 * bascule silencieusement sur les banques de repli statiques pré-rédigées.
 */

export interface CritiqueAIDAResult {
  attention: string;
  interet: string;
  desir: string;
  action: string;
  points_forts: string[];
  vigilances: string[];
  score_global_indicatif: number; // 0 à 10
}

export interface RepliqueSoncasResult {
  replique: string;
  ton: string;
  signaux_visibles: string[];
}

export interface ExempleGenereResult {
  secteur: string;
  public_cible: string;
  mise_en_situation: string;
  application_principe: string;
  resultat_attendu: string;
}

export const geminiService = {
  /**
   * P0 : Génération d'un exemple d'illustration contextualisé
   */
  async generateP0Example(
    ficheCode: string,
    ficheTitre: string,
    principe: string,
    secteur: string = 'Services B2B & Conseil',
    publicCible: string = 'Dirigeants de PME'
  ): Promise<ExempleGenereResult> {
    try {
      const response = await fetch('/api/gemini/p0-example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ficheCode, ficheTitre, principe, secteur, publicCible })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.application_principe) {
          return data;
        }
      }
    } catch {
      // Échec silencieux -> repli statique
    }

    // Repli statique garanti
    return {
      secteur,
      public_cible: publicCible,
      mise_en_situation: `Cas d'usage concret dans le secteur « ${secteur} » auprès de « ${publicCible} » :`,
      application_principe: `Mise en oeuvre de ${ficheCode} (${ficheTitre}) : le commercial structure son action selon le principe (${principe.slice(0, 140)}...) en adaptant son vocabulaire aux enjeux opérationnels du client sans jamais forcer la décision.`,
      resultat_attendu: 'Prise de conscience du prospect et ouverture d\'un canal d\'échange régulier et mutuellement constructif.'
    };
  },

  /**
   * P9 : Critique pédagogique bloc par bloc d'un message AIDA (ne réécrit JAMAIS le message)
   */
  async critiqueAIDA(
    attention: string,
    interet: string,
    desir: string,
    action: string,
    contexte: { secteur?: string; public?: string } = {}
  ): Promise<CritiqueAIDAResult> {
    try {
      const response = await fetch('/api/gemini/p9-critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attention, interet, desir, action, contexte })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.attention) {
          return data;
        }
      }
    } catch {
      // Repli statique
    }

    // Analyse heuristique statique de repli
    const spamWords = ['gratuit', 'révolutionnaire', 'incroyable', 'meilleure offre', 'sans engagement', '100% garanti'];
    const fullText = `${attention} ${interet} ${desir} ${action}`.toLowerCase();
    const foundSpams = spamWords.filter((w) => fullText.includes(w));
    const questionMarksInAction = (action.match(/\?/g) || []).length;

    const pointsForts: string[] = [];
    const vigilances: string[] = [];

    if (attention.length > 10 && attention.length < 90) {
      pointsForts.push('Accroche concise et percutante (bonne longueur).');
    } else {
      vigilances.push('L\'accroche gagne à être resserrée pour être lue en 3 secondes.');
    }

    if (foundSpams.length > 0) {
      vigilances.push(`Mots d'hyper-vente détectés (${foundSpams.join(', ')}) : risque de déclencher les filtres anti-spam ou la méfiance.`);
    } else {
      pointsForts.push('Vocabulaire sobre, sans terminologie d\'hyper-vente artificielle.');
    }

    if (questionMarksInAction === 1) {
      pointsForts.push('Un seul appel à l\'action (CTA unique respecté), sans surcharge cognitive.');
    } else if (questionMarksInAction > 1) {
      vigilances.push('Plusieurs questions dans l\'action : ne demandez qu\'une seule chose à la fois pour faciliter la réponse.');
    } else {
      vigilances.push('L\'action gagnerait à être formulée sous forme d\'une question légère à faible friction.');
    }

    return {
      attention: attention.trim()
        ? 'L\'accroche interpelle bien sur le contexte, veillez à toujours commencer par le sujet du prospect plutôt que par votre entreprise.'
        : 'Bloc Attention vide : l\'objet et la première phrase sont déterminants pour le taux d\'ouverture.',
      interet: interet.trim()
        ? 'Le problème est formulé. Assurez-vous que le prospect se reconnaisse instantanément dans la douleur évoquée.'
        : 'Bloc Intérêt vide : explicitez la friction ou l\'enjeu métier auquel fait face l\'interlocuteur.',
      desir: desir.trim()
        ? 'La projection du bénéfice est claire. Vérifiez que vous apportez une preuve concrète ou un indicateur mesurable.'
        : 'Bloc Désir vide : projetez la valeur sans tomber dans l\'inventaire technique.',
      action: action.trim()
        ? 'La demande d\'action est présente. Veillez à ce que l\'effort demandé soit minime (ex: valider un intérêt plutôt que signer un devis).'
        : 'Bloc Action vide : terminez impérativement par une demande claire et courtoise.',
      points_forts: pointsForts.length > 0 ? pointsForts : ['Structure AIDA globalement respectée.'],
      vigilances: vigilances.length > 0 ? vigilances : ['Vérifier la délivrabilité technique et la pertinence de l\'échantillon.'],
      score_global_indicatif: Math.max(5, 8 - vigilances.length + pointsForts.length)
    };
  },

  /**
   * P10 : Réplique du prospect selon son mobile SONCAS caché
   */
  async generateSoncasReply(
    profilSoncas: string, // Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie
    historiqueEchanges: Array<{ emetteur: 'commercial' | 'prospect'; texte: string }>,
    dernierMessageCommercial: string
  ): Promise<RepliqueSoncasResult> {
    try {
      const response = await fetch('/api/gemini/p10-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilSoncas, historiqueEchanges, dernierMessageCommercial })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.replique) {
          return data;
        }
      }
    } catch {
      // Repli statique
    }

    // Banque de repli statique par mobile SONCAS
    const banque: Record<string, RepliqueSoncasResult[]> = {
      Sécurité: [
        {
          replique: "Écoutez, nous travaillons déjà avec notre prestataire habituel depuis 4 ans. Changer maintenant représente un risque opérationnel lourd. Qui me garantit que vos process ne vont pas planter notre production ?",
          ton: 'Prudent, réservé, attentif aux certifications et aux preuves.',
          signaux_visibles: ['Mention de l\'ancienneté', 'Crainte de la panne', 'Besoin de garanties contractuelles']
        },
        {
          replique: "Vos arguments ont l'air séduisants, mais quelles références vérifiables pouvez-vous me fournir dans notre branche exacte ? Avez-vous une homologation officielle ?",
          ton: 'Vérificateur, demande des preuves formelles.',
          signaux_visibles: ['Références secteur', 'Validation externe']
        }
      ],
      Orgueil: [
        {
          replique: "Nous sommes leaders sur notre secteur. Je ne cherche pas une solution standard pour débutants, mais ce qui se fait de plus exclusif pour consolider notre avance stratégique.",
          ton: 'Exigeant, fier, sensible à l\'image et au statut.',
          signaux_visibles: ['Affirmation du leadership', 'Refus de la banalité', 'Valorisation personnelle']
        },
        {
          replique: "Est-ce que votre méthodologie a été conçue pour des organisations de notre envergure ? Je ne veux pas que mon équipe perde son temps sur des outils basiques.",
          ton: 'Assertif, soucieux de sa réputation interne.',
          signaux_visibles: ['Taille de la structure', 'Peur de perdre la face']
        }
      ],
      Nouveauté: [
        {
          replique: "Ce qui m'intéresse, c'est ce que votre approche apporte de réellement en rupture. Est-ce que vous utilisez des technologies récentes ou est-ce du classique repackagé ?",
          ton: 'Curieux, enthousiaste, tourné vers l\'innovation.',
          signaux_visibles: ['Quête d\'originalité', 'Attrait pour l\'inédit']
        }
      ],
      Confort: [
        {
          replique: "Honnêtement, nous sommes déjà sous l'eau. Si votre solution me demande 3 semaines de paramétrage et de formation de mes équipes, ce sera non d'office. Est-ce que c'est clé en main ?",
          ton: 'Pressé, pragmatique, fuyant la complexité.',
          signaux_visibles: ['Surcharge mentale', 'Refus de la complexité', 'Recherche du "clé en main"']
        }
      ],
      Argent: [
        {
          replique: "Très bien, mais parlons chiffres : quel est le coût global et sous quel délai mesurons-nous un retour sur investissement concret ? Nous devons serrer les budgets ce trimestre.",
          ton: 'Calculateur, attentif au ratio coût/gain.',
          signaux_visibles: ['Mots : ROI, coût, budget', 'Recherche d\'économies directes']
        }
      ],
      Sympathie: [
        {
          replique: "C'est agréable d'échanger avec vous, vous avez l'air de bien comprendre nos réalités. J'aime bien collaborer avec des partenaires accessibles et disponibles. Comment fonctionne le suivi humain ?",
          ton: 'Chaleureux, relationnel, axé sur l\'écoute.',
          signaux_visibles: ['Sensibilité au contact', 'Attachement au partenariat humain']
        }
      ]
    };

    const options = banque[profilSoncas] || banque['Sécurité'];
    const idx = Math.floor(Math.random() * options.length);
    return options[idx];
  }
};
