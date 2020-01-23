import { ServiceAddons, Params } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy, AuthenticationBaseStrategy, AuthenticationResult } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth, OAuthStrategy } from '@feathersjs/authentication-oauth';

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

class GoogleStrategy extends OAuthStrategy {
  async getEntityData(profile) {
    // this will set 'googleId'
    const baseData = await super.getEntityData(profile, undefined, undefined)

    // this will grab the picture and email address of the Google profile
    return {
      ...baseData,
      profilePicture: profile.picture,
      email: profile.email
    }
  }

  async authenticate(authentication: AuthenticationResult, params: Params) {
    const { email, email_verified } = authentication.id_token.payload

    let user

    if (email && email_verified) {
      const usersService = await this.app.service('users')
      const usersResponse = await usersService.find({ query: { email } })
      user = usersResponse.data[0]
    }

    return {
      authentication: { strategy: this.name },
      user: user
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

  if (app.get('authentication').authStrategies.includes('noLogin')) {
    authentication.register('noLogin', new NoLoginStrategy());
  }

  if (app.get('authentication').authStrategies.includes('google')) {
    authentication.register('google', new GoogleStrategy());
  }

  app.use('/authentication', authentication);
  app.configure(expressOauth());
}
