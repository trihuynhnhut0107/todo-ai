import { TokenPayload } from "../dtos/auth.dto";

declare global {
  namespace Express {
    interface Request {
      /**
       * User information populated by TSOA's expressAuthentication function
       * when @Security("jwt") decorator is used on a controller method.
       * This is guaranteed to be present in protected routes.
       */
      user?: TokenPayload;
    }
  }
}

export {};
