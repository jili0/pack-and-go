// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useAuth } from "@/context/AuthContext";
// import "@/app/styles/styles.css";

// const RegisterForm = () => {
//   const router = useRouter();
//   const { register } = useAuth();

//   const [formData, setFormData] = useState({
//     name: "", email: "", phone: "", password: "", confirmPassword: "", role: "user", terms: false
//   });
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [registerError, setRegisterError] = useState(null);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
//     if (errors[name]) setErrors({ ...errors, [name]: null });
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name) newErrors.name = "Name is required";
//     if (!formData.email) newErrors.email = "Email address is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid";
//     if (!formData.phone) newErrors.phone = "Phone number is required";
//     if (!formData.password) newErrors.password = "Password is required";
//     else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters long";
//     if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
//     if (!formData.terms) newErrors.terms = "You must agree to the terms and conditions";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setIsSubmitting(true);
//     setRegisterError(null);

//     const { confirmPassword, terms, ...registrationData } = formData;

//     try {
//       const result = await register(registrationData);
//       if (result.success) {
//         router.push(formData.role === "user" ? "/user" : "/company/setup");
//       } else {
//         setRegisterError(result.message || "Registration failed");
//         setIsSubmitting(false);
//       }
//     } catch (error) {
//       setRegisterError("An error occurred. Please try again later.");
//       setIsSubmitting(false);
//     }
//   };

//   const FormField = ({ label, name, type = "text", placeholder, options }) => (
//     <div className="form-field">
//       <label htmlFor={name}>{label}</label>
//       {type === "select" ? (
//         <select id={name} name={name} value={formData[name]} onChange={handleChange} disabled={isSubmitting}>
//           {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//         </select>
//       ) : (
//         <input
//           type={type}
//           id={name}
//           name={name}
//           value={formData[name]}
//           onChange={handleChange}
//           placeholder={placeholder}
//           disabled={isSubmitting}
//         />
//       )}
//       {errors[name] && <p className="error-message">{errors[name]}</p>}
//     </div>
//   );

//   return (
//     <div className="register-form-container">
//       <h1>Registration</h1>
//       <p>Create an account to use Pack & Go.</p>

//       {registerError && (
//         <div className="error-alert">
//           <div className="error-icon">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <circle cx="12" cy="12" r="10"></circle>
//               <line x1="12" y1="8" x2="12" y2="12"></line>
//               <line x1="12" y1="16" x2="12.01" y2="16"></line>
//             </svg>
//           </div>
//           <p>{registerError}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="register-form">
//         <FormField label="Name" name="name" placeholder="First and Last Name" />
//         <FormField label="Email Address" name="email" type="email" placeholder="example@email.com" />
//         <FormField label="Phone Number" name="phone" type="tel" placeholder="+49 123 4567890" />
//         <FormField label="Password" name="password" type="password" placeholder="At least 6 characters" />
//         <FormField label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" />
//         <FormField 
//           label="Account Type" 
//           name="role" 
//           type="select" 
//           options={[
//             { value: "user", label: "Customer" },
//             { value: "company", label: "Moving Company" }
//           ]} 
//         />

//         <div className="checkbox-field">
//           <input
//             type="checkbox"
//             id="terms"
//             name="terms"
//             checked={formData.terms}
//             onChange={handleChange}
//             disabled={isSubmitting}
//           />
//           <label htmlFor="terms">
//             I agree to the <Link href="/placeholder" target="_blank">Terms and Conditions</Link> and <Link href="/placeholder" target="_blank">Privacy Policy</Link>.
//           </label>
//           {errors.terms && <p className="error-message">{errors.terms}</p>}
//         </div>

//         <button type="submit" disabled={isSubmitting} className="submit-button">
//           {isSubmitting ? "Registering..." : "Register"}
//         </button>
//       </form>

//       <div className="login-link">
//         <p>Already registered? <Link href="/login">Sign in now</Link></p>
//       </div>
//     </div>
//   );
// };

// export default RegisterForm;