'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from '../app/login/login.module.css';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false); // ✅ Add mount check
  const router = useRouter();

  useEffect(() => {
    setMounted(true); // ✅ Mark as mounted

    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (loggedUser) {
      if (loggedUser.role === 'admin') router.push('/admin');
      else if (loggedUser.role === 'cashier') router.push('/cashier');
    }
  }, []);

  const handleLogin = async () => {
    if (!mobile || !password) {
      alert('Please enter both mobile and password');
      return;
    }

    try {
      const res = await axios.post('/api/login', { mobile, password });

      if (res.data.success) {
        const user = res.data.user;

        if (user.status !== 'yes') {
          alert('You are not allowed to login. Please contact admin.');
          return;
        }

        localStorage.setItem('user', JSON.stringify(user));
        if (user.role === 'admin') router.push('/admin');
        else router.push('/cashier');
      } else {
        alert(res.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  // ✅ Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>🔐 Login</h2>
        <input
          type="text"
          placeholder="📱 Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="🔑 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleLogin} className={styles.button}>Login</button>
      </div>
    </div>
  );
}
