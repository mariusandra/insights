import { ResultsParams, ResultsResponse } from '../../insights/definitions'
import { Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createAdapter from '../../insights/adapter'
import FindResults from '../../insights/results'

interface ServiceOptions {}
interface ResultsServiceParams extends Params {
  query: ResultsParams
}

export class Results implements Partial<ServiceMethods<ResultsResponse>> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (params: ResultsServiceParams): Promise<ResultsResponse> {
    return await this.find(params)
  }

  async find (params: ResultsServiceParams): Promise<ResultsResponse> {
    const connectionsService = this.app.service('connections')
    const structureService = this.app.service('structure')

    const { connection } = params.query
    const [connectionId, subsetId] = connection.split('--')

    const connectionsResult = await connectionsService.get(connectionId)
    const { url, timeout, timezone } = connectionsResult

    const structure = await structureService.get(connectionId, { query: { subsetId } })

    const adapter = createAdapter(url, timeout, timezone)

    const results = new FindResults({ params: params.query, adapter, structure })
    return results.getResponse()
  }
}
