// // src/app/search-results/page.jsx
// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from '@/components/ui/Image';
// import styles from '@/app/styles/SearchResults.module.css';

// export default function SearchResults() {
//   const router = useRouter();
//   const [companies, setCompanies] = useState([]);
//   const [formData, setFormData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sortBy, setSortBy] = useState('rating'); // 'rating' or 'certified'
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     // Load the saved form data and search results from Session Storage
//     const loadSessionData = () => {
//       try {
//         const savedFormData = sessionStorage.getItem('movingFormData');
//         const savedResults = sessionStorage.getItem('searchResults');
        
//         if (!savedFormData || !savedResults) {
//           // If no data is found, redirect back to home page
//           router.push('/');
//           return;
//         }
        
//         setFormData(JSON.parse(savedFormData));
//         setCompanies(JSON.parse(savedResults));
//         setLoading(false);
//       } catch (error) {
//         console.error('Error loading search results:', error);
//         setError('The search results could not be loaded. Please try again.');
//         setLoading(false);
//       }
//     };
    
//     loadSessionData();
//   }, [router]);

//   // Sort companies by selected criterion
//   const sortedCompanies = [...companies].sort((a, b) => {
//     if (sortBy === 'rating') {
//       // Sort by rating (highest first)
//       return b.averageRating - a.averageRating;
//     } else if (sortBy === 'certified') {
//       // Sort by certification (certified first)
//       if (a.isKisteKlarCertified && !b.isKisteKlarCertified) return -1;
//       if (!a.isKisteKlarCertified && b.isKisteKlarCertified) return 1;
//       // If certification is the same, sort by rating
//       return b.averageRating - a.averageRating;
//     }
//     return 0;
//   });

//   const handleSortChange = (value) => {
//     setSortBy(value);
//   };

//   const handleSelectCompany = (company) => {
//     setSelectedCompany(company);
//     setShowModal(true);
//   };

//   const handleConfirmSelection = () => {
//     // Save the selected company and form data for the order process
//     sessionStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
    
//     // Redirect to the order creation page
//     router.push('/order/create');
//   };

//   if (loading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <div className={styles.spinner}></div>
//         <h2 className={styles.loadingText}>Loading moving companies...</h2>
//         <p className={styles.loadingSubtext}>Please wait a moment.</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.errorContainer}>
//           <div className={styles.errorIcon}>⚠️</div>
//           <h2 className={styles.errorTitle}>An error occurred</h2>
//           <p className={styles.errorText}>{error}</p>
//           <button 
//             className={styles.primaryButton}
//             onClick={() => router.push('/')}
//           >
//             Back to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       {/* Header Section */}
//       <div className={styles.header}>
//         <h1 className={styles.title}>Moving Companies Found</h1>
//         <p className={styles.subtitle}>
//           From {formData?.fromAddress?.city || 'Start location'} to {formData?.toAddress?.city || 'Destination'}
//         </p>
//       </div>

//       {/* Filter Bar */}
//       <div className={styles.filterBar}>
//         <div className={styles.resultsCount}>
//           <h2 className={styles.resultsText}>
//             {companies.length} moving companies found
//           </h2>
//           <p className={styles.resultsSubtext}>
//             For {formData?.estimatedHours || 0} hours with {formData?.helpersCount || 0} helpers
//           </p>
//         </div>
        
//         <div className={styles.sortContainer}>
//           <span className={styles.sortLabel}>Sort by:</span>
//           <select
//             value={sortBy}
//             onChange={(e) => handleSortChange(e.target.value)}
//             className={styles.sortSelect}
//           >
//             <option value="rating">Best Rating</option>
//             <option value="certified">KisteKlar Certified</option>
//           </select>
//         </div>
//       </div>

//       {/* Companies List */}
//       <div className={styles.companiesList}>
//         {sortedCompanies.length > 0 ? (
//           sortedCompanies.map((company) => (
//             <div key={company._id} className={styles.companyCard}>
//               <div className={styles.companyHeader}>
//                 <div className={styles.companyInfo}>
//                   <div className={styles.companyLogo}>
//                     {company.logo ? (
//                       <Image 
//                         src={company.logo} 
//                         alt={`${company.companyName} Logo`}
//                         width={64}
//                         height={64}
//                         className={styles.logoImage} 
//                       />
//                     ) : (
//                       <div className={styles.logoPlaceholder}>
//                         <span>{company.companyName.charAt(0)}</span>
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className={styles.companyDetails}>
//                     <h3 className={styles.companyName}>{company.companyName}</h3>
//                     <div className={styles.ratingContainer}>
//                       <div className={styles.stars}>
//                         {[...Array(5)].map((_, i) => (
//                           <span 
//                             key={i} 
//                             className={i < Math.round(company.averageRating) ? styles.starFilled : styles.starEmpty}
//                           >
//                             ★
//                           </span>
//                         ))}
//                       </div>
//                       <span className={styles.reviewCount}>
//                         ({company.reviewsCount} {company.reviewsCount === 1 ? 'review' : 'reviews'})
//                       </span>
//                     </div>
//                   </div>
//                 </div>
                
