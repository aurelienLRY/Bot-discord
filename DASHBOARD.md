# 🎨 Dashboard Multi-Bots

Interface web moderne pour monitorer tous vos bots Discord en temps réel, protégée par mot de passe.

---

## 🚀 Démarrage Rapide (3 minutes)

### 1. Configurer le mot de passe

Fichier `.env` :
```env
DASHBOARD_PASSWORD=VotreMotDePasseSecurise123!
```

⚠️ **Ne jamais utiliser `admin123` en production !**

### 2. Démarrer

```bash
npm start
```

Logs :
```
✅ Serveur HTTP démarré sur le port 3000
   • Dashboard : http://localhost:3000/dashboard 🎨
🔐 Mot de passe dashboard : ✅ Configuré
```

### 3. Accéder

**Local** : http://localhost:3000/dashboard  
**VPS/Easypanel** : https://votre-domaine.com/dashboard

Entrez le mot de passe → C'est parti ! 🎉

---

## ✨ Fonctionnalités

- 🔐 **Protégé par mot de passe** - Accès sécurisé
- 📊 **Vue d'ensemble** - Statistiques globales en temps réel
- 🤖 **Liste des bots** - Status de chaque bot
- 🔄 **Auto-refresh** - Actualisation automatique toutes les 5 secondes
- 💾 **Session persistante** - Reste connecté pendant la session
- 🎨 **Design moderne** - Interface Tailwind CSS responsive
- 📱 **Mobile-friendly** - Fonctionne sur tous les appareils

## 🚀 Accès Rapide

### En Local

```bash
npm start
```

Puis ouvrez : **http://localhost:3000/dashboard**

### Sur VPS/Easypanel

Accédez à : **https://votre-domaine.com/dashboard**

## 🔐 Configuration du Mot de Passe

### 1. Définir le mot de passe

Dans votre fichier `.env` :

```env
DASHBOARD_PASSWORD=VotreMotDePasseSecurise123!
```

⚠️ **Important** :
- Ne jamais utiliser `admin123` en production !
- Utilisez un mot de passe fort : 12+ caractères
- Mélangez lettres, chiffres et symboles
- Ne partagez jamais ce mot de passe

### 2. Vérifier la configuration

Au démarrage, vérifiez les logs :

```
✅ Serveur HTTP démarré sur le port 3000
📊 Endpoints disponibles :
   • Dashboard : http://localhost:3000/dashboard 🎨 (protégé)
🔐 Mot de passe dashboard : ✅ Configuré
```

Si vous voyez `⚠️ DÉFAUT (changez-le!)`, changez le mot de passe !

## 📊 Interface du Dashboard

### Page de Connexion

