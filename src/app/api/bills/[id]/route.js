import connectDB from '@/lib/db';
import Bill from '@/models/Bill';
export async function DELETE(_, { params }) {
  await connectDB();
  await Bill.findByIdAndDelete(params.id);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
