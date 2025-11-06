# 🚀 Démarrage Rapide - Bot Discord

Guide ultra-rapide pour démarrer votre bot Discord en 5 minutes.

## 📋 Prérequis

- Node.js 18+ installé
- Un compte Discord
- (Optionnel) Un compte Easypanel pour le VPS

## ⚡ Installation en 3 étapes

### 1️⃣ Cloner et installer

```bash
git clone <votre-repo>
cd Bot-discord
npm install
```

### 2️⃣ Configurer

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos valeurs
# Windows:
notepad .env
# Linux/Mac:
nano .env
```

Remplissez :
```env
DISCORD_TOKEN=votre_token_discord_ici
N8N_WEBHOOK=votre_url_webhook_ici
PORT=3000
```

**Obtenir le token Discord :**
1. https://discord.com/developers/applications
2. Créer une application → Onglet "Bot"
3. "Reset Token" et copiez
4. ⚠️ Activez "MESSAGE CONTENT INTENT" !

### 3️⃣ Démarrer

```bash
# Vérifier la configuration
npm run check

# Démarrer le bot
npm start
```

Vous devriez voir :
```
[2024-XX-XX] ✅ Bot connecté en tant que VotreBot#1234
[2024-XX-XX] ✅ Serveur HTTP démarré sur le port 3000
```

## 🐳 Avec Docker (recommandé pour VPS)

```bash
# Construire et démarrer
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## 📊 Tester

1. **Health Check**
```bash
curl http://localhost:3000/health
```

2. **Statistiques**
```bash
curl http://localhost:3000/stats
```

3. **Envoyer un message sur Discord**
   - Le bot devrait le logger
   - Il sera envoyé au webhook n8n

## 🚀 Déployer sur Easypanel

### Méthode ultra-rapide

1. **Poussez votre code sur GitHub**
```bash
git add .
git commit -m "Config bot Discord"
git push origin main
```

2. **Dans Easypanel** :
   - "Create New Service" → "App" → "Docker"
   - Source : GitHub
   - Repository : Sélectionnez votre repo
   - Build Path : `/`

3. **Variables d'environnement** (dans Easypanel) :
```
DISCORD_TOKEN=votre_token
N8N_WEBHOOK=https://votre-n8n.com/webhook/xxx
PORT=3000
NODE_ENV=production
```

4. **Deploy** → Attendez 2-3 minutes → ✅ Fait !

5. **Vérifier** :
   - Consultez les logs dans Easypanel
   - Testez : `curl https://votre-domaine.com/health`

## 🎯 Configuration n8n (Webhook)

1. Dans n8n, créez un workflow
2. Ajoutez un nœud "Webhook"
3. Méthode : POST
4. Copiez l'URL du webhook
5. Utilisez cette URL dans `N8N_WEBHOOK`

Le bot enverra ce format :
```json
{
  "username": "User#1234",
  "userId": "123456789",
  "content": "message text",
  "channelId": "987654321",
  "channelName": "general",
  "guildId": "111222333",
  "guildName": "Mon Serveur",
  "timestamp": 1699264800000,
  "messageId": "444555666"
}
```

## ❓ Problèmes courants

### "Disallowed intents"
➡️ Activez "MESSAGE CONTENT INTENT" sur Discord Developer Portal

### "ECONNREFUSED" sur webhook
➡️ Vérifiez l'URL du webhook n8n
➡️ Testez : `curl -X POST $N8N_WEBHOOK -d '{"test":1}'`

### Le bot ne répond pas
➡️ Vérifiez qu'il est invité sur votre serveur
➡️ Vérifiez les permissions (Read Messages, View Channels)

### Docker ne démarre pas
➡️ Vérifiez que le port 3000 est libre
➡️ Consultez les logs : `docker-compose logs`

## 📚 Documentation complète

- [README.md](./README.md) - Documentation complète
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement détaillé

## 🆘 Besoin d'aide ?

1. Consultez les logs : `npm start` ou `docker-compose logs -f`
2. Testez la config : `npm run check`
3. Vérifiez les variables d'environnement

---

**🎉 Votre bot devrait maintenant fonctionner !**

Si tout marche, vous verrez les messages Discord arriver dans les logs et dans n8n.

