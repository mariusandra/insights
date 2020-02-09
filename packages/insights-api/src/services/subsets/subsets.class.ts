import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';
import {FieldType, StructureColumn, StructureCustom, StructureLink} from "../../insights/definitions";

export interface SubsetData {
  _id?: string,
  connectionId: string,
  type: 'all_data' | 'custom',
  name: string,
  addNewModels: boolean,
  addNewFields: boolean,
  selection?: {
    [key: string]: false | { [key: string]: boolean }
  },
  newFields?: {
    [key: string]: {
      [key: string]: {
        key: string,
        type: FieldType,
        meta: StructureColumn | StructureCustom | StructureLink
      }
    }
  },
  editedFields: {
    [key: string]: {
      [key: string]: {
        key: string,
        originalKey: string,
        type: FieldType,
        meta: StructureColumn | StructureCustom | StructureLink
      }
    }
  }
}

export class Subsets extends Service<SubsetData> {
  constructor (options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }
};
