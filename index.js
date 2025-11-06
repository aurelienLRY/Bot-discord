require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'admin123';

// Logger amélioré avec timestamps
const log = {
  info: (msg) => console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`),
  success: (msg) => console.log(`[${new Date().toISOString()}] ✅ ${msg}`),
  error: (msg) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`),
  warn: (msg) => console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`),
  message: (msg) => console.log(`[${new Date().toISOString()}] 💬 ${msg}`)
};

// Statistiques globales
const globalStats = {
  startTime: Date.now(),
  totalMessagesProcessed: 0,
  totalErrors: 0
};

// Tableau pour stocker tous les bots
const bots = [];

// ============================================================================
// FONCTION : Charger les configurations des bots depuis les variables d'env
// ============================================================================
function loadBotConfigs() {
  const configs = [];
  
  // Vérifier si on utilise l'ancien format (un seul bot)
  if (process.env.DISCORD_TOKEN && process.env.N8N_WEBHOOK) {
    log.info('📝 Configuration détectée : Format ancien (un seul bot)');
    configs.push({
      name: process.env.BOT_NAME || 'Bot-1',
      token: process.env.DISCORD_TOKEN,
      webhook: process.env.N8N_WEBHOOK
    });
    return configs;
  }
  
  // Nouveau format : plusieurs bots avec BOT_1_NAME, BOT_1_TOKEN, etc.
  const botCount = parseInt(process.env.BOT_COUNT || '0');
  
  if (botCount > 0) {
    log.info(`📝 Configuration détectée : ${botCount} bot(s) configuré(s)`);
    
    for (let i = 1; i <= botCount; i++) {
      const name = process.env[`BOT_${i}_NAME`];
      const token = process.env[`BOT_${i}_TOKEN`];
      const webhook = process.env[`BOT_${i}_WEBHOOK`];
      
      if (!token || token === 'votre_token_discord_ici') {
        log.warn(`⚠️  Bot ${i} : Token manquant ou invalide, ignoré`);
        continue;
      }
      
      if (!webhook || webhook === 'votre_url_webhook_ici') {
        log.warn(`⚠️  Bot ${i} : Webhook manquant ou invalide, ignoré`);
        continue;
      }
      
      configs.push({
        name: name || `Bot-${i}`,
        token: token,
        webhook: webhook
      });
    }
  }
  
  if (configs.length === 0) {
    log.error('❌ Aucune configuration de bot valide trouvée !');
    log.info('📝 Formats supportés :');
    log.info('   Format simple (1 bot) :');
    log.info('     DISCORD_TOKEN=xxx');
    log.info('     N8N_WEBHOOK=yyy');
    log.info('     BOT_NAME=MonBot (optionnel)');
    log.info('');
    log.info('   Format multiple (N bots) :');
    log.info('     BOT_COUNT=3');
    log.info('     BOT_1_NAME=Bot1');
    log.info('     BOT_1_TOKEN=xxx');
    log.info('     BOT_1_WEBHOOK=yyy');
    log.info('     BOT_2_NAME=Bot2');
    log.info('     BOT_2_TOKEN=xxx');
    log.info('     BOT_2_WEBHOOK=yyy');
    log.info('     ...');
    process.exit(1);
  }
  
  return configs;
}

// ============================================================================
// CLASSE : Gestionnaire de Bot Discord
// ============================================================================
class DiscordBot {
  constructor(config) {
    this.name = config.name;
    this.token = config.token;
    this.webhook = config.webhook;
    
    // Statistiques du bot
    this.stats = {
      messagesProcessed: 0,
      errors: 0,
      reconnections: 0,
      lastMessage: null,
      status: 'initializing'
    };
    
    // Créer le client Discord
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ],
      restTimeOffset: 0,
      restRequestTimeout: 15000,
      retryLimit: 3,
      closeTimeout: 5000
    });
    
    this.setupEventHandlers();
  }
  
  // Configuration des événements Discord
  setupEventHandlers() {
    this.client.on('clientReady', () => {
      this.stats.status = 'connected';
      this.stats.reconnections++;
      log.success(`[${this.name}] Bot connecté : ${this.client.user.tag}`);
      log.info(`[${this.name}] Connecté à ${this.client.guilds.cache.size} serveur(s)`);
    });
    
    this.client.on('disconnect', () => {
      this.stats.status = 'disconnected';
      log.warn(`[${this.name}] Bot déconnecté de Discord`);
    });
    
    this.client.on('reconnecting', () => {
      this.stats.status = 'reconnecting';
      log.warn(`[${this.name}] Tentative de reconnexion...`);
    });
    
    this.client.on('resume', () => {
      this.stats.status = 'connected';
      log.success(`[${this.name}] Connexion restaurée`);
    });
    
    this.client.on('error', (error) => {
      this.stats.errors++;
      globalStats.totalErrors++;
      
      if (error.message.includes('disallowed intents')) {
        log.error(`[${this.name}] Les intents ne sont pas activés sur Discord Developer Portal`);
        log.info('📝 Activez "MESSAGE CONTENT INTENT" pour ce bot');
      } else {
        log.error(`[${this.name}] Erreur Discord : ${error.message}`);
      }
    });
    
    this.client.on('warn', (warning) => {
      log.warn(`[${this.name}] Discord warning : ${warning}`);
    });
    
    // Traitement des messages
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      
      this.stats.messagesProcessed++;
      globalStats.totalMessagesProcessed++;
      this.stats.lastMessage = new Date().toISOString();
      
      log.message(`[${this.name}] ${message.author.username} (${message.channel.name}): ${message.content}`);
      
      await this.sendToWebhook(message);
    });
  }
  
  // Envoyer le message au webhook n8n
  async sendToWebhook(message) {
    try {
      const payload = {
        botName: this.name,
        botId: this.client.user?.id,
        botTag: this.client.user?.tag,
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
      
      await axios.post(this.webhook, payload, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      log.info(`[${this.name}] Message envoyé au webhook n8n`);
    } catch (error) {
      this.stats.errors++;
      globalStats.totalErrors++;
      log.error(`[${this.name}] Erreur webhook n8n : ${error.message}`);
      
      // Retry une fois en cas d'erreur
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        log.warn(`[${this.name}] Tentative de renvoi dans 2 secondes...`);
        setTimeout(async () => {
          try {
            await axios.post(this.webhook, {
              botName: this.name,
              username: message.author.username,
              content: message.content,
              channelId: message.channel.id
            });
            log.success(`[${this.name}] Message renvoyé avec succès`);
          } catch (retryError) {
            log.error(`[${this.name}] Échec du renvoi : ${retryError.message}`);
          }
        }, 2000);
      }
    }
  }
  
  // Connexion du bot avec retry
  async connect() {
    try {
      this.stats.status = 'connecting';
      await this.client.login(this.token);
    } catch (error) {
      this.stats.status = 'error';
      log.error(`[${this.name}] Échec de connexion : ${error.message}`);
      log.warn(`[${this.name}] Nouvelle tentative dans 10 secondes...`);
      setTimeout(() => this.connect(), 10000);
    }
  }
  
  // Déconnexion propre
  async disconnect() {
    try {
      this.stats.status = 'disconnected';
      await this.client.destroy();
      log.info(`[${this.name}] Bot déconnecté proprement`);
    } catch (error) {
      log.error(`[${this.name}] Erreur lors de la déconnexion : ${error.message}`);
    }
  }
  
  // Obtenir les statistiques du bot
  getStats() {
    return {
      name: this.name,
      tag: this.client.user?.tag || 'Not connected',
      id: this.client.user?.id,
      status: this.stats.status,
      servers: this.client.guilds.cache.size,
      messagesProcessed: this.stats.messagesProcessed,
      errors: this.stats.errors,
      reconnections: this.stats.reconnections,
      lastMessage: this.stats.lastMessage,
      isReady: this.client.isReady()
    };
  }
}

// ============================================================================
// INITIALISATION DES BOTS
// ============================================================================
log.info('🚀 Démarrage du système multi-bots Discord...');

const configs = loadBotConfigs();
log.success(`✅ ${configs.length} bot(s) configuré(s) :`);

configs.forEach((config, index) => {
  log.info(`   ${index + 1}. ${config.name}`);
  const bot = new DiscordBot(config);
  bots.push(bot);
});

// Connexion de tous les bots
log.info('🔌 Connexion des bots...');
bots.forEach(bot => bot.connect());

// ============================================================================
// FONCTION : Formater l'uptime
// ============================================================================
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

// ============================================================================
// FONCTIONS UTILITAIRES SERVEUR
// ============================================================================

// Vérifier l'authentification
function checkAuth(req) {
  const authHeader = req.headers['authorization'];
  return authHeader === DASHBOARD_PASSWORD;
}

// Parser le body JSON des requêtes POST
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Obtenir les stats pour l'API
function getStatsData() {
  const uptimeMs = Date.now() - globalStats.startTime;
  
  return {
    global: {
      botsCount: bots.length,
      botsConnected: bots.filter(bot => bot.client.isReady()).length,
      totalMessagesProcessed: globalStats.totalMessagesProcessed,
      totalErrors: globalStats.totalErrors,
      uptime: {
        seconds: Math.floor(uptimeMs / 1000),
        formatted: formatUptime(uptimeMs)
      }
    },
    bots: bots.map(bot => bot.getStats()),
    system: {
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid
    }
  };
}

// ============================================================================
// SERVEUR HTTP - Dashboard, API et Health Check
// ============================================================================
const server = http.createServer(async (req, res) => {
  const url = req.url;
  const method = req.method;
  
  // ========== DASHBOARD HTML ==========
  if (url === '/dashboard' || url === '/') {
    const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
    if (fs.existsSync(dashboardPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(dashboardPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Dashboard non trouvé. Créez le fichier public/dashboard.html');
    }
    return;
  }
  
  // ========== API AUTHENTICATION ==========
  if (url === '/api/auth' && method === 'POST') {
    const body = await parseBody(req);
    
    if (body.password === DASHBOARD_PASSWORD) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Authentifié' }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Mot de passe incorrect' }));
    }
    return;
  }
  
  // ========== API STATS (Protégé) ==========
  if (url === '/api/stats') {
    if (!checkAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Non autorisé' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getStatsData()));
    return;
  }
  
  // ========== HEALTH CHECK (Public) ==========
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    const allBotsConnected = bots.every(bot => bot.client.isReady());
    const anyBotConnected = bots.some(bot => bot.client.isReady());
    
    const healthCheck = {
      status: allBotsConnected ? 'OK' : (anyBotConnected ? 'PARTIAL' : 'STARTING'),
      botsCount: bots.length,
      botsConnected: bots.filter(bot => bot.client.isReady()).length,
      bots: bots.map(bot => ({
        name: bot.name,
        tag: bot.client.user?.tag || 'connecting',
        status: bot.stats.status,
        isReady: bot.client.isReady()
      })),
      uptime: Math.floor(process.uptime()),
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      timestamp: new Date().toISOString()
    };
    res.end(JSON.stringify(healthCheck, null, 2));
    return;
  }
  
  // ========== STATS JSON (Public) ==========
  if (url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getStatsData(), null, 2));
    return;
  }
  
  // ========== STATS PAR BOT ==========
  if (url.startsWith('/stats/')) {
    const botName = decodeURIComponent(url.split('/stats/')[1]);
    const bot = bots.find(b => b.name === botName);
    
    if (bot) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(bot.getStats(), null, 2));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Bot not found', 
        availableBots: bots.map(b => b.name) 
      }));
    }
    return;
  }
  
  // ========== LISTE DES BOTS ==========
  if (url === '/bots') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const botsList = bots.map(bot => ({
      name: bot.name,
      tag: bot.client.user?.tag || 'Not connected',
      status: bot.stats.status,
      isReady: bot.client.isReady(),
      servers: bot.client.guilds.cache.size,
      messagesProcessed: bot.stats.messagesProcessed
    }));
    res.end(JSON.stringify(botsList, null, 2));
    return;
  }
  
  // ========== 404 ==========
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    error: 'Not Found', 
    endpoints: [
      '/dashboard - Dashboard visuel protégé',
      '/health - Health check',
      '/stats - Statistiques JSON',
      '/bots - Liste des bots',
      '/stats/:botName - Stats d\'un bot'
    ] 
  }));
});

// ============================================================================
// DÉMARRAGE DU SERVEUR HTTP
// ============================================================================
server.listen(PORT, () => {
  log.success(`Serveur HTTP démarré sur le port ${PORT}`);
  log.info(`📊 Endpoints disponibles :`);
  log.info(`   • Dashboard : http://localhost:${PORT}/dashboard 🎨 (protégé)`);
  log.info(`   • Health check : http://localhost:${PORT}/health`);
  log.info(`   • Statistiques : http://localhost:${PORT}/stats`);
  log.info(`   • Liste des bots : http://localhost:${PORT}/bots`);
  log.info(`   • Stats par bot : http://localhost:${PORT}/stats/:botName`);
  log.info(`🔐 Mot de passe dashboard : ${DASHBOARD_PASSWORD === 'admin123' ? '⚠️  DÉFAUT (changez-le!)' : '✅ Configuré'}`);
});

