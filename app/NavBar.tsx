"use client";

import { handleLogout } from "../lib/actions/acttion";



export default function NavBar({ role }: { role: "candidate" | "admin" | null }) {
  const dashboardHref = role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav style={styles.nav}>
      <div style={styles.leftGroup}>
        <a href={dashboardHref} style={styles.link}>Dashboard</a>
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

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "#052e02",
    color: "white",
  },
  leftGroup: {
    display: "flex",
    gap: "20px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "15px",
  },
  rightGroup: {
    display: "flex",
    alignItems: "center",
  },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid white",
    color: "white",
    padding: "6px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};