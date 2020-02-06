// Initializes the `connections` service on path `/connections`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Connections } from './connections.class';
import createModel from '../../models/connections.model';
import hooks from './connections.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'connections': Connections & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const Model = createModel(app);
  const paginate = false;

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/connections', new Connections(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('connections');

  service.hooks(hooks);
}
