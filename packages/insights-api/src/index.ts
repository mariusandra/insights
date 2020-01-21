import logger from './logger';
import app from './app';

const host = process.env.INSIGHTS_HOST || app.get('host');
const port = process.env.INSIGHTS_PORT || app.get('port');
const server = app.listen(port, host);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);
