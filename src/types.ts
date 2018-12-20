export type Nullable<T> = T | null;
export type HashMap<V> = { [key: string]: V };

export type RequestDataType = 'json' | 'formData';
export type ResponseDataType = 'json' | 'text' | 'blob';
export type DataTypes = {
  request: RequestDataType,
  response: ResponseDataType,
};

export type FetchOptions = RequestInit;

export type ApiServiceOptions = {
  dataTypes?: DataTypes;
  responseHeaders?: string[];
  onInit?(): any;
  onSuccess?(url: string, r: Response, responseBody: any): any;
  onError?(e: Error): any;
  transformResponse?(responseBody: Body): any;
  logFunction?(method: string): any;
};
