import mongoose from "mongoose";
import Audience from "../constants/audience";
import jwt, { VerifyOptions } from "jsonwebtoken";
import { getEnvironmentVariable } from "@/lib/utils";


const  JWT_ACESS_SECRET = getEnvironmentVariable('JWT_ACESS_SECRET');
const JWT_REFRESH_SECRET = getEnvironmentVariable('JWT_REFRESH_SECRET');
export type RefreshTokenPayload = {
  sessionId: mongoose.Types.ObjectId;
};

export type AccessTokenPayload = {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
};

export const refreshTokenOptions = {
  secret: JWT_REFRESH_SECRET,
  expiresIn: '30d', // 30 days
  audience: [Audience.User],
};
export const accessTokenOptions = {
  secret: JWT_ACESS_SECRET,
  expiresIn: '15m', // 15 minutes
  audience: [Audience.User],
};

export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options: typeof refreshTokenOptions
) => {
  const { secret, ...signOpts } = options;
  return (jwt as any).sign(payload, secret, {
    ...signOpts,
  });
};

interface TVerifyOptions extends VerifyOptions {
  secret: string;
}

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options: TVerifyOptions
) => {
  const { secret, ...verifyOpts } = options;

  try {
    const payload = jwt.verify(token, secret, {
      ...verifyOpts,
    }) as TPayload;
    return { payload };
  } catch (error: any) {
    return { error: error.message };
  }
};
