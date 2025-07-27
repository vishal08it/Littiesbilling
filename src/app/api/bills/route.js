import connectDB from '@/lib/db';
import Bill from '@/models/Bill';

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const newBill = await Bill.create(data); // This includes cashierName
  return new Response(JSON.stringify(newBill), { status: 201 });
}