![Login](https://via.placeholder.com/800x400/1f2937/ffffff?text=Page+de+Connexion)

- Logo Discord
- Champ mot de passe
- Bouton de connexion
- Message d'erreur si mot de passe incorrect

### Vue d'Ensemble

#### 🔢 Statistiques Globales (4 cartes)

1. **Bots Actifs** 🟢
   - Nombre de bots connectés / total
   - Indicateur visuel vert

2. **Messages Traités** 🔵
   - Total de messages depuis le démarrage
   - Compteur global

3. **Erreurs** 🔴
   - Nombre total d'erreurs
   - 0 = tout va bien !

4. **Uptime** 🟣
   - Temps d'activité du système
   - Format : "2h 15m 30s"

#### 🤖 Liste des Bots

Chaque bot affiche :

- **Icône Discord** avec statut (vert = connecté, rouge = déconnecté)
- **Nom du bot** et tag Discord
- **Statistiques** :
  - Messages traités
  - Serveurs Discord
  - Erreurs
- **Badge de status** : `connected`, `connecting`, `disconnected`, etc.

**Exemple de carte bot :**

```
┌────────────────────────────────────────────────────┐
│ 🟢 Bot-Production                                   │
│    BotProd#1234                                     │
│                                                      │
│    320           5           1        connected    │
│   messages    serveurs    erreurs                   │
└────────────────────────────────────────────────────┘
```

#### 💻 Informations Système

- **Node.js** : Version
- **Plateforme** : Linux/Windows/Mac
- **Mémoire utilisée** : En MB
- **PID** : Process ID

#### 📊 État Global

- **Status** : OK / PARTIAL / STARTING
- **Dernière activité** : Heure du dernier message
- **Reconnexions totales** : Compteur de toutes les reconnexions

## 🎮 Utilisation

### Se Connecter

1. Ouvrez `/dashboard` dans votre navigateur
2. Entrez le mot de passe (défini dans `DASHBOARD_PASSWORD`)
3. Cliquez sur "Se connecter"
4. ✅ Vous êtes connecté !

La session reste active tant que vous n'actualisez pas la page ou ne fermez pas le navigateur.

### Navigation

#### Bouton "🔄 Actualiser"
Actualise manuellement les données (utile si l'auto-refresh est trop lent).

#### Bouton "🚪 Déconnexion"
Déconnecte et retourne à la page de connexion.

### Auto-Refresh

Le dashboard se met à jour automatiquement **toutes les 5 secondes** !

Vous verrez en haut à droite :
```
Mis à jour à 14:35:42
```

## 🎨 Codes Couleur

### Status des Bots

- 🟢 **Vert** = Bot connecté et opérationnel
- 🔴 **Rouge** = Bot déconnecté ou en erreur
- 🟡 **Jaune** = Bot en cours de reconnexion

### Status Global

- **OK** (vert) = Tous les bots sont connectés ✅
- **PARTIAL** (jaune) = Au moins un bot connecté ⚠️
- **STARTING** (gris) = Aucun bot connecté (démarrage) 🔄

## 📱 Responsive Design

Le dashboard s'adapte à tous les écrans :

- **Desktop** : Grille 4 colonnes pour les stats
- **Tablet** : Grille 2 colonnes
- **Mobile** : Grille 1 colonne

## 🔒 Sécurité

### Protection

- ✅ Dashboard protégé par mot de passe
- ✅ Session sécurisée côté client (sessionStorage)
- ✅ Endpoints API protégés
- ✅ Validation côté serveur

### Endpoints Publics vs Protégés

**Publics** (pour monitoring externe) :
- `/health` - Health check
- `/stats` - Stats JSON
- `/bots` - Liste des bots

**Protégés** (nécessitent authentification) :
- `/dashboard` - Interface visuelle
- `/api/stats` - Stats pour le dashboard
- `/api/auth` - Authentification

### Bonnes Pratiques

1. ✅ Changez le mot de passe par défaut
2. ✅ Utilisez HTTPS en production
3. ✅ Ne partagez pas le mot de passe
4. ✅ Logs d'accès pour audit
5. ⚠️ Pas d'authentification bearer (basique mais suffisant)

## 🛠️ Personnalisation

### Modifier l'intervalle d'auto-refresh

Dans `public/dashboard.html`, ligne ~387 :

```javascript
const AUTO_REFRESH_INTERVAL = 5000; // 5 secondes
```

Changez la valeur (en millisecondes) :
- `3000` = 3 secondes
- `10000` = 10 secondes
- `30000` = 30 secondes

### Changer les couleurs

Le dashboard utilise Tailwind CSS avec un thème Discord.

Couleurs principales :
- Discord bleu : `#5865F2`
- Fond : `gray-900`
- Cartes : `gray-800`
- Bordures : `gray-700`

## 📊 Captures d'Écran

### Vue d'ensemble Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  🎮 Dashboard Multi-Bots     Mis à jour à 14:35:42  🔄  🚪   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Bots    │  │Messages │  │ Erreurs │  │ Uptime  │        │
│  │ 3/3 ✅  │  │ 542     │  │ 2       │  │ 2h 15m  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                               │
│  🤖 Bots Actifs                             3 bots           │
│  ├─ Bot-Production  [320 msg] [5 srv] [1 err] ✅ connected  │
│  ├─ Bot-Development [142 msg] [2 srv] [0 err] ✅ connected  │
│  └─ Bot-Testing     [80 msg]  [1 srv] [1 err] ✅ connected  │
│                                                               │
│  💻 Système              📊 État Global                      │
│  Node: v18.0.0           Status: OK ✅                       │
│  Platform: linux         Dernière: 14:35:30                  │
│  Mémoire: 95 MB          Reconnexions: 3                     │
└──────────────────────────────────────────────────────────────┘
```

## 🐛 Dépannage

### Dashboard inaccessible

**Problème** : 404 Not Found

**Solutions** :
1. Vérifiez que le dossier `public/` existe
2. Vérifiez que `dashboard.html` est dans `public/`
3. Relancez : `npm start`

### Mot de passe refusé

**Problème** : ❌ Mot de passe incorrect

**Solutions** :
1. Vérifiez `DASHBOARD_PASSWORD` dans `.env`
2. Pas d'espaces avant/après le mot de passe
3. Redémarrez le serveur après modification
4. Vérifiez les logs au démarrage

### Dashboard ne charge pas les données

**Problème** : Erreur 401 Unauthorized

**Solutions** :
1. Déconnectez-vous et reconnectez-vous
2. Videz le cache du navigateur
3. Vérifiez les logs du serveur

### Auto-refresh ne fonctionne pas

**Problème** : Les stats ne se mettent pas à jour

**Solutions** :
1. Vérifiez la console du navigateur (F12)
2. Actualisez manuellement avec le bouton 🔄
3. Rechargez la page complète (Ctrl+R)

## 📈 Cas d'Usage

### Monitoring Production

Dashboard parfait pour :
- ✅ Surveiller la santé des bots
- ✅ Détecter les déconnexions
- ✅ Voir l'activité en temps réel
- ✅ Identifier les bots en erreur

### Présentation Client

- ✅ Interface professionnelle
- ✅ Visualisation claire
- ✅ Stats en temps réel
- ✅ Mobile-friendly

### Débogage

- ✅ Voir quel bot traite des messages
- ✅ Identifier les erreurs rapidement
- ✅ Vérifier les reconnexions
- ✅ Monitoring de la mémoire

## 🔗 Intégration

### Embed dans un iframe

```html
<iframe 
  src="https://votre-domaine.com/dashboard" 
  width="100%" 
  height="800px"
  style="border: none;"
></iframe>
```

⚠️ Nécessite une authentification préalable.

### API REST pour intégration externe

Si vous voulez intégrer les données dans une autre application :

```javascript
// Authentification
const auth = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'votre_mot_de_passe' })
});

// Récupérer les stats
const stats = await fetch('/api/stats', {
  headers: { 'Authorization': 'votre_mot_de_passe' }
});
```

## 📚 Liens Utiles

- **README.md** - Documentation générale
- **MULTI-BOTS.md** - Guide multi-bots
- **DEPLOYMENT.md** - Déploiement VPS
- **QUICKSTART.md** - Démarrage rapide

## 💡 Astuces

### Ajouter un bookmark

Ajoutez le dashboard à vos favoris pour un accès rapide !

### Raccourci clavier

- **F5** : Recharger la page
- **Ctrl+R** : Recharger
- **Ctrl+W** : Fermer l'onglet

### Mode sombre

Le dashboard est déjà en mode sombre ! 🌙

Parfait pour les longues sessions de monitoring.

---

**🎉 Profitez de votre dashboard de monitoring en temps réel !**

Besoin d'aide ? Consultez la documentation ou les logs du serveur.

