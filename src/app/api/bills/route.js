import connectDB from '@/lib/db';
import Bill from '@/models/Bill';

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const newBill = await Bill.create(data); // This includes cashierName
  return new Response(JSON.stringify(newBill), { status: 201 });
}

export async function GET() {
  await connectDB();
  const bills = await Bill.find().sort({ createdAt: -1 });
  return new Response(JSON.stringify(bills), { status: 200 });
}
