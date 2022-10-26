export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum FilterCondition {
  EQ = '$eq',
  NE = '$ne',
  GT = '$gt',
  LT = '$lt',
  GTE = '$gte',
  LTE = '$lte',
  STARTS = '$starts',
  ENDS = '$ends',
  CONT = '$cont',
  EXCL = '$excl',
  IS_NULL = '$isnull',
  NOT_NULL = '$notnull',
  EQ_L = '$eqL',
  NE_L = '$neL',
  STARTS_L = '$startsL',
  ENDS_L = '$endsL',
  CONT_L = '$contL',
  EXCL_L = '$exclL',
}

export const conditionsTemplates = new Map<
  FilterCondition,
  (field: string, param: string) => string
>([
  [FilterCondition.EQ, (field, param) => `"${field}" = :${param}`],
  [FilterCondition.NE, (field, param) => `"${field}" != :${param}`],
  [FilterCondition.GT, (field, param) => `"${field}" > :${param}`],
  [FilterCondition.LT, (field, param) => `"${field}" < :${param}`],
  [FilterCondition.GTE, (field, param) => `"${field}" >= :${param}`],
  [FilterCondition.LTE, (field, param) => `"${field}" <= :${param}`],
  [
    FilterCondition.STARTS,
    (field, param) => `"${field}" LIKE :${param} || '%'`,
  ],
  [FilterCondition.ENDS, (field, param) => `"${field}" LIKE '%' || :${param}`],
  [
    FilterCondition.CONT,
    (field, param) => `"${field}" LIKE '%' || :${param} || '%'`,
  ],
  [
    FilterCondition.EXCL,
    (field, param) => `"${field}" NOT LIKE '%' || :${param} || '%'`,
  ],
  [FilterCondition.IS_NULL, (field, param) => `"${field}" IS NULL`],
  [FilterCondition.NOT_NULL, (field, param) => `"${field}" IS NOT NULL`],
  [FilterCondition.EQ_L, (field, param) => `LOWER("${field}") = :${param}`],
  [FilterCondition.NE_L, (field, param) => `LOWER("${field}") != :${param}`],
  [
    FilterCondition.STARTS_L,
    (field, param) => `"${field}" ILIKE :${param} || '%'`,
  ],
  [
    FilterCondition.ENDS_L,
    (field, param) => `"${field}" ILIKE '%' || :${param}`,
  ],
  [
    FilterCondition.CONT_L,
    (field, param) => `"${field}" ILIKE '%' || :${param} || '%'`,
  ],
  [
    FilterCondition.EXCL_L,
    (field, param) => `"${field}" NOT ILIKE '%' || :${param} || '%'`,
  ],
]);
