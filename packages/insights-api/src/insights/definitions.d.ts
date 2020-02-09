export type ColumnType = 'string' | 'boolean' | 'time' | 'date' | 'number' | 'unknown'
export type AggregationType = 'count' | 'sum' | 'min' | 'max' | 'avg'
export type TruncationType = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
export type FieldType = 'column' | 'custom' | 'link'

export interface StructureColumn {
  type: ColumnType,
  index?: 'primary_key'
}

export interface StructureCustom {
  sql: string
}

export interface StructureLink {
  model: string,
  model_key: string,
  my_key: string
}

export interface ResultsParams {
  connection: string,

  sort: string,
  columns: string[],
  filter: { key: string, value: string }[],

  offset: number, // 0
  limit: number, // 25

  export: 'xlsx' | 'pdf',
  exportTitle: string,

  graphControls: Partial<GraphControls>,

  graphTimeFilter: string, // last-60
  facetsColumn: string,
  facetsCount: number,

  graphOnly: boolean,
  tableOnly: boolean
}

export interface GraphControls {
  type: string, // 'area'
  sort: string, // '123'
  cumulative: boolean,
  percentages: boolean,
  labels: boolean,
  compareWith: number,
  compareWithPercentageLine: boolean,
  compareWithPercentageLineDomain: [number, number],
  prediction: boolean
}

export interface ResultsResponse {

}

export interface GraphResponse {

}

export interface ColumnMetadata {
  column: string,
  path: string,
  type: ColumnType,
  url: string,
  key: string,
  model: string,
  aggregate: AggregationType,
  transform: TruncationType,
  index: string,
  sql: string,
  sqlBeforeTransform: string,
  alias: string
}

export interface SqlQueryResponse {
  rows: {
    [column: string]: any;
  }[]
}

export interface StructureModel {
  enabled: boolean,
  model: string,
  table_name: string,
  primary_key?: string,
  columns: {
    [name: string]: StructureColumn
  },
  custom: {
    [name: string]: StructureCustom
  },
  links: {
    [name: string]: StructureLink
  }
}

export interface Structure {
  [model: string]: StructureModel
}
