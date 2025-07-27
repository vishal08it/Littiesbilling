import connectDB from '@/lib/db';
import User from '@/models/User';

// POST: Add a new cashier
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, mobile, password } = body;

    if (!name || !mobile || !password) {
      return new Response(JSON.stringify({ message: 'Missing fields' }), { status: 400 });
    }

    const existing = await User.findOne({ mobile });
    if (existing) {
      return new Response(JSON.stringify({ message: 'Mobile already registered' }), { status: 409 });
    }

    const user = new User({
      name,
      mobile,
      password,
      role: 'cashier',
      status: 'yes',
    });

    await user.save();

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (err) {
    console.error('Error adding cashier:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}

// GET: Get all cashiers
export async function GET() {
  try {
    await connectDB();
    const cashiers = await User.find({ role: 'cashier' }).select('-password'); // Don't return password
    return new Response(JSON.stringify(cashiers), { status: 200 });
  } catch (err) {
    console.error('Error fetching cashiers:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
