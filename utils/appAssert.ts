import assert from "node:assert";

import AppError from "./AppError";
import { HttpStatusCode, AppErrorCode } from "../constants/http";

type AppAssert = (
  condition: any,
  httpstatuscode: HttpStatusCode,
  message: string,
  apperrorcode?: AppErrorCode
) => asserts condition;

export const AppAssert: AppAssert = (
  condition,
  httpstatuscode,
  message,
  apperrorcode
) => assert(condition, new AppError(httpstatuscode, message, apperrorcode));
