// Script de vérification de la configuration avant déploiement
require('dotenv').config();

const checks = [];

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

// Vérification DISCORD_TOKEN
if (process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== 'votre_token_discord_ici') {
  console.log(`✅ DISCORD_TOKEN : Configuré (${process.env.DISCORD_TOKEN.length} caractères)`);
  checks.push(true);
} else {
  console.log('❌ DISCORD_TOKEN : Manquant ou invalide');
  checks.push(false);
}

// Vérification N8N_WEBHOOK
if (process.env.N8N_WEBHOOK && process.env.N8N_WEBHOOK !== 'votre_url_webhook_ici') {
  console.log(`✅ N8N_WEBHOOK : Configuré (${process.env.N8N_WEBHOOK})`);
  
  // Vérification format URL
  try {
    new URL(process.env.N8N_WEBHOOK);
    console.log('   → Format URL valide');
    checks.push(true);
  } catch {
    console.log('   ⚠️  Format URL invalide');
    checks.push(false);
  }
} else {
  console.log('❌ N8N_WEBHOOK : Manquant ou invalide');
  checks.push(false);
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
if (process.env.N8N_WEBHOOK && process.env.N8N_WEBHOOK !== 'votre_url_webhook_ici') {
  console.log('\n🌐 Test de connectivité webhook...\n');
  
  const axios = require('axios');
  axios.post(process.env.N8N_WEBHOOK, {
    test: true,
    message: 'Test de configuration depuis check-config.js'
  }, { timeout: 5000 })
    .then(() => {
      console.log('✅ Webhook n8n : Accessible et fonctionnel');
      displayResults(checks, true);
    })
    .catch((error) => {
      console.log(`⚠️  Webhook n8n : Erreur de connexion - ${error.message}`);
      console.log('   → Vérifiez que l\'URL est correcte et que n8n est accessible');
      displayResults(checks, false);
    });
} else {
  displayResults(checks, null);
}

function displayResults(checks, webhookTest) {
  console.log('\n' + '='.repeat(50));
  
  const passed = checks.filter(c => c).length;
  const total = checks.length;
  
  if (passed === total && (webhookTest === null || webhookTest === true)) {
    console.log('\n✅ Configuration valide ! Prêt pour le déploiement.\n');
    console.log('📝 Prochaines étapes :');
    console.log('   1. Assurez-vous que les intents MESSAGE CONTENT sont activés sur Discord');
    console.log('   2. Déployez avec : npm start (local) ou suivez DEPLOYMENT.md (Easypanel)');
    console.log('   3. Surveillez les logs au démarrage\n');
    process.exit(0);
  } else {
    console.log(`\n❌ ${total - passed} erreur(s) détectée(s). Corrigez les problèmes avant de déployer.\n`);
    process.exit(1);
  }
}

