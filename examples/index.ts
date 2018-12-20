import { ApiServiceFactory } from '../src/index';
import { HashMap } from '../src/types';

const REST_SERVICE_FACTORY = new ApiServiceFactory('https://private-672e3-bgsed.apiary-proxy.com', {
  logFunction: (message) => console.log(message),
  onError: (e) => console.log(e),
});

type QuestionsServiceType = {
  get: {
    params: {
      id: number,
    },
    response: number;
  };
  post: {
    body: {
      id: number;
      data: HashMap<any>;
    },
    response: string;
  };
}
const QuestionsService = REST_SERVICE_FACTORY.create<QuestionsServiceType>('questions');

QuestionsService.get({ a: 'b' }).then(r => console.log(r))
QuestionsService.get({ id: 22 }).then(r => console.log(r));

QuestionsService.post({ id: 22 }).then(r => console.log(r));
QuestionsService.post({ id: 22, data: { value: 'What?' } }).then(r => console.log(r));
