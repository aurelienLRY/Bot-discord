# 🚀 Guide de Déploiement sur Easypanel

Ce guide vous explique comment déployer votre bot Discord sur un VPS avec Easypanel.

## 📋 Prérequis

1. Un compte Easypanel configuré sur votre VPS
2. Un bot Discord avec son token (https://discord.com/developers/applications)
3. Les intents MESSAGE CONTENT activés sur le portail Discord Developer
4. Une URL webhook n8n configurée

## 🐳 Méthode 1 : Déploiement Docker via Easypanel (Recommandé)

### Étape 1 : Préparer le dépôt

1. Poussez votre code sur GitHub/GitLab
2. Assurez-vous que le Dockerfile est à la racine

### Étape 2 : Créer l'application dans Easypanel

1. Connectez-vous à votre Easypanel
2. Cliquez sur **"Create New Service"**
3. Sélectionnez **"App"** → **"Docker"**
4. Configurez :
   - **Name** : `discord-bot`
   - **Source** : GitHub/GitLab (ou Docker Registry)
   - **Repository** : Votre dépôt
   - **Branch** : `main` ou `master`
   - **Build Path** : `/` (racine)

### Étape 3 : Configuration des variables d'environnement

Dans Easypanel, ajoutez ces variables d'environnement :

```
DISCORD_TOKEN=votre_token_discord_complet
N8N_WEBHOOK=https://votre-n8n.com/webhook/votre-webhook-id
PORT=3000
NODE_ENV=production
```

### Étape 4 : Configuration des domaines (Optionnel)

Si vous voulez accéder au health check publiquement :

1. Dans Easypanel, allez dans **"Domains"**
2. Ajoutez un domaine : `bot.votredomaine.com`
3. Le certificat SSL sera automatiquement configuré

### Étape 5 : Déployer

1. Cliquez sur **"Deploy"**
2. Easypanel va :
   - Cloner votre dépôt
   - Builder l'image Docker
   - Démarrer le conteneur
   - Configurer le health check

### Étape 6 : Vérifier le déploiement

Consultez les logs dans Easypanel :
```
[2024-XX-XX] ✅ Bot connecté en tant que VotreBot#1234
[2024-XX-XX] ✅ Serveur HTTP démarré sur le port 3000
```

Testez le health check :
```bash
curl http://bot.votredomaine.com/health
```

## 🔧 Méthode 2 : Build local + Push sur Docker Registry

### Étape 1 : Builder l'image

```bash
# Builder l'image
docker build -t votre-registry/discord-bot:latest .

# Pousser vers votre registry
docker push votre-registry/discord-bot:latest
```

### Étape 2 : Déployer depuis le registry

Dans Easypanel :
1. **Create New Service** → **App** → **Docker**
2. **Source** : Docker Registry
3. **Image** : `votre-registry/discord-bot:latest`
4. Ajoutez les variables d'environnement
5. Déployez

## 📊 Monitoring

### Health Check

Le bot expose deux endpoints :

**`/health`** - Status simple
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

**`/stats`** - Statistiques détaillées
```json
{
  "bot": {
    "name": "MonBot#1234",
    "servers": 5,
    "status": "connected"
  },
  "statistics": {
    "messagesProcessed": 142,
    "errors": 0,
    "reconnections": 1,
    "uptime": {
      "formatted": "2h 15m 30s"
    }
  }
}
```

### Configurer les alertes dans Easypanel

1. Allez dans **Settings** → **Health Check**
2. Configurez :
   - **Path** : `/health`
   - **Port** : `3000`
   - **Interval** : `30s`
   - **Timeout** : `10s`

## 🔄 Mises à jour automatiques

### Option 1 : Webhook GitHub/GitLab

1. Dans Easypanel, copiez l'URL du webhook de déploiement
2. Dans votre dépôt GitHub/GitLab :
   - **Settings** → **Webhooks**
   - Ajoutez l'URL Easypanel
   - Événements : Push sur la branche main

À chaque commit, le bot se redéploiera automatiquement !

### Option 2 : CI/CD avec GitHub Actions

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Easypanel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Trigger Easypanel Deployment
        run: |
          curl -X POST ${{ secrets.EASYPANEL_WEBHOOK_URL }}
```

## 🐛 Dépannage

### Le bot ne se connecte pas

1. Vérifiez les logs dans Easypanel
2. Assurez-vous que `DISCORD_TOKEN` est correct
3. Vérifiez que les intents sont activés sur Discord Developer Portal

### Erreurs de webhook n8n

1. Testez le webhook manuellement :
```bash
curl -X POST $N8N_WEBHOOK \
  -H "Content-Type: application/json" \
  -d '{"test": "message"}'
```

2. Vérifiez que n8n est accessible depuis votre VPS

### Le conteneur redémarre en boucle

1. Consultez les logs : `docker logs discord-bot`
2. Vérifiez les variables d'environnement
3. Assurez-vous que le port 3000 n'est pas utilisé

## 📈 Optimisations pour Production

### Limites de ressources

Dans Easypanel, configurez :
- **CPU** : 0.5 core (500m)
- **RAM** : 512MB limite, 128MB réservé

### Restart Policy

Configurez le redémarrage automatique :
- **Restart Policy** : `unless-stopped`

### Logs

Les logs sont automatiquement capturés par Easypanel. Accédez-y via :
- **Logs** dans l'interface Easypanel
- Ou via CLI : `docker logs -f discord-bot`

## 🔐 Sécurité

### Bonnes pratiques

1. ✅ Ne jamais commit le fichier `.env`
2. ✅ Utiliser des variables d'environnement dans Easypanel
3. ✅ Limiter l'accès au health check si nécessaire
4. ✅ Activer uniquement les intents Discord nécessaires
5. ✅ Mettre à jour régulièrement les dépendances

### Rotation des tokens

Si votre token Discord est compromis :
1. Générez un nouveau token sur Discord Developer Portal
2. Mettez à jour `DISCORD_TOKEN` dans Easypanel
3. Redéployez l'application

## 📞 Support

- Discord.js : https://discord.js.org
- Easypanel : https://easypanel.io/docs
- n8n : https://docs.n8n.io

---

✨ Votre bot est maintenant prêt pour une utilisation 24/7 !

