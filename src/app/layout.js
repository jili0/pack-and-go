// src/app/layout.js
import { Inter } from 'next/font/google';
import './styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pack & Go - Einfach umziehen mit transparenten Preisen',
  description: 'Pack & Go bietet transparente Preise für Ihren Umzug. Buchen Sie vertrauenswürdige Umzugshelfer und packen Sie Ihre Sorgen weg.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}