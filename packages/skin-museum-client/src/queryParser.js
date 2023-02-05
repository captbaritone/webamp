function parseQuery(query) {
  const filters = [];
  const numericFilters = [];
  const newQuery = query
    .replace(
      /has:([a-z]+)([><]=?)(\d+)/g,
      (_, attribute, comparison, number) => {
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
      } else if (boolAttribute != null) {
        filters.push(`${boolAttribute.name}=${not ? 0 : 1}`);
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
  return [newQuery, options];
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
