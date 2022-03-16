const DEFAULT_QUERY = `# Winamp Skins GraphQL API
#
# https://skins.webamp.org
#
# This is a GraphQL API for the Winamp Skin Museum's database.
# It's mostly intended for exploring the data set. Please feel
# free to have a look around and see what you can find!
#
# The GraphiQL environment has many helpful features to help
# you discover what fields exist and what they mean, so be bold!
#
# If you have any questions or feedback, please get in touch:
# - Twitter: @captbaritone
# - Email: jordan@jordaneldredge.com
# - Discord: https://webamp.org/chat


# An example query to get you started...
query MyQuery {

  # Search for a skin made by LuigiHann
  search_skins(query: "luigihann zelda", first: 1) {
    # The filename of the skin
    filename
    download_url
    museum_url

    # Try hovering the returned url
    # for a preview of the skin -->
    screenshot_url

    # All the tweets that shared this skin
    tweets {
      likes
      retweets
      url
    }

    # Information about the files contained within the skin
    archive_files {
      filename
      # For image files, try hovering the
      # returned url --->
      url
      # Date the file was created according to the zip file
      date
    }
  }
}`;

export default DEFAULT_QUERY;
