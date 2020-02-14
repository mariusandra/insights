import React from 'react'
import { kea, useValues } from 'kea'
import { push } from 'connected-react-router'
import Spinner from '../../lib/tags/spinner'
import client from 'lib/client'

const urlService = client.service('urls')

const logic = kea({
  actions: () => ({
    goToUrl: code => ({ code }),
    urlError: true
  }),

  reducers: ({ actions }) => ({
    isLoading: [true, {
      [actions.goToUrl]: () => true,
      [actions.urlError]: () => false
    }]
  }),

  events: ({ actions }) => ({
    afterMount: () => {
      const path = window.location.pathname
      console.log(path)
      actions.goToUrl(path.split('/').slice(-1)[0])
    }
  }),

  listeners: ({ actions, store }) => ({
    [actions.goToUrl]: async ({ code }) => {
      try {
        const urls = await urlService.find({query: {code: code}})

        const url = urls.data[0]
        if (url) {
          store.dispatch(push(url.path))
        } else {
          actions.urlError()
        }
      } catch (e) {
        actions.urlError()
      }
    }
  })
})

export default function () {
  const { isLoading } = useValues(logic)

  return <div>{isLoading ? <Spinner /> : <div style={{ color: 'red', textAlign: 'center', marginTop: 50 }}>Error Loading Short URL</div>}</div>
}
