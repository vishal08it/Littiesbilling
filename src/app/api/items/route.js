import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = 'attendance'; // change if needed

export async function GET() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const items = await db.collection('items').find().toArray();
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/items error:', error);
    return NextResponse.json({ message: 'Failed to fetch items' }, { status: 500 });
  }
}
