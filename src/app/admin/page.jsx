'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ correct import

import Navbar from '@/components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function AdminPage() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [cashierData, setCashierData] = useState({ name: '', mobile: '', password: '' });
  const [selectedCashier, setSelectedCashier] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchBills();
    fetchCashiers();
  }, []);

  useEffect(() => {
    filterBills();
  }, [selectedCashier, selectedDate, bills]);

  const fetchBills = async () => {
    const res = await axios.get('/api/bills');
    setBills(res.data);
  };

  const fetchCashiers = async () => {
    const res = await axios.get('/api/cashiers');
    setCashiers(res.data);
  };

const exportPDF = () => {
  const doc = new jsPDF();

  doc.text('Bill Report', 14, 10);

  autoTable(doc, {
    startY: 20,
    head: [['Customer', 'Cashier', 'Total', 'Date']],
    body: filteredBills.map(b => [
      b.customerName,
      b.cashier,
      `Rs. ${b.total}`,
      new Date(b.createdAt).toLocaleDateString('en-GB') // dd-mm-yyyy
    ])
  });

  doc.save('report.pdf');
};



  const handleCashierSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/cashiers', {
      ...cashierData,
      role: 'cashier',
      status: 'yes'
    });
    toast.success('Cashier added successfully');
    setShowPopup(false);
    setCashierData({ name: '', mobile: '', password: '' });
    fetchCashiers();
  };

  const toggleStatus = async (cashier) => {
    const newStatus = cashier.status === 'yes' ? 'no' : 'yes';
    await axios.put(`/api/cashiers/${cashier.mobile}`, { status: newStatus });
    fetchCashiers();
    toast.success('Status updated');
  };

  const filterBills = () => {
    let filtered = bills;
    if (selectedCashier) {
      filtered = filtered.filter(b => b.cashier === selectedCashier);
    }
    if (selectedDate) {
      filtered = filtered.filter(b =>
        new Date(b.createdAt).toDateString() === new Date(selectedDate).toDateString()
      );
    }
    setFilteredBills(filtered);
  };

  const chartData = {
    labels: [...new Set(filteredBills.map(b => {
      const d = new Date(b.createdAt);
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }))],
    datasets: [{
      label: 'Total Amount',
      data: filteredBills.reduce((acc, b) => {
        const d = new Date(b.createdAt);
        const date = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        acc[date] = (acc[date] || 0) + b.total;
        return acc;
      }, {}),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
    }]
  };
  chartData.datasets[0].data = chartData.labels.map(date => chartData.datasets[0].data[date] || 0);

  const summaryByCashier = cashiers.map(c => {
    const theirBills = bills.filter(b => b.cashier === c.name);
    const total = theirBills.reduce((sum, b) => sum + b.total, 0);
    return { name: c.name, count: theirBills.length, total };
  });

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="p-6 bg-gradient-to-b from-sky-50 to-white min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Admin Dashboard</h1>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6 justify-center">
          <button onClick={exportPDF} className="bg-green-600 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transition">
            Export PDF
          </button>
          <button onClick={() => setShowPopup(true)} className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transition">
            ➕ Add New Cashier
          </button>
        </div>

        {/* Billing Summary by Cashier */}
        <div className="overflow-x-auto mb-10 rounded-xl shadow-md border border-gray-300">
          <h2 className="text-xl font-semibold bg-yellow-100 p-4 rounded-t-xl">Billing Summary by Cashier</h2>
          <table className="min-w-full text-sm bg-white rounded-b-xl text-left">
            <thead className="bg-yellow-50 border-b font-semibold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Cashier</th>
                <th className="p-3">Bills</th>
                <th className="p-3">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {summaryByCashier.map((c, i) => (
                <tr key={c.name} className="border-b hover:bg-gray-50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.count}</td>
                  <td className="p-3">₹{c.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 justify-center">
          <select className="border p-2 rounded shadow-sm" value={selectedCashier} onChange={(e) => setSelectedCashier(e.target.value)}>
            <option value="">Filter by Cashier</option>
            {cashiers.map(c => (
              <option key={c.mobile} value={c.name}>{c.name}</option>
            ))}
          </select>
          <input type="date" className="border p-2 rounded shadow-sm" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        {/* Bill Table */}
        <div className="overflow-x-auto rounded-2xl shadow-2xl border border-gray-200 mb-10">
          <h2 className="text-xl font-semibold p-4 bg-blue-100 rounded-t-2xl">Bill List</h2>
          <table className="min-w-full bg-white rounded-b-2xl text-left text-sm">
            <thead className="bg-gradient-to-r from-blue-200 to-blue-100 text-gray-800">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Cashier</th>
                <th className="p-3">Total</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Items</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map(b => (
                <tr key={b._id} className="border-b hover:bg-gray-50 transition-all">
                  <td className="p-3">{b.customerName}</td>
                  <td className="p-3">{b.customerMobile}</td>
                  <td className="p-3">{b.cashier}</td>
                  <td className="p-3">₹{b.total}</td>
                  <td className="p-3">{(() => {const d = new Date(b.createdAt); const day = String(d.getDate()).padStart(2, '0');const month = String(d.getMonth() + 1).padStart(2, '0');const year = d.getFullYear();return `${day}-${month}-${year}`; })()}</td>
                  <td className="p-3">{new Date(b.createdAt).toLocaleTimeString()}</td>
                  <td className="p-3 text-xs">
                    <ul>
                      {b.items.map((i, idx) => (
                        <li key={idx}>{i.name} × {i.qty} = ₹{i.price}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
              {!filteredBills.length && (
                <tr><td colSpan="7" className="text-center text-gray-500 p-4">No bills found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Chart View */}
        <div className="bg-white p-4 rounded-2xl shadow-2xl mb-10">
          <h2 className="text-xl font-semibold mb-4">Bill Summary Chart</h2>
          <Bar data={chartData} />
        </div>

        {/* Cashier List Table */}
        <div className="overflow-x-auto rounded-2xl shadow-2xl border border-gray-200">
          <h2 className="text-xl font-semibold p-4 bg-green-100 rounded-t-2xl">Cashier List</h2>
          <table className="min-w-full text-left bg-white rounded-b-2xl text-sm">
            <thead className="bg-gradient-to-r from-green-200 to-green-100 text-gray-800">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {cashiers.map((c) => (
                <tr key={c.mobile} className="hover:bg-gray-50 transition-all">
                  <td className="p-4">{c.name}</td>
                  <td className="p-4">{c.mobile}</td>
                  <td className="p-4">{c.role}</td>
                  <td className="p-4 cursor-pointer" onClick={() => toggleStatus(c)}>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${c.status === 'yes' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!cashiers.length && (
                <tr><td colSpan="4" className="text-center p-4 text-gray-500">No cashiers added.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleCashierSubmit} className="bg-white p-6 rounded-2xl shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4">Add New Cashier</h2>
            <input type="text" placeholder="Name" value={cashierData.name} onChange={(e) => setCashierData({ ...cashierData, name: e.target.value })} required className="w-full mb-3 p-2 border rounded" />
            <input type="text" placeholder="Mobile" value={cashierData.mobile} onChange={(e) => setCashierData({ ...cashierData, mobile: e.target.value })} required className="w-full mb-3 p-2 border rounded" />
            <input type="password" placeholder="Password" value={cashierData.password} onChange={(e) => setCashierData({ ...cashierData, password: e.target.value })} required className="w-full mb-4 p-2 border rounded" />
            <div className="flex justify-between">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-full">Save</button>
              <button type="button" onClick={() => setShowPopup(false)} className="bg-red-500 text-white px-4 py-2 rounded-full">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
