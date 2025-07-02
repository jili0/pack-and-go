FROM node:18-alpine

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production

# App code kopieren
COPY . .

# Build-Konfiguration (Mock data)
ENV MONGODB_URI="mongodb://localhost:27017/pack-and-go"
ENV JWT_SECRET="mock-jwt-secret"
ENV RESEND_API_KEY="re_mock_key_for_build"
ENV FROM_EMAIL=no-reply@pack-and-go.de
ENV SUPPORT_EMAIL=support@pack-and-go.de
ENV ADMIN_EMAIL=admin@pack-and-go.de
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