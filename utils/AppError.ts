import { AppErrorCode, HttpStatusCode } from "../constants/http";

class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public message: string,
    public ErrorCode?: AppErrorCode
  ) {
    super(message);
  }
}


export default AppError