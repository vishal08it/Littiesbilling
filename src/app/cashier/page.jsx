'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function CashierPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [cashier, setCashier] = useState('');
  const [items, setItems] = useState([{ id: '', name: '', qty: 1, rate: 0, price: 0 }]);
  const [itemList, setItemList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const printRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'cashier') {
      router.replace('/login');
    } else {
      setCashier(user.name);
    }

    axios.get('/api/items')
      .then(res => setItemList(res.data))
      .catch(err => console.error(err));

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
      updated[index] = {
        id,
        name: selected.name,
        rate: selected.price,
        qty: updated[index].qty,
        price: selected.price * updated[index].qty,
      };
      setItems(updated);
    }
  };

  const totalAmount = items.reduce((sum, i) => sum + i.price, 0);

  const handlePreview = () => {
    setShowModal(true);
  };

  const handlePrintAndSave = async () => {
    const content = printRef.current;
    const win = window.open('', '', 'width=350,height=600');

    win.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
              }
              th, td {
                border-bottom: 1px solid #ccc;
                padding: 4px;
              }
              h2 {
                margin: 5px 0;
              }
              .thank-you {
                margin-top: 15px;
                text-align: center;
                font-weight: 500;
              }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();

    setTimeout(async () => {
      try {
        await axios.post('/api/bills', {
          customerName: name,
          customerMobile: mobile,
          cashier,
          items: items.map(({ name, qty, rate, price }) => ({ name, qty, rate, price })),
          total: totalAmount
        });
        localStorage.removeItem('draft');
        router.push('/cashier');
      } catch (err) {
        alert('Failed to save bill.');
      }
    }, 1000);
  };

  return (
    <>
      <Navbar />
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>

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
                  <option key={item._id} value={item._id}>{item.name}</option>
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

        <button onClick={handlePreview} className="bg-green-600 text-white px-6 py-2 rounded">
          Preview Bill
        </button>
      </div>

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded w-[350px]" ref={printRef}>
            <div className="text-center" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              {/* <img
                src="/logo.png"
                alt="Logo"
                className="w-20 mx-auto mb-1"
                style={{ display: 'inline-block' }}
              /> */}
              <h2 className="font-bold text-lg mb-2">🧾 Litties Restaurant</h2>
            </div>

            <p><strong>Customer:</strong> {name}</p>
            <p><strong>Mobile:</strong> {mobile}</p>
            <p><strong>Cashier:</strong> {cashier}</p>
            <hr className="my-2" />

            <table className="text-sm w-full">
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

            <div className="text-center mt-4 text-sm font-medium">
              🙏 Thank you for visiting Litties Restaurant!
            </div>

            <div className="flex justify-center mt-4 no-print">
              <button
                onClick={handlePrintAndSave}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                🖨️ Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
