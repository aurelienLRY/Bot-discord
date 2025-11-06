# 🎯 Premier Déploiement sur Easypanel

Guide pas-à-pas pour votre premier déploiement. Suivez ces étapes dans l'ordre.

## ✅ Phase 1 : Préparation Locale (10 min)

### 1. Vérifier Node.js
```bash
node --version
# Doit afficher v18.x.x ou supérieur
```

Si version < 18, installez Node.js 18+ depuis https://nodejs.org

### 2. Installer les dépendances
```bash
cd Bot-discord
npm install
```

### 3. Configurer les variables d'environnement
```bash
# Copier le template
cp .env.example .env

# Éditer le fichier .env
notepad .env  # Windows
nano .env     # Linux/Mac
```

**Remplissez avec vos vraies valeurs :**
```env
DISCORD_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.GhIjKl.MnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz
N8N_WEBHOOK=https://votre-n8n.com/webhook/abc123def456
PORT=3000
NODE_ENV=development
```

### 4. Obtenir le token Discord (si pas encore fait)

**Étape A : Créer l'application**
1. Allez sur https://discord.com/developers/applications
2. Cliquez "New Application"
3. Donnez un nom : "MonBot" par exemple
4. Cliquez "Create"

**Étape B : Créer le bot**
1. Menu latéral → "Bot"
2. Cliquez "Add Bot" → "Yes, do it!"
3. Donnez un username au bot

