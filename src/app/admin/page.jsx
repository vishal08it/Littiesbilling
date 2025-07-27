'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Navbar from '@/components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminPage() {
  const [bills, setBills] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [cashierData, setCashierData] = useState({ name: '', mobile: '', password: '' });

  useEffect(() => {
    fetchBills();
    fetchCashiers();
  }, []);

  const fetchBills = async () => {
    const res = await axios.get('/api/bills');
    setBills(res.data);
  };

  const fetchCashiers = async () => {
    try {
      const res = await axios.get('/api/cashiers');
      setCashiers(res.data);
    } catch (err) {
      console.error('Failed to fetch cashiers', err);
    }
  };

  const deleteBill = async (id) => {
    if (!confirm('Delete this bill?')) return;
    await axios.delete(`/api/bills/${id}`);
    fetchBills();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Bill Report', 14, 10);
    doc.autoTable({
      head: [['Customer', 'Total', 'Date']],
      body: bills.map((b) => [b.customerName, `₹${b.total}`, new Date(b.createdAt).toLocaleString()])
    });
    doc.save('report.pdf');
  };

  const handleCashierSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/cashiers', {
        ...cashierData,
        role: 'cashier',
        status: 'yes'
      });
      toast.success('Cashier added successfully');
      setShowPopup(false);
      setCashierData({ name: '', mobile: '', password: '' });
      fetchCashiers();
    } catch (err) {
      toast.error('Error adding cashier');
    }
  };

  const toggleStatus = async (cashier) => {
    const newStatus = cashier.status === 'yes' ? 'no' : 'yes';
    try {
      await axios.put(`/api/cashiers/${cashier.mobile}`, { status: newStatus });
      fetchCashiers();
      toast.success('Status updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="p-6">
        <h1 className="text-2xl mb-4">Admin Dashboard</h1>

        <div className="flex gap-4 mb-4">
          <button onClick={exportPDF} className="bg-green-500 text-white px-4 py-2 rounded">
            Export PDF
          </button>
          <button onClick={() => setShowPopup(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
            ➕ Add New Cashier
          </button>
        </div>

        {/* Bill List */}
        <div className="bg-white rounded shadow mb-6">
          {bills.map((b) => (
            <div key={b._id} className="flex justify-between border-b p-4">
              <span>
                {b.customerName} – ₹{b.total}
              </span>
              <button className="text-red-500" onClick={() => deleteBill(b._id)}>
                Delete
              </button>
            </div>
          ))}
          {!bills.length && <p className="p-4 text-center">No bills.</p>}
        </div>

        {/* Cashier Table with Columns and Clickable Status */}
        <h2 className="text-xl mb-2">Cashier List</h2>
        <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
          <table className="min-w-full text-left bg-white rounded-xl shadow-lg">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {cashiers.map((c) => (
                <tr
                  key={c.mobile}
                  className="hover:shadow-lg transition-all duration-200 ease-in-out bg-white border-b"
                >
                  <td className="p-4">{c.name}</td>
                  <td className="p-4">{c.mobile}</td>
                  <td className="p-4">{c.role}</td>
                  <td
                    className="p-4 cursor-pointer"
                    onClick={() => toggleStatus(c)}
                  >
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                        c.status === 'yes' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!cashiers.length && (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">
                    No cashiers added.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleCashierSubmit}
            className="bg-white p-6 rounded shadow-lg w-96"
          >
            <h2 className="text-xl mb-4">Add New Cashier</h2>
            <input
              type="text"
              placeholder="Name"
              value={cashierData.name}
              onChange={(e) => setCashierData({ ...cashierData, name: e.target.value })}
              required
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Mobile"
              value={cashierData.mobile}
              onChange={(e) => setCashierData({ ...cashierData, mobile: e.target.value })}
              required
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={cashierData.password}
              onChange={(e) => setCashierData({ ...cashierData, password: e.target.value })}
              required
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-between">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
