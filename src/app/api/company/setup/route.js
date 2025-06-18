// src/app/api/company/setup/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { getSession } from "@/lib/auth";
import saveUploadedFile from "@/lib/fileUpload";

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "company") {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    await connectDB();

    // Prüfe, ob bereits ein Firmenprofil existiert
    const existingCompany = await Company.findOne({ accountId: session.id });

    if (existingCompany) {
      return NextResponse.json(
        {
          success: false,
          message: "Es existiert bereits ein Firmenprofil für diesen Benutzer",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Extrahiere die Formulardaten
    const companyName = formData.get("companyName");
    const taxId = formData.get("taxId");
    const description = formData.get("description");
    const hourlyRate = formData.get("hourlyRate");
    const street = formData.get("street");
    const city = formData.get("city");
    const postalCode = formData.get("postalCode");
    const country = formData.get("country") || "Deutschland";
    const isKisteKlarCertified =
      formData.get("isKisteKlarCertified") === "true";

    // Extrahiere die Servicegebiete
    const serviceAreasData = formData.get("serviceAreas");
    let serviceAreas = [];

    if (serviceAreasData) {
      try {
        serviceAreas = JSON.parse(serviceAreasData);
      } catch (error) {
        return NextResponse.json(
          { success: false, message: "Ungültiges Format für Servicegebiete" },
          { status: 400 }
        );
      }
    }

    // Validiere die Eingaben
    if (
      !companyName ||
      !taxId ||
      !hourlyRate ||
      !street ||
      !city ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Alle Pflichtfelder müssen ausgefüllt sein",
        },
        { status: 400 }
      );
    }

    // Verarbeite die hochgeladenen Dateien
    const businessLicenseFile = formData.get("businessLicense");
    const kisteKlarCertificateFile = formData.get("kisteKlarCertificate");

    let businessLicenseUrl = null;
    let kisteKlarCertificateUrl = null;

    if (businessLicenseFile) {
      businessLicenseUrl = await saveUploadedFile(
        businessLicenseFile,
        "businessLicense",
        session.id
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Betriebsausweis ist erforderlich" },
        { status: 400 }
      );
    }

    if (isKisteKlarCertified && kisteKlarCertificateFile) {
      kisteKlarCertificateUrl = await saveUploadedFile(
        kisteKlarCertificateFile,
        "kisteKlarCertificate",
        session.id
      );
    } else if (isKisteKlarCertified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "KisteKlar-Zertifikat ist erforderlich, wenn Sie angeben, zertifiziert zu sein",
        },
        { status: 400 }
      );
    }

    // Erstelle das Firmenprofil
    const newCompany = await Company.create({
      accountId: session.id,
      companyName,
      address: {
        street,
        city,
        postalCode,
        country,
      },
      taxId,
      description,
      serviceAreas,
      isVerified: false, // Muss von einem Administrator bestätigt werden
      isKisteKlarCertified,
      documents: {
        businessLicense: {
          url: businessLicenseUrl,
          verified: false,
        },
        ...(kisteKlarCertificateUrl
          ? {
              kisteKlarCertificate: {
                url: kisteKlarCertificateUrl,
                verified: false,
              },
            }
          : {}),
      },
    });

    // Hole die E-Mail-Adresse und Telefonnummer des Benutzers
    const account = await Account.findById(session.id);

    // Sende E-Mail-Benachrichtigung an den Administrator zur Überprüfung
    // (Implementierung in lib/email.js)
    // await sendCompanyVerificationRequestEmail({
    //   companyName,
    //   companyEmail: account.email,
    //   companyPhone: account.phone,
    //   documentsUrl: [businessLicenseUrl, kisteKlarCertificateUrl].filter(Boolean)
    // });

    return NextResponse.json(
      {
        success: true,
        message:
          "Firmenprofil erfolgreich erstellt und zur Überprüfung eingereicht",
        company: newCompany,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Fehler beim Erstellen des Firmenprofils:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Serverfehler beim Erstellen des Firmenprofils",
      },
      { status: 500 }
    );
  }
}
