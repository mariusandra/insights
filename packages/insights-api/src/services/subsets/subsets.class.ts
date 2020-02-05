import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

interface SubsetData {
  _id?: string,
  connectionId: string,
  type: 'all_data' | 'custom',
  name: string,
  newModels: 'add' | 'skip',
  newFields: 'add' | 'skip',
  selection: { [key: string]: false | { [key: string]: boolean } }
}

export class Subsets extends Service<SubsetData> {
  constructor (options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }
};
