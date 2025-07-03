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

ENV ORACLE_CLOUD_TENANCY_OCID=mock-tenancy-ocid
ENV ORACLE_CLOUD_USER_OCID=mock-user-ocid
ENV ORACLE_CLOUD_KEY_FINGERPRINT=mock-key-fingerprint
ENV ORACLE_PRIVATE_KEY_BASE64=mock-base64-private-key
ENV ORACLE_CLOUD_REGION=mock-region
ENV ORACLE_CLOUD_BUCKET_NAME=mock-bucket-name
ENV ORACLE_CLOUD_NAMESPACE=mock-namespace

ENV ORACLE_CLOUD_COMPARTMENT_OCID=mock-compartment-ocid
ENV GEMINI_API_KEY=mock-gemini-api-key

# Next.js Build für Production
RUN npm run build

# Port exponieren
EXPOSE 3000

# Environment Variable für Production
ENV NODE_ENV=production

CMD ["npm", "start"]