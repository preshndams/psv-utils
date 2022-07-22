import { access, unlink, constants, mkdir } from "fs";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import Slugify from "slugify";
import Axios from "axios";
import jwt from "jsonwebtoken";
import { v1 as uuidV1, validate as UUIDValidaton } from "uuid";
import {Sequelize} from 'sequelize'
import { ValidationError } from "../errors";

const fileExists = (file: any) => {
  return new Promise((resolve, reject) => {
    access(file, constants.F_OK, (err) => {
      if (err) resolve(false);
      resolve(true);
    });
  });
};

export const shuffelWord = (word: any) => {
  let shuffledWord = "";
  word = word.split("");
  while (word.length > 0) {
    shuffledWord += word.splice((word.length * Math.random()) << 0, 1);
  }
  return shuffledWord;
};

export const deleteFile = async (file: any): Promise<boolean> => {
  if (await fileExists(file)) {
    return new Promise((resolve, reject) => {
      unlink(file, (err) => {
        return err ? reject(err) : resolve(true);
      });
    });
  }
  return false;
};

const validate = (
  schema: any,
  object: any,
  option = { abortEarly: true, allowUnknown: false }
) => {
  const check = schema.validate(object, option);
  if (check.error) {
    throw new ValidationError(check.error.details[0].message);
  }
  return check.value;
};

export function joiValidator(constraint: any, isMiddleware = true): any {
  if (!constraint)
    throw new ValidationError(
      "Kindly supply validation schema to joiValidator"
    );

  if (!isMiddleware) {
    return validate(constraint.schema, constraint.data, constraint.option);
  }
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (constraint.body) {
        req.body = validate(
          constraint.body.schema,
          req.body,
          constraint.body.options
        );
      }
      if (constraint.params)
        req.params = validate(
          constraint.params.schema,
          req.params,
          constraint.params.options
        );
      if (constraint.query)
        req.query = validate(
          constraint.query.schema,
          req.query,
          constraint.query.options
        );
      if (constraint.headers)
        req.headers = validate(
          constraint.headers.schema,
          req.headers,
          constraint.headers.options
        );

      return next();
    } catch (err) {
      next(err);
    }
  };
}

const randomString = (N = 10) => {
  return Array(N + 1)
    .join((Math.random().toString(36) + "00000000000000000").slice(2, 18))
    .slice(0, N);
};

const uniqueString = (capitalize = false): string => {
  const now = Array.from(Date.now().toString());
  let result = "";
  for (let i = 0; i < now.length; i++) {
    if (i % 4 === 0) result += randomString(2);
    result += now[i];
  }
  return capitalize ? result.toUpperCase() : result;
};

const createPath = (path: any) =>
  new Promise((ful, rej) => {
    fileExists(path)
      .then((exists) => {
        if (exists) return ful(true);
        mkdir(path, { recursive: true }, (err) => {
          if (err) return rej(err);
          return ful(true);
        });
      })
      .catch((err) => rej(err));
  });

export const uploadFile = ({
  name = undefined,
  limit = 5,
  allowedFormat = ["jpg", "jpeg", "png", "gif"],
  location = "/",
}: {
  name?: string;
  limit?: number;
  allowedFormat?: any[];
  location?: string;
}): any => {
  /* Set storage to s3 */
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      await createPath(location);
      cb(null, location);
    },
    filename: (req, file, cb) => {
      let mimetype = file.mimetype.split("/")[1];
      cb(null, name ? name + "." + mimetype : `${uniqueString()}.${mimetype}`);
    },
  });

  /* Limit is converted to bytes from megabyte */
  const limits = { fileSize: limit * 1000000 };

  /* Restrict file format to allowed ones */
  const fileFilter = (req: any, file: any, cb: any) => {
    if (allowedFormat.length === 0) return cb(null, true);
    if (
      allowedFormat.includes(file.originalname.split(".").pop().toLowerCase())
    ) {
      return cb(null, true);
    } else {
      return cb(
        `File format not allowed, allowed formats are: ${allowedFormat.join(
          ", "
        )}`
      );
    }
  };
  return multer({ storage, limits, fileFilter });
};

