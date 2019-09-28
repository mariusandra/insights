// Initializes the `results` service on path `/results`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Results } from './results.class';
import hooks from './results.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'results': Results & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/results', new Results(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('results');

  service.hooks(hooks);
}
