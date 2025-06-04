// // src/app/order/create/page.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import Link from 'next/link';
// import Image from '@/components/ui/Image';
// import styles from '@/app/styles/Order.module.css';
// import AddressForm from '@/components/forms/AddressForm';

// export default function CreateOrder() {
//   const router = useRouter();
//   // const { user } = useAuth();

//   const { user, loading: authLoading } = useAuth(); // 添加 authLoading 状态

//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [formData, setFormData] = useState({
//     fromAddress: {},
//     toAddress: {},
//     helpersCount: 2,
//     estimatedHours: 4,
//     preferredDates: ['', '', ''],
//     notes: ''
//   });

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [totalPrice, setTotalPrice] = useState(0);



//   // // Load saved data from session storage
//   // useEffect(() => {
//   //   if (!user) {
//   //     // Redirect to login if user is not logged in
//   //     router.push('/login?redirect=order/create');
//   //     return;
//   //   }

//   //   const loadSessionData = async () => {
//   //     try {
//   //       const savedCompany = sessionStorage.getItem('selectedCompany');
//   //       const savedFormData = sessionStorage.getItem('movingFormData');
//   //       debugger;
//   //       console.log('Loading session data:', { savedCompany, savedFormData });
//   //       if (!savedCompany || !savedFormData) {
//   //         // Redirect to home if no data is found
//   //         router.push('/');
//   //         return;
//   //       }

//   //       const parsedCompany = JSON.parse(savedCompany);
//   //       const parsedFormData = JSON.parse(savedFormData);

//   //       setSelectedCompany(parsedCompany);
//   //       setFormData({
//   //         ...parsedFormData,
//   //         notes: ''
//   //       });

//   //       // Calculate total price
//   //       const hourlyRate = parsedCompany.hourlyRate || 50;
//   //       const price = hourlyRate * parsedFormData.helpersCount * parsedFormData.estimatedHours;
//   //       setTotalPrice(price);

//   //       setLoading(false);
//   //     } catch (error) {
//   //       console.error('Error loading order data:', error);
//   //       setError('Failed to load order data. Please try again.');
//   //       setLoading(false);
//   //     }
//   //   };

//   //   loadSessionData();
//   // }, [user, router]);

//   const handleFromAddressChange = (address) => {
//     setFormData({ ...formData, fromAddress: address });
//   };

//   const handleToAddressChange = (address) => {
//     setFormData({ ...formData, toAddress: address });
//   };

//   const handleDateChange = (index, e) => {
//     const newDates = [...formData.preferredDates];
//     newDates[index] = e.target.value;
//     setFormData({ ...formData, preferredDates: newDates });
//   };

//   const handleNotesChange = (e) => {
//     setFormData({ ...formData, notes: e.target.value });
//   };

//   const validateForm = () => {
//     // Check if from address is complete
//     if (!formData.fromAddress.street || !formData.fromAddress.city || !formData.fromAddress.postalCode) {
//       setError('Please complete the origin address.');
//       return false;
//     }

//     // Check if to address is complete
//     if (!formData.toAddress.street || !formData.toAddress.city || !formData.toAddress.postalCode) {
//       setError('Please complete the destination address.');
//       return false;
//     }

//     // Check if at least one preferred date is selected
//     if (!formData.preferredDates[0]) {
//       setError('Please select at least one preferred date.');
//       return false;
//     }