//                 {company.isKisteKlarCertified && (
//                   <div className={styles.certificationBadge}>
//                     <svg className={styles.certIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                     KisteKlar Certified
//                   </div>
//                 )}
//               </div>
              
//               {/* Price */}
//               <div className={styles.priceContainer}>
//                 <div className={styles.priceHeader}>
//                   <span className={styles.priceLabel}>Hourly Rate:</span>
//                   <span className={styles.priceValue}>
//                     {company.hourlyRate * (formData?.helpersCount || 2)} €/hr
//                   </span>
//                 </div>
//                 <p className={styles.priceNote}>
//                   for {formData?.helpersCount || 2} helpers ({company.hourlyRate} € per helper/hr)
//                 </p>
//               </div>
              
//               {/* Expandable Section */}
//               <div className={styles.expandableSection}>
//                 {company.description && (
//                   <div className={styles.descriptionSection}>
//                     <h4 className={styles.sectionTitle}>Description</h4>
//                     <p className={styles.companyDescription}>{company.description}</p>
//                   </div>
//                 )}
                
//                 {company.serviceAreas && company.serviceAreas.length > 0 && (
//                   <div className={styles.serviceAreasSection}>
//                     <h4 className={styles.sectionTitle}>Service Areas</h4>
//                     <div className={styles.serviceAreasList}>
//                       {company.serviceAreas.map((area, index) => (
//                         <span key={index} className={styles.serviceAreaTag}>
//                           {area.from} → {area.to}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               {/* Action Buttons */}
//               <div className={styles.actionButtons}>
//                 <button
//                   type="button"
//                   className={styles.secondaryButton}
//                   onClick={() => {
//                     const element = document.getElementById(`company-details-${company._id}`);
//                     if (element) {
//                       element.classList.toggle(styles.expanded);
//                     }
//                   }}
//                 >
//                   Show More
//                 </button>
                
//                 <button
//                   type="button"
//                   className={styles.primaryButton}
//                   onClick={() => handleSelectCompany(company)}
//                 >
//                   Select
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className={styles.noResults}>
//             <div className={styles.noResultsIcon}>🔍</div>
//             <h3 className={styles.noResultsTitle}>No Moving Companies Found</h3>
//             <p className={styles.noResultsText}>
//               Unfortunately, no matching moving companies were found for your request.
//               Try different start or destination locations.
//             </p>
//             <button
//               className={styles.primaryButton}
//               onClick={() => router.push('/')}
//             >
//               Start New Search
//             </button>
//           </div>
//         )}
//       </div>
      
//       {/* Back Button */}
//       <div className={styles.backButtonContainer}>
//         <button 
//           onClick={() => router.push('/')}
//           className={styles.backButton}
//         >
//           <svg className={styles.backIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M7.70711 14.7071C7.31658 15.0976 6.68342 15.0976 6.29289 14.7071L2.29289 10.7071C1.90237 10.3166 1.90237 9.68342 2.29289 9.29289L6.29289 5.29289C6.68342 4.90237 7.31658 4.90237 7.70711 5.29289C8.09763 5.68342 8.09763 6.31658 7.70711 6.70711L5.41421 9H17C17.5523 9 18 9.44772 18 10C18 10.5523 17.5523 11 17 11H5.41421L7.70711 13.2929C8.09763 13.6834 8.09763 14.3166 7.70711 14.7071Z" fill="currentColor"/>
//           </svg>
//           Back to Home
//         </button>
//       </div>

