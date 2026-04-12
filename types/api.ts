export type ApiSuccess<T> = {
  data: T;
  error: null;
};

export type ApiFailure = {
  data: null;
  error: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
