
// app/api/sessions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import Session from "../../../../models/Session";
import { AppAssert } from "../../../../utils/appAssert";
import {
  HTTP_MESSAGES,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../../../../constants/http";
import { verifyToken, accessTokenOptions } from "../../../../utils/jwt";

// Helper function to get user info from token
async function getUserFromToken(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  
  if (!accessToken) {
    throw new Error('InvalidAccessToken');
  }

  const { payload, error } = verifyToken(accessToken, accessTokenOptions as any);
  
  if (!payload || error) {
    throw new Error('InvalidAccessToken');
  }

  return {
    userId: payload.userId,
    sessionId: payload.sessionId,
  };
}

export async function DELETE(
  request: NextRequest,

) {
  try {
    const { sessionId: requestSessionId } = await getUserFromToken(request);
    const paramsSessionId = request.url.split('/').pop();

    AppAssert(
      requestSessionId.toString() !== paramsSessionId,
      UNAUTHORIZED,
      HTTP_MESSAGES[UNAUTHORIZED]
    );

    const deleted:any = await Session.findByIdAndDelete(paramsSessionId);
    AppAssert(deleted, NOT_FOUND, "Session not found");
    
    return NextResponse.json(deleted, { status: OK });
  } catch (error: any) {
    const status = error.statusCode || (error.message.includes('token') ? UNAUTHORIZED : 500);
    return NextResponse.json({
      message: error.message || 'Internal server error',
    }, { status });
  }
}



