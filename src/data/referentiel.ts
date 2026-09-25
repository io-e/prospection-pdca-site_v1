/**
 * Referentiel_Methodes_Prospection_PDCA_v2.2.ts
 * Référentiel méthodologique complet (Fiches M01-M21 et Indicateurs K01-K15).
 * Tous les champs et contenus sont strictement en français.
 */

export interface FicheMethode {
  code: string;
  titre: string;
  sous_titre: string;
  phase_dominante: 'Plan' | 'Do' | 'Check' | 'Act' | 'Universel';
  temps_estime: string;
  principe: string;
  regles: string[];
  questions_cles: string[];
  kpi_lies: string[];
  exemple_b2b: string;
  pieges: string[];
  modules_recommandes: string[];
}

export interface IndicateurMethode {
  code: string;
  nom: string;
  description: string;
  formule: string;
  unite: string;
  frequence: string;
  seuils: {
    vert: { min?: number; max?: number; label: string };
    orange: { min?: number; max?: number; label: string };
    rouge: { min?: number; max?: number; label: string };
  };
  recommandation: string;
}

export const FICHES_REFERENTIEL: Record<string, FicheMethode> = {
  M01: {
    code: 'M01',
    titre: 'Pyramide de Maslow appliquée à la vente',
    sous_titre: 'Identifier les niveaux de besoin fondamentaux du prospect',
    phase_dominante: 'Plan',
    temps_estime: '25 min',
    principe: "La hiérarchie des besoins d'Abraham Maslow permet de positionner l'argumentaire au niveau exact de préoccupation du prospect : besoins physiologiques/opérationnels, sécurité et continuité, appartenance et conformité de secteur, estime et reconnaissance statutaire, et accomplissement stratégique.",
    regles: [
      'Ne jamais proposer une solution de niveau "Estime" ou "Accomplissement" si les besoins de "Sécurité" opérationnelle ne sont pas garantis.',
      'Valider le niveau d\'écoute actif avant de monter en gamme d\'arguments.',
      'Distinguer les besoins de la personne (interlocuteur) de ceux de l\'organisation.'
    ],
    questions_cles: [
      'Quel est le niveau de risque perçu par l\'interlocuteur en changeant de prestataire ?',
      'Quelle est sa quête personnelle de valorisation interne ?',
      'L\'offre sécurise-t-elle ses opérations courantes avant d\'optimiser ses performances ?'
    ],
    kpi_lies: ['K01', 'K11'],
    exemple_b2b: 'Dans la vente de logiciels de cybersécurité, adresser d\'abord la Sécurité (continuité d\'activité, conformité RGPD) avant l\'Accomplissement (image d\'entreprise innovante).',
    pieges: [
      'Sur-vendre l\'innovation à un DSI terrorisé par la panne.',
      'Confondre besoin exprimé et besoin fondamental latent.'
    ],
    modules_recommandes: ['P1', 'P0']
  },
  M02: {
    code: 'M02',
    titre: "Théorie de l'autodétermination (Deci & Ryan)",
    sous_titre: 'Activer la motivation intrinsèque en prospection',
    phase_dominante: 'Plan',
    temps_estime: '30 min',
    principe: "La motivation humaine durable repose sur trois besoins psychologiques universels : l'Autonomie (sentiment de contrôle), la Compétence (sentiment d'efficacité et maîtrise) et l'Affiliation (sentiment de connexion aux autres). Une prospection contrainte et mécanique s'essouffle rapidement.",
    regles: [
      'Favoriser des objectifs de maîtrise (qualité de l\'échange) plutôt que de pure pression de résultat.',
      'Accorder l\'autonomie sur le choix des canaux et des angles d\'attaque.',
      'Célébrer les apprentissages et les micro-victoires pour renforcer le sentiment de compétence.'
    ],
    questions_cles: [
      'Ai-je le sentiment de choisir ma stratégie de prospection ou de la subir ?',
      'Quels retours concrets confirment ma progression technique ?',
      'Avec quels pairs puis-je partager mes succès et mes doutes ?'
    ],
    kpi_lies: ['K01', 'K11'],
    exemple_b2b: 'Un commercial qui choisit d\'alterner 30 min d\'appels ciblés et 30 min de messages vidéo personnalisés préserve son autonomie et son énergie.',
    pieges: [
      'Pression par les seuls quotas quantitatifs destructeurs de sens.',
      'Isolement du prospecteur sans espace de débriefing bienveillant.'
    ],
    modules_recommandes: ['P1', 'P2']
  },
  M03: {
    code: 'M03',
    titre: 'Objectifs SMART en prospection',
    sous_titre: 'Formuler des engagements précis, mesurables et réalistes',
    phase_dominante: 'Plan',
    temps_estime: '25 min',
    principe: 'Un engagement commercial flou produit des résultats aléatoires. La méthode SMART garantit que chaque objectif est Spécifique (action claire), Mesurable (chiffré), Atteignable (ressources suffisantes), Réaliste (adapté au marché) et Temporellement défini (échéance ferme).',
    regles: [
      'Distinguer les objectifs d\'action (ex: 20 appels passés) des objectifs de résultat (ex: 3 RDV pris).',
      'Fixer un objectif d\'action sous son contrôle direct.',
      'Verrouiller une date et une heure de bilan régulières.'
    ],
    questions_cles: [
      'L\'objectif dépend-il uniquement de mes actions ou de tiers extérieurs ?',
      'Comment saurai-je exactement que l\'objectif est atteint ?',
      'Le créneau d\'exécution est-il sanctuarisé dans mon agenda ?'
    ],
    kpi_lies: ['K01', 'K02'],
    exemple_b2b: '"Contacter 15 DRH du secteur logistique via LinkedIn avec un message personnalisé entre mardi 9h et 11h, et décrocher au moins 2 appels de découverte avant vendredi."',
    pieges: [
      'Confondre voeu pieux ("faire plus de prospection") et objectif SMART.',
      'Surcharger la cible au point de provoquer l\'abandon avant le départ.'
    ],
    modules_recommandes: ['P1', 'P5', 'P12']
  },
  M04: {
    code: 'M04',
    titre: 'Modèle transthéorique du changement (Prochaska)',
    sous_titre: 'Comprendre et accompagner les étapes psychologiques de transition',
    phase_dominante: 'Plan',
    temps_estime: '35 min',
    principe: 'Le passage à l\'action suit 6 étapes incompressibles : Précontemplation (déni du besoin), Contemplation (conscience du problème sans décision), Préparation (planification active), Action (mise en oeuvre), Maintien (ancrage de l\'habitude) et Prévention de la rechute.',
    regles: [
      'Identifier l\'étape exacte avant de prescrire une méthode.',
      'Ne pas forcer l\'action immédiate chez un individu encore en phase de contemplation.',
      'Prévoir un plan de secours documenté pour les phases inévitables de baisse de régime.'
    ],
    questions_cles: [
      'À quelle étape me situé-je par rapport à la prospection téléphonique ?',
      'Quels bénéfices tangibles déclencheront mon passage à l\'action ?',
      'Quel signal d\'alarme m\'indiquera un risque de rechute vers la procrastination ?'
    ],
    kpi_lies: ['K09', 'K10'],
    exemple_b2b: 'Un consultant indépendant qui sait qu\'il doit prospecter (Contemplation) doit d\'abord préparer sa cible et ses scripts (Préparation) avant de se fixer 50 appels par jour (Action).',
    pieges: [
      'Vouloir sauter l\'étape de préparation mentale et logistique.',
      'Considérer une pause temporaire comme un échec définitif.'
    ],
    modules_recommandes: ['P2', 'P0']
  },
  M05: {
    code: 'M05',
    titre: 'Balance décisionnelle et Échelle de confiance',
    sous_titre: 'Peser les coûts de l\'inaction et évaluer sa confiance d\'exécution',
    phase_dominante: 'Plan',
    temps_estime: '30 min',
    principe: "La balance décisionnelle met en miroir 4 cadrans : Coûts du statu quo, Bénéfices du statu quo, Coûts du changement et Bénéfices du changement. L'échelle de confiance (1 à 10) mesure la probabilité d'exécution et permet d'explorer ce qui manque pour gagner 2 points.",
    regles: [
      'Toujours clarifier le coût de l\'inaction (perte de CA, dépendance à un seul client).',
      'Si le score de confiance est inférieur à 7/10, réduire immédiatement la difficulté de l\'action.',
      'Demander : "Pourquoi pas 2 crans en dessous ?" pour révéler les motivations déjà présentes.'
    ],
    questions_cles: [
      'Que me coûte réellement le fait de ne pas prospecter cette semaine ?',
      'Sur une échelle de 1 à 10, quel est mon niveau de confiance pour réussir ce créneau ?',
      'Que faudrait-il pour que mon 6 devienne un 8 ?'
    ],
    kpi_lies: ['K09', 'K10'],
    exemple_b2b: 'Statu quo : "Je reste sur mes dossiers confortables mais mon pipeline sera vide dans 3 mois." Changement : "1h d\'appels me stresse mais m\'assure 2 nouveaux contrats réguliers."',
    pieges: [
      'Ignorer les bénéfices cachés du statu quo (confort, absence de rejet).',
      'Maintenir un plan avec une confiance à 4/10 sans le simplifier.'
    ],
    modules_recommandes: ['P2', 'P1']
  },
  M06: {
    code: 'M06',
    titre: 'Technique Pomodoro et Blocs de prospection',
    sous_titre: 'Structurer des sessions intenses de 25 min protégées de toute distraction',
    phase_dominante: 'Do',
    temps_estime: '25 min',
    principe: 'Fractionner le temps en blocs stricts de 25 minutes de travail ininterrompu suivis de 5 minutes de pause déconnectée. Après 4 blocs, accorder une pause longue (15-30 min). Ce rythme protège la charge mentale et neutralise le multitâche.',
    regles: [
      'Téléphone en mode "ne pas déranger", boîte mail fermée, onglets superflus masqués.',
      'Toute interruption imprévue est notée sur un brouillon et traitée APRÈS le Pomodoro.',
      'Si le bloc est interrompu de force, il est annulé et réinitialisé.'
    ],
    questions_cles: [
      'Ma liste de contacts et mes coordonnées sont-elles prêtes AVANT de lancer le chronomètre ?',
      'Ai-je sanctuarisé mon environnement physique et numérique ?',
      'Comment vais-je récompenser mon cerveau pendant la pause de 5 minutes ?'
    ],
    kpi_lies: ['K01', 'K02', 'K08'],
    exemple_b2b: 'Bloquer 2 Pomodoros le mardi matin : 25 min d\'appels directs sans consulter LinkedIn, 5 min d\'étirements, 25 min de relances e-mails ciblées.',
    pieges: [
      'Ouvrir sa boîte e-mail ou Slack pendant la pause de 5 minutes.',
      'Préparer ses contacts pendant le Pomodoro au lieu d\'agir directement.'
    ],
    modules_recommandes: ['P3', 'P5']
  },
  M07: {
    code: 'M07',
    titre: 'Loi de Pareto (80/20) et Analyse ABC',
    sous_titre: 'Concentrer l\'énergie commerciale sur les 20% de comptes clés',
    phase_dominante: 'Plan',
    temps_estime: '30 min',
    principe: "80% des résultats commerciaux proviennent généralement de 20% des efforts et des cibles. La segmentation ABC affine ce principe : Groupe A (20% des prospects générant 70-80% de la valeur), Groupe B (30% apportant 15-20%), Groupe C (50% n'apportant que 5-10%).",
    regles: [
      'Allouer au minimum 60% du temps de prospection active sur les comptes de profil A.',
      'Automatiser ou mutualiser le traitement des comptes du groupe C.',
      'Réévaluer la classification tous les trimestres en fonction des conversions réelles.'
    ],
    questions_cles: [
      'Quels sont les 3 critères objectifs qui caractérisent mes prospects de catégorie A ?',
      'Combien d\'heures ai-je consacrées cette semaine à des comptes à faible potentiel ?',
      'Quelle offre standardisée puis-je proposer aux catégories C ?'
    ],
    kpi_lies: ['K04', 'K07'],
    exemple_b2b: 'Entreprises de plus de 100 salariés avec filiales à l\'international (A) : approche sur-mesure multicanale. TPE locales (C) : webinaires et e-mailing automatisé.',
    pieges: [
      'Traiter tous les prospects avec la même intensité chronophage.',
      'S\'attarder sur des comptes C "sympathiques" mais financièrement marginaux.'
    ],
    modules_recommandes: ['P4', 'P8', 'P12']
  },
  M08: {
    code: 'M08',
    titre: 'Règle des 2 minutes et Boîte anti-procrastination',
    sous_titre: 'Éliminer instantanément les micro-actions bloquantes',
    phase_dominante: 'Do',
    temps_estime: '20 min',
    principe: "Issue de la méthode GTD (Getting Things Done), la règle stipule que toute micro-tâche prenant moins de 2 minutes (ex: valider un contact CRM, envoyer un lien de documentation, caler une invitation agenda) doit être exécutée sur-le-champ au lieu d'être différée.",
    regles: [
      'Si l\'action prend moins de 120 secondes : la faire immédiatement.',
      'Si elle prend plus de 2 minutes : la planifier dans un bloc dédié ou la déléguer.',
      'Tenir une "Boîte d\'atterrissage" pour noter les idées parasites en cours de session.'
    ],
    questions_cles: [
      'Cette tâche nécessite-t-elle une vraie réflexion ou un simple clic ?',
      'Combien de micro-tâches en souffrance encombrent mon esprit ?',
      'Puis-je vider ma boîte d\'atterrissage en 10 minutes en fin de journée ?'
    ],
    kpi_lies: ['K02', 'K03'],
    exemple_b2b: 'Envoyer l\'invitation Google Calendar immédiatement après avoir raccroché avec un prospect pour sécuriser le créneau avant qu\'il n\'oublie.',
    pieges: [
      'Enchaîner 30 micro-tâches pour fuir l\'appel difficile de prospection.',
      'Sous-estimer une tâche complexe en la croyant réalisable en 2 minutes.'
    ],
    modules_recommandes: ['P3', 'P5']
  },
  M09: {
    code: 'M09',
    titre: "Matrice d'Eisenhower",
    sous_titre: 'Arbitrer impitoyablement entre Urgence et Importance',
    phase_dominante: 'Plan',
    temps_estime: '25 min',
    principe: 'Classer toutes les sollicitations en 4 quadrants : Q1 (Urgent & Important : Crises, signer un devis chaud), Q2 (Non Urgent & Important : Prospection, formation, stratégie), Q3 (Urgent & Non Important : Sollicitations imprévues, interruptions), Q4 (Non Urgent & Non Important : Scroll stérile, futilités).',
    regles: [
      'La prospection de fond appartient impérativement au Quadrant 2.',
      'Le Quadrant 2 doit être planifié et protégé, sinon il est dévoré par les urgences Q1 et Q3.',
      'Éliminer ou automatiser sans scrupule les activités du Quadrant 4.'
    ],
    questions_cles: [
      'Quel pourcentage de ma semaine ai-je alloué au Quadrant 2 (prospection future) ?',
      'Quelles urgences de ma journée étaient en réalité les priorités de quelqu\'un d\'autre ?',
      'Quelle tâche puis-je refuser ou déléguer dès demain ?'
    ],
    kpi_lies: ['K01', 'K12'],
    exemple_b2b: 'Plutôt que d\'éteindre un incendie administratif toute la matinée, sanctuariser 9h-10h30 pour la prospection Q2 avant de rouvrir sa messagerie.',
    pieges: [
      'Confondre urgence perçue (une notification) et importance stratégique (un nouveau client).',
      'Vivre en permanence dans le stress du Quadrant 1.'
    ],
    modules_recommandes: ['P5', 'P12']
  },
  M10: {
    code: 'M10',
    titre: 'Semaine type et Time blocking',
    sous_titre: 'Sanctuariser des plages régulières de prospection dans son agenda',
    phase_dominante: 'Plan',
    temps_estime: '30 min',
    principe: 'Le "Time blocking" consiste à attribuer à chaque type de tâche commerciale un bloc horaire récurrent, étanche et prévisible dans la semaine type. Quand la prospection a son rendez-vous fixe avec soi-même, elle cesse d\'être la variable d\'ajustement.',
    regles: [
      'Placer les créneaux d\'appels sur les pics d\'énergie et de joignabilité (souvent mardi/jeudi 9h-11h30 et 14h-16h).',
      'Prévoir un bloc de préparation de données en amont du bloc d\'appels.',
      'Inclure un bloc de revue hebdomadaire (PDCA Check/Act) le vendredi après-midi.'
    ],
    questions_cles: [
      'Mes créneaux de prospection sont-ils visibles et verrouillés dans mon agenda partagé ?',
      'Ai-je prévu des sas de respiration entre les blocs pour absorber les dérives ?',
      'Que fais-je si un client urgent réclame un créneau pendant mon bloc prospection ?'
    ],
    kpi_lies: ['K01', 'K02'],
    exemple_b2b: 'Mardi 9h-11h : Session de phoning B2B. Mercredi 16h-17h : Recherches d\'ICP et enrichissement CRM. Vendredi 15h-16h : Rétrospective PDCA.',
    pieges: [
      'Remplir son agenda à 100% sans laisser de marges d\'imprévus (buffer).',
      'Déplacer son créneau de prospection à la moindre demande interne.'
    ],
    modules_recommandes: ['P5', 'P3']
  },
  M11: {
    code: 'M11',
    titre: 'Value Proposition Canvas (Osterwalder)',
    sous_titre: 'Aligner parfaitement la proposition de valeur sur les maux du client',
    phase_dominante: 'Plan',
    temps_estime: '40 min',
    principe: "Le canevas confronte le profil du client (Missions/Jobs, Douleurs/Pains, Gains attendus) avec la carte de valeur de l'offre (Produits & Services, Soulageurs de maux, Créateurs de gains). L'adéquation parfaite (Fit) est atteinte lorsque chaque argument répond à une douleur critique ou un gain majeur.",
    regles: [
      'Commencer TOUJOURS par le profil client avant de parler de ses propres produits.',
      'Classer les maux par ordre d\'intensité (léger, modéré, insupportable).',
      'Ne retenir que les 3 soulageurs de douleur les plus différenciants.'
    ],
    questions_cles: [
      'Quel est le "Job to be done" profond de mon interlocuteur au-delà de son titre ?',
      'Qu\'est-ce qui l\'empêche de dormir la veille d\'une réunion de direction ?',
      'En quoi ma solution élimine-t-elle spécifiquement cette source d\'angoisse ?'
    ],
    kpi_lies: ['K13', 'K14'],
    exemple_b2b: 'Client DRH : Job = Recruter 10 ingénieurs qualifiés. Pain = 60 jours de délai et fuite des talents. Soulageur = Plateforme de sourcing IA réduisant le délai à 12 jours garantis.',
    pieges: [
      'Remplir le profil client avec des suppositions non vérifiées sur le terrain.',
      'Faire l\'inventaire technique des fonctionnalités au lieu de bénéfices clients concrets.'
    ],
    modules_recommandes: ['P6', 'P7']
  },
  M12: {
    code: 'M12',
    titre: 'Modèle VRIO',
    sous_titre: 'Tester la solidité stratégique de son avantage concurrentiel',
    phase_dominante: 'Check',
    temps_estime: '25 min',
    principe: "Pour qu'un argumentaire commercial soit imparable, l'atout mis en avant doit passer le crible de 4 questions successives : Est-il porteur de Valeur économique ? Est-il Rare sur le marché ? Est-il Difficilement Imitable ? L'entreprise est-elle Organisée pour l'exploiter efficacement ?",
    regles: [
      'Si l\'atout n\'est pas Rare, il s\'agit d\'une simple parité concurrentielle (obligation de base).',
      'Si l\'atout est Imitable facilement, l\'avantage n\'est que temporaire.',
      'Formuler l\'argument phare autour de la combinaison Valeur + Rareté + Inimitabilité.'
    ],
    questions_cles: [
      'Mon argument est-il utilisable au mot près par mon concurrent direct ?',
      'Combien de temps et d\'argent faudrait-il à un rival pour copier mon offre ?',
      'Quelles preuves tangibles (brevets, méthodologie exclusive, data) soutiennent mon inimitabilité ?'
    ],
    kpi_lies: ['K04', 'K14'],
    exemple_b2b: '"Nous sommes réactifs et à l\'écoute" = 0 Rareté. "Notre algorithme propriétaire audite 45 points de conformité en 3 minutes avec certification ISO" = Valeur + Rareté + Inimitabilité.',
    pieges: [
      'Confondre un avantage perçu interne avec un avantage validé par les acheteurs.',
      'Bâtir tout son discours sur des promesses que n\'importe qui d\'autre peut énoncer.'
    ],
    modules_recommandes: ['P6', 'P7']
  },
  M13: {
    code: 'M13',
    titre: 'Méthode CABP',
    sous_titre: 'Transformer chaque caractéristique technique en bénéfice prouvé',
    phase_dominante: 'Plan',
    temps_estime: '30 min',
    principe: "La méthode structure l'argumentation commerciale en 4 temps rigoureux : Caractéristique (fait objectif / technologie), Avantage (ce que la caractéristique permet de faire), Bénéfice (gain personnel ou financier pour le prospect), et Preuve (chiffre, label, témoignage client indiscutable).",
    regles: [
      'Ne jamais énoncer une caractéristique sans enchaîner immédiatement sur son bénéfice client.',
      'Toujours clore la séquence par une preuve factuelle et vérifiable.',
      'Adapter le bénéfice au profil psychologique du décideur (cf. SONCAS).'
    ],
    questions_cles: [
      'Quelle est la différence fondamentale entre mon avantage et le bénéfice pour le client ?',
      'Quelle preuve formelle puis-je citer pour balayer le scepticisme ?',
      'Mon argument résonne-t-il avec le portefeuille ou avec le confort de l\'acheteur ?'
    ],
    kpi_lies: ['K04', 'K13'],
    exemple_b2b: 'C : "Hébergement souverain SecNumCloud en France" -> A : "Vos données ne sont soumises à aucune législation extraterritoriale" -> B : "Zéro risque juridique pour votre statut OIV" -> P : "Certificat ANSSI N° 2024/12 consultable en ligne".',
    pieges: [
      'S\'arrêter à la caractéristique en espérant que le client devinera le bénéfice.',
      'Avancer des preuves vagues ("tous nos clients sont ravis") sans données tangibles.'
    ],
    modules_recommandes: ['P7', 'P6', 'P10']
  },
  M14: {
    code: 'M14',
    titre: 'Méthode SIMAC',
    sous_titre: 'Conduire un entretien ou une présentation percutante en 5 étapes',
    phase_dominante: 'Do',
    temps_estime: '30 min',
    principe: "Trame d'entretien commercial progressive : Situation (état des lieux partagé et indiscutable), Idée (concept d'amélioration proposé), Mécanisme (fonctionnement concret et calendrier), Avantages (gains spécifiques pour l'entreprise), Conclusion (appel à l'action ou signature de l'accord).",
    regles: [
      'Valider l\'accord du prospect sur la Situation avant de présenter la moindre Idée.',
      'Garder le Mécanisme simple : 3 étapes clés maximum pour ne pas noyer l\'auditoire.',
      'Toujours terminer par une conclusion engageante à choix alternatif ou date fixe.'
    ],
    questions_cles: [
      'Le prospect a-t-il formellement acquiescé sur le diagnostic de départ ?',
      'Mon Idée est-elle formulée en une seule phrase limpide ?',
      'Quel est le prochain pas concret proposé en Conclusion ?'
    ],
    kpi_lies: ['K04', 'K13'],
    exemple_b2b: 'S : "Vous perdez 8h/semaine sur vos déclarations douanières." I : "Automatiser la saisie par connecteur direct." M : "Installation en 48h sans coupure." A : "Gain de 1 200 € par mois." C : "Testons sur un échantillon dès jeudi."',
    pieges: [
      'Présenter la solution avant d\'avoir fait verbaliser la situation au prospect.',
      'S\'étendre sur les détails techniques du mécanisme au détriment des avantages.'
    ],
    modules_recommandes: ['P7', 'P10']
  },
  M15: {
    code: 'M15',
    titre: 'Elevator Pitch (Accroche 30-60-90s)',
    sous_titre: 'Capter l\'attention et susciter la curiosité en moins de 60 secondes',
    phase_dominante: 'Do',
    temps_estime: '25 min',
    principe: "Structure d'accroche éclair conçue pour un échange fortuit ou les 30 premières secondes d'un appel : 1. Accroche / Question problème, 2. Cible et contexte de marché, 3. Solution unique et différenciation, 4. Métrique de résultat / Preuve, 5. Appel à l'action précis (Call To Action).",
    regles: [
      'Rythme idéal : 120 à 140 mots par minute avec des pauses marquées.',
      'Bannir le jargon interne et les acronymes abscons.',
      'Le but n\'est PAS de vendre l\'offre, mais uniquement de vendre le rendez-vous suivant.'
    ],
    questions_cles: [
      'Mon interlocuteur comprend-il mon métier après 15 secondes ?',
      'Quel chiffre marquant retient-il à la fin de ma tirade ?',
      'Le Call to Action est-il facile à accepter immédiatement ?'
    ],
    kpi_lies: ['K03', 'K13'],
    exemple_b2b: '"Bonjour Thomas. Les directeurs logistiques me disent souvent qu\'ils perdent 15% de marge sur les retours colis. Chez Alpha, nous avons automatisé le contrôle en quai pour diviser ce coût par deux, comme chez ChronoExpress. Auriez-vous 10 minutes mardi pour voir comment l\'appliquer à votre flotte ?"',
    pieges: [
      'Parler trop vite sous l\'effet du stress.',
      'Vouloir tout expliquer dans le premier appel au lieu de créer l\'intrigue.'
    ],
    modules_recommandes: ['P7', 'P3']
  },
  M16: {
    code: 'M16',
    titre: 'Profil de Client Idéal (ICP) et Personas B2B',
    sous_titre: 'Cibler avec une précision chirurgicale les comptes à plus forte valeur',
    phase_dominante: 'Plan',
    temps_estime: '35 min',
    principe: "L'ICP (Ideal Customer Profile) définit l'organisation cible (taille, secteur, chiffre d'affaires, géographie, maturité technologique, signaux d'affaires). Le Persona définit l'interlocuteur humain au sein de cette cible (rôle, KPI personnels, peurs professionnelles, vocabulaire de prédilection).",
    regles: [
      'Définir au maximum 3 personas prioritaires par campagne pour garder la cohérence du discours.',
      'Identifier les déclencheurs d\'achat (trigger events : levée de fonds, recrutement, nomination, nouvelle réglementation).',
      'Rédiger la liste des critères d\'exclusion (qui NE PAS contacter).'
    ],
    questions_cles: [
      'Quels sont les attributs communs de mes 5 meilleurs clients actuels ?',
      'À quoi reconnaît-on un compte qui ne signera jamais malgré les apparences ?',
      'Quels sont les indicateurs de performance annuels de mon persona acheteur ?'
    ],
    kpi_lies: ['K03', 'K04', 'K07'],
    exemple_b2b: 'ICP : PME industrielles de 50 à 250 salariés en Auvergne-Rhône-Alpes avec ERP vieillissant. Persona : Responsable de production sous pression de cadences, sensible à la fiabilité plutôt qu\'au prix.',
    pieges: [
      'Définir une cible trop large par peur de manquer des opportunités.',
      'Traiter un PDG et un responsable technique avec le même message.'
    ],
    modules_recommandes: ['P8', 'P4', 'P6']
  },
  M17: {
    code: 'M17',
    titre: 'Séquence multicanale de prospection (J0 à J21)',
    sous_titre: 'Orchestrer les points de contact sur Téléphone, Email et LinkedIn',
    phase_dominante: 'Plan',
    temps_estime: '40 min',
    principe: "Il faut en moyenne 6 à 8 points de contact pour décrocher un premier échange avec un décideur B2B. La séquence multicanale cadencée alterne les canaux (Emailing, appel vocal direct, message vocal, visite de profil LinkedIn, invitation, relance de valeur) sur une période de 21 jours ouvrés.",
    regles: [
      'Espacer les prises de contact de 2 à 4 jours ouvrés.',
      'Apporter une valeur nouvelle ou un éclairage différent à chaque étape (jamais de "simple relance pour savoir si vous avez lu mon mail").',
      'Respecter scrupuleusement la conformité CNIL / RGPD B2B (lien de désinscription obligatoire, données B2B directes).'
    ],
    questions_cles: [
      'Mon message de rupture (Break-up mail) à J21 libère-t-il le prospect avec élégance ?',
      'Chaque canal est-il utilisé selon ses codes naturels (ton décontracté sur LinkedIn, formel sur e-mail, percutant au téléphone) ?',
      'Le prospect peut-il se désinscrire en un clic sans friction ?'
    ],
    kpi_lies: ['K02', 'K03', 'K05', 'K08'],
    exemple_b2b: 'J0 : Visite profil LinkedIn. J+1 : Email d\'accroche personnalisé avec cas d\'usage. J+4 : Appel téléphonique 1 + message vocal. J+8 : Partage d\'un livre blanc sur LinkedIn. J+14 : Email avec preuve chiffrée. J+21 : Email de rupture cordial.',
    pieges: [
      'Harceler le prospect sur le même canal 3 jours d\'affilée.',
      'Envoyer des e-mails anonymes et génériques non contextualisés.'
    ],
    modules_recommandes: ['P8', 'P9', 'P10']
  },
  M18: {
    code: 'M18',
    titre: 'Méthode AIDA et Tests A/B de messages',
    sous_titre: 'Rédiger des messages magnétiques et comparer scientifiquement 2 variantes',
    phase_dominante: 'Do',
    temps_estime: '30 min',
    principe: "La formule AIDA structure le copywriting : Attention (objet et première ligne intrigante), Intérêt (reformulation du problème du prospect), Désir (projection du bénéfice de la solution), Action (un seul appel à l'action limpide et sans friction). Le test A/B compare deux variantes ne différant que d'une seule variable.",
    regles: [
      'Un seul appel à l\'action (CTA) par message.',
      'Bannir les mots déclencheurs de spam ou d\'hyper-vente ("Incroyable", "Révolutionnaire", "Meilleure offre").',
      'Pour un test A/B valide, modifier STRICTEMENT UN SEUL paramètre (soit l\'objet, soit le CTA, jamais les deux).'
    ],
    questions_cles: [
      'La première phrase parle-t-elle du prospect ou de moi ?',
      'Le CTA demande-t-il un effort minime (ex: "Êtes-vous ouvert à un échange de 5 min ?") ?',
      'Mon volume d\'envois est-il suffisant pour une validité statistique (z-test p < 0.05) ?'
    ],
    kpi_lies: ['K03', 'K05', 'K06'],
    exemple_b2b: 'Variante A (Objet : "Question sur vos délais logistiques") vs Variante B (Objet : "Optimisation des tournées chez [Société]"). Même corps de texte, calcul du taux de réponse respectif.',
    pieges: [
      'Multiplier les variables dans un test A/B, rendant le résultat inexploitable.',
      'Mettre deux liens différents et demander un rendez-vous dans le même e-mail.'
    ],
    modules_recommandes: ['P9', 'P8']
  },
  M19: {
    code: 'M19',
    titre: 'Méthode SONCAS et Traitement des objections',
    sous_titre: 'Décoder la typologie motivationnelle et neutraliser les freins',
    phase_dominante: 'Do',
    temps_estime: '35 min',
    principe: "Chaque acheteur est guidé par une combinaison de mobiles dominants : Sécurité (peur de l'erreur), Orgueil (besoin de prestige/statut), Nouveauté (attrait de la modernité), Confort (recherche de simplicité/gain de temps), Argent (rentabilité/prix), Sympathie (relation humaine/partage). L'objection est traitée en 4 temps : Écouter, Accuser réception, Isoler, Traiter.",
    regles: [
      'Déceler le mobile dominant à partir des indices verbaux et du non-verbal.',
      'Ne jamais réfuter une objection de front ("Mais non, vous avez tort").',
      'Utiliser le registre lexical exact correspondant au profil SONCAS repéré.'
    ],
    questions_cles: [
      'Quels mots récurrents trahissent le profil dominant de cet interlocuteur ?',
      'Ai-je validé qu\'il n\'y avait pas d\'autre objection cachée ("À part le prix, qu\'est-ce qui vous ferait hésiter ?") ?',
      'Mon contre-argument sécurise-t-il ou valorise-t-il l\'acheteur ?'
    ],
    kpi_lies: ['K04', 'K14'],
    exemple_b2b: 'Profil Sécurité : "Pouvez-vous me garantir le respect des normes ?" -> Réponse axée sur les certifications, les sauvegardes et la garantie contractuelle.',
    pieges: [
      'Parler "Argent et Remise" à un profil "Orgueil" qui cherche avant tout l\'exclusivité.',
      'Traiter l\'objection de prix sans avoir préalablement établi la valeur perçue.'
    ],
    modules_recommandes: ['P10', 'P7']
  },
  M20: {
    code: 'M20',
    titre: 'Grille d\'observation en double écoute',
    sous_titre: 'Évaluer objectivement la pratique commerciale lors d\'appels réels',
    phase_dominante: 'Check',
    temps_estime: '30 min',
    principe: "La double écoute (ou écoute croisée entre pairs) s'appuie sur une grille multicritères standardisée pour mesurer les compétences clés : Accroche initiale, Écoute active et questionnement ouvert, Découverte des besoins, Gestion des objections, Reformulation et Conclusion. Elle élimine la subjectivité du jugement.",
    regles: [
      'L\'observateur n\'intervient jamais pendant l\'appel en cours.',
      'Remplir la grille sur des faits observables et vérifiables, non sur des impressions.',
      'Limiter l\'évaluation à 5 ou 6 critères majeurs pour préserver la précision.'
    ],
    questions_cles: [
      'Le commercial a-t-il laissé au prospect au moins 60% du temps de parole ?',
      'Les questions posées étaient-elles ouvertes ou fermées et suggestives ?',
      'La conclusion proposait-elle une date et une heure précises ?'
    ],
    kpi_lies: ['K04', 'K15'],
    exemple_b2b: 'Grille notée de 1 à 4 sur 6 axes : Clarté de l\'élocution, Détection du besoin, Pertinence du pitch CABP, Traitement de l\'objection "Pas le temps", Prise de RDV formelle.',
    pieges: [
      'Transformer la séance d\'écoute en tribunal au lieu d\'un temps d\'apprentissage.',
      'Observer sans critères préalablement acceptés par le prospecteur.'
    ],
    modules_recommandes: ['P11', 'P1']
  },
  M21: {
    code: 'M21',
    titre: 'Méthode COIN de feedback constructif',
    sous_titre: 'Délivrer un retour d\'expérience bienveillant, factuel et mobilisateur',
    phase_dominante: 'Act',
    temps_estime: '25 min',
    principe: "Le modèle COIN structure le débriefing d'une interaction commerciale : Contexte (date, appel, moment précis), Observation (fait neutre et indiscutable sans jugement de valeur), Impact (conséquence directe sur le prospect ou la vente), Next steps (action d'amélioration concrète coconstruite pour le prochain appel).",
    regles: [
      'Commencer TOUJOURS par demander l\'auto-évaluation du prospecteur ("Comment l\'as-tu vécu ?").',
      'Bannir les généralités ("Tu parles trop vite") au profit de faits datés ("À la 2e minute, tu as interrompu le prospect").',
      'Finir par un engagement immédiat pour l\'appel suivant.'
    ],
    questions_cles: [
      'Mon observation est-elle contestable ou purement factuelle ?',
      'L\'impact décrit est-il compris et partagé par la personne ?',
      'Le "Next step" est-il testable dès la prochaine session de prospection ?'
    ],
    kpi_lies: ['K09', 'K15'],
    exemple_b2b: 'C : "Ce matin lors de l\'appel avec M. Dupont..." O : "...quand il a dit que c\'était trop cher, tu as baissé le prix de 15% immédiatement sans questionner." I : "...cela a décrédibilisé la valeur de notre offre." N : "Au prochain appel, nous testerons la question miroir : Qu\'entendez-vous par trop cher ?".',
    pieges: [
      'Mélanger jugement personnel et observation objective.',
      'Donner 10 axes d\'amélioration simultanés au lieu de se concentrer sur un seul geste clé.'
    ],
    modules_recommandes: ['P11', 'P12']
  }
};