//       {/* Confirmation Modal */}
//       {showModal && selectedCompany && (
//         <div className={styles.modalBackdrop}>
//           <div className={styles.modal}>
//             <div className={styles.modalHeader}>
//               <h3 className={styles.modalTitle}>Select Moving Company</h3>
//             </div>
//             <div className={styles.modalBody}>
//               <p className={styles.modalText}>
//                 Would you like to select the following moving company?
//               </p>
//               <div className={styles.modalCompanyCard}>
//                 <h4 className={styles.modalCompanyName}>{selectedCompany.companyName}</h4>
//                 <div className={styles.modalCompanyDetails}>
//                   <div className={styles.modalRating}>
//                     <span className={styles.modalRatingValue}>{selectedCompany.averageRating.toFixed(1)}</span>
//                     <span className={styles.modalRatingSeparator}>•</span>
//                     <span className={styles.modalReviewCount}>{selectedCompany.reviewsCount} reviews</span>
//                     {selectedCompany.isKisteKlarCertified && (
//                       <>
//                         <span className={styles.modalRatingSeparator}>•</span>
//                         <span className={styles.modalCertified}>
//                           <svg className={styles.modalCertIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                           </svg>
//                           KisteKlar certified
//                         </span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className={styles.modalPriceCard}>
//                 <div className={styles.modalPriceHeader}>
//                   <span className={styles.modalPriceLabel}>Estimated Price:</span>
//                   <span className={styles.modalPriceValue}>
//                     {formData ? (selectedCompany.hourlyRate * formData.helpersCount * formData.estimatedHours) : 0} €
//                   </span>
//                 </div>
//                 <p className={styles.modalPriceNote}>
//                   Based on {formData?.helpersCount || 2} helpers for {formData?.estimatedHours || 4} hours
//                 </p>
//               </div>
//             </div>
//             <div className={styles.modalFooter}>
//               <button
//                 type="button"
//                 onClick={() => setShowModal(false)}
//                 className={styles.modalSecondaryButton}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleConfirmSelection}
//                 className={styles.modalPrimaryButton}
//               >
//                 Select and Continue
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // src/app/search-results/page.jsx
// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from '@/components/ui/Image';
// import styles from '@/app/styles/SearchResults.module.css';

// // import connectDB from '@/lib/db';
// // import Company from '@/models/Company';
// // import mongoose from 'mongoose';

// // Mock user IDs for development
// const MOCK_userId = ['682c462f7f8348c9b55ce486','682c569c04ed6aa9c0b94ff4','682c588604ed6aa9c0b94ff9','68342aee1b085ff9560a34e5','683f07893e7edc6ca1554326']; 
  
// // Mock data for development
// const MOCK_FORM_DATA = {
//   fromAddress: {
//     city: 'Berlin',
//     postalCode: '10115',
//     street: 'Mockstraße 1'
//   },
//   toAddress: {
//     city: 'Munich',
//     postalCode: '80331',
//     street: 'Testallee 42'
//   },
//   moveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
//   estimatedHours: 5,
//   helpersCount: 2,
//   additionalServices: ['packing', 'furnitureAssembly']
// };

// const MOCK_COMPANIES = Array.from({ length: 5 }, (_, i) => ({
//   // Remove _id to let MongoDB generate it automatically
//   // _id: (i+100).toString(), // Generate a new ObjectId for each company
//   userId:MOCK_userId[i] , // Generate a valid ObjectId for userId
//   companyName: `Mock Moving Company ${2*i + 1}`,
//   address: {
//     street: `Musterstraße ${2*i + 10}`,
//     city: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'][i],
//     postalCode: `${10000 + 2*i * 1000}`,
//     country: 'Deutschland'
//   },
//   taxId: `DE${100000000 + 2*i}`, // Required field - mock German tax ID format
//   description: `This is a mock moving company description for testing purposes. Company ${i + 1} provides excellent service with ${i + 2} years of experience.`,
//   serviceAreas: [
//     { from: 'Berlin', to: 'Munich' },
//     { from: 'Hamburg', to: 'Frankfurt' }
//   ],
//   hourlyRate: 25 + (i * 5), // Required field
//   isVerified: i % 2 === 0,
//   isKisteKlarCertified: i % 3 === 0,
//   documents: {
//     businessLicense: {
//       url: i % 2 === 0 ? '/documents/business-license.pdf' : undefined,
//       verified: i % 2 === 0
//     },
//     kisteKlarCertificate: {
//       url: i % 3 === 0 ? '/documents/kiste-klar-cert.pdf' : undefined,
//       verified: i % 3 === 0
//     }
//   },
//   averageRating: 3.5 + (i * 0.5),
//   reviewsCount: 10 + (i * 5)
//   // createdAt will be set automatically by the schema default
// }));

// // await connectDB();
// // await Company.create(MOCK_COMPANIES)

// export default function SearchResults() {
//   const router = useRouter();
//   const [companies, setCompanies] = useState([]);
//   const [formData, setFormData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sortBy, setSortBy] = useState('rating'); // 'rating' or 'certified'
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [showModal, setShowModal] = useState(false);


//   const [usingMockData, setUsingMockData] = useState(false);


//   // Debug: Add console logs for component lifecycle
//   console.log('🔄 SearchResults component rendered');
//   console.log('📊 Current state:', {
//     companies: companies.length,
//     formData: !!formData,
//     loading,
//     error,
//     sortBy,
//     selectedCompany: !!selectedCompany,
//     showModal
//   });

