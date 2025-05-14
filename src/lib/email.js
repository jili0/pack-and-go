// src/lib/email.js
import { Resend } from 'resend';

// Konfiguriere Resend mit dem API-Schlüssel aus den Umgebungsvariablen
const resend = new Resend(process.env.RESEND_API_KEY);

// E-Mail-Absender-Adresse
const fromEmail = process.env.FROM_EMAIL || 'no-reply@pack-and-go.de';
const supportEmail = process.env.SUPPORT_EMAIL || 'support@pack-and-go.de';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@pack-and-go.de';

/**
 * Sendet eine Willkommens-E-Mail an einen neuen Benutzer
 * @param {string} email - E-Mail-Adresse des Benutzers
 * @param {string} name - Name des Benutzers
 * @returns {Promise<object>} - Resend API-Antwort
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Willkommen bei Pack & Go',
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
      `
    });

    return response;
  } catch (error) {
    console.error('Fehler beim Senden der Willkommens-E-Mail:', error);
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
  totalPrice
}) => {
  try {
    const formattedDate = new Date(preferredDate).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const response = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Ihre Umzugsanfrage bei Pack & Go',
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
          <p>Sie können den Status Ihrer Anfrage jederzeit in Ihrem <a href="${process.env.NEXT_PUBLIC_BASE_URL}/user/orders">persönlichen Dashboard</a> einsehen.</p>
          <p>Haben Sie Fragen? Unser Support-Team steht Ihnen jederzeit zur Verfügung. Schreiben Sie uns einfach eine E-Mail an <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>Vielen Dank, dass Sie sich für Pack & Go entschieden haben!</p>
          <p>Herzliche Grüße,<br>Ihr Pack & Go Team</p>
          <hr style="border: 1px solid #E5E7EB; margin-top: 20px;">
          <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
          </p>
        </div>
      `
    });

    return response;
  } catch (error) {
    console.error('Fehler beim Senden der Bestellbestätigungs-E-Mail:', error);
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
  orderDetails
}) => {
  try {
    const preferredDates = orderDetails.preferredDates.map(date => 
      new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    ).join(', ');

    const response = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Neue Umzugsanfrage auf Pack & Go',
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
            ${orderDetails.notes ? `<p><strong>Zusätzliche Hinweise:</strong> ${orderDetails.notes}</p>` : ''}
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
      `
    });

    return response;
  } catch (error) {
    console.error('Fehler beim Senden der Bestellbenachrichtigungs-E-Mail:', error);
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
  confirmedDate
}) => {
  try {
    // Übersetze die Status-Werte in benutzerfreundliche Texte
    const statusTexts = {
      pending: 'Anfrage gesendet',
      confirmed: 'Bestätigt',
      declined: 'Abgelehnt',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert'
    };

    // Erstelle einen geeigneten Betreff und Text je nach Statusänderung
    let subject = '';
    let statusSpecificText = '';

    if (newStatus === 'confirmed') {
      subject = 'Ihre Umzugsanfrage wurde bestätigt';
      statusSpecificText = `
        <p>Gute Neuigkeiten! ${companyName} hat Ihre Umzugsanfrage für den Umzug von ${fromCity} nach ${toCity} bestätigt.</p>
        <p><strong>Bestätigtes Datum:</strong> ${new Date(confirmedDate).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        <p>Das Unternehmen wird sich in Kürze mit Ihnen in Verbindung setzen, um die weiteren Details zu besprechen.</p>
      `;
    } else if (newStatus === 'declined') {
      subject = 'Ihre Umzugsanfrage wurde abgelehnt';
      statusSpecificText = `
        <p>Leider müssen wir Ihnen mitteilen, dass ${companyName} Ihre Umzugsanfrage für den Umzug von ${fromCity} nach ${toCity} abgelehnt hat.</p>
        <p>Dies kann verschiedene Gründe haben, wie z.B. Kapazitätsengpässe oder Nichtverfügbarkeit am gewünschten Datum.</p>
        <p>Wir empfehlen Ihnen, eine neue Anfrage mit alternativen Terminen zu stellen oder andere Umzugsunternehmen zu kontaktieren.</p>
      `;
    } else if (newStatus === 'completed') {
      subject = 'Ihr Umzug wurde abgeschlossen';
      statusSpecificText = `
        <p>Wir freuen uns, dass Ihr Umzug von ${fromCity} nach ${toCity} mit ${companyName} erfolgreich abgeschlossen wurde!</p>
        <p>Wir würden uns sehr freuen, wenn Sie Ihre Erfahrungen mit dem Unternehmen in Form einer Bewertung teilen würden. Dies hilft anderen Kunden bei der Auswahl des richtigen Umzugsunternehmens.</p>
        <p>Sie können Ihre Bewertung direkt in Ihrem <a href="${process.env.NEXT_PUBLIC_BASE_URL}/user/orders">persönlichen Dashboard</a> abgeben.</p>
      `;
    } else if (newStatus === 'cancelled') {
      subject = 'Ihr Umzug wurde storniert';
      statusSpecificText = `
        <p>Wir möchten Sie darüber informieren, dass Ihr Umzug von ${fromCity} nach ${toCity} mit ${companyName} storniert wurde.</p>
        <p>Falls Sie Fragen zur Stornierung haben, kontaktieren Sie bitte unseren Kundenservice unter <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      `;
    } else {
      subject = 'Update zu Ihrer Umzugsanfrage';
      statusSpecificText = `
        <p>Der Status Ihrer Umzugsanfrage für den Umzug von ${fromCity} nach ${toCity} mit ${companyName} hat sich geändert.</p>
        <p>Neuer Status: ${statusTexts[newStatus] || newStatus}</p>
      `;
    }

    const response = await resend.emails.send({
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
          <p>Sie können alle Details Ihrer Anfrage jederzeit in Ihrem <a href="${process.env.NEXT_PUBLIC_BASE_URL}/user/orders">persönlichen Dashboard</a> einsehen.</p>
          <p>Haben Sie Fragen? Unser Support-Team steht Ihnen jederzeit zur Verfügung. Schreiben Sie uns einfach eine E-Mail an <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>Herzliche Grüße,<br>Ihr Pack & Go Team</p>
          <hr style="border: 1px solid #E5E7EB; margin-top: 20px;">
          <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
          </p>
        </div>
      `
    });

    return response;
  } catch (error) {
    console.error('Fehler beim Senden der Status-Update-E-Mail:', error);
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
  documentsUrl
}) => {
  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: 'Neue Anfrage zur Firmenverifizierung',
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
              ${documentsUrl.map(url => `<li><a href="${url}">Dokument anzeigen</a></li>`).join('')}
            </ul>
          </div>
          <p>Bitte überprüfen Sie die hochgeladenen Dokumente und verifizieren Sie das Unternehmen im <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/companies">Admin-Dashboard</a>.</p>
          <p>Herzliche Grüße,<br>Das Pack & Go System</p>
          <hr style="border: 1px solid #E5E7EB; margin-top: 20px;">
          <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
          </p>
        </div>
      `
    });

    return response;
  } catch (error) {
    console.error('Fehler beim Senden der Verifizierungsanfrage-E-Mail:', error);
    throw error;
  }
};