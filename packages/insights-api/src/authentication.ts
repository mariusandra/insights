import { ServiceAddons, Params } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy, AuthenticationBaseStrategy, AuthenticationResult } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth } from '@feathersjs/authentication-oauth';

import { Application } from './declarations';

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

class NoLoginStrategy extends AuthenticationBaseStrategy {
  async authenticate(authentication: AuthenticationResult, params: Params) {
    const usersService = await this.app.service('users')
    const users = await usersService.find()

    return {
      authentication: { strategy: this.name },
      user: users.data[0]
    }
  }
}

export default function(app: Application) {
  const authentication = new AuthenticationService(app);

  if (app.get('authentication').authStrategies.includes('jwt')) {
    authentication.register('jwt', new JWTStrategy());
  }

  if (app.get('authentication').authStrategies.includes('local')) {
    authentication.register('local', new LocalStrategy());
  }

  if (app.get('authentication').noLogin) {
    authentication.register('noLogin', new NoLoginStrategy());
  }

  app.use('/authentication', authentication);
  app.configure(expressOauth());
}
