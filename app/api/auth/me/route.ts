// @/app/api/auth/me/route.ts
import { NextRequest } from "next/server";
import { returnSuccess, returnError } from "@/lib/response";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await verifyAuthToken(request);

    if (!authResult || !authResult.user)
      return returnError({ message: "Unauthorized" });

    if (!authResult.success) {
      return returnError({
        message: "Unauthorized",
        status: 401,
      });
    }

    return returnSuccess({
      data: {
        user: {
          id: authResult?.user?._id,
          name: authResult?.user?.name,
          email: authResult?.user?.email,
          role: authResult?.user?.role,
          avatar: authResult?.user?.avatar,
          isEmailVerified: authResult?.user?.isEmailVerified,
          lastLogin: authResult?.user?.lastLogin,
          phone: authResult?.user?.phone,
          isActive: authResult?.user?.isActive,
          multifactorAuthentication:
            authResult.user.multifactorAuthentication || false,
        },
      },
    });
  } catch (error: any) {
    return returnError({
      message: "Failed to get user data",
      error,
      status: 500,
    });
  }
}
