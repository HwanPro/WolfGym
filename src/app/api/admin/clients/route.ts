// src/app/api/admin/clients/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';

export async function GET(request: Request) {
  try {
    const clients = await prisma.client.findMany(); // Encapsula await en una función
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newClient = await prisma.client.create({ data });
    return NextResponse.json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Error creating client' }, { status: 500 });
  }
}
