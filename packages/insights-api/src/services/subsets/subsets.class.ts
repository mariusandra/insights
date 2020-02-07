import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export interface SubsetData {
  _id?: string,
  connectionId: string,
  type: 'all_data' | 'custom',
  name: string,
  addNewModels: boolean,
  addNewFields: boolean,
  selection: { [key: string]: false | { [key: string]: boolean } }
}

export class Subsets extends Service<SubsetData> {
  constructor (options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }
};
