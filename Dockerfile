# Utiliser l'image Node.js officielle LTS (Alpine pour être léger)
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production uniquement
RUN npm ci --only=production && \
    npm cache clean --force

# Copier le code source
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Changer vers l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3000

# Health check pour vérifier que le bot fonctionne
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer le bot
CMD ["node", "index.js"]

