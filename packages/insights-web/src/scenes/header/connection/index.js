import React from 'react'
import { ButtonGroup } from "@blueprintjs/core";

import Database from './database'
import Subset from './subset'

export default function Connection () {
  return (
    <ButtonGroup style={{ minWidth: 120, marginRight: 20 }}>
      <Database />
      <Subset />
    </ButtonGroup>
  )
}