**Étape C : Récupérer le token**
1. Cliquez "Reset Token"
2. Copiez le token (vous ne le verrez qu'une fois !)
3. Collez-le dans `.env` → `DISCORD_TOKEN=...`

**Étape D : Activer les intents (CRUCIAL !)**
1. Dans la page Bot, descendez à "Privileged Gateway Intents"
2. ✅ Activez **"MESSAGE CONTENT INTENT"**
3. ✅ Activez **"SERVER MEMBERS INTENT"** (optionnel)
4. ✅ Activez **"PRESENCE INTENT"** (optionnel)
5. Cliquez "Save Changes"

**Étape E : Inviter le bot sur votre serveur**
1. Menu latéral → "OAuth2" → "URL Generator"
2. **Scopes** : Cochez `bot`
3. **Bot Permissions** : 
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Read Message History
4. Copiez l'URL générée en bas
5. Ouvrez l'URL dans un navigateur
6. Sélectionnez votre serveur Discord
7. Cliquez "Authorize"

### 5. Configurer le webhook n8n

**Si vous avez déjà n8n :**
1. Créez un nouveau workflow dans n8n
2. Ajoutez un nœud "Webhook"
3. Configurez :
   - Method : `POST`
   - Path : Un nom unique, ex: `discord-bot`
4. Copiez l'URL du webhook
5. Collez dans `.env` → `N8N_WEBHOOK=...`

**Si vous n'avez pas encore n8n :**
- Utilisez une URL de test : `https://webhook.site` (pour tester)
- Ou installez n8n : https://docs.n8n.io/hosting/

### 6. Tester la configuration
```bash
npm run check
```

Vous devriez voir :
```
✅ Version Node.js : v18.x.x
✅ DISCORD_TOKEN : Configuré
✅ N8N_WEBHOOK : Configuré
✅ discord.js : Installé
✅ axios : Installé
✅ dotenv : Installé
✅ Configuration valide !
```

### 7. Test en local
```bash
npm start
```

Résultat attendu :
```
[2024-XX-XX] 🚀 Démarrage du Bot Discord...
[2024-XX-XX] ✅ Bot connecté en tant que MonBot#1234
[2024-XX-XX] ℹ️  Connecté à 1 serveur(s)
[2024-XX-XX] ✅ Serveur HTTP démarré sur le port 3000
```

### 8. Tester le bot
1. Ouvrez Discord
2. Allez sur votre serveur où le bot est présent
3. Envoyez un message : "Hello bot!"
4. Vérifiez les logs :
```
[2024-XX-XX] 💬 VotreNom (general): Hello bot!
[2024-XX-XX] ℹ️  Message envoyé au webhook n8n
```

5. Testez le health check :
```bash
curl http://localhost:3000/health
```

**Si tout fonctionne**, passez à la Phase 2 ! 🎉

**Si ça ne fonctionne pas**, voir section Dépannage en bas.

---

## 🚀 Phase 2 : Déploiement sur Easypanel (15 min)

### 1. Préparer le dépôt Git

**Si vous n'avez pas encore de dépôt GitHub :**

```bash
# Initialiser git
git init

# Ajouter tous les fichiers
git add .

# Commit initial
git commit -m "Initial commit - Bot Discord v2.0"

# Créer un repo sur GitHub.com
# Puis lier votre repo local :
git remote add origin https://github.com/votre-username/bot-discord.git
git branch -M main
git push -u origin main
```

**Si vous avez déjà un dépôt :**

```bash
# Ajouter les modifications
git add .
git commit -m "Upgrade to v2.0 - Easypanel ready"
git push origin main
```

### 2. Se connecter à Easypanel

1. Ouvrez votre Easypanel : `https://votre-vps.com:3000`
2. Connectez-vous avec vos identifiants

### 3. Créer le projet

1. Cliquez sur **"Projects"** (menu de gauche)
2. Cliquez **"Create Project"** (ou utilisez un projet existant)
3. Nommez-le : `discord-bot`

### 4. Créer l'application

1. Dans votre projet, cliquez **"Create Service"**
2. Sélectionnez **"App"**
3. Type : **"GitHub"** (ou GitLab/Bitbucket selon votre repo)

### 5. Configurer la source

1. **Connect your GitHub account** (si pas déjà fait)
2. **Repository** : Sélectionnez `votre-username/bot-discord`
3. **Branch** : `main` (ou `master`)
4. **Build Type** : `Dockerfile` (devrait être auto-détecté)
5. **Build Path** : `/` (racine du repo)

### 6. Configurer les variables d'environnement

Cliquez sur **"Environment"** et ajoutez :

| Key | Value |
|-----|-------|
| `DISCORD_TOKEN` | Votre token Discord complet |
| `N8N_WEBHOOK` | Votre URL webhook n8n |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

**⚠️ Important** : 
- Copiez-collez EXACTEMENT les valeurs (pas d'espaces avant/après)
- Le token Discord est TRÈS long (~70 caractères)

### 7. Configurer le domaine (optionnel)

1. Cliquez sur **"Domains"**
2. Ajoutez un domaine : `bot.votredomaine.com`
3. Easypanel configurera automatiquement le SSL

**Si vous n'avez pas de domaine**, Easypanel vous en donnera un.

### 8. Configurer le Health Check

1. Cliquez sur **"Advanced"** ou **"Health Check"**
2. Configurez :
   - **Path** : `/health`
   - **Port** : `3000`
   - **Interval** : `30` secondes
   - **Timeout** : `10` secondes
   - **Retries** : `3`

### 9. Déployer !

1. Cliquez **"Deploy"** ou **"Create and Deploy"**
2. Attendez le build (2-3 minutes)
3. Surveillez les logs en temps réel

**Logs attendus :**
```
Building image...
✓ Image built successfully
Starting container...
[2024-XX-XX] 🚀 Démarrage du Bot Discord...
[2024-XX-XX] ✅ Bot connecté en tant que MonBot#1234
[2024-XX-XX] ✅ Serveur HTTP démarré sur le port 3000
✓ Container started
✓ Health check passed
```

### 10. Vérifier le déploiement

**A. Via l'interface Easypanel :**
- Status doit être **"Running"** (vert)
- Health check : **"Healthy"**

**B. Via les logs :**
```
Logs → Voir les logs en temps réel
```

**C. Via le health check :**
```bash
curl https://bot.votredomaine.com/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "discord": "connected",
  "bot": "MonBot#1234",
  "uptime": 45,
  "memory": "42 MB",
  "timestamp": "2024-XX-XX..."
}
```

**D. Test final - Envoyer un message Discord :**
1. Ouvrez Discord
2. Envoyez un message sur votre serveur
3. Vérifiez les logs Easypanel :
```
[2024-XX-XX] 💬 VotreNom (general): Test message
[2024-XX-XX] ℹ️  Message envoyé au webhook n8n
```

---

## 🎉 C'est fini !

Votre bot Discord tourne maintenant 24/7 sur votre VPS !

### Ce que vous pouvez faire maintenant :

1. **Consulter les stats** : `https://bot.votredomaine.com/stats`
2. **Configurer des alertes** dans Easypanel
3. **Activer le déploiement auto** via webhook GitHub
4. **Créer des workflows n8n** pour automatiser vos tâches

### Surveillance

- **Logs** : Easypanel → Votre app → Logs
- **Métriques** : Easypanel → Votre app → Metrics
- **Health** : `curl https://bot.votredomaine.com/health`

---

## 🐛 Dépannage

### Erreur : "Disallowed intents"
➡️ Vous avez oublié d'activer MESSAGE CONTENT INTENT sur Discord Developer Portal

**Solution :**
1. https://discord.com/developers/applications
2. Votre application → Bot
3. Activez "MESSAGE CONTENT INTENT"
4. Save Changes
5. Redéployez sur Easypanel

### Erreur : "Invalid token"
➡️ Le token Discord est incorrect

**Solution :**
1. Vérifiez que vous avez copié le token en entier
2. Régénérez un nouveau token sur Discord Developer Portal
3. Mettez à jour la variable DISCORD_TOKEN dans Easypanel
4. Redéployez

### Le bot ne se connecte pas
➡️ Vérifiez les logs dans Easypanel

**Checklist :**
- [ ] Token Discord correct
- [ ] Intents activés sur Discord
- [ ] Variables d'environnement bien configurées
- [ ] Pas de caractères spéciaux mal échappés

### Build Docker échoue
➡️ Vérifiez que le Dockerfile est à la racine

**Solution :**
```bash
# Vérifier la structure
ls -la
# Doit contenir : Dockerfile, index.js, package.json
```

### Health check échoue
➡️ Le serveur HTTP ne démarre pas

**Solution :**
1. Vérifiez que PORT=3000 dans les variables
2. Consultez les logs pour voir les erreurs
3. Vérifiez que le port 3000 n'est pas déjà utilisé

### Webhook n8n ne reçoit rien
➡️ Problème de connectivité ou URL incorrecte

**Solution :**
1. Testez l'URL depuis le VPS :
```bash
curl -X POST $N8N_WEBHOOK -d '{"test":true}'
```
2. Vérifiez que n8n est accessible depuis Internet
3. Vérifiez les logs du bot pour voir les erreurs

---

## 📞 Besoin d'aide ?

1. **Vérifiez les logs** : C'est la source #1 d'information
2. **Testez en local d'abord** : Plus facile de debugger
3. **Consultez la documentation** :
   - [README.md](./README.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)
   - [QUICKSTART.md](./QUICKSTART.md)

---

✨ **Félicitations ! Votre bot est maintenant en production !** 🎉

