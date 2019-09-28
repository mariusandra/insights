import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

interface UrlData {
  _id?: string;
  code: string;
  path: string;
}

export class Urls extends Service<UrlData> {
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }
};
