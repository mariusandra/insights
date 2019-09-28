// Initializes the `structure` service on path `/structure`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Structure } from './structure.class';
import hooks from './structure.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'structure': Structure & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/structure', new Structure(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('structure');

  service.hooks(hooks);
}
