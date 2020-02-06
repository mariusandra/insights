// Initializes the `subsets` service on path `/subsets`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Subsets } from './subsets.class';
import createModel from '../../models/subsets.model';
import hooks from './subsets.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'subsets': Subsets & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: false,
    multi: ['remove']
  };

  // Initialize our service with any options it requires
  app.use('/subsets', new Subsets(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('subsets');

  service.hooks(hooks);
}
