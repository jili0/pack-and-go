FROM node:18-alpine

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production

# App code kopieren
COPY . .

# Build-Konfiguration (Mock uri)
ENV MONGODB_URI="mongodb://localhost:27017/pack-and-go"
ENV ESLINT_NO_DEV_ERRORS=true
ENV NEXT_LINT=false


# Next.js Build für Production
RUN npm run build

# Port exponieren
EXPOSE 3000

# Environment Variable für Production
ENV NODE_ENV=production

# App starten
CMD ["npm", "start"]