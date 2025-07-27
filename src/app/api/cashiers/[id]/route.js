import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { status } = req.body;

    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    return res.status(200).json({ message: 'Cashier status updated' });
  }

  res.status(405).end();
}
