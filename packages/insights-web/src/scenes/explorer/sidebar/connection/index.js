import React from 'react'
import { ButtonGroup, Dialog } from "@blueprintjs/core";

import Database from './database'
import Subset from './subset'

export default function Connection () {
  return (
    <>
      <ButtonGroup>
        <Database />
        <Subset />
      </ButtonGroup>
    </>
  )
}
