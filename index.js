require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Configuration Discord Bot avec reconnexion automatique
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  // Configuration pour VPS - reconnexion automatique
  restTimeOffset: 0,
  restRequestTimeout: 15000,
  retryLimit: 3,
  closeTimeout: 5000
});

const token = process.env.DISCORD_TOKEN;
const webhookUrl = process.env.N8N_WEBHOOK;
const PORT = process.env.PORT || 3000;

// Statistiques du bot
let stats = {
  startTime: Date.now(),
  messagesProcessed: 0,
  errors: 0,
  reconnections: 0,
  lastMessage: null
};

// Logger amélioré avec timestamps
const log = {
  info: (msg) => console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`),
  success: (msg) => console.log(`[${new Date().toISOString()}] ✅ ${msg}`),
  error: (msg) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`),
  warn: (msg) => console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`),
  message: (msg) => console.log(`[${new Date().toISOString()}] 💬 ${msg}`)
};

// Vérification des variables d'environnement
if (!token || token === 'votre_token_discord_ici') {
  log.error('DISCORD_TOKEN manquant ou invalide dans le fichier .env');
  log.info('Obtenez votre token sur : https://discord.com/developers/applications');
  process.exit(1);
}

if (!webhookUrl || webhookUrl === 'votre_url_webhook_ici') {
  log.error('N8N_WEBHOOK manquant ou invalide dans le fichier .env');
  process.exit(1);
}

log.info('🚀 Démarrage du Bot Discord...');

// Events Discord
client.on('ready', () => {
  log.success(`Bot connecté en tant que ${client.user.tag}`);
  log.info(`Connecté à ${client.guilds.cache.size} serveur(s)`);
  stats.reconnections++;
});

// Gestion des déconnexions
client.on('disconnect', () => {
  log.warn('Bot déconnecté de Discord');
});

client.on('reconnecting', () => {
  log.warn('Tentative de reconnexion à Discord...');
});

client.on('resume', () => {
  log.success('Connexion restaurée avec Discord');
});

// Gestion des erreurs
client.on('error', (error) => {
  stats.errors++;
  if (error.message.includes('disallowed intents')) {
    log.error('Les intents ne sont pas activés sur Discord Developer Portal');
    log.info('📝 Étapes pour corriger :');
    log.info('   1. Allez sur https://discord.com/developers/applications');
    log.info('   2. Sélectionnez votre application');
    log.info('   3. Allez dans l\'onglet "Bot"');
    log.info('   4. Dans "Privileged Gateway Intents", activez "MESSAGE CONTENT INTENT"');
    log.info('   5. Sauvegardez et relancez le bot');
  } else {
    log.error(`Erreur Discord : ${error.message}`);
  }
});

// Gestion des warnings
client.on('warn', (warning) => {
  log.warn(`Discord warning : ${warning}`);
});

// Traitement des messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  stats.messagesProcessed++;
  stats.lastMessage = new Date().toISOString();
  
  log.message(`${message.author.username} (${message.channel.name}): ${message.content}`);

  try {
    const payload = {
      username: message.author.username,
      userId: message.author.id,
      content: message.content,
      channelId: message.channel.id,
      channelName: message.channel.name,
      guildId: message.guild?.id,
      guildName: message.guild?.name,
      timestamp: message.createdTimestamp,
      messageId: message.id
    };

    await axios.post(webhookUrl, payload, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    log.info(`Message envoyé au webhook n8n`);
  } catch (error) {
    stats.errors++;
    log.error(`Erreur webhook n8n : ${error.message}`);
    
    // Retry une fois en cas d'erreur
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      log.warn('Tentative de renvoi...');
      setTimeout(async () => {
        try {
          await axios.post(webhookUrl, {
            username: message.author.username,
            content: message.content,
            channelId: message.channel.id
          });
          log.success('Message renvoyé avec succès');
        } catch (retryError) {
          log.error(`Échec du renvoi : ${retryError.message}`);
        }
      }, 2000);
    }
  }
});

// Connexion Discord avec gestion d'erreur
async function connectBot() {
  try {
    await client.login(token);
  } catch (error) {
    log.error(`Échec de connexion : ${error.message}`);
    log.warn('Nouvelle tentative dans 10 secondes...');
    setTimeout(connectBot, 10000);
  }
}

connectBot();

// Serveur HTTP pour health check et statistiques (requis pour Easypanel)
const server = http.createServer((req, res) => {
  const url = req.url;
  
  // Health check endpoint pour Easypanel
  if (url === '/' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const healthCheck = {
      status: 'OK',
      discord: client.isReady() ? 'connected' : 'connecting',
      bot: client.user ? client.user.tag : 'starting',
      uptime: Math.floor(process.uptime()),
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      timestamp: new Date().toISOString()
    };
    res.end(JSON.stringify(healthCheck, null, 2));
  }
  
  // Stats endpoint pour monitoring
  else if (url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const uptimeSeconds = Date.now() - stats.startTime;
    const detailedStats = {
      bot: {
        name: client.user?.tag || 'Starting...',
        id: client.user?.id,
        servers: client.guilds.cache.size,
        status: client.isReady() ? 'connected' : 'connecting'
      },
      statistics: {
        messagesProcessed: stats.messagesProcessed,
        errors: stats.errors,
        reconnections: stats.reconnections,
        lastMessage: stats.lastMessage,
        uptime: {
          seconds: Math.floor(uptimeSeconds / 1000),
          formatted: formatUptime(uptimeSeconds)
        }
      },
      system: {
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    res.end(JSON.stringify(detailedStats, null, 2));
  }
  
  // 404 pour les autres routes
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', endpoints: ['/', '/health', '/stats'] }));
  }
});

// Formater l'uptime
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}j ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// Démarrage du serveur HTTP
server.listen(PORT, () => {
  log.success(`Serveur HTTP démarré sur le port ${PORT}`);
  log.info(`Health check : http://localhost:${PORT}/health`);
  log.info(`Statistics : http://localhost:${PORT}/stats`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', async () => {
  log.warn('Signal SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    log.info('Serveur HTTP fermé');
  });
  client.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  log.warn('Signal SIGINT reçu, arrêt gracieux...');
  server.close(() => {
    log.info('Serveur HTTP fermé');
  });
  client.destroy();
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  log.error(`Promesse non gérée : ${error.message}`);
  console.error(error);
});

process.on('uncaughtException', (error) => {
  log.error(`Exception non capturée : ${error.message}`);
  console.error(error);
  // Ne pas arrêter le processus pour maintenir l'écoute
});
