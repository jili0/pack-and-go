// src/app/layout.js
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext"; // NEU
import "@/app/styles/styles.css";

export const metadata = {
  title: "Pack & Go - Einfach umziehen mit transparenten Preisen",
  description:
    "Pack & Go bietet transparente Preise für Ihren Umzug. Buchen Sie vertrauenswürdige Umzugshelfer und packen Sie Ihre Sorgen weg.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        <LoadingProvider>
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </LoadingProvider>
        {/* NEU */}
      </body>
    </html>
  );
}
