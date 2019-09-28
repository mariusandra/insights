import { Application } from '../declarations';
import users from './users/users.service';
import connections from './connections/connections.service';
import views from './views/views.service';
import urls from './urls/urls.service';
import favourites from './favourites/favourites.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(users);
  app.configure(connections);
  app.configure(views);
  app.configure(urls);
  app.configure(favourites);
}
