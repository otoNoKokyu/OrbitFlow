export interface IResponse<T> {
    message: string;
    data: T;
    cached: boolean;
    timestamp: string;
  }
  
  export interface IErrResponse {
    message: string;
    error: string;
  }
  