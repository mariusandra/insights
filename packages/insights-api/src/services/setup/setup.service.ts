// Initializes the `setup` service on path `/setup`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Setup } from './setup.class';
import hooks from './setup.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'setup': Setup & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/setup', new Setup(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('setup');

  service.hooks(hooks);
}
