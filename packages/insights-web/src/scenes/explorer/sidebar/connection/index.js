import React from 'react'
import { Button } from "antd";

import Database from './database'
import Subset from './subset'

export default function Connection () {
  return (
    <Button.Group>
      <Database />
      <Subset />
    </Button.Group>
  )
}
