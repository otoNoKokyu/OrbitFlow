export interface IResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    cached: boolean;
    timestamp: string;
  }
  
  export interface IErrResponse {
    statusCode: number;
    message: string;
    error: string;
  }
  