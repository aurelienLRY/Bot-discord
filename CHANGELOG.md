# 📝 Changelog - Historique des Versions

## Version 3.1.0 - Dashboard de Monitoring (Novembre 2024)

### 🎉 Nouveautés

#### Dashboard Visuel
- ✅ Interface web moderne avec Tailwind CSS
- ✅ Protégé par mot de passe (`DASHBOARD_PASSWORD`)
- ✅ Auto-refresh automatique (5 secondes)
- ✅ Design responsive (mobile/tablet/desktop)
- ✅ 4 cartes de statistiques en temps réel
- ✅ Liste détaillée de tous les bots
- ✅ Thème Discord professionnel

#### Nouveaux Endpoints
- `/dashboard` - Interface HTML du dashboard
- `/api/auth` (POST) - Authentification
- `/api/stats` (GET) - Stats protégées pour le dashboard

#### Fichiers Ajoutés
- `public/dashboard.html` - Dashboard complet (~600 lignes)
- `DASHBOARD.md` - Documentation complète

### 🔧 Modifications
- `index.js` : Ajout des fonctions `checkAuth()`, `parseBody()`, `getStatsData()`
- Serveur HTTP refactorisé avec routes d'authentification
- Message de démarrage amélioré avec indication du mot de passe

---

## Version 3.0.0 - Système Multi-Bots (Novembre 2024)

### 🎉 Nouveautés Majeures

#### Support Multi-Bots
- ✅ Un seul processus peut gérer N bots simultanément
- ✅ Chaque bot avec son propre token et webhook n8n
- ✅ Configuration flexible : 1 bot ou 100 bots
- ✅ Rétrocompatible avec la config simple (1 bot)
- ✅ Logs préfixés par nom de bot `[Bot-1]`, `[Bot-2]`

#### Architecture Refactorisée
```javascript
class DiscordBot {
  constructor(config) { ... }
  setupEventHandlers() { ... }
  sendToWebhook(message) { ... }
  connect() { ... }
  disconnect() { ... }
  getStats() { ... }
}
```

#### Fonction de Chargement
- `loadBotConfigs()` : Détecte automatiquement le format de configuration
- Support de 2 formats : simple (1 bot) ou multi-bots (N bots)

#### Nouveaux Endpoints HTTP
- `/stats` - Statistiques globales améliorées
- `/bots` - Liste rapide de tous les bots
- `/stats/:botName` - Stats d'un bot spécifique
- `/health` - Status de tous les bots (amélioré)

#### Payload Enrichi vers n8n
Ajout de nouveaux champs :
```json
{
  "botName": "Bot-Production",
  "botId": "123456789",
  "botTag": "BotProd#1234",
  ...
}
```

### 📋 Configuration

#### Format Simple (1 bot)
```env
DISCORD_TOKEN=xxx
N8N_WEBHOOK=yyy
BOT_NAME=MonBot
```

#### Format Multi-Bots (N bots)
```env
BOT_COUNT=3
BOT_1_NAME=Bot-Production
BOT_1_TOKEN=xxx
BOT_1_WEBHOOK=yyy
BOT_2_NAME=Bot-Development
BOT_2_TOKEN=xxx
BOT_2_WEBHOOK=yyy
...
```

### 🛠️ Fichiers Ajoutés
- `MULTI-BOTS.md` - Guide complet du système multi-bots
- `env.multi-bots.example` - Exemple de configuration

### 📈 Performances
- 1 bot : ~40-60 MB RAM
- 3 bots : ~80-120 MB RAM
- 5 bots : ~120-180 MB RAM
- CPU : <5% sous charge normale

---

## Version 2.0.0 - Adaptation VPS Easypanel (Novembre 2024)

### 🎉 Nouveautés

#### Robustesse et Reconnexion
- ✅ Reconnexion automatique à Discord
- ✅ Configuration optimisée pour VPS (timeouts, retry)
- ✅ Gestion des événements `disconnect`, `reconnecting`, `resume`
- ✅ Retry automatique des requêtes webhook n8n
- ✅ Fonction `connectBot()` avec retry automatique

#### Monitoring et Statistiques
- ✅ Endpoint `/health` pour health check Easypanel
- ✅ Endpoint `/stats` avec statistiques détaillées
- ✅ Tracking des métriques (messages, erreurs, reconnexions, uptime)
- ✅ Health check Docker intégré

#### Logs Améliorés
- ✅ Logger avec timestamps ISO 8601
- ✅ Niveaux : info, success, error, warn, message
- ✅ Logs plus détaillés pour debugging

#### Payload Enrichi
Ajout de nouveaux champs vers n8n :
- `userId`, `channelName`
- `guildId`, `guildName`
- `timestamp`, `messageId`

#### Gestion des Erreurs
- ✅ Signaux SIGTERM et SIGINT (arrêt gracieux)
- ✅ `unhandledRejection` et `uncaughtException`
- ✅ Le bot ne crash plus sur erreurs inattendues

### 🐳 Fichiers Docker

#### Dockerfile
- Image Node.js 18 Alpine (légère)
- Utilisateur non-root (sécurité)
- Health check intégré
- ~40 MB image finale

#### docker-compose.yml
- Configuration prête à l'emploi
- Limites de ressources
- Restart policy `unless-stopped`

### 📚 Documentation
- `README.md` - Documentation complète
- `DEPLOYMENT.md` - Guide Easypanel détaillé
- `QUICKSTART.md` - Démarrage en 5 minutes
- `FIRST-DEPLOY.md` - Guide pas-à-pas

### 🛠️ Outils
- `check-config.js` - Validation de configuration
- `.github/workflows/deploy.yml` - CI/CD GitHub Actions
- `easypanel.json` - Configuration Easypanel

### 🐛 Corrections
- ✅ Événement `ready` → `clientReady` (dépréciation Discord.js)
- ✅ Amélioration de la gestion des erreurs
- ✅ Fix du format d'URL dans check-config

---

## Version 1.0.0 - Version Initiale

### Fonctionnalités de Base
- Bot Discord simple
- Écoute des messages
- Envoi vers webhook n8n
- Configuration via .env

---

## 📊 Résumé des Versions

| Version | Date | Fonctionnalité Principale |
|---------|------|---------------------------|
| **3.1.0** | Nov 2024 | Dashboard de monitoring |
| **3.0.0** | Nov 2024 | Système multi-bots |
| **2.0.0** | Nov 2024 | Adaptation VPS Easypanel |
| **1.0.0** | - | Version initiale |

---

## 🎯 Évolution du Projet

**v1.0** : Bot simple  
**v2.0** : Bot + VPS ready  
**v3.0** : Multi-bots  
**v3.1** : Multi-bots + Dashboard ! 🎨

---

## 🔄 Migration

### De v1.0 vers v2.0
Aucune migration nécessaire - rétrocompatible

### De v2.0 vers v3.0
Pour activer multi-bots :
1. Ajoutez `BOT_COUNT=N`
2. Ajoutez `BOT_X_NAME`, `BOT_X_TOKEN`, `BOT_X_WEBHOOK`
3. Redémarrez

Ou continuez avec le format simple (1 bot) - fonctionne toujours !

### De v3.0 vers v3.1
Pour activer le dashboard :
1. Ajoutez `DASHBOARD_PASSWORD=xxx` dans .env
2. Créez le dossier `public/`
3. Ajoutez `dashboard.html` dans `public/`
4. Redémarrez

Tous les endpoints existants continuent de fonctionner.

---

**Version actuelle** : 3.1.0  
**Statut** : ✅ Production Ready  
**Rétrocompatibilité** : ✅ 100% depuis v1.0
