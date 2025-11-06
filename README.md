# 🤖 Bot Discord Multi-Bots avec Dashboard

Système multi-bots Discord optimisé pour VPS avec dashboard de monitoring. Gérez plusieurs bots, surveillez-les en temps réel, et automatisez via n8n.

> 📚 **Nouveau sur le projet ?** Consultez **[INDEX.md](INDEX.md)** pour naviguer dans la documentation.

## ✨ Fonctionnalités

- 🔄 **Reconnexion automatique** en cas de déconnexion
- 📊 **Monitoring** via endpoints HTTP (health check + statistiques)
- 🐳 **Dockerisé** et prêt pour Easypanel
- 🛡️ **Robuste** avec gestion des erreurs et retry automatique
- 📝 **Logs détaillés** avec timestamps pour faciliter le debugging
- 🔌 **Intégration n8n** via webhook
- ⚡ **Léger** : ~40 MB d'utilisation RAM

## 🚀 Démarrage Rapide

### En local

1. **Cloner et installer**
```bash
git clone <votre-repo>
cd Bot-discord
npm install
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos vraies valeurs
```

3. **Démarrer le bot**
```bash
npm start
```

### Avec Docker

```bash
# Construire l'image
docker build -t discord-bot .

# Ou utiliser docker-compose
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

## 📋 Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Token du bot Discord | `MTIzNDU2Nzg5MDEyMzQ1Njc4OQ...` |
| `N8N_WEBHOOK` | URL du webhook n8n | `https://n8n.example.com/webhook/abc123` |
| `PORT` | Port du serveur HTTP | `3000` (défaut) |
| `NODE_ENV` | Environnement | `production` ou `development` |

### Obtenir le token Discord

1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Allez dans l'onglet **"Bot"**
4. Cliquez sur **"Reset Token"** et copiez-le
5. ⚠️ **Important** : Activez **"MESSAGE CONTENT INTENT"** dans "Privileged Gateway Intents"
6. Invitez le bot sur votre serveur avec les permissions nécessaires

## 📊 Endpoints de Monitoring

### `/health` - Health Check
Endpoint simple pour vérifier que le bot fonctionne.

```bash
curl http://localhost:3000/health
```

Réponse :
```json
{
  "status": "OK",
  "discord": "connected",
  "bot": "MonBot#1234",
  "uptime": 3600,
  "memory": "45 MB",
  "timestamp": "2024-11-06T10:30:00.000Z"
}
```

### `/stats` - Statistiques Détaillées
Informations complètes sur l'état du bot.

```bash
curl http://localhost:3000/stats
```

Réponse :
```json
{
  "bot": {
    "name": "MonBot#1234",
    "id": "123456789",
    "servers": 5,
    "status": "connected"
  },
  "statistics": {
    "messagesProcessed": 142,
    "errors": 0,
    "reconnections": 1,
    "lastMessage": "2024-11-06T10:29:45.000Z",
    "uptime": {
      "seconds": 7830,
      "formatted": "2h 10m 30s"
    }
  },
  "system": {
    "memory": {...},
    "nodeVersion": "v18.0.0",
    "platform": "linux"
  }
}
```

## 🐳 Déploiement sur Easypanel

Consultez le guide détaillé : **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Résumé rapide

1. **Pousser votre code** sur GitHub/GitLab
2. **Dans Easypanel** :
   - Create New Service → App → Docker
   - Connectez votre dépôt
   - Ajoutez les variables d'environnement
   - Deploy !
3. **Configurez le health check** sur `/health`
4. **Profit** ! Votre bot tourne 24/7 🎉

## 🔧 Architecture

### Flux des messages

```
Discord Server
    ↓
[Message reçu]
    ↓
Bot Discord (index.js)
    ↓
[Traitement & Log]
    ↓
Webhook n8n (HTTP POST)
    ↓
n8n Workflow
    ↓
[Vos automatisations]
```

### Payload envoyé à n8n

```json
{
  "username": "Utilisateur#1234",
  "userId": "123456789",
  "content": "Message text",
  "channelId": "987654321",
  "channelName": "general",
  "guildId": "111222333",
  "guildName": "Mon Serveur",
  "timestamp": 1699264800000,
  "messageId": "444555666"
}
```

## 🛡️ Fonctionnalités de Robustesse

- ✅ **Reconnexion automatique** à Discord en cas de déconnexion
- ✅ **Retry automatique** des requêtes webhook en cas d'échec
- ✅ **Gestion gracieuse** des signaux SIGTERM/SIGINT
- ✅ **Health check** pour monitoring externe
- ✅ **Logs horodatés** pour audit et debugging
- ✅ **Gestion des erreurs non capturées** sans crash

## 📝 Logs

Le bot produit des logs détaillés :

```
[2024-11-06T10:00:00.000Z] 🚀 Démarrage du Bot Discord...
[2024-11-06T10:00:01.523Z] ✅ Bot connecté en tant que MonBot#1234
[2024-11-06T10:00:01.523Z] ℹ️  Connecté à 5 serveur(s)
[2024-11-06T10:00:01.689Z] ✅ Serveur HTTP démarré sur le port 3000
[2024-11-06T10:00:01.689Z] ℹ️  Health check : http://localhost:3000/health
[2024-11-06T10:05:23.456Z] 💬 User123 (general): Hello world!
[2024-11-06T10:05:23.567Z] ℹ️  Message envoyé au webhook n8n
```

## 🐛 Dépannage

### Le bot ne démarre pas

```bash
# Vérifier les variables d'environnement
cat .env

# Vérifier les logs
npm start

# Avec Docker
docker-compose logs discord-bot
```

### Le bot se déconnecte souvent

- Vérifiez votre connexion internet
- Assurez-vous que les intents sont activés sur Discord
- Consultez les logs pour identifier la cause

### Les messages n'arrivent pas à n8n

```bash
# Tester le webhook manuellement
curl -X POST $N8N_WEBHOOK \
  -H "Content-Type: application/json" \
  -d '{"test": "message"}'
```

## 📈 Performances

- **Mémoire** : ~40-60 MB en idle, ~100 MB sous charge
- **CPU** : <1% en idle, ~5% lors du traitement de messages
- **Latence** : <100ms entre réception Discord et envoi n8n
- **Uptime** : 99.9%+ avec la gestion de reconnexion

## 🔐 Sécurité

- ✅ Variables d'environnement pour les secrets
- ✅ Utilisateur non-root dans Docker
- ✅ Pas de données sensibles dans les logs
- ✅ Dépendances à jour

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à :
- Ouvrir des issues pour les bugs
- Proposer des améliorations
- Soumettre des pull requests

## 📄 Licence

ISC

## 🔗 Liens Utiles

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [n8n Documentation](https://docs.n8n.io/)
- [Easypanel Documentation](https://easypanel.io/docs)
- [Guide de Déploiement Complet](./DEPLOYMENT.md)

---

✨ **Fait avec ❤️ pour la communauté Discord**

