/**
 * Splits a search into its words and its has:/filter: terms. Returns:
 *
 * - The words.
 * - The terms as Algolia search parameters (`filters`, `numericFilters`).
 * - The terms as the filters our own search applies (search_classic_skins):
 *   `{ ani: true }` for has:ani, `{ nsfw: false }` for -filter:nsfw.
 * - Whether those say everything the terms do. A comparison
 *   (has:transparency>100) or an attribute we don't know (has:sparkles)
 *   can't be said there.
 */
function parseQuery(query) {
  const filters = [];
  const numericFilters = [];
  const searchFilters = {};
  let searchFiltersComplete = true;
  const newQuery = query
    .replace(
      /has:([a-z]+)([><]=?)(\d+)/g,
      (_, attribute, comparison, number) => {
        searchFiltersComplete = false;
        const numericAttribute = numericAttributeMap[attribute];
        if (numericAttribute == null) {
          return undefined;
        }
        numericFilters.push(`${numericAttribute.name}${comparison}${number}`);
        return "";
      }
    )
    .replace(/(-?)(filter|has):([a-z]+)/g, (_, not, __, attribute) => {
      const numericAttribute = numericAttributeMap[attribute];
      const boolAttribute = boolAttributeMap[attribute];
      // If you try to do a boolean filter on a numeric attribute, we'll use our
      // boolThreshold to determine if it's true or false
      if (numericAttribute != null) {
        const comparison = not ? "<=" : ">=";
        numericFilters.push(
          `${numericAttribute.name}${comparison}${numericAttribute.boolThreshold}`
        );
        searchFilters[attribute] = !not;
      } else if (boolAttribute != null) {
        filters.push(`${boolAttribute.name}=${not ? 0 : 1}`);
        searchFilters[attribute] = !not;
      } else {
        searchFiltersComplete = false;
      }
      return "";
    });
  const options = {};
  if (filters.length) {
    options.filters = filters.join(" AND ");
  }
  if (numericFilters.length) {
    options.numericFilters = numericFilters.join(" AND ");
  }
  return [newQuery, options, searchFilters, searchFiltersComplete];
}

const boolAttributeMap = {
  cur: { name: "cur", category: "cursors" },
  ani: { name: "ani", category: "cursors" },
  playlist: { name: "playlist", category: "windows" },
  media: { name: "media", category: "windows" },
  browser: { name: "browser", category: "windows" },
  equalizer: { name: "equalizer", category: "windows" },
  general: { name: "general", category: "windows" },
  video: { name: "video", category: "windows" },
  mikro: { name: "mikro", category: "plugin" },
  vidamp: { name: "vidamp", category: "plugin" },
  avs: { name: "avs", category: "plugin" },
  nsfw: { name: "nsfw", category: "review" },
  // To Add
  /* Has readme */
  /* Is skinamp */
};

// Our own search's transparency and likes filters use these thresholds
// too (see api/graphql/resolvers/SkinResolver.ts).
const numericAttributeMap = {
  transparency: {
    name: "transparentPixels",
    boolThreshold: 4000,
  },
  likes: {
    name: "twitterLikes",
    boolThreshold: 1,
  },
};

export default parseQuery;

// transparentPixels >= 4000;
// transparentPixels > 4000;
