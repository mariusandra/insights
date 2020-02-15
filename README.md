# Insights

![Insights Explorer](https://user-images.githubusercontent.com/53387/74577340-e68a6000-4f8e-11ea-95bf-4682f545cc8f.png)

**Insights** is a self-hosted "SQL-not-required" data analytics and business intelligence tool. Featuring linkable URLs, easy data exploration, automatic joins, graphs, exports, facets (pivots), saveable views, pretty colors and a ridiculously permissive license (MIT).


## Important Disclaimer and Security Notice!

Please be aware that is an extremely early BETA release of Insights, which has not gone any kind of security audit.
Heck, it might be full of bugs that cause it to leak critical data.

Use on a live server at your own risk!

## Installing

To install, make sure you have Node 10+ installed and then run:

```
npm install -g insights
insights init
insights start
```

This creates a folder `.insights` which contains all the config and runtime data.


## Coming soon

* Export graphs as iframes or react components for easy embedding
* Manage users in the interface
* PDF and XLSX exports (they worked on the old Rails version, but have to be ported to NodeJS)
* Better graph controls
* Graphs that don't require a time column
* View generated SQL
* Dashboards
* Multiple lines from different sources on one chart in the dashboard
* Polishing


## Development

If you want to help with development, run these steps:

```sh
# 1. fork the repo in github

# 2. clone it
git clone git@github.com:<YOUR_NAME_HERE>/insights.git

# 3. install all dependencies
cd insights
yarn

# 4. start the app
yarn run init
yarn start

# 5. open http://localhost:3000/ and hack away
```
