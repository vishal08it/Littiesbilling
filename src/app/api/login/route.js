import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const { mobile, password } = await req.json();

    // Fetch user by mobile
    const user = await User.findOne({ mobile });

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { status: 401 }
      );
    }

    // Debug logs (check console output in terminal where Next.js runs)
    console.log('User found:', {
      mobile: user.mobile,
      password: user.password,
      status: user.status,
    });

    // Plaintext password check (you can replace this with bcrypt later)
    if (user.password !== password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid password' }),
        { status: 401 }
      );
    }

    // ❗️Status check — make it case-insensitive and trim any spaces
    const cleanStatus = (user.status || '').trim().toLowerCase();

    if (cleanStatus !== 'yes') {
      return new Response(
        JSON.stringify({ success: false, message: 'User is not allowed to login' }),
        { status: 403 }
      );
    }

    // Return success response
    const userData = {
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
    };

    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error', error: error.message }),
      { status: 500 }
    );
  }
}
