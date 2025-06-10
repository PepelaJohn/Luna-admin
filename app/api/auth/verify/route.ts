// /app/api/auth/verify/route.ts or /pages/api/auth/verify.ts (depending on your setup)
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth'; // the one with Mongoose

export async function POST(request: NextRequest) {
  const authResult = await verifyAuthToken(request);
  return NextResponse.json(authResult);
}
