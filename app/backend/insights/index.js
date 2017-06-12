// import 'babel-polyfill'

// import { database, config } from '../../config/insights'

// import getStructure from './structure'
// import createAdapter from './adapter'
// import Results from './results'

const { database, config } = require('../../config/insights')

const getStructure = require('./structure')
const createAdapter = require('./adapter')
const Results = require('./results')

function main () {
  const structure = getStructure(config)
  const adapter = createAdapter(database)
  // const params = {
  //   columns: ['User.country.name', 'User.id!!count', 'User.created_at!month', 'User.orders.confirmed'],
  //   sort: '-User.created_at!day',
  //   filter: [{ key: 'User.orders.confirmed', value: 'equals:true' }],
  //   facetsColumn: 'User.country.name',
  //   facetsCount: 6,
  //   graphTimeFilter: 'last-365',
  //   graphCumulative: false,
  //   percentages: false,
  //   offset: 0,
  //   limit: 81
  // }

  const params = {"columns":["Product.title","Product.order_lines.total_price_in_eur!!sum","Product.order_lines.id!!count","Product.order_lines.quantity!!avg"],"sort":"-Product.order_lines.total_price_in_eur!!sum","filter":[],"facetsColumn":null,"facetsCount":6,"graphTimeFilter":"last-60","graphCumulative":false,"percentages":false,"offset":0,"limit":48}

  const results = new Results({ params, adapter, structure })
  results.getResponse().then(response => {
    console.log(response)
  })
}

main()
