export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNATHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
  BAD_GATEWAY = 502,
  UNAVAILABLE = 503
}

export class NewError extends Error {
  httpCode: HttpStatusCode;
  constructor(message: string, httpCode: HttpStatusCode) {
    super(message);
    this.name = 'NewError';
    this.httpCode = httpCode;
  }

  // get httpCode() {
  //   return this.httpCode
  // }
}
