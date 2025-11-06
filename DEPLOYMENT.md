# 🚀 Guide de Déploiement sur Easypanel

Déployez votre système multi-bots Discord sur un VPS avec Easypanel en 15 minutes.

---

## 📋 Prérequis

- VPS avec Easypanel installé
- Tokens Discord (https://discord.com/developers/applications)
- MESSAGE CONTENT INTENT activé pour chaque bot
- URLs webhook n8n configurées

---

## ⚡ Démarrage Rapide

### 1. Préparer le Code

```bash
# Tester en local d'abord
npm run check
npm start

# Pousser sur GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Créer l'Application dans Easypanel

1. Connectez-vous à Easypanel
2. **Create New Service** → **App** → **GitHub**
3. Sélectionnez votre repository
4. Branch : `main`
5. Build Type : `Dockerfile` (auto-détecté)
6. Build Path : `/`

### 3. Configurer les Variables d'Environnement

**Configuration Simple (1 bot)** :

| Variable | Valeur |
|----------|--------|
| `DISCORD_TOKEN` | Votre token Discord |
| `N8N_WEBHOOK` | https://n8n.example.com/webhook/xxx |
| `BOT_NAME` | MonBot |
| `DASHBOARD_PASSWORD` | VotreMotDePasseSecurise! |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

**Configuration Multi-Bots (3 bots)** :

| Variable | Valeur |
|----------|--------|
| `BOT_COUNT` | `3` |
| `BOT_1_NAME` | Bot-Production |
| `BOT_1_TOKEN` | Token Discord 1 |
| `BOT_1_WEBHOOK` | Webhook n8n 1 |
| `BOT_2_NAME` | Bot-Development |
| `BOT_2_TOKEN` | Token Discord 2 |
| `BOT_2_WEBHOOK` | Webhook n8n 2 |
| `BOT_3_NAME` | Bot-Testing |
| `BOT_3_TOKEN` | Token Discord 3 |
| `BOT_3_WEBHOOK` | Webhook n8n 3 |
| `DASHBOARD_PASSWORD` | VotreMotDePasseSecurise! |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

### 4. Configurer le Domaine (Optionnel)

1. **Domains** → **Add Domain**
2. Entrez : `bot.votredomaine.com`
3. SSL auto-configuré par Easypanel ✅

### 5. Configurer le Health Check

1. **Advanced** → **Health Check**
2. Path : `/health`
3. Port : `3000`
4. Interval : `30s`
5. Timeout : `10s`
6. Retries : `3`

### 6. Déployer !

1. Cliquez **Deploy**
2. Attendez 2-3 minutes (build + démarrage)
3. Surveillez les logs

Logs attendus :
```
[2024-XX-XX] 🚀 Démarrage du système multi-bots...
[2024-XX-XX] ✅ 3 bot(s) configuré(s)
[2024-XX-XX] ✅ [Bot-Production] Bot connecté : BotProd#1234
[2024-XX-XX] ✅ Serveur HTTP démarré sur le port 3000
[2024-XX-XX] 🔐 Mot de passe dashboard : ✅ Configuré
```

### 7. Vérifier le Déploiement

**Via Easypanel** :
- Status : **Running** (vert)
- Health Check : **Healthy** ✅

**Via les endpoints** :
```bash
# Health check
curl https://bot.votredomaine.com/health

# Dashboard
https://bot.votredomaine.com/dashboard
```

---

## 🐳 Méthode Alternative : Docker Registry

Si vous préférez builder localement :

```bash
# Builder l'image
docker build -t votre-registry/discord-bot:latest .

# Pousser vers registry
docker push votre-registry/discord-bot:latest
```

Dans Easypanel :
- **Source** : Docker Registry
- **Image** : `votre-registry/discord-bot:latest`
- Ajoutez les variables d'environnement
- Deploy !

---

## 🔧 Configuration Avancée

### Limites de Ressources

Recommandé :
- **CPU** : 0.5 core (500m)
- **RAM** : 512MB limite, 128MB réservé

### Restart Policy

- **Restart Policy** : `unless-stopped`

### Ports

- **Port** : 3000 (interne)
- **Publié** : Auto (Easypanel gère)

---

## 📊 Monitoring

### Dashboard

Accédez au dashboard visuel :
```
https://bot.votredomaine.com/dashboard
```

Connectez-vous avec `DASHBOARD_PASSWORD`.

### Logs

Consultez les logs en temps réel dans Easypanel :
- **Logs** → Voir les logs en direct
- Filtrez par mot-clé : `[Bot-Production]`, `❌`, `✅`

### Alertes

Configurez des alertes Easypanel :
1. **Settings** → **Alerts**
2. Alertes sur :
   - Health check failed
   - CPU > 80%
   - RAM > 80%

---

## 🔄 Mises à Jour Automatiques

### Webhook GitHub

1. Dans Easypanel, copiez l'URL du webhook
2. Dans GitHub :
   - **Settings** → **Webhooks**
   - Ajoutez l'URL Easypanel
   - Events : Push sur `main`

À chaque commit → déploiement automatique ! 🎉

### GitHub Actions

`.github/workflows/deploy.yml` :
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
      
      - name: Trigger Easypanel
        run: |
          curl -X POST ${{ secrets.EASYPANEL_WEBHOOK_URL }}
```

---

## 🐛 Dépannage

### Le bot ne se connecte pas

**Logs** :
```
❌ [Bot-Test] Échec de connexion : Invalid token
```

**Solutions** :
1. Vérifiez `DISCORD_TOKEN` dans Easypanel
2. Assurez-vous que le token est complet (~70 caractères)
3. Vérifiez MESSAGE CONTENT INTENT sur Discord Developer Portal

### Build Docker échoue

**Erreur** : `Dockerfile not found`

**Solution** :
- Vérifiez que le Dockerfile est à la racine du repo
- Build Path dans Easypanel : `/`

### Health check échoue

**Status** : Unhealthy

**Solutions** :
1. Vérifiez les logs : le serveur démarre-t-il ?
2. Vérifiez le port : doit être `3000`
3. Testez manuellement :
   ```bash
   curl http://container-ip:3000/health
   ```

### Webhook n8n ne reçoit rien

**Logs** :
```
❌ [Bot-Prod] Erreur webhook : ECONNREFUSED
```

**Solutions** :
1. Testez depuis le conteneur :
   ```bash
   curl -X POST $N8N_WEBHOOK -d '{"test":1}'
   ```
2. Vérifiez que n8n est accessible depuis Internet
3. Vérifiez l'URL (pas de typo)

### Dashboard inaccessible

**Erreur** : 404 Not Found

**Solution** :
- Vérifiez que le dossier `public/` est dans le repo
- Vérifiez que `dashboard.html` est commité
- Redéployez

---

## 📈 Optimisations Production

### HTTPS

✅ Easypanel configure automatiquement SSL avec Let's Encrypt.

### Logs

- Gardez les logs 7 jours maximum
- Utilisez un service externe pour logs long-terme (optionnel)

### Sauvegarde

Sauvegardez votre fichier `.env` dans un coffre-fort sécurisé.

### Surveillance

- Dashboard : Monitoring visuel en temps réel
- Alertes Easypanel : Notifications automatiques
- Logs : Consultez régulièrement

---

## 🔐 Sécurité

### Bonnes Pratiques

✅ Utilisez HTTPS (Easypanel le fait automatiquement)  
✅ Mot de passe fort pour le dashboard (12+ caractères)  
✅ Ne commitez JAMAIS le fichier `.env`  
✅ Activez uniquement les intents nécessaires  
✅ Tokens Discord différents par environnement  

### Rotation des Tokens

Si un token est compromis :
1. Générez un nouveau token sur Discord Developer Portal
2. Mettez à jour dans Easypanel
3. Redéployez

---

## ✅ Checklist de Déploiement

Avant de déployer :

- [ ] Code testé en local (`npm start`)
- [ ] `npm run check` passe sans erreur
- [ ] Tokens Discord valides
- [ ] MESSAGE CONTENT INTENT activé pour chaque bot
- [ ] Webhooks n8n fonctionnels
- [ ] `DASHBOARD_PASSWORD` configuré (pas "admin123")
- [ ] Code poussé sur GitHub
- [ ] Variables d'environnement prêtes

Après déploiement :

- [ ] Logs vérifiés (bots connectés)
- [ ] Health check : Healthy ✅
- [ ] Dashboard accessible
- [ ] Messages Discord arrivent dans n8n
- [ ] Alertes configurées

---

## 📞 Support

- **Logs** : Première source d'information
- **Health check** : `/health` pour status
- **Dashboard** : `/dashboard` pour monitoring visuel
- **Stats API** : `/stats` pour debugging

**📚 Documentation complète** :
- `README.md` - Vue d'ensemble
- `MULTI-BOTS.md` - Configuration multi-bots
- `DASHBOARD.md` - Guide du dashboard
- `QUICKSTART.md` - Démarrage rapide local

---

✨ **Votre bot est maintenant en production 24/7 sur Easypanel !** 🎉
