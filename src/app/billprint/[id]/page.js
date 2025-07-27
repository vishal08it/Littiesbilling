import connectDB from '@/lib/db';
import Bill from '@/models/Bill';

export default async function BillPrintPage({ params }) {
  await connectDB();
  const bill = await Bill.findById(params.id).lean();

  return (
    <div className="w-[58mm] font-mono p-2 text-sm">
      <h2 className="text-center font-bold">RECEIPT</h2>
      <p>Cust: {bill.customerName}</p>
      <p>Mob: {bill.customerMobile}</p>
      <p>Cashier: {bill.cashierName}</p> {/* ✅ Display cashier name */}
      <hr />
      {bill.items.map((it, i) => (
        <div key={i} className="flex justify-between">
          <span>{it.name} x{it.qty}</span>
          <span>₹{it.price * it.qty}</span>
        </div>
      ))}
      <hr />
      <div className="flex justify-between font-bold">
        <span>Total</span><span>₹{bill.total}</span>
      </div>
      <p className="text-center mt-2">Thank you!</p>
      <button onClick={() => window.print()} className="block mx-auto mt-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">Print</button>
    </div>
  );
}
