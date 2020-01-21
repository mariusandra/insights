import path from 'path';
import compress from 'compression';
import helmet from 'helmet';
import cors from 'cors';

import './utils/set-config-folder'
import feathers from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';

import { Application } from './declarations';
import logger from './logger';
import middleware from './middleware';
import services from './services';
import appHooks from './app.hooks';
import channels from './channels';
import authentication from './authentication';
// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers());

// Load app configuration
app.configure(configuration());

if (!app.get('authentication') || !app.get('authentication').secret) {
  throw new Error("A 'secret' must be provided in your authentication configuration")
}

if (process.env.INSIGHTS_DATA) {
  app.set('nedb', process.env.INSIGHTS_DATA)
} else {
  process.env.INSIGHTS_DATA = app.get('nedb') || path.join(process.env.NODE_CONFIG_DIR, 'data')
}

if (process.env.INSIGHTS_PUBLIC_URL) {
  app.set('authentication.jwtOptions.audience', process.env.INSIGHTS_PUBLIC_URL)
}

// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Host the public folder
app.get('/', (req, res) => res.send('<p>Insights API backend!</p>'));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger } as any));

app.hooks(appHooks);

export default app;
