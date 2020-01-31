import React from 'react'
import { Button } from "antd";
import { useValues } from 'kea'

import Database from './database'
import Subset from './subset'

import connectionsLogic from './logic'

export default function Connection () {
  const { selectedConnection } = useValues(connectionsLogic)

  return (
    <Button.Group>
      <Database />
      {selectedConnection ? <Subset /> : null}
    </Button.Group>
  )
}
