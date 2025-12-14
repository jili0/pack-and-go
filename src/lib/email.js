// src/lib/email.js
import { Resend } from "resend";

// E-Mail-Absender-Adresse
const fromEmail = process.env.FROM_EMAIL || "no-reply@pack-and-go.de";
const supportEmail = process.env.SUPPORT_EMAIL || "support@pack-and-go.de";
const adminEmail = process.env.ADMIN_EMAIL || "admin@pack-and-go.de";

// Lazy initialization of Resend client to avoid build-time errors
let resend = null;
function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    // During build time, create a mock client if API key is missing
    if (!apiKey && (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'development')) {
      // Return a mock client that logs instead of sending
      return {
        emails: {
          send: async () => {
            console.warn('Resend API key not configured. Email would be sent in production.');
            return { id: 'mock-email-id' };
          }
        }
      };
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

/**
 * Sendet eine Willkommens-E-Mail an einen neuen Benutzer
 * @param {string} email - E-Mail-Adresse des Benutzers
 * @param {string} name - Name des Benutzers
 * @returns {Promise<object>} - Resend API-Antwort
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const resendClient = getResendClient();
    const response = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: "Willkommen bei Pack & Go",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Willkommen bei Pack & Go!</h1>
          <p>Hallo ${name},</p>
          <p>vielen Dank für Ihre Registrierung bei Pack & Go. Wir freuen uns, Sie bei Ihrem nächsten Umzug unterstützen zu dürfen.</p>
          <p>Mit unserer Plattform können Sie:</p>
          <ul>
            <li>Passende Umzugsfirmen in Ihrer Region finden</li>
            <li>Transparente Preise dank unserem einfachen Stundensatz-Modell erhalten</li>
            <li>Umzugsanfragen mit nur wenigen Klicks erstellen</li>
            <li>Bewertungen anderer Kunden einsehen und eigene Erfahrungen teilen</li>
          </ul>
          <p>Haben Sie Fragen? Unser Support-Team steht Ihnen jederzeit zur Verfügung. Schreiben Sie uns einfach eine E-Mail an <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>Viel Erfolg bei Ihrem nächsten Umzug!</p>
          <p>Herzliche Grüße,<br>Ihr Pack & Go Team</p>
          <hr style="border: 1px solid #E5E7EB; margin-top: 20px;">
          <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
          </p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error("Fehler beim Senden der Willkommens-E-Mail:", error);
    throw error;
  }
};

/**
 * Sendet eine Bestellbestätigung an einen Kunden
 * @param {object} params - Parameter für die E-Mail
 * @returns {Promise<object>} - Resend API-Antwort
 */
export const sendOrderConfirmationEmail = async ({
  email,
  name,
  orderId,
  companyName,
  fromCity,
  toCity,
  preferredDate,
  totalPrice,
}) => {
  try {
    const formattedDate = new Date(preferredDate).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const resendClient = getResendClient();
    const response = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: "Ihre Umzugsanfrage bei Pack & Go",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Ihre Umzugsanfrage wurde erfolgreich erstellt!</h1>
          <p>Hallo ${name},</p>
          <p>vielen Dank für Ihre Umzugsanfrage bei Pack & Go. Ihre Anfrage wurde erfolgreich übermittelt und wird derzeit von der Umzugsfirma geprüft.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1F2937;">Ihre Anfrage im Überblick</h2>
            <p><strong>Bestellnummer:</strong> ${orderId}</p>
            <p><strong>Umzugsfirma:</strong> ${companyName}</p>
            <p><strong>Strecke:</strong> Von ${fromCity} nach ${toCity}</p>
            <p><strong>Gewünschtes Datum:</strong> ${formattedDate}</p>
            <p><strong>Gesamtpreis:</strong> ${totalPrice} €</p>
          </div>
          <p>Die Umzugsfirma wird sich in Kürze mit Ihnen in Verbindung setzen, um die Details zu besprechen und das Datum zu bestätigen.</p>
          <p>Sie können den Status Ihrer Anfrage jederzeit in Ihrem <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/orders">persönlichen Dashboard</a> einsehen.</p>
          <p>Haben Sie Fragen? Unser Support-Team steht Ihnen jederzeit zur Verfügung. Schreiben Sie uns einfach eine E-Mail an <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>Vielen Dank, dass Sie sich für Pack & Go entschieden haben!</p>
          <p>Herzliche Grüße,<br>Ihr Pack & Go Team</p>
          <hr style="border: 1px solid #E5E7EB; margin-top: 20px;">
          <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
          </p>
        </div>
      `,
    });
 
    return response;
  } catch (error) {
    console.error("Fehler beim Senden der Bestellbestätigungs-E-Mail:", error);
    throw error;
  }
};

/**
 * Sendet eine Benachrichtigung über eine neue Bestellung an eine Umzugsfirma
 * @param {object} params - Parameter für die E-Mail
 * @returns {Promise<object>} - Resend API-Antwort
 */
export const sendNewOrderNotificationEmail = async ({
  email,
  companyName,
  orderDetails,
}) => {
  try {
    const preferredDates = orderDetails.preferredDates
      .map((date) =>
        new Date(date).toLocaleDateString("de-DE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      )
      .join(", ");

    const resendClient = getResendClient();
    const response = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: "Neue Umzugsanfrage auf Pack & Go",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Neue Umzugsanfrage erhalten</h1>
          <p>Hallo ${companyName},</p>
          <p>Sie haben eine neue Umzugsanfrage über Pack & Go erhalten. Hier sind die Details:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1F2937;">Anfrage im Überblick</h2>
            <p><strong>Bestellnummer:</strong> ${orderDetails.id}</p>
            <p><strong>Kunde:</strong> ${orderDetails.customerName}</p>
            <p><strong>Kontakt:</strong> ${orderDetails.customerEmail}, ${orderDetails.customerPhone}</p>
            <p><strong>Von:</strong> ${orderDetails.fromAddress.street}, ${orderDetails.fromAddress.postalCode} ${orderDetails.fromAddress.city}</p>
            <p><strong>Nach:</strong> ${orderDetails.toAddress.street}, ${orderDetails.toAddress.postalCode} ${orderDetails.toAddress.city}</p>
            <p><strong>Gewünschte Termine:</strong> ${preferredDates}</p>
            <p><strong>Anzahl Helfer:</strong> ${orderDetails.helpersCount}</p>
            <p><strong>Geschätzte Stunden:</strong> ${orderDetails.estimatedHours}</p>
            <p><strong>Gesamtpreis:</strong> ${orderDetails.totalPrice} €</p>
            ${orderDetails.notes ? `<p><strong>Zusätzliche Hinweise:</strong> ${orderDetails.notes}</p>` : ""}
          </div>
          <p>Bitte loggen Sie sich in Ihr <a href="${process.env.NEXT_PUBLIC_BASE_URL}/company">Firmendashboard</a> ein, um auf diese Anfrage zu reagieren. Sie können das Datum bestätigen oder einen alternativen Termin vorschlagen.</p>
          <p>Bitte bearbeiten Sie diese Anfrage innerhalb von 24 Stunden, um dem Kunden eine schnelle Rückmeldung zu geben.</p>
          <p>Bei Fragen steht Ihnen unser Support-Team jederzeit zur Verfügung unter <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>Vielen Dank für Ihre Zusammenarbeit!</p>
          <p>Herzliche Grüße,<br>Ihr Pack & Go Team</p>
          <hr style="border: 1px solid #E5E7EB; margin-top: 20px;">
          <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
          </p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error(
      "Fehler beim Senden der Bestellbenachrichtigungs-E-Mail:",
      error
    );
    throw error;
  }
};

/**
 * Sendet eine E-Mail über Statusänderungen an einen Kunden
 * @param {object} params - Parameter für die E-Mail
 * @returns {Promise<object>} - Resend API-Antwort
 */
export const sendOrderStatusUpdateEmail = async ({
  email,
  name,
  orderId,
  oldStatus,
  newStatus,
  companyName,
  fromCity,
  toCity,
  confirmedDate,
}) => {
  try {
    // Übersetze die Status-Werte in benutzerfreundliche Texte
    const statusTexts = {
      pending: "Anfrage gesendet",
      confirmed: "Bestätigt",
      declined: "Abgelehnt",
      completed: "Abgeschlossen",
      cancelled: "Storniert",
    };

    // Erstelle einen geeigneten Betreff und Text je nach Statusänderung
    let subject = "";
    let statusSpecificText = "";

    if (newStatus === "confirmed") {
      subject = "Ihre Umzugsanfrage wurde bestätigt";
      statusSpecificText = `
        <p>Gute Neuigkeiten! ${companyName} hat Ihre Umzugsanfrage für den Umzug von ${fromCity} nach ${toCity} bestätigt.</p>
        <p><strong>Bestätigtes Datum:</strong> ${new Date(
          confirmedDate
        ).toLocaleDateString("de-DE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
        <p>Das Unternehmen wird sich in Kürze mit Ihnen in Verbindung setzen, um die weiteren Details zu besprechen.</p>
      `;
    } else if (newStatus === "declined") {
      subject = "Ihre Umzugsanfrage wurde abgelehnt";
      statusSpecificText = `
        <p>Leider müssen wir Ihnen mitteilen, dass ${companyName} Ihre Umzugsanfrage für den Umzug von ${fromCity} nach ${toCity} abgelehnt hat.</p>
        <p>Dies kann verschiedene Gründe haben, wie z.B. Kapazitätsengpässe oder Nichtverfügbarkeit am gewünschten Datum.</p>
        <p>Wir empfehlen Ihnen, eine neue Anfrage mit alternativen Terminen zu stellen oder andere Umzugsunternehmen zu kontaktieren.</p>
      `;
    } else if (newStatus === "completed") {
      subject = "Ihr Umzug wurde abgeschlossen";
      statusSpecificText = `
        <p>Wir freuen uns, dass Ihr Umzug von ${fromCity} nach ${toCity} mit ${companyName} erfolgreich abgeschlossen wurde!</p>
        <p>Wir würden uns sehr freuen, wenn Sie Ihre Erfahrungen mit dem Unternehmen in Form einer Bewertung teilen würden. Dies hilft anderen Kunden bei der Auswahl des richtigen Umzugsunternehmens.</p>
        <p>Sie können Ihre Bewertung direkt in Ihrem <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/orders">persönlichen Dashboard</a> abgeben.</p>
      `;
    } else if (newStatus === "cancelled") {
      subject = "Ihr Umzug wurde storniert";
      statusSpecificText = `
        <p>Wir möchten Sie darüber informieren, dass Ihr Umzug von ${fromCity} nach ${toCity} mit ${companyName} storniert wurde.</p>
        <p>Falls Sie Fragen zur Stornierung haben, kontaktieren Sie bitte unseren Kundenservice unter <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      `;
    } else {
      subject = "Update zu Ihrer Umzugsanfrage";
      statusSpecificText = `
        <p>Der Status Ihrer Umzugsanfrage für den Umzug von ${fromCity} nach ${toCity} mit ${companyName} hat sich geändert.</p>
        <p>Neuer Status: ${statusTexts[newStatus] || newStatus}</p>
      `;
    }

    const resendClient = getResendClient();
    const response = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Status Ihrer Umzugsanfrage geändert</h1>
          <p>Hallo ${name},</p>
          ${statusSpecificText}
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1F2937;">Ihre Anfrage im Überblick</h2>
            <p><strong>Bestellnummer:</strong> ${orderId}</p>
            <p><strong>Umzugsfirma:</strong> ${companyName}</p>
            <p><strong>Strecke:</strong> Von ${fromCity} nach ${toCity}</p>
            <p><strong>Status:</strong> ${statusTexts[newStatus] || newStatus}</p>
          </div>
          <p>Sie können alle Details Ihrer Anfrage jederzeit in Ihrem <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/orders">persönlichen Dashboard</a> einsehen.</p>
          <p>Haben Sie Fragen? Unser Support-Team steht Ihnen jederzeit zur Verfügung. Schreiben Sie uns einfach eine E-Mail an <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>Herzliche Grüße,<br>Ihr Pack & Go Team</p>
          <hr style="border: 1px solid #E5E7EB; margin-top: 20px;">
          <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
          </p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error("Fehler beim Senden der Status-Update-E-Mail:", error);
    throw error;
  }
};

/**
 * Sendet eine Benachrichtigung über eine Anfrage zur Firmenverifizierung an den Administrator
 * @param {object} params - Parameter für die E-Mail
 * @returns {Promise<object>} - Resend API-Antwort
 */
export const sendCompanyVerificationRequestEmail = async ({
  companyName,
  companyEmail,
  companyPhone,
  documentsUrl,
}) => {
  try {
    const resendClient = getResendClient();
    const response = await resendClient.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: "Neue Anfrage zur Firmenverifizierung",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Neue Anfrage zur Firmenverifizierung</h1>
          <p>Hallo Admin,</p>
          <p>eine neue Umzugsfirma hat sich auf Pack & Go registriert und wartet auf die Verifizierung.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1F2937;">Unternehmensdaten</h2>
            <p><strong>Firmenname:</strong> ${companyName}</p>
            <p><strong>E-Mail:</strong> ${companyEmail}</p>
            <p><strong>Telefon:</strong> ${companyPhone}</p>
            <p><strong>Hochgeladene Dokumente:</strong></p>
            <ul>
              ${documentsUrl.map((url) => `<li><a href="${url}">Dokument anzeigen</a></li>`).join("")}
            </ul>
          </div>
          <p>Bitte überprüfen Sie die hochgeladenen Dokumente und verifizieren Sie das Unternehmen im <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/companies">Admin-Dashboard</a>.</p>
          <p>Herzliche Grüße,<br>Das Pack & Go System</p>
          <hr style="border: 1px solid #E5E7EB; margin-top: 20px;">
          <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
          </p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error(
      "Fehler beim Senden der Verifizierungsanfrage-E-Mail:",
      error
    );
    throw error;
  }
};

/**
 * Sendet eine Buchungsbestätigungs-E-Mail an einen Kunden
 * @param {object} params - Parameter für die E-Mail
 * @returns {Promise<object>} - Resend API-Antwort
 */
export const sendBookingConfirmationEmail = async ({
  email,
  name,
  bookingId,
  serviceName,
  companyName,
  bookingDate,
  bookingTime,
  duration,
  location,
  totalPrice,
  serviceDetails = {},
  customerPhone,
  companyPhone,
  companyEmail,
  specialInstructions,
}) => {
  try {
    // Formatiere das Datum für die deutsche Lokalisierung
    const formattedDate = new Date(bookingDate).toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long", 
      day: "numeric",
    });

    // Formatiere die Zeit
    const formattedTime = bookingTime || "Ganztags";

    // Erstelle Service-Details HTML falls vorhanden
    const serviceDetailsHtml = Object.keys(serviceDetails).length > 0 
      ? `
        <div style="margin: 15px 0;">
          <h3 style="color: #1F2937; margin-bottom: 10px;">Service-Details:</h3>
          ${Object.entries(serviceDetails).map(([key, value]) => 
            `<p style="margin: 5px 0;"><strong>${key}:</strong> ${value}</p>`
          ).join('')}
        </div>
      `
      : '';

    const resendClient = getResendClient();
    const response = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: `Buchungsbestätigung - ${serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Buchung bestätigt!</h1>
            <p style="color: #E5E7EB; margin: 10px 0 0 0; font-size: 16px;">Vielen Dank für Ihr Vertrauen</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: white;">
            <p style="font-size: 16px; margin-bottom: 25px;">
              Hallo <strong>${name}</strong>,
            </p>
            
            <p style="margin-bottom: 25px; color: #374151;">
              Ihre Buchung für <strong>${serviceName}</strong> wurde erfolgreich bestätigt! 
              Wir freuen uns darauf, Ihnen einen erstklassigen Service zu bieten.
            </p>

            <!-- Booking Details Card -->
            <div style="background: linear-gradient(145deg, #F8FAFC, #F1F5F9); 
                        border: 2px solid #E2E8F0; 
                        border-radius: 12px; 
                        padding: 25px; 
                        margin: 25px 0;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">
                📋 Ihre Buchungsdetails
              </h2>
              
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                  <span style="font-weight: 600; color: #374151;">Buchungsnummer:</span>
                  <span style="color: #1F2937; font-family: monospace; background: #F3F4F6; padding: 2px 8px; border-radius: 4px;">${bookingId}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                  <span style="font-weight: 600; color: #374151;">Service:</span>
                  <span style="color: #1F2937;"><strong>${serviceName}</strong></span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                  <span style="font-weight: 600; color: #374151;">Anbieter:</span>
                  <span style="color: #1F2937;">${companyName}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                  <span style="font-weight: 600; color: #374151;">📅 Datum:</span>
                  <span style="color: #1F2937;">${formattedDate}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                  <span style="font-weight: 600; color: #374151;">🕐 Uhrzeit:</span>
                  <span style="color: #1F2937;">${formattedTime}</span>
                </div>
                
                ${duration ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                  <span style="font-weight: 600; color: #374151;">⏱️ Dauer:</span>
                  <span style="color: #1F2937;">${duration}</span>
                </div>
                ` : ''}
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                  <span style="font-weight: 600; color: #374151;">📍 Ort:</span>
                  <span style="color: #1F2937;">${location}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #3B82F6; margin-top: 10px;">
                  <span style="font-weight: 700; color: #1F2937; font-size: 18px;">💰 Gesamtpreis:</span>
                  <span style="color: #059669; font-weight: 700; font-size: 18px;">${totalPrice} €</span>
                </div>
              </div>
              
              ${serviceDetailsHtml}
              
              ${specialInstructions ? `
              <div style="margin-top: 20px; padding: 15px; background: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 0 8px 8px 0;">
                <h4 style="color: #92400E; margin: 0 0 8px 0;">📝 Besondere Hinweise:</h4>
                <p style="color: #78350F; margin: 0;">${specialInstructions}</p>
              </div>
              ` : ''}
            </div>

            <!-- Contact Information -->
            <div style="background: #F0F9FF; 
                        border: 1px solid #0EA5E9; 
                        border-radius: 8px; 
                        padding: 20px; 
                        margin: 25px 0;">
              <h3 style="color: #0C4A6E; margin: 0 0 15px 0;">📞 Kontaktinformationen</h3>
              <div style="color: #0F172A;">
                <p style="margin: 8px 0;"><strong>Ihr Ansprechpartner:</strong> ${companyName}</p>
                <p style="margin: 8px 0;"><strong>Telefon:</strong> <a href="tel:${companyPhone}" style="color: #0EA5E9; text-decoration: none;">${companyPhone}</a></p>
                <p style="margin: 8px 0;"><strong>E-Mail:</strong> <a href="mailto:${companyEmail}" style="color: #0EA5E9; text-decoration: none;">${companyEmail}</a></p>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background: #F0FDF4; 
                        border: 1px solid #22C55E; 
                        border-radius: 8px; 
                        padding: 20px; 
                        margin: 25px 0;">
              <h3 style="color: #15803D; margin: 0 0 15px 0;">✅ Nächste Schritte</h3>
              <ul style="color: #0F172A; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Der Anbieter wird sich 24-48 Stunden vor dem Termin bei Ihnen melden</li>
                <li style="margin-bottom: 8px;">Halten Sie Ihr Telefon ${customerPhone ? `(${customerPhone})` : ''} am Buchungstag bereit</li>
                <li style="margin-bottom: 8px;">Bei Fragen können Sie den Anbieter direkt kontaktieren</li>
                <li>Änderungen oder Stornierungen sind bis 24h vor dem Termin möglich</li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/bookings" 
                 style="display: inline-block; 
                        background: linear-gradient(135deg, #3B82F6, #1E40AF); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        margin: 0 10px 10px 0;
                        box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                📱 Meine Buchungen verwalten
              </a>
              
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/contact" 
                 style="display: inline-block; 
                        background: white; 
                        color: #3B82F6; 
                        border: 2px solid #3B82F6; 
                        padding: 13px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        margin: 0 10px 10px 0;">
                💬 Support kontaktieren
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center;">
              <p style="color: #6B7280; margin-bottom: 15px;">
                Vielen Dank, dass Sie sich für Pack & Go entschieden haben!
              </p>
              <p style="color: #1F2937; font-weight: 600;">
                Herzliche Grüße,<br>
                Ihr Pack & Go Team
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F9FAFB; 
                      padding: 20px; 
                      border-radius: 0 0 10px 10px; 
                      border-top: 1px solid #E5E7EB;">
            <p style="font-size: 12px; 
                      color: #6B7280; 
                      margin: 0; 
                      text-align: center; 
                      line-height: 1.5;">
              Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.<br>
              Bei Fragen wenden Sie sich an: <a href="mailto:${supportEmail}" style="color: #3B82F6;">${supportEmail}</a>
            </p>
          </div>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error("Fehler beim Senden der Buchungsbestätigungs-E-Mail:", error);
    throw error;
  }
};
