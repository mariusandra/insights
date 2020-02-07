import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export interface ViewData {
  _id?: string;
  name: string;
  path: string;
  connectionId: string,
  subsetId: string
}

export class Views extends Service<ViewData> {
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }
};