//   // Check if we're in development mode
//   const isDev = process.env.NODE_ENV === 'development';

//   useEffect(() => {
//     const loadSessionData = () => {
//       try {
//         // In production or when we have session data, use that
//         const savedFormData = typeof window !== 'undefined' ? sessionStorage.getItem('movingFormData') : null;
//         const savedResults = typeof window !== 'undefined' ? sessionStorage.getItem('searchResults') : null;

//         if (savedFormData && savedResults) {
//           setFormData(JSON.parse(savedFormData));
//           setCompanies(JSON.parse(savedResults));
//           setLoading(false);
//           setUsingMockData(false);
//           return;
//         }

//         // In development mode, use mock data if no session data exists
//         if (isDev) {
//           console.warn('⚠️ No session data found - using development mock data');
//           setFormData(MOCK_FORM_DATA);
//           setCompanies(MOCK_COMPANIES);
//           setUsingMockData(true);
//           setLoading(false);
//           return;
//         }

//         // In production with no data, redirect
//         // router.push('/');

//       } catch (error) {
//         console.error('Error loading search results:', error);
//         setError(`Failed to load results: ${error.message}`);
//         setLoading(false);
//       }
//     };

//     const timer = setTimeout(() => {
//       loadSessionData();
//     }, 100);

//     return () => clearTimeout(timer);
//   }, [router, isDev]);

//   useEffect(() => {
//     console.log('🚀 useEffect triggered');
    
//     // Load the saved form data and search results from Session Storage
//     const loadSessionData = () => {
//       try {
//         console.log('📥 Loading session data...');
        
//         // Debug: Check if sessionStorage is available
//         if (typeof window === 'undefined') {
//           console.error('❌ Window is undefined - running on server?');
//           setError('Page not ready. Please refresh.');
//           setLoading(false);
//           return;
//         }

//         const savedFormData = sessionStorage.getItem('movingFormData');
//         const savedResults = sessionStorage.getItem('searchResults');
        
//         console.log('🔍 Session data check:', {
//           savedFormData: savedFormData ? 'Found' : 'Not found',
//           savedFormDataLength: savedFormData?.length || 0,
//           savedResults: savedResults ? 'Found' : 'Not found',
//           savedResultsLength: savedResults?.length || 0
//         });

//         // Debug: Log raw session data
//         if (savedFormData) {
//           console.log('📝 Raw form data:', savedFormData.substring(0, 100) + '...');
//         }
//         if (savedResults) {
//           console.log('📋 Raw results data:', savedResults.substring(0, 100) + '...');
//         }
        
//         if (!savedFormData || !savedResults) {
//           console.warn('⚠️ Missing session data, redirecting to home');
//           console.log('🏠 Redirecting to home page...');
//           // If no data is found, redirect back to home page
//           // router.push('/');
//           return;
//         }
        
//         // Parse the data
//         const parsedFormData = JSON.parse(savedFormData);
//         const parsedResults = JSON.parse(savedResults);
        
//         console.log('✅ Parsed form data:', parsedFormData);
//         console.log('✅ Parsed results:', {
//           companiesCount: parsedResults.length,
//           firstCompany: parsedResults[0] || 'No companies',
//           allCompanyNames: parsedResults.map(c => c.companyName)
//         });
        
//         setFormData(parsedFormData);
//         setCompanies(parsedResults);
//         setLoading(false);
        
//         console.log('🎉 Session data loaded successfully');
//       } catch (error) {
//         console.error('💥 Error loading search results:', error);
//         console.error('📍 Error stack:', error.stack);
//         setError(`The search results could not be loaded: ${error.message}`);
//         setLoading(false);
//       }
//     };
    
//     // Add a small delay to ensure client-side rendering
//     const timer = setTimeout(() => {
//       loadSessionData();
//     }, 100);

//     return () => clearTimeout(timer);
//   }, [router]);

//   // Debug: Log when companies change
//   useEffect(() => {
//     console.log('📈 Companies state updated:', {
//       count: companies.length,
//       companies: companies.map(c => ({
//         id: c._id,
//         name: c.companyName,
//         rating: c.averageRating,
//         certified: c.isKisteKlarCertified
//       }))
//     });
//   }, [companies]);

//   // Sort companies by selected criterion
//   const sortedCompanies = [...companies].sort((a, b) => {
//     console.log('🔄 Sorting companies by:', sortBy);
    
