const minWidth = 2;

export const getTokenWidth = (value) =>
  `${Math.max(value.length + 1, minWidth)}ch`;
