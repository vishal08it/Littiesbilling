'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';

export default function CashierPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [cashier, setCashier] = useState('');
  const [items, setItems] = useState([
    { id: '', name: '', qty: 1, rate: 0, price: 0 }
  ]);
  const [itemList, setItemList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [billData, setBillData] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    axios.get('/api/items')
      .then(res => setItemList(res.data))
      .catch(err => console.error(err));

    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.name && user?.role === 'cashier') {
      setCashier(user.name);
    }

    const draft = localStorage.getItem('draft');
    if (draft) {
      const d = JSON.parse(draft);
      setName(d.name);
      setMobile(d.mobile);
      setItems(d.items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('draft', JSON.stringify({ name, mobile, items }));
  }, [name, mobile, items]);

  const addItem = () => {
    setItems([...items, { id: '', name: '', qty: 1, rate: 0, price: 0 }]);
  };

  const updItem = (i, key, value) => {
    const updated = [...items];
    if (key === 'qty') {
      updated[i].qty = Number(value);
      updated[i].price = updated[i].qty * updated[i].rate;
    }
    setItems(updated);
  };

  const handleItemSelect = (index, id) => {
    const selected = itemList.find(item => item._id === id);
    if (selected) {
      const updated = [...items];
      updated[index].id = id;
      updated[index].name = selected.name;
      updated[index].rate = selected.price;
      updated[index].price = updated[index].qty * selected.price;
      setItems(updated);
    }
  };

  const totalAmount = items.reduce((sum, i) => sum + i.price, 0);

  const submit = async () => {
    try {
      const res = await axios.post('/api/bills', {
        customerName: name,
        customerMobile: mobile,
        cashier,
        items: items.map(({ name, qty, rate, price }) => ({ name, qty, rate, price })),
        total: totalAmount
      });

      localStorage.removeItem('draft');
      setBillData(res.data);
      setShowModal(true);
    } catch (err) {
      alert('Failed to save bill.');
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '', 'width=300,height=600');
    win.document.write('<html><head><title>Print</title></head><body>');
    win.document.write(content.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl mb-4 font-semibold">🧾 Create Bill</h1>

        <p className="mb-2 font-semibold">Cashier: {cashier}</p>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Customer Name"
          className="border p-2 mb-2 w-full"
        />
        <input
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          placeholder="Customer Mobile"
          className="border p-2 mb-4 w-full"
        />

        {items.map((item, i) => (
          <div key={i} className="mb-2">
            <div className="flex gap-2 items-center">
              <select
                value={item.id}
                onChange={e => handleItemSelect(i, e.target.value)}
                className="border p-2 flex-1"
              >
                <option value="">-- Select Item --</option>
                {itemList.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qty"
                value={item.qty}
                onChange={e => updItem(i, 'qty', e.target.value)}
                className="border p-2 w-20"
              />
              <input
                type="number"
                placeholder="Rate"
                value={item.rate}
                readOnly
                className="border p-2 w-24 bg-gray-100"
              />
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                readOnly
                className="border p-2 w-24 bg-gray-100"
              />
            </div>
          </div>
        ))}

        <button onClick={addItem} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          ➕ Add Item
        </button>

        <div className="text-right mt-4 mb-4 font-bold text-lg">
          Total Price: ₹{totalAmount}
        </div>

        <button onClick={submit} className="bg-green-600 text-white px-6 py-2 rounded">
          Submit & Print
        </button>
      </div>

      {/* Print Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded w-[350px]" ref={printRef}>
            {/* <h2 className="text-center font-bold text-lg mb-2">🧾 Bill Preview</h2> */}
             <h2 className="text-center font-bold text-lg mb-2">🧾 Litties Restaurant</h2>
            
            <p><strong>Customer Name:</strong> {name}</p>
            <p><strong>Customer Mobile Number:</strong> {mobile}</p>
            <p><strong>Cashier Name:</strong> {cashier}</p>
            <hr className="my-2" />
            <table className="w-full text-sm">
              <thead>
                <tr className="font-semibold border-b">
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>₹{item.rate}</td>
                    <td>₹{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-right mt-2 font-bold">Total: ₹{totalAmount}</p>
            <div className="flex justify-between mt-4">
              <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-1 rounded">🖨️ Print</button>
              {/* <button onClick={() => setShowModal(false)} className="bg-red-600 text-white px-4 py-1 rounded">❌ Close</button> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
