import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export class Connections extends Service {
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }
};
