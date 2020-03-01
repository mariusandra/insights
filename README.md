# Insights

Insights is a tool to visually explore a PostgreSQL database, with an emphasis on generating graphs that show business performance over time.

Think of Google Data Studio or Google Looker, but totally free, self-hosted and without the "Google" part.

See a [**live demo**](https://demo.insights.sh/) for Widgets Inc, a fictional e-commerce site.

![Insights Explorer](https://user-images.githubusercontent.com/53387/74577340-e68a6000-4f8e-11ea-95bf-4682f545cc8f.png)

## Important Disclaimer and Security Notice!

Please be aware that is an extremely early BETA release of Insights, which has not gone through any kind of security audit.

Use on a live server at your own risk!

## Installing

To install, make sure you have Node 10+ installed and then run:

```
npm install -g insights
insights init
insights start
```

This creates a folder `.insights` which contains all the config and runtime data.

## Implemented Features

* Self Hosted, installed via NPM
* PostgreSQL connection support
* Auto-detect your database schema, including all foreign keys!
* Connect to multiple databases
* Edit the schema and add custom SQL fields right there in the interface!
* Create subsets of your data (e.g. share only a few fields with marketing)
* Data explorer
* Filters on the data
* Time-based graphs
* Split the graph by some column (e.g. new users by country name)
* Keyboard navigation in the sidebar
* Saved views
* Pinned fields


## Coming Soon

* Embed React or <iframe> components and get data through the insights API
* Decent mobile support
* Log in with your Google Account
* Manage users in the interface
* Access control for subsets
* PDF and XLSX exports
* Way more and better graphs
* View generated SQL
* Dashboards
* Multiple lines from different sources on one chart in the dashboard
* Plugins?


## Support

Insights is MIT-licensed Sponsorware. If you use it in your business, please [contribute](https://github.com/sponsors/mariusandra) towards its development!

To stay in touch and receive news when we release a significant update, [please sign up here](http://eepurl.com/gTlRkf).

You can also [follow me on Twitter](https://twitter.com/mariusandra) to receive the latest updates.
 

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
