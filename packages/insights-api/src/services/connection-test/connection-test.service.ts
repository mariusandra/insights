// Initializes the `connection-test` service on path `/connection-test`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ConnectionTest } from './connection-test.class';
import hooks from './connection-test.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'connection-test': ConnectionTest & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/connection-test', new ConnectionTest(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('connection-test');

  service.hooks(hooks);
}
