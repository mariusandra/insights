// Initializes the `favourites` service on path `/favourites`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Favourites } from './favourites.class';
import createModel from '../../models/favourites.model';
import hooks from './favourites.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'favourites': Favourites & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/favourites', new Favourites(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('favourites');

  service.hooks(hooks);
}
