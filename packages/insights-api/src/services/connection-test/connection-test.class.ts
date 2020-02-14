import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createAdapter from '../../insights/adapter'
import getStructure from '../../insights/structure'

interface Data {}

interface ServiceOptions {}

export class ConnectionTest implements Partial<ServiceMethods<Data>> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data> {
    try {
      const { url, structurePath } = params.query

      // check that this doesn't throw up
      await createAdapter(url, 60, 'UTC').test()

      // if we want a structure from a file, test that it exists
      if (structurePath) {
        await getStructure(structurePath)
      }

      return Promise.resolve({
        working: true
      })
    } catch (e) {
      return Promise.resolve({
        working: false,
        error: e.message
      })
    }
  }
}