//     if (sortBy === 'rating') {
//       // Sort by rating (highest first)
//       const result = b.averageRating - a.averageRating;
//       // console.log(`📊 Rating sort: ${a.companyName}(${a.averageRating}) vs ${b.companyName}(${b.averageRating}) = ${result}`);
//       return result;
//     } else if (sortBy === 'certified') {
//       // Sort by certification (certified first)
//       if (a.isKisteKlarCertified && !b.isKisteKlarCertified) {
//         // console.log(`✅ Cert sort: ${a.companyName} (certified) comes before ${b.companyName} (not certified)`);
//         return -1;
//       }
//       if (!a.isKisteKlarCertified && b.isKisteKlarCertified) {
//         // console.log(`✅ Cert sort: ${b.companyName} (certified) comes before ${a.companyName} (not certified)`);
//         return 1;
//       }
//       // If certification is the same, sort by rating
//       const result = b.averageRating - a.averageRating;
//       // console.log(`📊 Cert+Rating sort: ${a.companyName} vs ${b.companyName} = ${result}`);
//       return result;
//     }
//     return 0;
//   });

//   // // console.log('🏆 Final sorted companies:', sortedCompanies.map(c => `${c.companyName} (${c.averageRating}⭐, ${c.isKisteKlarCertified ? 'Certified' : 'Not certified'})`));

//   const handleSortChange = (value) => {
//     // console.log('🔄 Sort changed from', sortBy, 'to', value);
//     setSortBy(value);
//   };

//   const handleSelectCompany = (company) => {
    
//     // console.log('🎯 Company selected:', {
//     //   id: company._id,
//     //   name: company.companyName,
//     //   rating: company.averageRating
//     // });
//     setSelectedCompany(company);
//     setShowModal(true);
//   };

//   const handleConfirmSelection = () => {
//     // console.log('✅ Selection confirmed:', selectedCompany.companyName);
    
//     try {
//       // Save the selected company and form data for the order process
//       sessionStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
//       // console.log('💾 Selected company saved to session storage');
      
//       // Redirect to the order creation page
//       // console.log('🚀 Redirecting to order creation...');
//       router.push('/order/create');
//     } catch (error) {
//       console.error('💥 Error during selection confirmation:', error);
//       setError(`Failed to save selection: ${error.message}`);
//     }
//   };

//   // Debug: Log render conditions
//   // console.log('🎨 Render conditions:', { loading, error: !!error, companiesCount: companies.length });

//   if (loading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <div className={styles.spinner}></div>
//         <h2 className={styles.loadingText}>Loading moving companies...</h2>
//         <p className={styles.loadingSubtext}>Please wait a moment.</p>
//         <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
//           Debug: Loading state active
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     console.log('❌ Rendering error state:', error);
//     return (
//       <div className={styles.container}>
//         <div className={styles.errorContainer}>
//           <div className={styles.errorIcon}>⚠️</div>
//           <h2 className={styles.errorTitle}>An error occurred</h2>
//           <p className={styles.errorText}>{error}</p>
//           <div style={{ margin: '10px 0', fontSize: '12px', color: '#666', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
//             <strong>Debug Info:</strong><br/>
//             Error: {error}<br/>
//             Companies loaded: {companies.length}<br/>
//             Form data: {formData ? 'Present' : 'Missing'}<br/>
//             Session Storage: {typeof window !== 'undefined' && window.sessionStorage ? 'Available' : 'Not available'}
//           </div>
//           <button 
//             className={styles.primaryButton}
//             onClick={() => {
//               console.log('🏠 Error: Returning to home');
//               router.push('/');
//             }}
//           >
//             Back to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // console.log('✅ Rendering main content with', sortedCompanies.length, 'companies');

//   return (
//     <div className={styles.searchResultsContainer}>

//        {/* Development mode warning banner */}
//       {isDev && usingMockData && (
//         <div className={styles.devWarning}>
//           <strong>DEVELOPMENT MODE:</strong> Using mock data as no session data was found.
//           <button 
//             onClick={() => {
//               // Clear mock data flag and reload
//               setUsingMockData(false);
//               setLoading(true);
//               setTimeout(() => {
//                 const savedFormData = sessionStorage.getItem('movingFormData');
//                 const savedResults = sessionStorage.getItem('searchResults');
//                 if (savedFormData && savedResults) {
//                   setFormData(JSON.parse(savedFormData));
//                   setCompanies(JSON.parse(savedResults));
//                 }
//                 setLoading(false);
//               }, 100);
//             }}
//             className={styles.devWarningButton}
//           >
//             Try Reload Session Data
//           </button>
//         </div>
//       )}

