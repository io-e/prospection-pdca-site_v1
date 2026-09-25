import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialisation Gemini Server-side avec header télémétrie requis
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Route P0 : Génération d'exemple contextualisé
app.post('/api/gemini/p0-example', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Gemini non configuré' });
    }

    const { ficheCode, ficheTitre, principe, secteur, publicCible } = req.body;

    const prompt = `Tu es un expert formateur en prospection commerciale B2B et amélioration continue (PDCA).
L'utilisateur étudie la fiche méthodologique suivante :
- Code : ${ficheCode}
- Titre : ${ficheTitre}
- Principe : ${principe}

Contexte de l'apprenant :
- Secteur d'activité : ${secteur || 'Services B2B'}
- Public prospecté : ${publicCible || 'Dirigeants de PME'}

Génère un exemple d'illustration concret et crédible adapté strictement à ce secteur et ce public.
Réponds exclusivement au format JSON strict avec les champs suivants :
{
  "secteur": "${secteur || 'Services B2B'}",
  "public_cible": "${publicCible || 'Dirigeants de PME'}",
  "mise_en_situation": "Description de la situation de départ (2 phrases)",
  "application_principe": "Comment le commercial applique concrètement le principe de la fiche (3-4 phrases)",
  "resultat_attendu": "Le résultat observable et mesurable sur le terrain (1-2 phrases)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Erreur Gemini P0:', error?.message);
    return res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

// Route P9 : Critique pédagogique AIDA bloc par bloc
app.post('/api/gemini/p9-critique', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Gemini non configuré' });
    }

    const { attention, interet, desir, action, contexte } = req.body;

    const prompt = `Tu es un relecteur pédagogique en prospection commerciale. Ton rôle est de critiquer avec bienveillance un message de prospection rédigé selon la méthode AIDA.
ATTENTION : Tu ne dois JAMAIS réécrire le message à la place de l'apprenant. Tu dois seulement analyser bloc par bloc selon les règles :
- Règle 1 : Un seul appel à l'action (CTA unique, clair, sans friction).
- Règle 2 : Aucun mot d'hyper-vente ou de spam ("incroyable", "révolutionnaire", etc.).
- Règle 3 : Le prospect au centre dès la première phrase, pas le vendeur.

Message soumis :
- [Attention] : ${attention || '(vide)'}
- [Intérêt] : ${interet || '(vide)'}
- [Désir] : ${desir || '(vide)'}
- [Action] : ${action || '(vide)'}
Contexte : ${JSON.stringify(contexte || {})}

Réponds exclusivement au format JSON strict avec les champs suivants :
{
  "attention": "Commentaire pédagogique sur l'accroche",
  "interet": "Commentaire sur la formulation du problème",
  "desir": "Commentaire sur la proposition de valeur et les preuves",
  "action": "Commentaire sur le CTA et sa clarté",
  "points_forts": ["point fort 1", "point fort 2"],
  "vigilances": ["point de vigilance 1", "point de vigilance 2"],
  "score_global_indicatif": 8
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Erreur Gemini P9:', error?.message);
    return res.status(500).json({ error: 'Erreur lors de la critique' });
  }
});

// Route P10 : Réplique du prospect SONCAS selon motivation cachée
app.post('/api/gemini/p10-reply', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Gemini non configuré' });
    }

    const { profilSoncas, historiqueEchanges, dernierMessageCommercial } = req.body;

    const prompt = `Tu incarnes un prospect B2B professionnel (directeur général ou responsable opérationnel) lors d'un appel ou échange de prospection commerciale.
Ton profil motivationnel dominant (caché) est : ${profilSoncas} (Sécurité, Orgueil, Nouveauté, Confort, Argent ou Sympathie).
Historique récent des échanges :
${JSON.stringify(historiqueEchanges || [])}

Le commercial vient de te dire :
"${dernierMessageCommercial}"

Réagis de manière réaliste et crédible en incarnant les préoccupations profondes de ton profil ${profilSoncas}. Sois concis (2-3 phrases maximum), avec des hésitations réalistes ou des objections typiques.
Réponds exclusivement au format JSON strict avec les champs suivants :
{
  "replique": "Ta réponse verbale au commercial",
  "ton": "L'attitude perçue (ex: méfiant, exigeant, pressé...)",
  "signaux_visibles": ["indice 1 sur le mobile", "indice 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Erreur Gemini P10:', error?.message);
    return res.status(500).json({ error: 'Erreur lors de la réplique' });
  }
});

// Montage de Vite en mode développement ou fichiers statiques en production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Serveur Prospection PDCA démarré sur http://localhost:${port}`);
  });
}

startServer();
