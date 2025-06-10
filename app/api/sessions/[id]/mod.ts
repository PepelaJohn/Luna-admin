
// app/api/sessions/[id]/route.ts (using middleware approach)
import { NextRequest, NextResponse } from 'next/server';
import { z } from "zod";
import Session from "../../../../models/Session";
import { AppAssert } from "../../../../utils/appAssert";
import {
  HTTP_MESSAGES,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../../../../constants/http";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestSessionId = request.headers.get('x-session-id');
    const paramsSessionId = z.string().parse(params.id);

    AppAssert(
      requestSessionId !== paramsSessionId,
      UNAUTHORIZED,
      HTTP_MESSAGES[UNAUTHORIZED]
    );

    const deleted = await Session.findByIdAndDelete(paramsSessionId);
    AppAssert(deleted, NOT_FOUND, "Session not found");
    
    return NextResponse.json(deleted, { status: OK });
  } catch (error: any) {
    return NextResponse.json({
      message: error.message || 'Internal server error',
    }, { 
      status: error.statusCode || 500 
    });
  }
}