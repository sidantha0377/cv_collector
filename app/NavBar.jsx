'use client';
import { useRouter } from "next/navigation"; 
import {handleLogout} from "../lib/actions/acttion"
export default function NavBar() {
  const router = useRouter(); 


  return (
    <nav style={styles.nav}>
      <div style={styles.leftGroup}>
        {/* Use Next.js Link components here for better performance later */}
        <a href="/dashboard" style={styles.link}>Dashboard</a>
        <a href="/jobs" style={styles.link}>Jobs</a>
      </div>

      <div style={styles.rightGroup}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Log out
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #ddd',
    fontFamily: 'sans-serif'
  },
  leftGroup: {
    display: 'flex',
    gap: '20px'
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: '500'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};