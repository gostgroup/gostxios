import { Nullable, HashMap } from '../types';

const bodyFromObject: any = {
  json: (data: Nullable<HashMap<any>>) => JSON.stringify(data),
  formData: (data: any) => Object.keys(data).reduce(
    (formData, fieldName) => {
      if (Array.isArray(data[fieldName])) {
        data[fieldName].forEach((element: any) => {
          formData.append(fieldName, element);
        });
        return formData;
      }

      formData.append(fieldName, data[fieldName]);
      return formData;
    },
    new FormData(),
  )
}

export default bodyFromObject;
