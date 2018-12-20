import fetch from 'cross-fetch';
import * as urljoin from 'url-join';
import objectToParams from './utils/objectToParams';
import { Nullable, HashMap, DataTypes, ApiServiceOptions, FetchOptions } from './types';
import bodyFromObject from './utils/bodyFromObject';

const clientErrorCodeRegEx = /^[4][0-9][0-9]$/;
const serverErrorCodeRegEx = /^[5][0-9][0-9]$/;
const isClientError = (code: number) => clientErrorCodeRegEx.test(String(code));
const isServerError = (code: number) => serverErrorCodeRegEx.test(String(code));

const DEFAULT_DATA_TYPES: DataTypes = {
  request: 'json',
  response: 'json',
};

const safeCall = (fnOrUndefined: Function | undefined, r: any) => {
  if (typeof fnOrUndefined === 'function') return fnOrUndefined(r);
  return r;
};

type ParamsResponseAny = {
  params: HashMap<any>;
  response?: any;
}
type ParamsResponseBodyAny = {
  body: any;
} & ParamsResponseAny;
export interface ServiceType {
  get?: ParamsResponseAny;
  post?: ParamsResponseBodyAny;
  put?: ParamsResponseBodyAny;
  delete?: ParamsResponseBodyAny;
}

export default class ApiService<T extends ServiceType> {
  private url: string;
  private options: ApiServiceOptions;
  private fetchOptions: FetchOptions;

  /**
   * Creates adapter for backend service via provided url
   * @param {string} url - url path
   */
  constructor(
    url: string,
    options?: ApiServiceOptions,
    fetchOptions?: FetchOptions,
  ) {
    this.url = url;
    this.options = options || { dataTypes: { ...DEFAULT_DATA_TYPES } };
    this.fetchOptions = fetchOptions || { headers: {} };
  }

  checkResponse(url: string, response: Response, body: Nullable<HashMap<any>>) {
    if (isServerError(response.status)) {
      throw new Error('Server error');
    } else if (body && body.errors && body.errors.length) {
      body.errors.forEach((er: string) => {
        console.error(er); // eslint-disable-line no-console
      });
      throw new Error('Errors in response body');
    }
  }

  httpMethod(params = {}, body: Nullable<HashMap<any>> = {}, method: string) {
    let url = this.url;
    const options = {
      method,
      ...this.fetchOptions,
    };

    const requestDataType = (this.options.dataTypes && this.options.dataTypes.request) || 'json';
    const responseDataType = (this.options.dataTypes && this.options.dataTypes.response) || 'json';

    const { onSuccess } = this.options;

    if (['POST', 'PUT', 'DELETE'].indexOf(method) > -1) {
      options.body = bodyFromObject[requestDataType](body);
    }
    url = `${url}?${objectToParams(params)}`;

    this.log(method, url);
    return fetch(url, options).then((r) => {
      if (isClientError(r.status)) {
        return Promise.reject(new Error(String(r.status)));
      }

      return r[responseDataType]()
        .then((responseBody) => {
          if (typeof onSuccess === 'function') onSuccess(url, r, responseBody);

          this.checkResponse(url, r, responseBody);

          if (this.options.responseHeaders) {
            return Promise.resolve({
              data: responseBody,
              headers: (this.options.responseHeaders || []).reduce(
                (p: HashMap<string | null>, c) => {
                  p[c] = r.headers.get(c);
                  return p;
                }, {}),
            });
          }
          return Promise.resolve(responseBody);
        })
        .catch((ex) => {
          this.checkResponse(url, r, null);
          if (method === 'GET') {
            console.error(`Exception on parsing data fetched from ${url}`, ex); // eslint-disable-line no-console
            return Promise.reject();
          }
          return Promise.resolve();
        });
    }).catch((e) => {
      if (typeof this.options.onError === 'function') this.options.onError(e);
      throw e;
    });
  }

  // @ts-ignore https://github.com/Microsoft/TypeScript/issues/21760
  get = (params:  T['get']['params'] = {}): Promise<T['get']['response']> =>
    this.httpMethod(params, null, 'GET').then(r => safeCall(this.options.transformResponse, r));

  // @ts-ignore https://github.com/Microsoft/TypeScript/issues/21760
  post = (body: T['post']['body'] = {}, params: HashMap<any> = {}): Promise<T['post']['response']> =>
    this.httpMethod(params, body, 'POST').then(r => safeCall(this.options.transformResponse, r));

  // @ts-ignore https://github.com/Microsoft/TypeScript/issues/21760
  put = (body: HashMap<any> = {}, params: HashMap<any> = {}): Promise<T['put']['response']> =>
    this.httpMethod(params, body, 'PUT').then(r => safeCall(this.options.transformResponse, r))

  // @ts-ignore https://github.com/Microsoft/TypeScript/issues/21760
  delete = (body: HashMap<any> = {}, params: HashMap<any> = {}): Promise<T['delete']['response']> =>
    this.httpMethod(params, body, 'DELETE').then(r => safeCall(this.options.transformResponse, r))

  path(...args: string[]) {
    const url = urljoin(this.url, ...args);
    return new ApiService<T>(url, this.options, this.fetchOptions);
  }

  dataTypes(dataTypesObject: DataTypes) {
    return new ApiService<T>(
      this.url,
      { ...this.options, dataTypes: { ...this.options.dataTypes, ...dataTypesObject } },
      this.fetchOptions,
    );
  }

  responseHeaders(...headers: string[]) {
    return new ApiService<T>(this.url,
      { ...this.options, responseHeaders: headers },
      this.fetchOptions,
    );
  }

  headers(headers: HashMap<string> = {}) {
    return new ApiService<T>(
      this.url,
      this.options,
      { ...this.fetchOptions, headers: { ...this.fetchOptions.headers, ...headers } },
    );
  }

  log(method: string, url: string) {
    safeCall(this.options.logFunction, `${method} ${url}`);
  }

}