//     // Validate that dates are in the future
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     for (const date of formData.preferredDates) {
//       if (date) {
//         const selectedDate = new Date(date);
//         if (selectedDate < today) {
//           setError('Selected dates must be in the future.');
//           return false;
//         }
//       }
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setSubmitting(true);
//     setError(null);

//     try {
//       // Prepare order data
//       const orderData = {
//         companyId: selectedCompany.userId,
//         fromAddress: formData.fromAddress,
//         toAddress: formData.toAddress,
//         preferredDates: formData.preferredDates.filter(date => date),
//         helpersCount: formData.helpersCount,
//         estimatedHours: formData.estimatedHours,
//         totalPrice: totalPrice,
//         notes: formData.notes
//       };

//       // Send request to create order
//       const response = await fetch('/api/orders', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(orderData),
//       });

//       const data = await response.json();

//       if (data.success) {
//         // Clear session storage data
//         sessionStorage.removeItem('selectedCompany');
//         sessionStorage.removeItem('movingFormData');
//         sessionStorage.removeItem('searchResults');

//         // Redirect to order confirmation page
//         router.push(`/order/${data.order._id}/confirmation`);
//       } else {
//         setError(data.message || 'Failed to create order. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error creating order:', error);
//       setError('An error occurred. Please try again later.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString('en-US', options);
//   };

//     if (authLoading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <div className={styles.spinner}></div>
//         <p>Authenticating...</p>
//       </div>
//     );
//   }
//   if (loading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <div className={styles.spinner}></div>
//         <p>Loading order details...</p>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.createOrderPage}>
//       <div className={styles.container}>
//         <div className={styles.pageHeader}>
//           <h1>Create Order</h1>
//           <p>Review your details and confirm your booking</p>
//         </div>

//         {error && (
//           <div className={styles.errorAlert}>
//             <div className={styles.errorIcon}>!</div>
//             <p>{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           {/* Company Information */}
//           <div className={styles.card}>
//             <div className={styles.cardHeader}>
//               <h2>Selected Moving Company</h2>
//             </div>
//             <div className={styles.cardBody}>
//               <div className={styles.companyInfo}>
//                 {/* <div className={styles.companyLogo}>
//                   {selectedCompany.logo ? (
//                     <Image 
//                       src={selectedCompany.logo} 
//                       alt={selectedCompany.companyName} 
//                       width={80} 
//                       height={80} 
//                     />
//                   ) : (
//                     <div className={styles.logoPlaceholder}>
//                       <span>{selectedCompany.companyName.charAt(0)}</span>
//                     </div>
//                   )}
//                 </div> */}
//                 <div className={styles.companyDetails}>
//                   <h3>{selectedCompany.companyName}</h3>
//                   <div className={styles.ratingContainer}>
//                     <div className={styles.stars}>
//                       {[...Array(5)].map((_, i) => (
//                         <span
//                           key={i}
//                           className={i < Math.round(selectedCompany.averageRating) ? styles.starFilled : styles.starEmpty}
//                         >
//                           ★
//                         </span>
//                       ))}
//                     </div>
//                     <span className={styles.reviewCount}>
//                       ({selectedCompany.reviewsCount} {selectedCompany.reviewsCount === 1 ? 'review' : 'reviews'})
//                     </span>
//                   </div>
//                   {selectedCompany.isKisteKlarCertified && (
//                     <div className={styles.certifiedBadge}>
//                       <svg className={styles.certifiedIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                       KisteKlar Certified
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {selectedCompany.description && (
//                 <div className={styles.companyDescription}>
//                   <h4>About the Company</h4>
//                   <p>{selectedCompany.description}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Address Information */}
//           <div className={styles.card}>
//             <div className={styles.cardHeader}>
//               <h2>Moving Addresses</h2>
//             </div>
//             <div className={styles.cardBody}>
//               <div className={styles.addressesContainer}>
//                 <div className={styles.addressForm}>
//                   <h3>Origin</h3>
//                   <AddressForm
//                     initialValues={formData.fromAddress}
//                     onChange={handleFromAddressChange}
//                   />
//                 </div>
//                 <div className={styles.addressArrow}>→</div>
//                 <div className={styles.addressForm}>
//                   <h3>Destination</h3>
//                   <AddressForm
//                     initialValues={formData.toAddress}
//                     onChange={handleToAddressChange}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Moving Details */}
//           <div className={styles.card}>
//             <div className={styles.cardHeader}>
//               <h2>Moving Details</h2>
//             </div>
//             <div className={styles.cardBody}>
//               <div className={styles.detailsGrid}>
//                 <div className={styles.detailGroup}>
//                   <label className={styles.detailLabel}>Number of Helpers</label>
//                   <div className={styles.detailValue}>{formData.helpersCount}</div>
//                 </div>

//                 <div className={styles.detailGroup}>
//                   <label className={styles.detailLabel}>Estimated Hours</label>
//                   <div className={styles.detailValue}>{formData.estimatedHours}</div>
//                 </div>
//               </div>

//               <div className={styles.datePicker}>
//                 <h3>Preferred Dates</h3>
//                 <p className={styles.dateInfo}>
//                   Please select up to three preferred dates for your move. The company will confirm one of these dates.
//                 </p>

//                 <div className={styles.dateInputs}>
//                   {[0, 1, 2].map((index) => (
//                     <div key={index} className={styles.dateInputGroup}>
//                       <label className={styles.dateLabel}>
//                         {index === 0 ? (
//                           <span className={styles.primaryDate}>Primary Date*</span>
//                         ) : (
//                           `Alternative ${index}`
//                         )}
//                       </label>
//                       <input
//                         type="date"
//                         value={formData.preferredDates[index] || ''}
//                         onChange={(e) => handleDateChange(index, e)}
//                         min={new Date().toISOString().split('T')[0]}
//                         required={index === 0}
//                         className={styles.dateInput}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className={styles.notesSection}>
//                 <h3>Additional Notes</h3>
//                 <textarea
//                   value={formData.notes}
//                   onChange={handleNotesChange}
//                   placeholder="Add any special instructions or information for the moving company..."
//                   className={styles.notesInput}
//                   rows={4}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Price Summary */}
//           <div className={styles.card}>
//             <div className={styles.cardHeader}>
//               <h2>Price Summary</h2>
//             </div>
//             <div className={styles.cardBody}>
//               <div className={styles.priceBreakdown}>
//                 <div className={styles.priceRow}>
//                   <span>Hourly Rate per Helper</span>
//                   <span>{selectedCompany.hourlyRate} €</span>
//                 </div>
//                 <div className={styles.priceRow}>
//                   <span>Number of Helpers</span>
//                   <span>{formData.helpersCount}</span>
//                 </div>
//                 <div className={styles.priceRow}>
//                   <span>Estimated Hours</span>
//                   <span>{formData.estimatedHours}</span>
//                 </div>
//                 <div className={styles.priceDivider}></div>
//                 <div className={styles.priceTotalRow}>
//                   <span>Total Price</span>
//                   <span className={styles.totalPrice}>{totalPrice} €</span>
//                 </div>
//               </div>

//               <p className={styles.priceNote}>
//                 Note: The final price may vary based on the actual duration of the move.
//               </p>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className={styles.actionButtons}>
//             <Link href="/search-results" className={styles.backButton}>
//               Back to Results
//             </Link>
//             <button
//               type="submit"
//               className={styles.submitButton}
//               disabled={submitting}
//             >
//               {submitting ? (
//                 <>
//                   <div className={styles.buttonSpinner}></div>
//                   Submitting...
//                 </>
//               ) : (
//                 'Confirm and Book Now'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


// src/app/order/create/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from '@/components/ui/Image';
import styles from '@/app/styles/Order.module.css';
import AddressForm from '@/components/forms/AddressForm';

export default function CreateOrder() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // 添加 authLoading 状态

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    fromAddress: {},
    toAddress: {},
    helpersCount: 2,
    estimatedHours: 4,
    preferredDates: ['', '', ''],
    notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  // const [debugInfo, setDebugInfo] = useState([]); // 添加调试信息状态

  // // 添加调试函数
  // const addDebugInfo = (message) => {
  //   console.log(`[DEBUG] ${message}`);
  //   setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  // };

  // Load saved data from session storage
  useEffect(() => {
    // addDebugInfo('useEffect started');
    // addDebugInfo(`User status: ${user ? 'logged in' : 'not logged in'}`);
    // addDebugInfo(`Auth loading: ${authLoading}`);

    // 等待认证完成
    if (authLoading) {
      // addDebugInfo('Waiting for auth to complete...');
      return;
    }

    if (!user) {
      // addDebugInfo('User not logged in, redirecting to login');
      // Redirect to login if user is not logged in
      router.push('/login?redirect=order/create');
      return;
    }

    const loadSessionData = async () => {
      try {
        // addDebugInfo('Loading session data...');

        const savedCompany = sessionStorage.getItem('selectedCompany');
        const savedFormData = sessionStorage.getItem('movingFormData');

        // addDebugInfo(`savedCompany exists: ${!!savedCompany}`);
        // addDebugInfo(`savedFormData exists: ${!!savedFormData}`);

        if (!savedCompany) {
          router.push('/');
          return;
        }

        // if (!savedCompany || !savedFormData) {
        if ( !savedFormData) {
          // addDebugInfo('Missing session data, using mock data for development');

          // 开发模式：使用模拟数据
          // const mockCompany = {
          //   _id: 'mock_company_001',
          //   companyName: 'Test Moving Company',
          //   hourlyRate: 45,
          //   averageRating: 4.5,
          //   reviewsCount: 23,
          //   isKisteKlarCertified: true,
          //   description: 'A reliable moving company for testing purposes.',
          //   logo: null
          // };

          const mockFormData = {
            fromAddress: {
              street: '123 Test Street',
              city: 'Test City',
              postalCode: '12345',
              country: 'Germany'
            },
            toAddress: {
              street: '456 Destination Ave',
              city: 'New City',
              postalCode: '67890',
              country: 'Germany'
            },
            helpersCount: 2,
            estimatedHours: 4,
            preferredDates: ['', '', '']
          };

           setSelectedCompany(JSON.parse(savedCompany));
          setFormData({
            ...mockFormData,
            notes: ''
          });

          // Calculate total price with mock data
          // const price = mockCompany.hourlyRate * mockFormData.helpersCount * mockFormData.estimatedHours;
          const price = mockFormData.helpersCount * mockFormData.estimatedHours;
          setTotalPrice(price);

          // addDebugInfo(`Using mock data - Price: ${price} €`);
          setLoading(false);
          return;

          // 生产模式：重定向到首页 (注释掉以启用开发模式)
          // router.push('/');
          // return;
        }

        // addDebugInfo('Parsing session data...');
        const parsedCompany = JSON.parse(savedCompany);
        const parsedFormData = JSON.parse(savedFormData);

        // addDebugInfo(`Company: ${parsedCompany?.companyName || 'Unknown'}`);
        // addDebugInfo(`Form data helpers: ${parsedFormData?.helpersCount || 'Unknown'}`);

        setSelectedCompany(parsedCompany);
        setFormData({
          ...parsedFormData,
          notes: ''
        });

        // Calculate total price
        const hourlyRate = parsedCompany.hourlyRate || 50;
        const price = hourlyRate * parsedFormData.helpersCount * parsedFormData.estimatedHours;
        setTotalPrice(price);

        // addDebugInfo(`Price calculated: ${price} €`);
        // addDebugInfo('Data loaded successfully');
        setLoading(false);
      } catch (error) {
        console.error('Error loading order data:', error);
        // addDebugInfo(`Error loading data: ${error.message}`);
        setError('Failed to load order data. Please try again.');
        setLoading(false);
      }
    };

    loadSessionData();
  }, [user, router, authLoading]); // 添加 authLoading 依赖

  const handleFromAddressChange = (address) => {
    setFormData({ ...formData, fromAddress: address });
  };

  const handleToAddressChange = (address) => {
    setFormData({ ...formData, toAddress: address });
  };

  const handleDateChange = (index, e) => {
    const newDates = [...formData.preferredDates];
    newDates[index] = e.target.value;
    setFormData({ ...formData, preferredDates: newDates });
  };

  const handleNotesChange = (e) => {
    setFormData({ ...formData, notes: e.target.value });
  };

  const validateForm = () => {
    // Check if from address is complete
    if (!formData.fromAddress.street || !formData.fromAddress.city || !formData.fromAddress.postalCode) {
      setError('Please complete the origin address.');
      return false;
    }

    // Check if to address is complete
    if (!formData.toAddress.street || !formData.toAddress.city || !formData.toAddress.postalCode) {
      setError('Please complete the destination address.');
      return false;
    }

    // Check if at least one preferred date is selected
    if (!formData.preferredDates[0]) {
      setError('Please select at least one preferred date.');
      return false;
    }

    // Validate that dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const date of formData.preferredDates) {
      if (date) {
        const selectedDate = new Date(date);
        if (selectedDate < today) {
          setError('Selected dates must be in the future.');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Prepare order data
      const orderData = {
        companyId: selectedCompany.userId,
        fromAddress: formData.fromAddress,
        toAddress: formData.toAddress,
        preferredDates: formData.preferredDates.filter(date => date),
        helpersCount: formData.helpersCount,
        estimatedHours: formData.estimatedHours,
        totalPrice: totalPrice,
        notes: formData.notes
      };
// debugger;
      // Send request to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // Clear session storage data
        sessionStorage.removeItem('selectedCompany');
        sessionStorage.removeItem('movingFormData');
        sessionStorage.removeItem('searchResults');

        // Redirect to order confirmation page
        router.push(`/order/${data.order._id}/confirmation`);
      } else {
        setError(data.message || 'Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };


  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className={styles.createOrderPage}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1>Create Order</h1>
          <p>Review your details and confirm your booking</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorIcon}>!</div>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Company Information */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Selected Moving Company</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.companyInfo}>
                <div className={styles.companyLogo}>
                  {selectedCompany?.logo ? (
                    <Image
                      src={selectedCompany.logo}
                      alt={selectedCompany.companyName}
                      width={80}
                      height={80}
                    />
                  ) : (
                    <div className={styles.logoPlaceholder}>
                      <span>{selectedCompany?.companyName?.charAt(0) || '?'}</span>
                    </div>
                  )}
                </div>
                <div className={styles.companyDetails}>
                  <h3>{selectedCompany?.companyName || 'Unknown Company'}</h3>
                  <div className={styles.ratingContainer}>
                    <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.round(selectedCompany?.averageRating || 0) ? styles.starFilled : styles.starEmpty}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className={styles.reviewCount}>
                      ({selectedCompany?.reviewsCount || 0} {selectedCompany?.reviewsCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  {selectedCompany?.isKisteKlarCertified && (
                    <div className={styles.certifiedBadge}>
                      <svg className={styles.certifiedIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      KisteKlar Certified
                    </div>
                  )}
                </div>
              </div>

              {selectedCompany?.description && (
                <div className={styles.companyDescription}>
                  <h4>About the Company</h4>
                  <p>{selectedCompany.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Moving Addresses</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.addressesContainer}>
                <div className={styles.addressForm}>
                  <h3>Origin</h3>
                  <AddressForm
                    initialValues={formData.fromAddress}
                    onChange={handleFromAddressChange}
                  />
                </div>
                <div className={styles.addressArrow}>→</div>
                <div className={styles.addressForm}>
                  <h3>Destination</h3>
                  <AddressForm
                    initialValues={formData.toAddress}
                    onChange={handleToAddressChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Moving Details */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Moving Details</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailGroup}>
                  <label className={styles.detailLabel}>Number of Helpers</label>
                  <div className={styles.detailValue}>{formData.helpersCount}</div>
                </div>

                <div className={styles.detailGroup}>
                  <label className={styles.detailLabel}>Estimated Hours</label>
                  <div className={styles.detailValue}>{formData.estimatedHours}</div>
                </div>
              </div>

              <div className={styles.datePicker}>
                <h3>Preferred Dates</h3>
                <p className={styles.dateInfo}>
                  Please select up to three preferred dates for your move. The company will confirm one of these dates.
                </p>

                <div className={styles.dateInputs}>
                  {[0, 1, 2].map((index) => (
                    <div key={index} className={styles.dateInputGroup}>
                      <label className={styles.dateLabel}>
                        {index === 0 ? (
                          <span className={styles.primaryDate}>Primary Date*</span>
                        ) : (
                          `Alternative ${index}`
                        )}
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDates[index] || ''}
                        onChange={(e) => handleDateChange(index, e)}
                        min={new Date().toISOString().split('T')[0]}
                        required={index === 0}
                        className={styles.dateInput}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.notesSection}>
                <h3>Additional Notes</h3>
                <textarea
                  value={formData.notes}
                  onChange={handleNotesChange}
                  placeholder="Add any special instructions or information for the moving company..."
                  className={styles.notesInput}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Price Summary</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Hourly Rate per Helper</span>
                  <span>{selectedCompany?.hourlyRate || 0} €</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Number of Helpers</span>
                  <span>{formData.helpersCount}</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Estimated Hours</span>
                  <span>{formData.estimatedHours}</span>
                </div>
                <div className={styles.priceDivider}></div>
                <div className={styles.priceTotalRow}>
                  <span>Total Price</span>
                  <span className={styles.totalPrice}>{totalPrice} €</span>
                </div>
              </div>

              <p className={styles.priceNote}>
                Note: The final price may vary based on the actual duration of the move.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <Link href="/search-results" className={styles.backButton}>
              Back to Results
            </Link>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  Submitting...
                </>
              ) : (
                'Confirm and Book Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}