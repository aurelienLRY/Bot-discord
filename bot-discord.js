// bot.js
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const token = process.env.DISCORD_TOKEN;
const webhookUrl = process.env.N8N_WEBHOOK;

// Vérification des variables d'environnement
if (!token || token === 'votre_token_discord_ici') {
  console.error('❌ Erreur : DISCORD_TOKEN manquant ou invalide dans le fichier .env');
  console.error('    Obtenez votre token sur : https://discord.com/developers/applications');
  process.exit(1);
}

if (!webhookUrl || webhookUrl === 'votre_url_webhook_ici') {
  console.error('❌ Erreur : N8N_WEBHOOK manquant ou invalide dans le fichier .env');
  process.exit(1);
}

client.on('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

client.on('error', (error) => {
  if (error.message.includes('disallowed intents')) {
    console.error('❌ ERREUR : Les intents ne sont pas activés sur Discord Developer Portal');
    console.error('📝 Suivez ces étapes pour corriger :');
    console.error('   1. Allez sur https://discord.com/developers/applications');
    console.error('   2. Sélectionnez votre application');
    console.error('   3. Allez dans l\'onglet "Bot"');
    console.error('   4. Dans "Privileged Gateway Intents", activez "MESSAGE CONTENT INTENT"');
    console.error('   5. Sauvegardez les modifications');
    console.error('   6. Relancez le bot');
  }
  console.error('❌ Erreur Discord :', error);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  console.log(`💬 ${message.author.username} a dit : ${message.content}`);

  try {
    await axios.post(webhookUrl, {
      username: message.author.username,
      content: message.content,
      channelId: message.channel.id
    });
  } catch (error) {
    console.error('Erreur en envoyant à n8n :', error.message);
  }
});

// Gestion de la reconnexion automatique
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectTimeout;

async function connectToDiscord() {
  try {
    console.log('🔄 Tentative de connexion à Discord...');
    await client.login(token);
    reconnectAttempts = 0; // Reset du compteur en cas de succès
  } catch (error) {
    reconnectAttempts++;
    console.error(`❌ Erreur de connexion à Discord (tentative ${reconnectAttempts}/${maxReconnectAttempts}):`, error.message);
    
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
      console.log(`⏳ Nouvelle tentative dans ${delay / 1000} secondes...`);
      reconnectTimeout = setTimeout(() => connectToDiscord(), delay);
    } else {
      console.error('❌ Nombre maximum de tentatives de reconnexion atteint. Arrêt du bot.');
      process.exit(1);
    }
  }
}

// Gestion des déconnexions
client.on('disconnect', () => {
  console.warn('⚠️ Bot déconnecté de Discord');
  if (!reconnectTimeout) {
    reconnectAttempts = 0;
    connectToDiscord();
  }
});

client.on('shardDisconnect', (event, id) => {
  console.warn(`⚠️ Shard ${id} déconnecté:`, event.reason);
  if (!reconnectTimeout) {
    reconnectAttempts = 0;
    connectToDiscord();
  }
});

client.on('shardError', (error, id) => {
  console.error(`❌ Erreur sur le shard ${id}:`, error);
});

// Connexion initiale à Discord
connectToDiscord();

// Serveur HTTP pour garder le processus actif en production
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  const healthCheck = {
    status: 'OK',
    discord: client.isReady() ? 'connected' : 'connecting',
    bot: client.user ? client.user.tag : 'starting',
    uptime: process.uptime(),
    reconnectAttempts: reconnectAttempts
  };
  res.end(JSON.stringify(healthCheck));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveur HTTP démarré sur le port ${PORT}`);
  console.log(`🌐 Health check : http://localhost:${PORT}`);
});