//       {/* Debug Panel - Remove in production */}
//       <div style={{ 
//         background: '#f0f8ff', 
//         border: '1px solid #ccc', 
//         padding: '10px', 
//         margin: '10px 0', 
//         borderRadius: '4px',
//         fontSize: '12px'
//       }}>
//         <strong>🔧 Debug Panel:</strong><br/>
//         Companies: {companies.length} | Sorted: {sortedCompanies.length}<br/>
//         Form Data: {formData ? `${formData.fromAddress?.city} → ${formData.toAddress?.city}` : 'None'}<br/>
//         Sort: {sortBy} | Selected: {selectedCompany?.companyName || 'None'}<br/>
//         Modal: {showModal ? 'Open' : 'Closed'}
//       </div>

//       {/* Header Section */}
//       <div className={styles.searchResultsHeader}>
//         <h1 className={styles.title}>Moving Companies Found</h1>
//         <p className={styles.subtitle}>
//           From {formData?.fromAddress?.city || 'Start location'} to {formData?.toAddress?.city || 'Destination'}
//         </p>
//       </div>

//       {/* Filter Bar */}
//       <div className={styles.filterBar}>
//         <div className={styles.resultsCount}>
//           <h2 className={styles.resultsText}>
//             {companies.length} moving companies found
//           </h2>
//           <p className={styles.resultsSubtext}>
//             For {formData?.estimatedHours || 0} hours with {formData?.helpersCount || 0} helpers
//           </p>
//         </div>
        
//         <div className={styles.sortContainer}>
//           <span className={styles.sortLabel}>Sort by:</span>
//           <select
//             value={sortBy}
//             onChange={(e) => {
//               console.log('📝 Sort select changed:', e.target.value);
//               handleSortChange(e.target.value);
//             }}
//             className={styles.sortSelect}
//           >
//             <option value="rating">Best Rating</option>
//             <option value="certified">KisteKlar Certified</option>
//           </select>
//         </div>
//       </div>

//       {/* Companies List */}
//       <div className={styles.companiesList}>
//         {sortedCompanies.length > 0 ? (
//           sortedCompanies.map((company, index) => {
//             console.log(`🏢 Rendering company ${index + 1}:`, company.companyName);
            
//             return (
//               <div key={company._id} className={styles.companyCard}>
//                 <div className={styles.companyHeader}>
//                   <div className={styles.companyInfo}>
//                     <div className={styles.companyLogo}>
//                       {company.logo ? (
//                         <Image 
//                           src={company.logo} 
//                           alt={`${company.companyName} Logo`}
//                           width={64}
//                           height={64}
//                           className={styles.logoImage} 
//                         />
//                       ) : (
//                         <div className={styles.logoPlaceholder}>
//                           <span>{company.companyName.charAt(0)}</span>
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className={styles.companyDetails}>
//                       <h3 className={styles.companyName}>{company.companyName}</h3>
//                       <div className={styles.ratingContainer}>
//                         <div className={styles.stars}>
//                           {[...Array(5)].map((_, i) => (
//                             <span 
//                               key={i} 
//                               className={i < Math.round(company.averageRating) ? styles.starFilled : styles.starEmpty}
//                             >
//                               ★
//                             </span>
//                           ))}
//                         </div>
//                         <span className={styles.reviewCount}>
//                           ({company.reviewsCount} {company.reviewsCount === 1 ? 'review' : 'reviews'})
//                         </span>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {company.isKisteKlarCertified && (
//                     <div className={styles.certificationBadge}>
//                       <svg className={styles.certIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                       </svg>
//                       KisteKlar Certified
//                     </div>
//                   )}
//                 </div>
                
//                 {/* Price */}
//                 <div className={styles.priceContainer}>
//                   <div className={styles.priceHeader}>
//                     <span className={styles.priceLabel}>Hourly Rate:</span>
//                     <span className={styles.priceValue}>
//                       {company.hourlyRate * (formData?.helpersCount || 2)} €/hr
//                     </span>
//                   </div>
//                   <p className={styles.priceNote}>
//                     for {formData?.helpersCount || 2} helpers ({company.hourlyRate} € per helper/hr)
//                   </p>
//                 </div>
                
//                 {/* Expandable Section */}
//                 <div className={styles.expandableSection} id={`company-details-${company._id}`}>
//                   {company.description && (
//                     <div className={styles.descriptionSection}>
//                       <h4 className={styles.sectionTitle}>Description</h4>
//                       <p className={styles.companyDescription}>{company.description}</p>
//                     </div>
//                   )}
                  
//                   {company.serviceAreas && company.serviceAreas.length > 0 && (
//                     <div className={styles.serviceAreasSection}>
//                       <h4 className={styles.sectionTitle}>Service Areas</h4>
//                       <div className={styles.serviceAreasList}>
//                         {company.serviceAreas.map((area, areaIndex) => (
//                           <span key={areaIndex} className={styles.serviceAreaTag}>
//                             {area.from} → {area.to}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
                
