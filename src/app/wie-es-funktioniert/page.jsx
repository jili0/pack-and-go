// src/app/wie-es-funktioniert/page.jsx (continuing from previous part)
import Image from 'next/image';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero-Bereich */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Wie funktioniert Pack & Go?
          </h1>
          <p className="mt-6 text-xl max-w-3xl mx-auto">
            Umziehen war noch nie so einfach. Mit Pack & Go finden Sie schnell, transparent und unkompliziert die passende Umzugsfirma für Ihren Umzug.
          </p>
        </div>
      </section>

      {/* Prozess-Schritte */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Ihr Umzug in 3 einfachen Schritten</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Bei Pack & Go legen wir Wert auf Einfachheit und Transparenz. Unser Prozess ist darauf ausgelegt, Ihnen Zeit und Stress zu sparen.
            </p>
          </div>

          <div className="relative">
            {/* Verbindungslinie */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Schritt 1 */}
              <div className="relative bg-white p-8 rounded-lg shadow-lg">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Anfrage stellen</h3>
                  <div className="h-40 relative mb-6">
                    <Image
                      src="/images/step1.jpg"
                      alt="Anfrage stellen"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-gray-600">
                    Geben Sie Start- und Zieladresse ein, wählen Sie die Anzahl der Helfer und schätzen Sie die benötigte Zeit. Kein komplizierter Umzugsrechner notwendig!
                  </p>
                </div>
              </div>

              {/* Schritt 2 */}
              <div className="relative bg-white p-8 rounded-lg shadow-lg">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Angebote vergleichen</h3>
                  <div className="h-40 relative mb-6">
                    <Image
                      src="/images/step2.jpg"
                      alt="Angebote vergleichen"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-gray-600">
                    Erhalten Sie sofort eine Liste mit verfügbaren Umzugsfirmen für Ihre Route. Vergleichen Sie Bewertungen, Preise und Verfügbarkeit.
                  </p>
                </div>
              </div>

              {/* Schritt 3 */}
              <div className="relative bg-white p-8 rounded-lg shadow-lg">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Umzug buchen</h3>
                  <div className="h-40 relative mb-6">
                    <Image
                      src="/images/step3.jpg"
                      alt="Umzug buchen"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-gray-600">
                    Wählen Sie Ihre bevorzugte Umzugsfirma und bis zu drei Wunschtermine aus. Nach der Bestätigung durch die Firma steht Ihrem Umzug nichts mehr im Wege!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unser transparentes Preismodell */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Unser transparentes Preismodell</h2>
              <p className="mt-4 text-lg text-gray-600">
                Bei Pack & Go gibt es keine versteckten Kosten oder komplizierte Berechnungen. Unser Preismodell ist einfach und transparent.
              </p>
              
              <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">So berechnen wir den Preis:</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="ml-4 text-gray-600">
                      <span className="font-medium">Stundensatz pro Helfer:</span> Jede Umzugsfirma legt ihren eigenen Stundensatz fest (typischerweise zwischen 40€ und 60€ pro Helfer)
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="ml-4 text-gray-600">
                      <span className="font-medium">Anzahl der Helfer:</span> Sie wählen, wie viele Helfer Sie benötigen (Minimum: 2)
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="ml-4 text-gray-600">
                      <span className="font-medium">Geschätzte Stunden:</span> Sie schätzen, wie lange der Umzug dauern wird
                    </p>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="ml-4 text-gray-900 font-medium">
                        Gesamtpreis = Stundensatz × Anzahl der Helfer × Geschätzte Stunden
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="mt-6 text-sm text-gray-500">
                <strong>Hinweis:</strong> Der endgültige Preis kann variieren, wenn die tatsächliche Dauer des Umzugs von der geschätzten Zeit abweicht. Die Abrechnung erfolgt immer nach der tatsächlich benötigten Zeit.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Preisbeispiel</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Kleiner Umzug (1-Zimmer-Wohnung)</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Stundensatz pro Helfer:</div>
                    <div className="text-gray-900 font-medium">50 €</div>
                    <div className="text-gray-600">Anzahl der Helfer:</div>
                    <div className="text-gray-900 font-medium">2</div>
                    <div className="text-gray-600">Geschätzte Stunden:</div>
                    <div className="text-gray-900 font-medium">3</div>
                    <div className="border-t border-gray-200 col-span-2 my-2"></div>
                    <div className="text-gray-900 font-medium">Gesamtpreis:</div>
                    <div className="text-blue-600 font-bold">300 €</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Mittlerer Umzug (2-3-Zimmer-Wohnung)</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Stundensatz pro Helfer:</div>
                    <div className="text-gray-900 font-medium">50 €</div>
                    <div className="text-gray-600">Anzahl der Helfer:</div>
                    <div className="text-gray-900 font-medium">3</div>
                    <div className="text-gray-600">Geschätzte Stunden:</div>
                    <div className="text-gray-900 font-medium">5</div>
                    <div className="border-t border-gray-200 col-span-2 my-2"></div>
                    <div className="text-gray-900 font-medium">Gesamtpreis:</div>
                    <div className="text-blue-600 font-bold">750 €</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Großer Umzug (4+ Zimmer-Wohnung)</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Stundensatz pro Helfer:</div>
                    <div className="text-gray-900 font-medium">50 €</div>
                    <div className="text-gray-600">Anzahl der Helfer:</div>
                    <div className="text-gray-900 font-medium">4</div>
                    <div className="text-gray-600">Geschätzte Stunden:</div>
                    <div className="text-gray-900 font-medium">7</div>
                    <div className="border-t border-gray-200 col-span-2 my-2"></div>
                    <div className="text-gray-900 font-medium">Gesamtpreis:</div>
                    <div className="text-blue-600 font-bold">1.400 €</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KisteKlar-Zertifizierung */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="relative h-80 overflow-hidden rounded-lg">
                <Image
                  src="/images/certification.jpg"
                  alt="KisteKlar-Zertifizierung"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="mt-8 lg:mt-0 lg:col-span-7">
              <div className="lg:pl-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Qualitätsstandard
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Das KisteKlar-Zertifikat</h2>
                <p className="mt-4 text-lg text-gray-600">
                  Umzugsfirmen mit dem KisteKlar-Zertifikat erfüllen besonders hohe Qualitätsstandards und bieten Ihnen zusätzliche Sicherheit für Ihren Umzug.
                </p>
                <div className="mt-6 space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">Verifizierte Identität</h4>
                      <p className="mt-1 text-sm text-gray-600">Alle Dokumente und Lizenzen werden von unserem Team sorgfältig geprüft.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">Umfassende Versicherung</h4>
                      <p className="mt-1 text-sm text-gray-600">Zusätzlicher Versicherungsschutz für Ihre Möbel und Gegenstände.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">Geschultes Personal</h4>
                      <p className="mt-1 text-sm text-gray-600">Alle Mitarbeiter sind professionell geschult und haben Erfahrung im Umgang mit wertvollen Gegenständen.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">Qualitätsgarantie</h4>
                      <p className="mt-1 text-sm text-gray-600">Bei Schäden erhalten Sie eine schnelle und unkomplizierte Entschädigung.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <p className="text-gray-600">
                    Das KisteKlar-Zertifikat wird nur an Unternehmen vergeben, die unsere strengen Qualitätskriterien erfüllen und regelmäßig überprüft werden.
                  </p>
                  <p className="mt-2 text-gray-600">
                    Bei der Suche nach Umzugsfirmen können Sie gezielt nach zertifizierten Unternehmen filtern.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Häufig gestellte Fragen</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Hier finden Sie Antworten auf die häufigsten Fragen zu Pack & Go und unserem Service.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto divide-y divide-gray-200">
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">Wie funktioniert die Preisberechnung genau?</h3>
              <div className="mt-2 text-gray-600">
                <p>
                  Unser transparentes Preismodell basiert auf drei Faktoren: dem Stundensatz der Umzugsfirma (pro Helfer), der Anzahl der benötigten Helfer und der geschätzten Dauer des Umzugs. Diese drei Werte werden miteinander multipliziert, um den Gesamtpreis zu ermitteln. So können Sie bereits im Vorfeld genau sehen, was Ihr Umzug kosten wird.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">Was passiert, wenn mein Umzug länger dauert als geschätzt?</h3>
              <div className="mt-2 text-gray-600">
                <p>
                  Der bei der Buchung angegebene Preis basiert auf Ihrer Schätzung. Sollte der Umzug tatsächlich länger dauern, wird die zusätzliche Zeit nach dem vereinbarten Stundensatz berechnet. Umgekehrt gilt: Wenn der Umzug schneller erledigt ist, zahlen Sie nur für die tatsächlich benötigte Zeit.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">Wie sind meine Möbel während des Umzugs versichert?</h3>
              <div className="mt-2 text-gray-600">
                <p>
                  Alle Umzugsfirmen auf unserer Plattform verfügen über eine Grundversicherung für Transportschäden. Umzugsfirmen mit dem KisteKlar-Zertifikat bieten darüber hinaus einen erweiterten Versicherungsschutz. Die genauen Versicherungsbedingungen können je nach Unternehmen variieren und werden Ihnen vor der Buchung transparent dargestellt.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">Kann ich eine Buchung stornieren oder verschieben?</h3>
              <div className="mt-2 text-gray-600">
                <p>
                  Ja, Sie können Ihre Buchung stornieren oder verschieben. Bitte beachten Sie, dass je nach Zeitpunkt der Stornierung unterschiedliche Bedingungen gelten:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Stornierung bis 7 Tage vor dem Umzug: kostenlos</li>
                  <li>Stornierung 3-6 Tage vor dem Umzug: 30% des Gesamtpreises</li>
                  <li>Stornierung 1-2 Tage vor dem Umzug: 50% des Gesamtpreises</li>
                  <li>Stornierung am Tag des Umzugs: 100% des Gesamtpreises</li>
                </ul>
                <p className="mt-2">
                  Eine Terminverschiebung ist in der Regel kostenlos, sofern mindestens 48 Stunden vor dem geplanten Umzug mitgeteilt und ein alternativer Termin vereinbart wird.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">Wie kann ich sicher sein, dass die Umzugsfirma seriös ist?</h3>
              <div className="mt-2 text-gray-600">
                <p>
                  Alle Umzugsfirmen auf unserer Plattform werden vor der Aufnahme sorgfältig überprüft. Wir verifizieren ihre Identität, Lizenzen und Versicherungen. Darüber hinaus können Sie die Bewertungen anderer Kunden einsehen, um sich ein Bild von der Qualität der Dienstleistung zu machen. Umzugsfirmen mit dem KisteKlar-Zertifikat erfüllen zusätzlich strenge Qualitätsstandards und werden regelmäßig überprüft.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Haben Sie weitere Fragen? Kontaktieren Sie uns gerne!
            </p>
            <Link href="/kontakt" className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Zum Kontaktformular
            </Link>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit für Ihren stressfreien Umzug?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Holen Sie sich jetzt kostenlos und unverbindlich Angebote von verifizierten Umzugsfirmen in Ihrer Region.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-blue-700 bg-white hover:bg-blue-50"
          >
            Jetzt Umzug planen
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}