'use client';
import { useRouter } from 'next/navigation';
export default function Navbar() {
  const router = useRouter();
  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between">
      <span className="font-bold">Billing System</span>
      <button className="bg-red-500 px-3 py-1 rounded" onClick={() => {
        localStorage.removeItem('user');
        router.push('/login');
      }}>Logout</button>
    </div>
  );
}
