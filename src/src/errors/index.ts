export class ValidationError extends Error {
  httpStatusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "VALIDATION_ERROR";
    this.httpStatusCode = 400;
  }
}
export class EntryExistError extends Error {
  httpStatusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "ENTRY_EXISTS";
    this.httpStatusCode = 409;
  }
}

export class EntryNotFoundError extends Error {
  httpStatusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "ENTRY_NOT_FOUND";
    this.httpStatusCode = 404;
  }
}

export class AuthenticationError extends Error {
  httpStatusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "AUTHENTICATION_ERROR";
    this.httpStatusCode = 401;
  }
}

export class AuthorizationError extends Error {
  httpStatusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "AUTHORISATION_ERROR";
    this.httpStatusCode = 403;
  }
}

export class TokenExpiredError extends Error {
  httpStatusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "TOKEN_EXPIRED";
    this.httpStatusCode = 401;
  }
}

export class InvalidTokenError extends Error {
  httpStatusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "TOKEN_INVALID";
    this.httpStatusCode = 401;
  }
}

export class PaymentRequiredError extends Error {
  httpStatusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "PAYMENT_REQUIRED";
    this.httpStatusCode = 402;
  }
}

export const HTTP_STATUS_CODE_ERROR: any = {
  "400": "VALIDATION_ERROR",
  "401": "AUTHENTICATION_ERROR",
  "402": "PAYMENT_REQUIRED_ERROR",
  "403": "AUTHORISATION_ERROR",
  "404": "ENTRY_NOT_FOUND",
  "409": "ENTRY_EXISTS",
  "500": "FATAL_ERROR",
};

export const customErrorMessage = ({
  err = 0,
  ERROR_TYPE = "FATAL_ERROR",
}: {
  err: any;
  ERROR_TYPE: string;
}) => {
  let message;
  if (err && err.errors)
    message = err.errors[0] ? err.errors[0].message : "Something went wrong.";
  else if (err && err.message) message = err.message;
  else if (typeof err == "string") message = err;
  else message = "Something went wrong";

  if (process.env.NODE_ENV !== "production") {
    console.log("=======================================");
    console.log(err);
    console.log("=======================================");
  }
  const response = { success: false, message, ...err };
  response.error =
    err.name || HTTP_STATUS_CODE_ERROR[err.httpStatusCode] || ERROR_TYPE;
  if (err.httpStatusCode) response.httpStatusCode = err.httpStatusCode;
  response.service =
    err.service || process.env.APP_NAME || process.env.SERVICE_NAME;
  return response;
};

export const errorMessage = ({
  err = void 0,
  ERROR_TYPE = "FATAL_ERROR",
}: {
  err: any;
  ERROR_TYPE: string;
}) => {
  let message;
  if (err && err.errors)
    message = err.errors[0] ? err.errors[0].message : "Something went wrong.";
  else if (err && err.message) message = err.message;
  else if (typeof err == "string") message = err;
  else message = "Something went wrong";

  if (process.env.NODE_ENV !== "production") {
    console.log("=======================================");
    console.log(err);
    console.log("=======================================");
  }
  const response:any = { success: false, message };
  response.error =
    err.name || err.HTTP_STATUS_CODE_ERROR[err.httpStatusCode] || ERROR_TYPE;
  if (err.httpStatusCode) response.httpStatusCode = err.httpStatusCode;
  response.service =
    err.service || process.env.APP_NAME || process.env.SERVICE_NAME;
  return response;
};
