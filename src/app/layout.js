import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { SocketProvider } from "@/context/useSocket"; // ✅ Neuer Socket Provider
import SocketManager from "@/components/SocketManager";
import Widget from "@/components/ui/Widget";

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
          <SocketProvider>
            {/* ✅ Socket Provider ganz nach außen */}
            <AuthProvider>
              <NotificationProvider>
                <SocketManager />
                <Header />
                <main>{children}</main>
                <Widget />
                <Footer />
              </NotificationProvider>
            </AuthProvider>
          </SocketProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
