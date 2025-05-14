// src/app/page.js (completing the remaining part)
import Image from 'next/image';
import Link from 'next/link';
import MovingCalculator from '@/components/forms/PriceCalculator';

export default function Home() {
  return (
    <div>
      {/* Hero-Bereich */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        {/* Hero content from previous part */}
      </section>

      {/* Umzugsrechner */}
      <section id="calculator" className="py-16">
        {/* Calculator content from previous part */}
      </section>

      {/* Wie es funktioniert */}
      <section className="py-16 bg-gray-50">
        {/* How it works content from previous part */}
      </section>

      {/* Vorteile */}
      <section className="py-16">
        {/* Benefits content from previous part */}
      </section>

      {/* Kundenbewertungen */}
      <section className="py-16 bg-blue-50">
        {/* Testimonials content from previous part */}
      </section>

      {/* Call-to-Action */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit für Ihren stressfreien Umzug?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Holen Sie sich jetzt kostenlos und unverbindlich Angebote von verifizierten Umzugsfirmen in Ihrer Region.
          </p>
          <Link 
            href="#calculator" 
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-blue-700 bg-white hover:bg-blue-50"
          >
            Jetzt Umzug planen
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Städte-Sektion */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900">Top Umzugsunternehmen in großen Städten</h2>
            <p className="mt-4 text-lg text-gray-600">
              Finden Sie verifizierte Umzugsunternehmen in den größten Städten Deutschlands
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/stadt/berlin" className="group">
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image 
                  src="/images/cities/berlin.jpg" 
                  alt="Berlin" 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-bold">Berlin</h3>
                  <p className="text-sm">Top 10 Umzugsunternehmen</p>
                </div>
              </div>
            </Link>
            
            <Link href="/stadt/hamburg" className="group">
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image 
                  src="/images/cities/hamburg.jpg" 
                  alt="Hamburg" 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-bold">Hamburg</h3>
                  <p className="text-sm">Top 10 Umzugsunternehmen</p>
                </div>
              </div>
            </Link>
            
            <Link href="/stadt/muenchen" className="group">
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image 
                  src="/images/cities/muenchen.jpg" 
                  alt="München" 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-bold">München</h3>
                  <p className="text-sm">Top 10 Umzugsunternehmen</p>
                </div>
              </div>
            </Link>
            
            <Link href="/stadt/koeln" className="group">
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image 
                  src="/images/cities/koeln.jpg" 
                  alt="Köln" 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-bold">Köln</h3>
                  <p className="text-sm">Top 10 Umzugsunternehmen</p>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="mt-10 text-center">
            <Link 
              href="/staedte" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              Alle Städte ansehen
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}