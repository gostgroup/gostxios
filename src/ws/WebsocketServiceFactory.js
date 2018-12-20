import urljoin from 'url-join';
import WebsocketService from './WebsocketService';

let middleware = [];

export function applyMiddleware(...args) {
  middleware = [...middleware, ...args];
}

function withMiddleware() {
  const methodArguments = [];
  middleware.forEach(f => methodArguments.push(f()));
  return method => method(...methodArguments);
}

export default class WebsocketServiceFactory {

  constructor(apiUrl, options = {}, protocolOptions = {}) {
    this._apiUrl = apiUrl;
    this._options = options;
    if (typeof protocolOptions.params === 'function') {
      this.params = () => withMiddleware()(protocolOptions.params);
    }
  }

  setApiUrl(url) {
    if (typeof this._apiUrl === 'string') {
      throw new Error('You can not change API url');
    }
    this._apiUrl = url;
    return this;
  }

  create = (path, options = {}, protocolOptions = {}) =>
    new WebsocketService(
      urljoin(this._apiUrl, path),
      null,
      {
        ...this._options,
        ...options,
      },
      {
        params: this.params,
        ...protocolOptions,
      }
    );

}
