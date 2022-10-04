function parseQuery(query) {
  const filters = [];
  const newQuery = query.replace(
    /(-?)(filter|has):([a-z]+)/g,
    (_, not, __, attribute) => {
      filters.push(`${attribute}=${not ? 0 : 1}`);
      return "";
    }
  );
  const options = {};
  if (filters.length) {
    options.filters = filters.join(" AND ");
  }
  return [newQuery, options];
}

export default parseQuery;
