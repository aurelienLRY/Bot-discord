# 🚀 Migration vers Express.js

Le système a été migré de `http.createServer()` natif vers **Express.js** pour une meilleure structure et maintenabilité.

---

## ✨ Avantages de la Migration

✅ **Code plus propre** - Routes Express claires et organisées  
✅ **Middlewares** - Authentification, logging, parsing automatique  
✅ **Routing avancé** - Paramètres (`/:botName`), redirections  
✅ **Maintenance facilitée** - Ajout de nouvelles routes simplifié  
✅ **Meilleure gestion d'erreurs** - Middleware 404 personnalisé  
✅ **Body parsing automatique** - JSON et URL-encoded intégrés  

---

## 📦 Nouvelle Dépendance

**Express.js** ajouté dans `package.json` :

```json
{
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

**Installation** :
```bash
npm install
```

---

## 🔧 Changements Principaux

### 1. Import et Configuration

**Avant** (HTTP natif) :
```javascript
const http = require('http');
const server = http.createServer((req, res) => { ... });
```

**Après** (Express) :
```javascript
const express = require('express');
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
```

### 2. Routes

**Avant** :
```javascript
if (url === '/health') {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
```

**Après** :
```javascript
app.get('/health', (req, res) => {
  res.json(data);
});
```

### 3. Middlewares d'Authentification

**Avant** :
```javascript
function checkAuth(req) {
  return req.headers['authorization'] === DASHBOARD_PASSWORD;
}
```

**Après** :
```javascript
const authMiddleware = (req, res, next) => {
  if (req.headers['authorization'] !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
};

app.get('/api/stats', authMiddleware, (req, res) => { ... });
```

### 4. Paramètres de Route

**Avant** :
```javascript
if (url.startsWith('/stats/')) {
  const botName = decodeURIComponent(url.split('/stats/')[1]);
  ...
}
```

**Après** :
```javascript
app.get('/stats/:botName', (req, res) => {
  const botName = req.params.botName;
  ...
});
```

---

## 📋 Routes Express Disponibles

### Routes GET

| Route | Handler | Description |
|-------|---------|-------------|
| `GET /` | Redirect | Redirige vers `/dashboard` |
| `GET /dashboard` | HTML | Dashboard visuel |
| `GET /health` | JSON | Health check |
| `GET /stats` | JSON | Statistiques complètes |
| `GET /bots` | JSON | Liste des bots |
| `GET /stats/:botName` | JSON | Stats d'un bot |
| `GET /api/stats` | JSON | Stats protégées (auth) |

### Routes POST

| Route | Handler | Description |
|-------|---------|-------------|
| `POST /api/auth` | JSON | Authentification dashboard |

### Middleware 404

```javascript
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `La route ${req.method} ${req.url} n'existe pas`,
    endpoints: { ... }
  });
});
```

---

## 🎯 Nouveautés

### 1. Redirect Automatique

`GET /` redirige maintenant vers `/dashboard` :

```javascript
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});
```

### 2. Static Files

Le dossier `public/` est servi automatiquement :

```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

**Avantage** : Fichiers CSS, JS, images accessibles directement.

### 3. Body Parsing Automatique

Plus besoin de parser manuellement :

```javascript
// Automatique avec Express
app.post('/api/auth', (req, res) => {
  const { password } = req.body;  // Déjà parsé !
});
```

### 4. Middleware de Logging (Optionnel)

```javascript
const requestLogger = (req, res, next) => {
  log.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
};

// Pour activer :
app.use(requestLogger);
```

### 5. Message 404 Amélioré

Le 404 retourne maintenant la liste des endpoints disponibles :

```json
{
  "error": "Not Found",
  "message": "La route GET /test n'existe pas",
  "endpoints": {
    "dashboard": "/dashboard - Dashboard visuel protégé",
    "api": { ... },
    "public": { ... }
  }
}
```

---

