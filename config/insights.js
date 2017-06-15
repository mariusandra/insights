module.exports = {
  // connection string to your DB. only postgresql for now
  database: 'postgresql://localhost/insights_demo',

  // timezone for the dates
  timezone: 'Europe/Brussels',

  // either a link to the insights.yml file or null to autodetect
  // config: '../insights_demo/config/insights.yml'
  config: null
}
