import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import getStructure from '../../insights/structure'

interface Data {}

interface ServiceOptions {}

export class Structure implements Partial<ServiceMethods<Data>> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async get (id: Id, params?: Params): Promise<Data> {
    const { url, structurePath } = await this.app.service('connections').get(id)

    return getStructure(structurePath, url)
  }
}