// ============================================================================
// GESTION GRACIEUSE DE L'ARRÊT
// ============================================================================
async function gracefulShutdown(signal) {
  log.warn(`Signal ${signal} reçu, arrêt gracieux de tous les bots...`);
  
  // Fermer le serveur HTTP
  server.close(() => {
    log.info('✓ Serveur HTTP fermé');
  });
  
  // Déconnecter tous les bots
  log.info(`Déconnexion de ${bots.length} bot(s)...`);
  const disconnectPromises = bots.map(bot => bot.disconnect());
  
  try {
    await Promise.all(disconnectPromises);
    log.success('✓ Tous les bots déconnectés proprement');
  } catch (error) {
    log.error(`Erreur lors de la déconnexion : ${error.message}`);
  }
  
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================================
// GESTION DES ERREURS NON CAPTURÉES
// ============================================================================
process.on('unhandledRejection', (error) => {
  log.error(`Promesse non gérée : ${error.message}`);
  console.error(error);
  globalStats.totalErrors++;
});

process.on('uncaughtException', (error) => {
  log.error(`Exception non capturée : ${error.message}`);
  console.error(error);
  globalStats.totalErrors++;
  // Ne pas arrêter le processus pour maintenir l'écoute
});

// ============================================================================
// INFORMATIONS DE DÉMARRAGE
// ============================================================================
log.info('');
log.info('═'.repeat(60));
log.success('🎉 Système multi-bots démarré avec succès !');
log.info(`📦 ${bots.length} bot(s) en cours d'initialisation`);
log.info(`🌐 Serveur HTTP : http://localhost:${PORT}`);
log.info('═'.repeat(60));
log.info('');