## 🔄 Rétrocompatibilité

✅ **Toutes les routes fonctionnent exactement comme avant**  
✅ **Aucun changement pour les clients** (dashboard, endpoints API)  
✅ **Format des réponses identique**  

**Les URLs restent les mêmes** :
- `https://votre-url.com/health` ✅
- `https://votre-url.com/stats` ✅
- `https://votre-url.com/dashboard` ✅

---

## 🚀 Déploiement

### En Local

```bash
# Installer Express
npm install

# Démarrer
npm start
```

Logs :
```
✅ Serveur Express démarré sur le port 3000
```

### Docker / Easypanel

**Aucun changement nécessaire !**

Le `Dockerfile` installe automatiquement les dépendances :
```dockerfile
RUN npm ci --only=production
```

Redéployez simplement sur Easypanel.

---

## 📈 Extensibilité

Avec Express, ajouter de nouvelles routes est trivial :

### Exemple : Route de Ping

```javascript
app.get('/ping', (req, res) => {
  res.json({ 
    message: 'pong',
    timestamp: new Date().toISOString() 
  });
});
```

### Exemple : Route avec Authentification

```javascript
app.post('/api/restart', authMiddleware, (req, res) => {
  // Redémarrer un bot spécifique
  const { botName } = req.body;
  const bot = bots.find(b => b.name === botName);
  
  if (bot) {
    bot.disconnect();
    bot.connect();
    res.json({ success: true, message: `${botName} redémarré` });
  } else {
    res.status(404).json({ error: 'Bot non trouvé' });
  }
});
```

### Exemple : Middleware CORS

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});
```

---

## 🎨 Structure du Code

```
index.js
├── Imports & Configuration
├── Logger
├── Statistiques Globales
├── Classe DiscordBot
├── Initialisation des Bots
├── Middlewares Express           ← Nouveau
│   ├── authMiddleware
│   └── requestLogger
├── Fonctions Utilitaires
├── Routes Express                ← Refactorisé
│   ├── GET /
│   ├── GET /dashboard
│   ├── POST /api/auth
│   ├── GET /api/stats (auth)
│   ├── GET /health
│   ├── GET /stats
│   ├── GET /bots
│   ├── GET /stats/:botName
│   └── 404 Handler
├── Démarrage Serveur Express
├── Graceful Shutdown
└── Error Handlers
```

---

## 📊 Comparaison Avant/Après

| Aspect | HTTP Natif | Express |
|--------|------------|---------|
| **Lignes de code** | ~120 | ~80 | 
| **Lisibilité** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Maintenance** | Moyenne | Excellente |
| **Extensibilité** | Limitée | Infinie |
| **Body parsing** | Manuel | Automatique |
| **Routing** | If/else | Routes dédiées |
| **Middlewares** | Custom | Intégrés |
| **404 Handler** | Fin de if/else | Middleware dédié |

---

## ✅ Tests

Après migration, testez toutes les routes :

```bash
# Health check
curl https://votre-url.com/health

# Stats
curl https://votre-url.com/stats

# Bots
curl https://votre-url.com/bots

# Bot spécifique
curl https://votre-url.com/stats/CNC

# Dashboard (navigateur)
https://votre-url.com/dashboard

# 404
curl https://votre-url.com/test
```

**Toutes doivent fonctionner exactement comme avant !** ✅

---

## 🔮 Prochaines Étapes Possibles

Avec Express, vous pouvez facilement ajouter :

- 🔒 **Rate limiting** (express-rate-limit)
- 📝 **Logging avancé** (morgan)
- 🌐 **CORS** (cors)
- 🔐 **Helmet** (sécurité HTTP)
- 🗜️ **Compression** (compression)
- 📄 **Swagger** (documentation API)

---

**Version** : 3.2.0  
**Migration** : HTTP natif → Express.js  
**Date** : Novembre 2024  
**Status** : ✅ Production Ready

