import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/styles/UserDashboard.module.css'; // CSS Module import
import OrderDetails from '@/components/dashboard/OrderDetails';

export default function UserDashboard() {

    
 
  return (
    <div className={styles.userDashboard}>
    
       Hiiiiiiiiiiiiiiiiiiiiiiiiii, order Id

       <OrderDetails />
    </div>
  );
}