import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export interface ConnectionData {
  _id?: string;
  name: string;
  url: string;
  structurePath?: string;
  timeout?: number;
  timezone?: string;
}

export class Connections extends Service<ConnectionData> {
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }
};