//                 {/* Action Buttons */}
//                 <div className={styles.actionButtons}>
//                   <button
//                     type="button"
//                     className={styles.secondaryButton}
//                     onClick={() => {
//                       console.log('👁️ Show more clicked for:', company.companyName);
//                       const element = document.getElementById(`company-details-${company._id}`);
//                       if (element) {
//                         element.classList.toggle(styles.expanded);
//                         console.log('🔄 Toggled expanded class for:', company.companyName);
//                       } else {
//                         console.warn('❌ Could not find element:', `company-details-${company._id}`);
//                       }
//                     }}
//                   >
//                     Show More
//                   </button>
                  
//                   <button
//                     type="button"
//                     className={styles.primaryButton}
//                     onClick={() => {
//                       console.log('✅ Select button clicked for:', company.companyName);
//                       handleSelectCompany(company);
//                     }}
//                   >
//                     Select
//                   </button>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className={styles.noResults}>
//             <div className={styles.noResultsIcon}>🔍</div>
//             <h3 className={styles.noResultsTitle}>No Moving Companies Found</h3>
//             <p className={styles.noResultsText}>
//               Unfortunately, no matching moving companies were found for your request.
//               Try different start or destination locations.
//             </p>
//             <button
//               className={styles.primaryButton}
//               onClick={() => {
//                 console.log('🏠 No results: Starting new search');
//                 router.push('/');
//               }}
//             >
//               Start New Search
//             </button>
//           </div>
//         )}
//       </div>
      
// src/app/search-results/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/ui/Image';
import styles from '@/app/styles/SearchResults.module.css';

