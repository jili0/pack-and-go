FROM node:18-alpine

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production

# App code kopieren
COPY . .

# Next.js Build für Production
RUN npm run build

# Port exponieren
EXPOSE 3000

# Environment Variable für Production
ENV NODE_ENV=production

# App starten
CMD ["npm", "start"]