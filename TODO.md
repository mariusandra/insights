1. Make /url/:code paths work

```js
  app.get('/url/:code', async function (req, res) {
    const results = await service.find({ query: { code: req.params.code } })

    if (results.total > 0) {
      res.redirect(results.data[0].path)
    } else {
      res.send('<p>Short URL not found!</p>')
    }
  })
```

2. Check that you can't just CREATE users on the service

3. Make it possible to run it like so:

  `npx insights start`
  
It will ask you questions if it can't find its own config data

It will create a ".insights/config.yml" to store its config if none found.

.insights
insights
config/insights

This will contain the ENV for insights like DB paths.

Also optional schema files (current insights.yml):

