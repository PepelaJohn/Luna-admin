// @lib/response.ts
import { NextResponse } from 'next/server';

export const returnSuccess = ({
  data,
  status,
  message
}: {
  data?: string[] | { [key: string]: any },
  status?: number
  message?:string
}) => {
  const finalStatus = status || 200;

  if (Array.isArray(data)) {
    return NextResponse.json({ data, success: true }, { status: finalStatus });
  }

  if (data && typeof data === 'object') {
    return NextResponse.json({ ...data, success: true }, { status: finalStatus });
  }
  if(message) return NextResponse.json({message, status:finalStatus, success:true}, {status:finalStatus})

  return NextResponse.json({ success: true, status: finalStatus }, {status:finalStatus});
};




export const returnError = ({
  message,
  error,
  status,
}: {
  message: string;
  error?: any;
  status?: number;
}) => {
  const finalStatus = status || 500;
  return NextResponse.json(
    {
      message: error?.message || message,
      success: false,
      status: finalStatus,
    },
    { status: finalStatus }
  );
};

