export const uniqueBy = <T>(property: string, items: T[]): T[] =>
  items.filter((item, index) =>
    Boolean(items.findIndex((i) => i[property] === item[property]) === index)
  )
