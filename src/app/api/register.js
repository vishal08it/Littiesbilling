import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, mobile, password } = req.body;

  if (!name || !mobile || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    const db = client.db('YourDatabaseName');
    const users = db.collection('users');

    // Check if user already exists
    const existing = await users.findOne({ mobile });
    if (existing) {
      client.close();
      return res.status(409).json({ message: 'Mobile number already registered' });
    }

    const newUser = {
      name,
      mobile,
      password, // You should hash this in production
      role: 'cashier',
      status: 'yes',
      createdAt: new Date(),
    };

    await users.insertOne(newUser);
    client.close();

    return res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
