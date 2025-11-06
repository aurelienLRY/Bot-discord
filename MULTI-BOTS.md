# 🤖 Guide Multi-Bots

Gérez **plusieurs bots Discord simultanément** dans un seul processus ! Chaque bot a son propre webhook n8n.

## 🎯 Avantages

✅ Un seul processus pour N bots (économie de ressources)  
✅ Monitoring centralisé via dashboard  
✅ Webhooks séparés par bot  
✅ Logs identifiés `[Bot-1]`, `[Bot-2]`  
✅ Parfait pour dev/staging/production  

---

## 📝 Configuration

### Format Simple (1 bot)

```env
BOT_NAME=MonBot
DISCORD_TOKEN=MTIzNDU2Nzg5...xxx
N8N_WEBHOOK=https://n8n.example.com/webhook/monbot
```

### Format Multi-Bots (N bots)

```env
BOT_COUNT=3

BOT_1_NAME=Bot-Production
BOT_1_TOKEN=MTIzNDU2Nzg5...xxx
BOT_1_WEBHOOK=https://n8n.example.com/webhook/prod

BOT_2_NAME=Bot-Development
BOT_2_TOKEN=OTg3NjU0MzIx...yyy
BOT_2_WEBHOOK=https://n8n.example.com/webhook/dev

BOT_3_NAME=Bot-Testing
BOT_3_TOKEN=MTExMjIyMzMz...zzz
BOT_3_WEBHOOK=https://n8n.example.com/webhook/test
```

⚠️ **Important** : Activez MESSAGE CONTENT INTENT pour chaque bot !

---

## 🚀 Démarrage

```bash
npm start
```

Résultat :
```
[2024-XX-XX] 🚀 Démarrage du système multi-bots...
[2024-XX-XX] ✅ 3 bot(s) configuré(s)
[2024-XX-XX] ✅ [Bot-Production] Bot connecté : BotProd#1234
[2024-XX-XX] ✅ [Bot-Development] Bot connecté : BotDev#5678
[2024-XX-XX] ✅ [Bot-Testing] Bot connecté : BotTest#9012
```

---

## 📊 Endpoints HTTP

### `/health` - Status de tous les bots
```json
{
  "status": "OK",
  "botsCount": 3,
  "botsConnected": 3,
  "bots": [
    {"name": "Bot-Production", "status": "connected"},
    {"name": "Bot-Development", "status": "connected"},
    {"name": "Bot-Testing", "status": "connected"}
  ]
}
```

**Statuts** : `OK` (tous connectés), `PARTIAL` (au moins un), `STARTING` (aucun)

### `/stats` - Statistiques globales
```json
{
  "global": {
    "botsCount": 3,
    "botsConnected": 3,
    "totalMessagesProcessed": 542,
    "totalErrors": 2
  },
  "bots": [...]
}
```

### `/bots` - Liste rapide
```json
[
  {
    "name": "Bot-Production",
    "tag": "BotProd#1234",
    "status": "connected",
    "servers": 5,
    "messagesProcessed": 320
  }
]
```

### `/stats/:botName` - Stats d'un bot spécifique
```bash
curl http://localhost:3000/stats/Bot-Production
```

---

## 📨 Payload vers n8n

Chaque message Discord inclut maintenant le bot source :

```json
{
  "botName": "Bot-Production",
  "botId": "123456789",
  "botTag": "BotProd#1234",
  "username": "User#1234",
  "content": "Hello!",
  "channelName": "general",
  "guildName": "Mon Serveur",
  "timestamp": 1699264800000
}
```

**Avantage** : Identifiez quel bot a reçu quel message dans n8n !

---

## 🎯 Cas d'Usage

### Environnements séparés
```
Bot-Prod → Discord Prod → n8n prod
Bot-Dev  → Discord Dev  → n8n dev
Bot-Test → Discord Test → n8n test
```

### Multi-clients
```
Bot-Client-A → Serveur A → Webhook A
Bot-Client-B → Serveur B → Webhook B
```

### Bots spécialisés
```
Bot-Support   → Canal support → Workflow tickets
Bot-Sales     → Canal ventes  → Workflow CRM
Bot-Community → Canal public  → Workflow analytics
```

---

## 🐳 Docker & Easypanel

### Docker Compose

```yaml
environment:
  - BOT_COUNT=3
  - BOT_1_NAME=Bot-Prod
  - BOT_1_TOKEN=${BOT_1_TOKEN}
  - BOT_1_WEBHOOK=${BOT_1_WEBHOOK}
  - BOT_2_NAME=Bot-Dev
  - BOT_2_TOKEN=${BOT_2_TOKEN}
  - BOT_2_WEBHOOK=${BOT_2_WEBHOOK}
```

### Easypanel

Ajoutez les variables dans l'interface :

| Variable | Valeur |
|----------|--------|
| `BOT_COUNT` | `3` |
| `BOT_1_NAME` | `Bot-Production` |
| `BOT_1_TOKEN` | Votre token 1 |
| `BOT_1_WEBHOOK` | Votre webhook 1 |
| ... | ... |

---

## 📈 Performances

| Configuration | Mémoire | CPU (idle) |
|---------------|---------|------------|
| 1 bot | 40-60 MB | <1% |
| 3 bots | 80-120 MB | <2% |
| 5 bots | 120-180 MB | <3% |

**Recommandation** : 5-10 bots par processus sur VPS standard.

---

## 🐛 Dépannage

### Un bot ne se connecte pas
```
[2024-XX-XX] ❌ [Bot-Test] Échec : Invalid token
```
→ Vérifiez `BOT_X_TOKEN` dans .env

### Webhook n8n échoue
```
[2024-XX-XX] ❌ [Bot-Prod] Erreur webhook : ECONNREFUSED
```
→ Testez : `curl -X POST $BOT_1_WEBHOOK -d '{"test":1}'`

### Health check PARTIAL
→ Un ou plusieurs bots déconnectés. Consultez `/stats` pour identifier lequel.

---

## 🔄 Migration depuis Configuration Simple

Pour passer de 1 bot à multi-bots :

1. Ajoutez `BOT_COUNT=N`
2. Remplacez :
   - `DISCORD_TOKEN` → `BOT_1_TOKEN`
   - `N8N_WEBHOOK` → `BOT_1_WEBHOOK`
   - Ajoutez `BOT_1_NAME`
3. Ajoutez les autres bots (BOT_2_*, BOT_3_*, ...)
4. Redémarrez : `npm start`

**Pas obligatoire** : Le format simple (1 bot) fonctionne toujours !

---

**📚 Documentation complète** : README.md  
**🎨 Dashboard visuel** : DASHBOARD.md  
**🚀 Déploiement** : DEPLOYMENT.md
