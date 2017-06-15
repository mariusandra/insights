# Insights

As our [education marketplace](https://www.apprentus.com) grew, we faced a dilemma: we had little visibility into our data.

Questions such as *"who is our best customer?"*, *"which target countries are gaining in sales?"* or *"what are our most popular categories for paid leads?"* required tinkering in the Rails console or writing custom stats pages. We lost *a lot* of developer time over the years.

So we started looking for the best **Business Intelligence** solution out there.

Unfortunately, they all had their problems. Some required knowledge of SQL. Some made multi-table data exploration a pain. Most cost an arm, a leg and an iPhone. Per month.

The best tool we found was [Looker](https://looker.com/), but at a monthly price equal to our burn rate, it wouldn't work.

So I decided to re-implement the essential parts of Looker as an open source alternative.

**Insights** is a desktop or self-hosted "SQL-not-required" data analytics and business intelligence tool. Featuring linkable URLs, easy data exploration, automatic joins, graphs, exports, facets (pivots), saveable views, pretty colors and a ridiculously permissive license (MIT).

It's a work in progress and you're brave for checking it out! Cheers!

[Play with the demo here](http://insights-demo.mariusandra.com/).

![Screenshot of the Explorer](https://github.com/mariusandra/insights/raw/master/doc/screenshot-views.png)

![Screenshot of the Dashboard](https://github.com/mariusandra/insights/raw/master/doc/screenshot-dashboard.png)

## Installing

To install, make sure you have Node 7.6+ installed and then run:

```
npm install -g insights@latest

insights          # run the electron version
insights --server # run the server
```

## How does it work

Similar to Looker and their LookML, insights lets you to define your data model in a file called [`insights.yml`](https://github.com/mariusandra/insights_demo/blob/master/config/insights.yml).

If this file is not found, we try to autodetect your database schema and connections.

You can use the [`insights_export`](https://github.com/mariusandra/insights_export) gem to generate this file from your Rails Models. Adapters for other frameworks coming soon.

You keep this file with your code and update it whenever something changes. You edit it to add custom fields (e.g. `full_name: first_name || ' ' || last_name`), hide existing fields (e.g. `encrypted_password`) or hide entire models.

When your database changes, run `rake insights:export` and the file is updated automatically.

One entry in this file looks like this:

```yaml
Order:
  enabled: true  # set to false to hide
  model: Order
  table_name: orders
  primary_key: id
  columns:
    id:
      type: number
      index: primary_key
    total_price:
      type: number
    hidden_field: false # this stays hidden
    currency:
      type: string
    # ...
  custom:
    total_price_in_eur:
      sql: "$$.total_price * $$.currency_to_eur"
      type: number
  links:
    order_lines:
      model: OrderLine
      model_key: order_id
      my_key: id
    user:
      model: User
      model_key: id
      my_key: user_id
```

You give this `insights.yml` file and a database connection to `insights` and start exploring.

The point is this: your developers update the `.yml` file. Your CEO and CFO browse the interface. If they ask for a report, you send them a link to the right view and they can explore further.

## How to use

[Play with the demo here](http://insights-demo.mariusandra.com/) and try to answer the following questions:

1. Which product has been bought the most? ([solution](http://insights-demo.mariusandra.com/explorer?columns=Product.title%2CProduct.order_lines.total_price_in_eur%21%21sum%2CProduct.order_lines.id%21%21count%2CProduct.order_lines.quantity%21%21avg&facetsColumn=&facetsCount=6&graphCumulative=false&graphTimeFilter=last-60&percentages=false&redirect_path=explorer&sort=-Product.order_lines.total_price_in_eur%21%21sum&treeState=Product%2CProduct.order_lines))
2. Sales by country by month ([solution](http://insights-demo.mariusandra.com/explorer?columns=Order.total_price_in_eur!!sum%2COrder.user.country.name%2COrder.confirmed_at!month&sort=-Order.confirmed_at!day&treeState=Order%2COrder.user%2COrder.user.country&graphTimeFilter=last-365&facetsColumn=Order.user.country.name&facetsCount=6&graphCumulative=false&percentages=false&filter%5B0%5D=Order.confirmed%3Dequals%3Atrue)) - export it as a PDF as well!
3. Sales by delivery status ([solution](http://insights-demo.mariusandra.com/explorer?columns=Order.total_price_in_eur!!sum%2COrder.user.country.name%2COrder.status%2COrder.created_at!month&sort=-Order.created_at!day&treeState=Order%2COrder.user%2COrder.user.country&graphTimeFilter=last-365&facetsColumn=Order.status&facetsCount=6&graphCumulative=false&percentages=false))
4. Where are your users from ([solution](http://insights-demo.mariusandra.com/explorer?columns=User.country.name%2CUser.id!!count&sort=-User.id!!count&treeState=User%2CUser.country&graphTimeFilter=last-365&facetsColumn=User.country.name&facetsCount=6&graphCumulative=false&percentages=false))
5. ... by month? ([solution](http://insights-demo.mariusandra.com/explorer?columns=User.country.name%2CUser.id!!count%2CUser.created_at!month&sort=-User.created_at!day&treeState=User%2CUser.country&graphTimeFilter=last-365&facetsColumn=User.country.name&facetsCount=6&graphCumulative=false&percentages=false))
6. ... only ones with confirmed orders? ([solution](http://insights-demo.mariusandra.com/explorer?columns=User.country.name%2CUser.id!!count%2CUser.created_at!month%2CUser.orders.confirmed&sort=-User.created_at!day&treeState=User%2CUser.country%2CUser.orders&graphTimeFilter=last-365&facetsColumn=User.country.name&facetsCount=6&graphCumulative=false&percentages=false&filter%5B0%5D=User.orders.confirmed%3Dequals%3Atrue))

Hint: to count rows, select the `id` field and then `count` from the table header.

## Coming soon

* Dashboards
* Better graph controls
* Graphs that don't require a time column
* View generated SQL
* Moderate React/[Kea](https://github.com/mariusandra/kea) frontend code refactoring
* Polishing
