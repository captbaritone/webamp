function parseQuery(query) {
  const filters = [];
  const newQuery = query.replace(/(-?)filter:(nsfw)/, (_, not, attribute) => {
    filters.push(`${attribute}=${not ? 0 : 1}`);
    return "";
  });
  const options = {};
  if (filters.length) {
    options.filters = filters.join(" AND ");
  }
  return [newQuery, options];
}

export default parseQuery;
