import urljoin from 'url-join';
import ApiService from './ApiService.js';
import { ApiServiceOptions, FetchOptions } from './types';

export interface IApiServiceFactory {
  create<T>(): ApiService<T>
}

export default class ApiServiceFactory {
  private baseUrl: string;
  private options: ApiServiceOptions | undefined;
  private fetchOptions: FetchOptions | undefined;

  constructor(baseUrl: string, options?: ApiServiceOptions, fetchOptions?: FetchOptions) {
    this.baseUrl = baseUrl;
    this.options = options;
    this.fetchOptions = fetchOptions;
  }

  create = <T>(path: string, options?: ApiServiceOptions, fetchOptions?: FetchOptions) =>
    new ApiService<T>(
      urljoin(this.baseUrl, path),
      { ...this.options, ...options },
      { ...this.fetchOptions, ...fetchOptions }
    )
}
