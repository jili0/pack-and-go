// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { useState } from 'react';

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const redirectTo = searchParams.get('redirect') || '/user';

//   const { login } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await login(email, password);
//       router.push(redirectTo);
//     } catch (err) {
//       setError('Login fehlgeschlagen.');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />
//       <input
//         type="password"
//         placeholder="Passwort"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />
//       {error && <p className="text-red-500">{error}</p>}
//       <button type="submit">Loginnn</button>
//     </form>
//   );
// }
