// Script de vérification de la configuration avant déploiement
require('dotenv').config();

const checks = [];
let botsConfigs = [];

console.log('\n🔍 Vérification de la configuration...\n');

// Vérification Node.js version
const nodeVersion = process.version;
const requiredVersion = 18;
const currentVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (currentVersion >= requiredVersion) {
  console.log(`✅ Version Node.js : ${nodeVersion} (>= ${requiredVersion})`);
  checks.push(true);
} else {
  console.log(`❌ Version Node.js : ${nodeVersion} (minimum requis: ${requiredVersion})`);
  checks.push(false);
}

console.log('\n📝 Vérification de la configuration des bots...\n');

// Détection du format de configuration
if (process.env.DISCORD_TOKEN && process.env.N8N_WEBHOOK) {
  // Format ancien : un seul bot
  console.log('📋 Format détecté : Configuration simple (1 bot)');
  
  const botName = process.env.BOT_NAME || 'Bot-1';
  console.log(`\n🤖 Bot : ${botName}`);
  
  if (process.env.DISCORD_TOKEN !== 'votre_token_discord_ici') {
    console.log(`   ✅ Token : Configuré (${process.env.DISCORD_TOKEN.length} caractères)`);
    checks.push(true);
  } else {
    console.log('   ❌ Token : Manquant ou invalide');
    checks.push(false);
  }
  
  if (process.env.N8N_WEBHOOK !== 'votre_url_webhook_ici') {
    console.log(`   ✅ Webhook : Configuré`);
    try {
      new URL(process.env.N8N_WEBHOOK);
      console.log('   ✅ Format URL : Valide');
      checks.push(true);
      botsConfigs.push({
        name: botName,
        webhook: process.env.N8N_WEBHOOK
      });
    } catch {
      console.log('   ⚠️  Format URL : Invalide');
      checks.push(false);
    }
  } else {
    console.log('   ❌ Webhook : Manquant ou invalide');
    checks.push(false);
  }
  
} else {
  // Format nouveau : plusieurs bots
  const botCount = parseInt(process.env.BOT_COUNT || '0');
  
  if (botCount > 0) {
    console.log(`📋 Format détecté : Configuration multi-bots (${botCount} bot(s))`);
    
    for (let i = 1; i <= botCount; i++) {
      const name = process.env[`BOT_${i}_NAME`] || `Bot-${i}`;
      const token = process.env[`BOT_${i}_TOKEN`];
      const webhook = process.env[`BOT_${i}_WEBHOOK`];
      
      console.log(`\n🤖 Bot ${i} : ${name}`);
      
      if (!token || token === 'votre_token_discord_ici') {
        console.log(`   ❌ Token : Manquant ou invalide`);
        checks.push(false);
      } else {
        console.log(`   ✅ Token : Configuré (${token.length} caractères)`);
        checks.push(true);
      }
      
      if (!webhook || webhook === 'votre_url_webhook_ici') {
        console.log(`   ❌ Webhook : Manquant ou invalide`);
        checks.push(false);
      } else {
        console.log(`   ✅ Webhook : Configuré`);
        try {
          new URL(webhook);
          console.log('   ✅ Format URL : Valide');
          checks.push(true);
          botsConfigs.push({
            name: name,
            webhook: webhook
          });
        } catch {
          console.log('   ⚠️  Format URL : Invalide');
          checks.push(false);
        }
      }
    }
  } else {
    console.log('❌ Aucune configuration de bot trouvée !');
    console.log('\n📝 Formats supportés :');
    console.log('   Format simple (1 bot) :');
    console.log('     DISCORD_TOKEN=xxx');
    console.log('     N8N_WEBHOOK=yyy');
    console.log('     BOT_NAME=MonBot (optionnel)');
    console.log('');
    console.log('   Format multiple (N bots) :');
    console.log('     BOT_COUNT=3');
    console.log('     BOT_1_NAME=Bot1');
    console.log('     BOT_1_TOKEN=xxx');
    console.log('     BOT_1_WEBHOOK=yyy');
    console.log('     BOT_2_NAME=Bot2');
    console.log('     BOT_2_TOKEN=xxx');
    console.log('     BOT_2_WEBHOOK=yyy');
    checks.push(false);
  }
}

// Vérification PORT
const port = process.env.PORT || 3000;
console.log(`✅ PORT : ${port}`);
checks.push(true);

// Vérification des dépendances
console.log('\n📦 Vérification des dépendances...\n');

try {
  require('discord.js');
  console.log('✅ discord.js : Installé');
  checks.push(true);
} catch {
  console.log('❌ discord.js : Non installé - Exécutez "npm install"');
  checks.push(false);
}

try {
  require('axios');
  console.log('✅ axios : Installé');
  checks.push(true);
} catch {
  console.log('❌ axios : Non installé - Exécutez "npm install"');
  checks.push(false);
}

try {
  require('dotenv');
  console.log('✅ dotenv : Installé');
  checks.push(true);
} catch {
  console.log('❌ dotenv : Non installé - Exécutez "npm install"');
  checks.push(false);
}

// Test de connectivité webhook (optionnel)
if (botsConfigs.length > 0) {
  console.log('\n🌐 Test de connectivité des webhooks...\n');
  
  const axios = require('axios');
  const webhookTests = botsConfigs.map(config => {
    return axios.post(config.webhook, {
      test: true,
      botName: config.name,
      message: 'Test de configuration depuis check-config.js',
      timestamp: new Date().toISOString()
    }, { timeout: 5000 })
      .then(() => {
        console.log(`✅ Webhook [${config.name}] : Accessible et fonctionnel`);
        return true;
      })
      .catch((error) => {
        console.log(`⚠️  Webhook [${config.name}] : Erreur - ${error.message}`);
        return false;
      });
  });
  
  Promise.all(webhookTests).then((results) => {
    const allSuccess = results.every(r => r);
    displayResults(checks, allSuccess);
  });
} else {
  displayResults(checks, null);
}

function displayResults(checks, webhookTest) {
  console.log('\n' + '='.repeat(70));
  
  const passed = checks.filter(c => c).length;
  const total = checks.length;
  
  if (passed === total && (webhookTest === null || webhookTest === true)) {
    console.log('\n✅ Configuration valide ! Prêt pour le déploiement.\n');
    console.log('📝 Prochaines étapes :');
    console.log('   1. Assurez-vous que MESSAGE CONTENT INTENT est activé pour chaque bot');
    console.log('      → https://discord.com/developers/applications');
    console.log('   2. Démarrez le système :');
    console.log('      → Local : npm start');
    console.log('      → Docker : npm run docker:run');
    console.log('      → Easypanel : suivez DEPLOYMENT.md');
    console.log('   3. Surveillez les logs au démarrage');
    console.log('   4. Testez les endpoints :');
    console.log('      → Health check : curl http://localhost:3000/health');
    console.log('      → Statistiques : curl http://localhost:3000/stats');
    console.log('      → Liste bots : curl http://localhost:3000/bots\n');
    console.log('📖 Documentation :');
    console.log('   • Configuration multi-bots : MULTI-BOTS.md');
    console.log('   • Guide déploiement : DEPLOYMENT.md');
    console.log('   • Démarrage rapide : QUICKSTART.md\n');
    process.exit(0);
  } else {
    console.log(`\n❌ ${total - passed} erreur(s) détectée(s). Corrigez les problèmes avant de déployer.\n`);
    if (webhookTest === false) {
      console.log('⚠️  Certains webhooks n8n ne sont pas accessibles.');
      console.log('   Vérifiez que n8n est démarré et accessible.\n');
    }
    process.exit(1);
  }
}