export const INDICATEURS_REFERENTIEL: Record<string, IndicateurMethode> = {
  K01: {
    code: 'K01',
    nom: 'Taux d\'engagement sur créneaux',
    description: 'Proportion des créneaux de prospection prévus qui ont été effectivement tenus sans report ni annulation.',
    formule: '(Créneaux tenus / Créneaux planifiés) × 100',
    unite: '%',
    frequence: 'Hebdomadaire',
    seuils: {
      vert: { min: 85, label: 'Excellente discipline d\'exécution' },
      orange: { min: 65, max: 84.9, label: 'Risque d\'érosion de l\'effort' },
      rouge: { max: 64.9, label: 'Prospection dépriorisée ou subie' }
    },
    recommandation: 'Sanctuariser les créneaux dans l\'agenda partagé et désactiver les notifications pendant les sessions.'
  },
  K02: {
    code: 'K02',
    nom: 'Volume de contacts bruts traités',
    description: 'Nombre total de contacts uniques ciblés et approchés sur la période.',
    formule: 'Somme des prospects contactés (Appels + Emails + InMails)',
    unite: 'contacts/semaine',
    frequence: 'Hebdomadaire',
    seuils: {
      vert: { min: 40, label: 'Dynamique de pipeline soutenable' },
      orange: { min: 20, max: 39, label: 'Volume modéré, dépendance forte à chaque lead' },
      rouge: { max: 19, label: 'Volume insuffisant pour alimenter l\'entonnoir' }
    },
    recommandation: 'Préparer les listes qualifiées la veille pour ne pas perdre de temps en prospection active.'
  },
  K03: {
    code: 'K03',
    nom: 'Taux de joignabilité / ouverture',
    description: 'Ratio entre les prospects effectivement joints (ou ayant ouvert l\'email) et les tentatives de contact.',
    formule: '(Contacts joints ou ouverts / Tentatives totales) × 100',
    unite: '%',
    frequence: 'Hebdomadaire',
    seuils: {
      vert: { min: 35, label: 'Ciblage pertinent et horaires adaptés' },
      orange: { min: 20, max: 34.9, label: 'Horaires ou qualité des coordonnées à optimiser' },
      rouge: { max: 19.9, label: 'Fichier obsolète ou canal inadapté' }
    },
    recommandation: 'Tester des créneaux alternatifs (8h30-9h et 17h30-18h30) et vérifier la délivrabilité des adresses.'
  },
  K04: {
    code: 'K04',
    nom: 'Taux de conversion en rendez-vous qualifié',
    description: 'Proportion de prospects joints qui acceptent un premier rendez-vous de découverte approfondie.',
    formule: '(RDV qualifiés obtenus / Contacts joints) × 100',
    unite: '%',
    frequence: 'Hebdomadaire',
    seuils: {
      vert: { min: 15, label: 'Pitch percutant et qualification rigoureuse' },
      orange: { min: 8, max: 14.9, label: 'Argumentaire perfectible sur les objections clés' },
      rouge: { max: 7.9, label: 'Difficulté à susciter l\'intérêt ou proposition de valeur floue' }
    },
    recommandation: 'Revoir l\'accroche initiale (M15) et la maîtrise du mobile d\'achat SONCAS (M19).'
  },
  K05: {
    code: 'K05',
    nom: 'Taux de réponse aux messages AIDA',
    description: 'Taux de retour direct des prospects suite à l\'envoi d\'un message de prospection structuré.',
    formule: '(Réponses positives ou d\'échange / Messages envoyés) × 100',
    unite: '%',
    frequence: 'Par campagne',
    seuils: {
      vert: { min: 12, label: 'Message hautement engageant' },
      orange: { min: 5, max: 11.9, label: 'Dans la moyenne B2B, amélioration possible du CTA' },
      rouge: { max: 4.9, label: 'Message perçu comme impersonnel ou indésirable' }
    },
    recommandation: 'Réduire la longueur du message à moins de 120 mots et poser une seule question fermée et légère.'
  },
  K06: {
    code: 'K06',
    nom: 'Significativité statistique test A/B',
    description: 'Niveau de confiance statistique confirmant que la variante gagnante ne doit rien au hasard (Z-test / p-value).',
    formule: 'Calcul du z-score de deux proportions (seuil standard p < 0.05)',
    unite: '%',
    frequence: 'Par test A/B',
    seuils: {
      vert: { min: 95, label: 'Résultat statistiquement certain (p < 0.05)' },
      orange: { min: 80, max: 94.9, label: 'Tendance nette, échantillon encore insuffisant' },
      rouge: { max: 79.9, label: 'Résultat aléatoire, poursuivre le test' }
    },
    recommandation: 'Augmenter la taille de la cohorte test (minimum 50 envois par variante) avant de trancher.'
  },
  K07: {
    code: 'K07',
    nom: 'Part du temps alloué aux comptes A (Pareto)',
    description: 'Proportion du temps de prospection active investi sur les 20% de comptes à plus fort potentiel économique.',
    formule: '(Heures passées sur les cibles A / Heures totales de prospection) × 100',
    unite: '%',
    frequence: 'Mensuelle',
    seuils: {
      vert: { min: 60, label: 'Focus optimal sur la haute valeur ajoutée' },
      orange: { min: 40, max: 59.9, label: 'Dispersion modérée sur des comptes secondaires' },
      rouge: { max: 39.9, label: 'Énergie gaspillée sur des comptes marginaux' }
    },
    recommandation: 'Filtrer rigoureusement la liste de prospection selon les critères objectifs de l\'ICP (M16).'
  },
  K08: {
    code: 'K08',
    nom: 'Taux d\'abandon de séquence',
    description: 'Pourcentage de prospects sortis de la séquence avant la fin des points de contact prévus sans réponse ni motif.',
    formule: '(Séquences interrompues prématurément / Séquences initiées) × 100',
    unite: '%',
    frequence: 'Mensuelle',
    seuils: {
      vert: { max: 15, label: 'Excellente persévérance dans le suivi' },
      orange: { min: 15.1, max: 30, label: 'Relances incomplètes par manque de temps' },
      rouge: { min: 30.1, label: 'Abandon systématique après 1 ou 2 tentatives' }
    },
    recommandation: 'Programmer des rappels automatiques dans le CRM pour ne manquer aucun point de contact de J0 à J21.'
  },
  K09: {
    code: 'K09',
    nom: 'Score moyen de confiance / sérénité',
    description: 'Niveau auto-évalué de sérénité et d\'aisance avant et pendant les sessions de prospection (Échelle 1 à 10).',
    formule: 'Moyenne des évaluations auto-rapportées (1 = anxiété aiguë, 10 = confiance totale)',
    unite: '/10',
    frequence: 'Hebdomadaire',
    seuils: {
      vert: { min: 7.5, label: 'Confiance et posture sereine' },
      orange: { min: 5, max: 7.4, label: 'Appréhension modérée mais gérable' },
      rouge: { max: 4.9, label: 'Frein psychologique majeur, risque de blocage' }
    },
    recommandation: 'Utiliser la balance décisionnelle (M05) et démarrer la session par 3 victoires faciles.'
  },
  K10: {
    code: 'K10',
    nom: 'Victoires commerciales enregistrées',
    description: 'Nombre d\'avancées tangibles célébrées sur la semaine (objection levée, nouveau contact clé, RDV obtenu).',
    formule: 'Nombre d\'événements consignés dans le journal de bord des succès',
    unite: 'victoires/semaine',
    frequence: 'Hebdomadaire',
    seuils: {
      vert: { min: 5, label: 'Spirale d\'apprentissage positive active' },
      orange: { min: 2, max: 4, label: 'Progression continue mais peu célébrée' },
      rouge: { max: 1, label: 'Focalisation excessive sur les échecs ou inertie' }
    },
    recommandation: 'Prendre 5 minutes chaque vendredi pour noter 3 apprentissages valorisants de la semaine.'
  },
  K11: {
    code: 'K11',
    nom: 'Indice de motivation intrinsèque',
    description: 'Niveau d\'autonomie, de compétence et de sens perçus dans l\'exercice de la prospection (Score Deci & Ryan).',
    formule: 'Moyenne composite des scores d\'autonomie, de maîtrise et d\'affiliation (base 100)',
    unite: '/100',
    frequence: 'Mensuelle',
    seuils: {
      vert: { min: 75, label: 'Motivation intrinsèque solide et durable' },
      orange: { min: 50, max: 74.9, label: 'Motivation partiellement dépendante de pressions externes' },
      rouge: { max: 49.9, label: 'Motivation contrainte, risque élevé d\'épuisement' }
    },
    recommandation: 'Accorder plus de liberté dans le choix des thèmes d\'approche et des canaux privilégiés.'
  },
  K12: {
    code: 'K12',
    nom: 'Ratio temps important non-urgent (Q2 Eisenhower)',
    description: 'Part du temps de travail global consacrée aux activités stratégiques de fond non parasitées par l\'urgence.',
    formule: '(Heures passées en Quadrant 2 / Heures travaillées totales) × 100',
    unite: '%',
    frequence: 'Hebdomadaire',
    seuils: {
      vert: { min: 25, label: 'Investissement sain dans la performance future' },
      orange: { min: 15, max: 24.9, label: 'Équilibre fragile, urgences envahissantes' },
      rouge: { max: 14.9, label: 'Mode pompier permanent, avenir commercial compromis' }
    },
    recommandation: 'Bloquer les matinées du mardi et jeudi sans réunion interne ni consultation de messagerie avant 11h.'
  },
  K13: {
    code: 'K13',
    nom: 'Taux de rétention de l\'attention en pitch',
    description: 'Proportion de prospects qui maintiennent l\'échange au-delà de la phase d\'accroche initiale (plus de 90 secondes).',
    formule: '(Échanges poursuivis au-delà de 90s / Appels décrochés) × 100',
    unite: '%',
    frequence: 'Hebdomadaire',
    seuils: {
      vert: { min: 65, label: 'Accroche percutante et rythme captivant' },
      orange: { min: 45, max: 64.9, label: 'L\'accroche hésite ou ne pose pas le problème assez vite' },
      rouge: { max: 44.9, label: 'Rejet immédiat dans les 30 premières secondes' }
    },
    recommandation: 'Travailler le débit vocal, éliminer les tics de langage et énoncer le problème du prospect dès la 2e phrase.'
  },
  K14: {
    code: 'K14',
    nom: 'Précision de détection du profil SONCAS',
    description: 'Concordance entre le profil motivationnel supposé par le commercial et les signaux réels émis par le prospect.',
    formule: '(Profils SONCAS correctement validés / Entretiens analysés) × 100',
    unite: '%',
    frequence: 'Mensuelle',
    seuils: {
      vert: { min: 75, label: 'Écoute active aiguë et décodage précis des motivations' },
      orange: { min: 55, max: 74.9, label: 'Détection hésitante sur les profils complexes' },
      rouge: { max: 54.9, label: 'Projection de ses propres motivations sur le prospect' }
    },
    recommandation: 'Noter systématiquement les adjectifs employés par le client avant de choisir sa formule d\'argumentation.'
  },
  K15: {
    code: 'K15',
    nom: 'Indice de concordance inter-observateurs (Kappa)',
    description: 'Degré d\'accord objectif entre deux évaluateurs lors d\'une double écoute d\'appel commercial (Coefficient Kappa).',
    formule: 'Coefficient Kappa de Cohen : (Po - Pe) / (1 - Pe)',
    unite: 'score [-1 ; 1]',
    frequence: 'Par session d\'observation',
    seuils: {
      vert: { min: 0.7, label: 'Excellente harmonisation des critères d\'évaluation' },
      orange: { min: 0.4, max: 0.69, label: 'Accord modéré, grille d\'observation à clarifier' },
      rouge: { max: 0.39, label: 'Désaccord important, critères trop subjectifs' }
    },
    recommandation: 'Organiser une session d\'étalonnage entre observateurs autour d\'enregistrements témoins.'
  }
};