export default function SearchResults() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('rating');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadSessionData = () => {
      try {
        if (typeof window === 'undefined') {
          setError('Page not ready. Please refresh.');
          setLoading(false);
          return;
        }

        const savedFormData = sessionStorage.getItem('movingFormData');
        const savedResults = sessionStorage.getItem('searchResults');
        
        if (!savedFormData || !savedResults) {
          router.push('/');
          return;
        }
        
        const parsedFormData = JSON.parse(savedFormData);
        const parsedResults = JSON.parse(savedResults);
        
        setFormData(parsedFormData);
        setCompanies(parsedResults);
        setLoading(false);
      } catch (error) {
        setError(`The search results could not be loaded: ${error.message}`);
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      loadSessionData();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const sortedCompanies = [...companies].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.averageRating - a.averageRating;
    } else if (sortBy === 'certified') {
      if (a.isKisteKlarCertified && !b.isKisteKlarCertified) return -1;
      if (!a.isKisteKlarCertified && b.isKisteKlarCertified) return 1;
      return b.averageRating - a.averageRating;
    }
    return 0;
  });

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleConfirmSelection = () => {
    try {
      sessionStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
      router.push('/order/create');
    } catch (error) {
      setError(`Failed to save selection: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <h2 className={styles.loadingText}>Loading moving companies...</h2>
        <p className={styles.loadingSubtext}>Please wait a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>An error occurred</h2>
          <p className={styles.errorText}>{error}</p>
          <button 
            className={styles.primaryButton}
            onClick={() => router.push('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.searchResultsContainer}>
      {/* Header Section */}
      <div className={styles.searchResultsHeader}>
        <h1 className={styles.title}>Moving Companies Found</h1>
        <p className={styles.subtitle}>
          From {formData?.fromAddress?.city || 'Start location'} to {formData?.toAddress?.city || 'Destination'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.resultsCount}>
          <h2 className={styles.resultsText}>
            {companies.length} moving companies found
          </h2>
          <p className={styles.resultsSubtext}>
            For {formData?.estimatedHours || 0} hours with {formData?.helpersCount || 0} helpers
          </p>
        </div>
        
        <div className={styles.sortContainer}>
          <span className={styles.sortLabel}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="rating">Best Rating</option>
            <option value="certified">KisteKlar Certified</option>
          </select>
        </div>
      </div>

      {/* Companies List */}
      <div className={styles.companiesList}>
        {sortedCompanies.length > 0 ? (
          sortedCompanies.map((company) => (
            <div key={company._id} className={styles.companyCard}>
              <div className={styles.companyHeader}>
                <div className={styles.companyInfo}>
                  <div className={styles.companyLogo}>
                    {company.logo ? (
                      <Image 
                        src={company.logo} 
                        alt={`${company.companyName} Logo`}
                        width={64}
                        height={64}
                        className={styles.logoImage} 
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>
                        <span>{company.companyName.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.companyDetails}>
                    <h3 className={styles.companyName}>{company.companyName}</h3>
                    <div className={styles.ratingContainer}>
                      <div className={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={i < Math.round(company.averageRating) ? styles.starFilled : styles.starEmpty}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className={styles.reviewCount}>
                        ({company.reviewsCount} {company.reviewsCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                </div>
                
                {company.isKisteKlarCertified && (
                  <div className={styles.certificationBadge}>
                    <svg className={styles.certIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    KisteKlar Certified
                  </div>
                )}
              </div>
              
              <div className={styles.priceContainer}>
                <div className={styles.priceHeader}>
                  <span className={styles.priceLabel}>Hourly Rate:</span>
                  <span className={styles.priceValue}>
                    {company.hourlyRate * (formData?.helpersCount || 2)} €/hr
                  </span>
                </div>
                <p className={styles.priceNote}>
                  for {formData?.helpersCount || 2} helpers ({company.hourlyRate} € per helper/hr)
                </p>
              </div>
              
              <div className={styles.expandableSection} id={`company-details-${company._id}`}>
                {company.description && (
                  <div className={styles.descriptionSection}>
                    <h4 className={styles.sectionTitle}>Description</h4>
                    <p className={styles.companyDescription}>{company.description}</p>
                  </div>
                )}
                
                {company.serviceAreas && company.serviceAreas.length > 0 && (
                  <div className={styles.serviceAreasSection}>
                    <h4 className={styles.sectionTitle}>Service Areas</h4>
                    <div className={styles.serviceAreasList}>
                      {company.serviceAreas.map((area, areaIndex) => (
                        <span key={areaIndex} className={styles.serviceAreaTag}>
                          {area.from} → {area.to}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    const element = document.getElementById(`company-details-${company._id}`);
                    if (element) {
                      element.classList.toggle(styles.expanded);
                    }
                  }}
                >
                  Show More
                </button>
                
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => handleSelectCompany(company)}
                >
                  Select
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3 className={styles.noResultsTitle}>No Moving Companies Found</h3>
            <p className={styles.noResultsText}>
              Unfortunately, no matching moving companies were found for your request.
              Try different start or destination locations.
            </p>
            <button
              className={styles.primaryButton}
              onClick={() => router.push('/')}
            >
              Start New Search
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.backButtonContainer}>
        <button 
          onClick={() => router.push('/')}
          className={styles.backButton}
        >
          <svg className={styles.backIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.70711 14.7071C7.31658 15.0976 6.68342 15.0976 6.29289 14.7071L2.29289 10.7071C1.90237 10.3166 1.90237 9.68342 2.29289 9.29289L6.29289 5.29289C6.68342 4.90237 7.31658 4.90237 7.70711 5.29289C8.09763 5.68342 8.09763 6.31658 7.70711 6.70711L5.41421 9H17C17.5523 9 18 9.44772 18 10C18 10.5523 17.5523 11 17 11H5.41421L7.70711 13.2929C8.09763 13.6834 8.09763 14.3166 7.70711 14.7071Z" fill="currentColor"/>
          </svg>
          Back to Home
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedCompany && (
        <div className={styles.modalBackdrop} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Select Moving Company</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Would you like to select the following moving company?
              </p>
              <div className={styles.modalCompanyCard}>
                <h4 className={styles.modalCompanyName}>{selectedCompany.companyName}</h4>
                <div className={styles.modalCompanyDetails}>
                  <div className={styles.modalRating}>
                    <span className={styles.modalRatingValue}>{selectedCompany.averageRating.toFixed(1)}</span>
                    <span className={styles.modalRatingSeparator}>•</span>
                    <span className={styles.modalReviewCount}>{selectedCompany.reviewsCount} reviews</span>
                    {selectedCompany.isKisteKlarCertified && (
                      <>
                        <span className={styles.modalRatingSeparator}>•</span>
                        <span className={styles.modalCertified}>
                          <svg className={styles.modalCertIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          KisteKlar certified
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.modalPriceCard}>
                <div className={styles.modalPriceHeader}>
                  <span className={styles.modalPriceLabel}>Estimated Price:</span>
                  <span className={styles.modalPriceValue}>
                    {formData ? (selectedCompany.hourlyRate * formData.helpersCount * formData.estimatedHours) : 0} €
                  </span>
                </div>
                <p className={styles.modalPriceNote}>
                  Based on {formData?.helpersCount || 2} helpers for {formData?.estimatedHours || 4} hours
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={styles.modalSecondaryButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSelection}
                className={styles.modalPrimaryButton}
              >
                Select and Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}