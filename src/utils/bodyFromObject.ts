import { Nullable, HashMap } from '../types';

const bodyFromObject: any = {
  json: (data: Nullable<HashMap<any>>) => JSON.stringify(data),
  formData: (data: any) => Object.keys(data).reduce(
    (p, c) => { p.append(c, data[c]); return p; }, new FormData(),
  )
}

export default bodyFromObject;
