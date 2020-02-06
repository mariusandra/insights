// Initializes the `views` service on path `/views`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Views } from './views.class';
import createModel from '../../models/views.model';
import hooks from './views.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'views': Views & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate,
    multi: ['remove']
  };

  // Initialize our service with any options it requires
  app.use('/views', new Views(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('views');

  service.hooks(hooks);
}
