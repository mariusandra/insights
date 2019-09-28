import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';

import getStructure from '../../insights/structure'
import createAdapter from '../../insights/adapter'
import FindResults from '../../insights/results'

interface Data {}

interface ServiceOptions {}

export class Results implements Partial<ServiceMethods<Data>> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    const { connection } = params.query || {}
    const connectionsResult = await this.app.service('connections').find({ query: { keyword: connection } })

    const { structurePath, url } = connectionsResult.data[0]

    const structure = await getStructure(structurePath, url)
    const adapter = createAdapter(url)

    const results = new FindResults({ params: params.query, adapter, structure })
    return results.getResponse()
  }
}