export const slugify = ({
  value,
  lowerCase = true,
}: {
  value: string;
  lowerCase: boolean;
}): string => {
  if (lowerCase)
    return Slugify(value, {
      remove: /[*,}{》《`^#+~.()%&'"!:@]/g,
      lower: true,
    });

  return Slugify(value, {
    remove: /[*,}{》《`^#+~.()%&'"!:@]/g,
    lower: false,
  });
};

/* Make a get request */
export const getContent = async ({
  url,
  method = "GET",
  headers = {},
  token = undefined,
  data = undefined,
}: {
  url: string;
  method?: "GET" | "DELETE";
  headers?: Record<string, any>;
  token?: string;
  data?: Record<string, any>;
}): Promise<any> => {
  try {
    headers["X-Requested-With"] = "XMLHttpRequest";
    token && (headers["Authorization"] = token);
    const payload: any = {
      method,
      url,
      headers,
    };

    if (data) payload.data = data;

    const result = await Axios(payload);

    return result.data;
  } catch (err:any) {
    throw err.response
      ? { ...err.response.data, httpStatusCode: err.response.status } ||
          err.response
      : err;
  }
};
/* Make a post request */
export const postContent = async ({
  url,
  token,
  data,
  method = "POST",
  headers = {},
}: {
  url: string;
  token?: string;
  data?: Record<string, any>;
  method?: "POST" | "PATCH";
  headers?: Record<string, any>;
}): Promise<any> => {
  try {
    headers["X-Requested-With"] = "XMLHttpRequest";
    token && (headers["Authorization"] = token);

    const result = await Axios({
      method,
      url,
      data,
      headers,
    });

    return result.data;
  } catch (err:any) {
    if(err){
      if(err.response){
        throw  { ...err.response.data, httpStatusCode: err.response.status } || err.response
      }else throw err
    }
  }
};

export const paginate = (
  totalCount: number,
  currentPage: number,
  perPage: number
): object => {
  const previousPage = currentPage - 1;
  return {
    pageCount: Math.ceil(totalCount / perPage),
    offset: currentPage > 1 ? previousPage * perPage : 0,
  };
};

export const decodeJwt = (cipher: any, secreteKey: string) => {
  const token = cipher.split(" ").pop();
  return new Promise((ful, rej) => {
    if (!secreteKey) return rej(new Error("Kindly supply secret key"));
    jwt.verify(token, secreteKey, (err: any, data: any) => {
      if (err) rej(err);
      return ful(data);
    });
  });
};

export const encodeJwt = ({
  data,
  secreteKey = process.env.APP_KEY,
  duration = "24h",
}: {
  data: any;
  secreteKey: string;
  duration: string;
}) => {
  return new Promise((ful, rej) => {
    if (!secreteKey) return rej(new Error("Kindly supply secret key"));
    jwt.sign(data, secreteKey, { expiresIn: duration }, (err, token) => {
      if (err) rej(err);
      ful(token);
    });
  });
};

export function globalErrorHandler(err: Error): void {
  console.log("=======Unhandled error=======/n/n", err);
}

export function devLog(...keys: any): void {
  if (process.env.NODE_ENV !== "production") {
    const title = typeof keys[0] === "string" ? keys.shift() : "Log start";
    console.log(
      `\n\n\n=============${title}\n${new Date()}===================\n`
    );
    keys.forEach((log: any) => console.log(log));
    console.log("\n==============Log end==================\n");
  }
}

export function parseJSON(value: any): any {
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
}

export const uuid = {
  toBinary: (uuid: string) => {
    if (!uuid) uuid = uuidV1();
    else if (typeof uuid !== "string" && Buffer.isBuffer(uuid)) return uuid;
    const buf = Buffer.from(uuid.replace(/-/g, ""), "hex");
    return Buffer.concat([
      buf.subarray(6, 8),
      buf.subarray(4, 6),
      buf.subarray(0, 4),
      buf.subarray(8, 16),
    ]);
  },
  toString: (binary: any) => {
    if (!binary) throw new Error("Kindly supply binary UUID value");
    if (typeof binary === "string") return binary;
    return [
      binary.toString("hex", 4, 8),
      binary.toString("hex", 2, 4),
      binary.toString("hex", 0, 2),
      binary.toString("hex", 8, 10),
      binary.toString("hex", 10, 16),
    ].join("-");
  },
  mysqlBinary: (value: any) => Sequelize.fn("UUID_TO_BIN", value, 1),
  mysqlUUID: (field: any) => [
    Sequelize.fn("BIN_TO_UUID", Sequelize.col(field), 1),
    field,
  ],
  get: () => uuidV1(),
  isValid: (uuid: any) => UUIDValidaton(uuid),
}
