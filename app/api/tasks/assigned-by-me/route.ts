import { returnSuccess } from "@/lib/response";
import { NextRequest } from "next/server";

export const GET  = (request:NextRequest)=>{
    const token = request.headers.get('auth')
    console.log(token)
    return returnSuccess({message:"success"})
}