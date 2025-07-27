'use client';

import { useRouter } from 'next/navigation';
import './globals.css';

export default function HomePage() {
  const router = useRouter();

  const handleRedirect = (role) => {
    router.push(`/login?role=${role}`);
  };

  return (
    <main
      style={{
        padding: '50px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      <h1>Welcome to Smart Billing System 💸</h1>
      <p>Choose your role to continue:</p>

      <div
        style={{
          marginTop: '30px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
        }}
      >
        <button style={buttonStyle} onClick={() => handleRedirect('admin')}>
          Admin Dashboard
        </button>
        <button style={buttonStyle} onClick={() => handleRedirect('cashier')}>
          Cashier Panel
        </button>
      </div>
    </main>
  );
}

const buttonStyle = {
  padding: '15px 25px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  cursor: 'pointer',
};
