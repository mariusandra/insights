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

