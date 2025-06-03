"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyDashboard() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/company/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login"); // Token ungültig oder abgelaufen
          return;
        }

        const data = await res.json();
        setCompany(data);
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden des Profils", err);
        router.push("/login");
      }
    }

    fetchData();
  }, [router]);

  if (loading) return <p>Dashboard wird geladen...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Willkommen, {company.companyName}!</h1>
      <p><strong>Steuernummer:</strong> {company.taxId}</p>
      <p><strong>Stundensatz:</strong> {company.hourlyRate} €</p>
      <p><strong>Adresse:</strong> {company.street}, {company.postalCode} {company.city}, {company.country}</p>
      <p><strong>Zertifiziert bei KisteKlar:</strong> {company.isKisteKlarCertified ? "Ja" : "Nein"}</p>

      <h2>Servicegebiete:</h2>
      <ul>
        {company.serviceAreas.map((area, index) => (
          <li key={index}>
            {area.from} – {area.to}
          </li>
        ))}
      </ul>

      <p><strong>Beschreibung:</strong></p>
      <p>{company.description}</p>

      {/* Weitere Firmenfunktionen hier */}
    </div>
  );
}