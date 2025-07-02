// src/app/layout.js
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import SocketManager from "@/components/SocketManager"; // ✅ Import

import "@/app/styles/styles.css";

export const metadata = {
  title: "Pack & Go - Move easily with transparent pricing",
  description:
    "Pack & Go offers transparent pricing for your move. Book reliable movers and pack your worries away.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>
          <AuthProvider>
            <NotificationProvider>
              <SocketManager /> {/* ✅ Socket wird nach allen Contexts geladen */}
              <Header />
              <main>{children}</main>
              <Footer />
            </NotificationProvider>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
