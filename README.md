# Insights

Installing `insights` is a two-part process:

## Export your app's structure

First you need to create an `insights.yml` file from your main Rails application. This file will describe your database structure,
including custom fields and aliases that you may define.

1. Generate an `insights.yml` file from your Rails app.

*(Coming soon! For now you need to copy `app/services/insights/export_models.rb` to your app manually instead of adding the gem)*

Add `gem 'insights_export'` to your `Gemfile` and run:

```
rake insights:export
```

The generated `config/insights.yml` file needs to be accessible for `insights` in the next steps. I recommend keeping it in your
app's repository and running `rake insights:export` each time your model changes to update it. You can then symlink it to `insights`.

## Install Insights

1. Git clone (or fork and clone) the repository

```
git clone https://github.com/mariusandra/insights
cd insights
```

2. Install the ruby (~2.3) and nodejs (6+) packages:

```
bundle
yarn
```

Make sure the above commands succeed!

3. Setup the local database

Copy `config/database.yml.example` to `config/database.yml`

Edit `config/database` and change the `target_database:` block to point to your app's database.
Feel free to keep the `development` database as SQLite for now, although you might want to use something else in production.

Init the database:

```
bundle exec db:create
bundle exec db:schema:load
```

4. Set up the path to `insights.yml` in `config/initializers/insights.rb` (copy from `config/initializers/insights.rb.example`)

Anything like this, depending on your setup and the location of the file:

```
INSIGHTS_EXPORT_PATH = "#{Rails.root}/insights.yml"
INSIGHTS_EXPORT_PATH = '../my-app/config/insights.yml'
INSIGHTS_EXPORT_PATH = '/srv/my-app/current/config/insights.yml'
```

5. Set up the credentials in `config/initializers/insights.rb`

*(Coming soon. There is no authentication yet!)*

```
config.authentication = [
  ['user', 'password']
]

config.authentication = (connection, user, password) -> do
  results = connection.execute("select encrypted_password from users where email=#{conn.quote(user)} and is_admin = 'true'")
  if results.present? && results.length == 1 && results[0]['encrypted_password'] == encrypt(password)
    user
  else
    nil
  end
end
```

6. Run it!

```
foreman start
```

and open [`http://localhost:3300`](http://localhost:3300)
