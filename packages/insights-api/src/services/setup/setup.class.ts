import fs from 'fs'
import path from 'path'
import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import {inSetupMode} from "../../utils/in-setup-mode";
import randomString from "../../utils/random-string";

interface Data {
  authStrategy: 'noLogin' | 'local',
  email: string,
  password: string
}

interface ServiceOptions {}

export class Setup implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  async get (id: Id, params?: Params): Promise<any> {
    if (id === 'setup' && inSetupMode(this.app)) {
      return {
        inSetupMode: true
      }
    }
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (!inSetupMode(this.app)) {
      throw new Error('what??')
    }

    const secretKey = randomString(64)
    const template = {
      authentication: {
        secret: secretKey,
        authStrategies: ['jwt', params.authStrategy]
      }
    }

    if (!process.env.NODE_CONFIG_DIR) {
      throw new Error('No config folder!')
    }

    fs.writeFileSync(path.join(process.env.NODE_CONFIG_DIR, 'insights.json'), JSON.stringify(template, null, 2))

    if (params.authStrategy === 'local') {
      // TODO: create new app with new auth strategies
      // TODO: create user in that app
    }

    // TODO: figure out a way to reload the app

    return data;
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
