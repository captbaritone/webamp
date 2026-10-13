// SQLite's FTS5 MATCH expressions have their own query syntax, so user input
// can't be handed to it directly. Common searches like "rock's", "drum-n-bass"
// or "C++" are syntax errors, and a bare "AND" or an unbalanced quote will
// throw too. Algolia accepted anything, so now that it backs the museum's
// search we have to do the escaping ourselves.
//
// We tokenize roughly the way FTS5's default unicode61 tokenizer does (runs of
// letters and numbers, everything else a separator) and wrap each token in
// quotes so none of it can be read as an operator.

// Prefix matching a single character matches a large share of the index, which
// is slow to rank and useless to the user, so we don't bother.
const MIN_PREFIX_LENGTH = 2;

/**
 * Convert a user's search input into an FTS5 MATCH expression. Returns null if
 * the input has nothing searchable in it, in which case there's no query to
 * run.
 */
export function ftsMatchExpression(userInput: string): string | null {
  const tokens = userInput.match(/[\p{L}\p{N}]+/gu);
  if (tokens == null) {
    return null;
  }

  return tokens
    .map((token, i) => {
      const phrase = `"${token}"`;
      // Algolia prefix matched the last word of a query, which is what makes
      // results show up while you're still typing it. Keep that.
      const isLastToken = i === tokens.length - 1;
      return isLastToken && token.length >= MIN_PREFIX_LENGTH
        ? `${phrase}*`
        : phrase;
    })
    .join(" ");
}
