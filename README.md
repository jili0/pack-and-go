# Pack & Go - Umzugsplattform

Pack & Go ist eine moderne Webplattform zur Vermittlung von Umzugsdiensten mit einem transparenten Preismodell und Qualitätszertifizierung.

## Hauptmerkmale

- Transparentes Preismodell basierend auf Stundensätzen und Helferanzahl
- KisteKlar-Zertifizierung für Qualitätssicherung
- Benutzerfreundlicher Prozess in 3 einfachen Schritten
- Separate Dashboards für Kunden, Umzugsunternehmen und Administratoren
- Vollständiges Bewertungssystem
- Dokumenten-Upload und Verifizierung

## Technologie-Stack

### Frontend

- **Next.js**: React-Framework mit App Router für Server-Side Rendering
- **React Hook Form**: Formularvalidierung
- **Context API**: State Management
- **Socket.io-Client**: Echtzeit-Kommunikation

### Backend

- **Next.js API Routes**: Backend-Schnittstellen
- **MongoDB + Mongoose**: Datenbank und ODM
- **JWT**: Authentifizierung
- **Socket.io**: Echtzeit-Nachrichten
- **Resend**: E-Mail-Versand
- **AWS S3**: Dateispeicherung (nur Produktionsumgebung)

## Projektstruktur

```
pack-and-go/
├── public/                       # Static files
│   ├── images/                   # Images 
│   │   ├── logo.png
│   │   ├── hero-image.jpg
│   │   ├── step1.jpg
│   │   ├── step2.jpg
│   │   ├── step3.jpg
│   │   ├── certification.jpg
│   │   ├── placeholder.jpg       # Placeholder image
│   │   └── cities/               # City images for homepage
│   │       ├── berlin.jpg
│   │       ├── hamburg.jpg
│   │       ├── munich.jpg
│   │       └── cologne.jpg
│   ├── favicon.ico     
│   └── robots.txt
├── src/                
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── auth/             # Authentication APIs
│   │   │   │   ├── login/
│   │   │   │   │   └── route.js
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.js
│   │   │   │   ├── me/
│   │   │   │   │   └── route.js
│   │   │   │   ├── register/
│   │   │   │   │   └── route.js
│   │   │   │   └── delete/
│   │   │   │       └── route.js
│   │   │   ├── companies/        # Company APIs
│   │   │   │   ├── route.js
│   │   │   │   └── search/
│   │   │   │       └── route.js
│   │   │   ├── orders/           # Order APIs
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── user/             # User APIs
│   │   │   │   └── orders/
│   │   │   │       └── route.js
│   │   │   └── company/          # Company-specific APIs
│   │   │       └── setup/
│   │   │           └── route.js
│   │   ├── (auth)/               # Authentication pages
│   │   │   ├── login/
│   │   │   │   └── page.jsx
│   │   │   └── register/
│   │   │       └── page.jsx
│   │   ├── (dashboard)/          # Dashboard pages (protected)
│   │   │   ├── user/             # Customer dashboard
│   │   │   │   ├── page.jsx
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.jsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.jsx
│   │   │   │   └── profile/
│   │   │   │       └── page.jsx
│   │   │   ├── company/          # Moving company dashboard
│   │   │   │   ├── page.jsx
│   │   │   │   ├── orders/
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.jsx
│   │   │   │   └── setup/
│   │   │   │       └── page.jsx
│   │   │   └── admin/            # Admin dashboard
│   │   │       ├── page.jsx
│   │   │       └── companies/
│   │   │           └── page.jsx
│   │   ├── order/                # Order pages
│   │   │   ├── [id]/
│   │   │   │   └── confirmation/
│   │   │   │       └── page.jsx
│   │   │   └── create/
│   │   │       └── page.jsx
│   │   ├── search-results/       # Search results page
│   │   │   └── page.jsx
│   │   ├── guide/         # Information pages
│   │   │   └── page.jsx
│   │   ├── pricing/
│   │   │   └── page.jsx
│   │   ├── contact/
│   │   │   └── page.jsx
│   │   ├── tips/
│   │   │   └── page.jsx
│   │   ├── styles/               # CSS styles (modules)
│   │   │   ├── global.css        # Global CSS
│   │   │   ├── Home.module.css
│   │   │   ├── Layout.module.css
│   │   │   └── Components.module.css
│   │   ├── layout.js             # Root Layout
│   │   └── page.js               # Homepage
│   ├── components/               # React components
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── ui/                   # UI components
│   │   │   ├── CompanyCard.jsx
│   │   │   ├── StarRating.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── Modal.jsx
│   │   ├── forms/                # Form components
│   │   │   ├── AddressForm.jsx
│   │   │   ├── PriceCalculator.jsx  # Simple price calculator (instead of MovingCalculator)
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── FileUpload.jsx
│   │   └── dashboard/            # Dashboard components
│   │       ├── OrderList.jsx
│   │       ├── OrderDetails.jsx
│   │       └── ProfileForm.jsx
│   ├── lib/                      # Helper functions
│   │   ├── auth.js               # Authentication functions
│   │   ├── db.js                 # Database configuration
│   │   ├── email.js              # Email functions
│   │   ├── fileUpload.js         # File upload functions
│   │   ├── validation.js         # Validation functions
│   │   ├── imageHandler.js       # Image handling with placeholders
│   │   └── helpers.js            # General helper functions
│   ├── models/                   # Mongoose models
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Order.js
│   │   └── Review.js
│   └── context/                  # React Context
│       ├── AuthContext.js
│       └── OrderContext.js
├── middleware.js                 # Next.js Middleware for Auth
├── .env.local                    # Local environment variables
├── .env                          # Production environment variables
├── .gitignore
├── package.json
└── README.md
```

