import NeDB from 'nedb';
import path from 'path';
import { Application } from '../declarations';

export default function (app: Application) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'connections.db'),
    autoload: true
  });

  return Model;
}
