import {
  AuthorizationError,
  EntryExistError,
  EntryNotFoundError,
  AuthenticationError,
  InvalidTokenError,
  TokenExpiredError,
  PaymentRequiredError,
  ValidationError,
} from "./src/errors";
import { setRedis, setRedisEx, getRedis, delRedis } from "./src/database/redis";
import {
  getContent,
  postContent,
  paginate,
  decodeJwt,
  deleteFile,
  encodeJwt,
  slugify,
  uploadFile,
  joiValidator,
  parseJSON,
  globalErrorHandler,
  devLog,
  uuid,
} from "./src/utils";

module.exports = {
  parseJSON,
  globalErrorHandler,
  devLog,
  postContent,
  getContent,
  decodeJwt,
  encodeJwt,
  paginate,
  slugify,
  deleteFile,
  uploadFile,
  joiValidator,
  InvalidTokenError: InvalidTokenError,
  TokenExpiredError: TokenExpiredError,
  AuthenticationError: AuthenticationError,
  AuthorizationError: AuthorizationError,
  EntryExistError: EntryExistError,
  EntryNotFoundError: EntryNotFoundError,
  NotFoundError: EntryNotFoundError,
  ExistsError: EntryExistError,
  ValidationError: ValidationError,
  PaymentRequiredError: PaymentRequiredError,
  setRedis,
  setRedisEx,
  getRedis,
  delRedis,
  uuid
};