## Erste Schritte

### Voraussetzungen

- Node.js 14.6.0 oder höher
- NPM oder Yarn
- MongoDB (lokal oder Remote)

### Installation

1. Klonen Sie das Repository:
   ```bash
   git clone https://github.com/yourusername/pack-and-go.git
   cd pack-and-go
   ```

2. Installieren Sie die Abhängigkeiten:
   ```bash
   npm install
   # oder
   yarn install
   ```

3. Erstellen Sie eine .env.local-Datei im Hauptverzeichnis mit folgenden Umgebungsvariablen:
   ```
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/pack-and-go
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # Resend (E-Mail)
   RESEND_API_KEY=your_resend_api_key
   FROM_EMAIL=no-reply@pack-and-go.de
   SUPPORT_EMAIL=support@pack-and-go.de
   ADMIN_EMAIL=admin@pack-and-go.de
   
   # S3 (Nur für Produktion, für Entwicklung optional)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=eu-central-1
   AWS_S3_BUCKET_NAME=your_bucket_name
   AWS_S3_BASE_URL=https://your-bucket-url.s3.eu-central-1.amazonaws.com
   
   # App
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. Starten Sie den Entwicklungsserver:
   ```bash
   npm run dev
   # oder
   yarn dev
   ```

5. Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

### Produktion

Für die Bereitstellung in der Produktion:

1. Bauen Sie die Anwendung:
   ```bash
   npm run build
   # oder
   yarn build
   ```

2. Starten Sie den Produktionsserver:
   ```bash
   npm start
   # oder
   yarn start
   ```

## Benutzertypen

Die Plattform unterstützt drei Benutzertypen:

1. **Kunden**
   - Registrierung mit Name, E-Mail, Telefon
   - Umzugsanfragen erstellen
   - Umzugsfirmen vergleichen und auswählen
   - Bewertungen abgeben

2. **Umzugsfirmen**
   - Registrierung mit Firmendetails und Dokumenten
   - Nach Überprüfung durch Administratoren freigeschaltet
   - Anfragen bestätigen oder ablehnen
   - Eigene Preise und Servicegebiete festlegen

3. **Administratoren**
   - Umzugsfirmen verifizieren
   - Benutzer und Firmen verwalten
   - Plattform überwachen

## Hauptfunktionen

### Umzugssuche und -buchung

1. Benutzer geben Start- und Zieladresse ein
2. Benutzer wählen Anzahl der Helfer und geschätzte Dauer
3. System zeigt verfügbare Umzugsfirmen für die Route
4. Benutzer können Firmen nach Bewertung oder Zertifizierung sortieren
5. Benutzer wählen eine Firma und bis zu drei Wunschtermine aus
6. Umzugsfirma bestätigt einen Termin
7. Benutzer erhält Bestätigung per E-Mail

### Umzugsfirmen-Verifizierung

1. Umzugsfirma registriert sich und lädt Dokumente hoch
2. Administrator erhält Benachrichtigung und überprüft die Dokumente
3. Bei erfolgreicher Überprüfung wird die Firma freigeschaltet
4. Bei KisteKlar-Zertifizierung wird das Zertifikat ebenfalls überprüft

### Bewertungssystem

1. Nach Abschluss eines Umzugs kann der Kunde eine Bewertung abgeben
2. Bewertungen fließen in das Gesamtrating der Umzugsfirma ein
3. Kunden können Bewertungen als Entscheidungshilfe nutzen

## Sicherheit

- Alle Passwörter werden mit bcrypt gehasht
- JWT-Authentifizierung für API-Zugriff
- Rollenbasierte Zugriffskontrolle
- Dokumente werden sicher in S3 gespeichert

