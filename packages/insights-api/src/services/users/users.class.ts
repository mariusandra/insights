import { Service, NedbServiceOptions } from 'feathers-nedb'
import { Application } from '../../declarations'

interface UserData {
  _id?: string;
  email: string;
  password: string;
  roles: string[];
}

export class Users extends Service<UserData> {
  constructor (options: Partial<NedbServiceOptions>, app: Application) {
    super(options)
  }
};
