import { Application } from '../declarations';
import users from './users/users.service';
import connections from './connections/connections.service';
import views from './views/views.service';
import urls from './urls/urls.service';
import favourites from './favourites/favourites.service';
import connectionTest from './connection-test/connection-test.service';
import results from './results/results.service';
import structure from './structure/structure.service';
import subsets from './subsets/subsets.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(users);
  app.configure(connections);
  app.configure(views);
  app.configure(urls);
  app.configure(favourites);
  app.configure(connectionTest);
  app.configure(results);
  app.configure(structure);
  app.configure(subsets);
}
