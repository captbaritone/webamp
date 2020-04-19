const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const Skins = require("./data/skins");

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
enum TweetStatus {
    TWEETED
    REJECTED
    APPROVED
    UNREVIEWED
}
type InternetArchiveItem {
    url: String
    skinFilename: String
}
  type Skin {
    md5: String!
    canonicalFilename: String
    filenames: [String]
    emails: [String]
    tweetUrl: String
    skinUrl: String
    screenshotUrl: String
    averageColor: String
    webampUrl: String
    tweetStatus: TweetStatus
    readmeText: String
    internetArchiveItem: InternetArchiveItem
    imageHash: String
    uploader: String
  }
  type Query {
    skin(md5: String!): Skin
    skins(imageHash: String!): [Skin]
  }
`);

class InternetArchiveItem {
  constructor(md5) {
    this._md5 = md5;
    this._itemPromise = Skins.getInternetArchiveItem(md5);
  }

  async url() {
    const item = await this._itemPromise;
    if (item == null) {
      return null;
    }
    return Skins.getInternetArchiveUrl(item.identifier);
  }

  async skinFilename() {
    const item = await this._itemPromise;
    if (item == null) {
      return null;
    }
    return item.skinFileName;
  }
}

class Skin {
  static async fromMd5(md5) {
    return new Skin(await Skins.getSkinByMd5(md5));
  }

  constructor(data) {
    this._data = data;
  }

  md5() {
    return this._data.md5;
  }

  async _get(getter) {
    return getter(this._data);
  }

  async canonicalFilename() {
    return this._get((skin) => skin.canonicalFilename);
  }

  async filenames() {
    return this._get((skin) => skin.fileNames);
  }

  async emails() {
    return this._get((skin) => skin.emails);
  }

  async tweetUrl() {
    return this._get((skin) => skin.tweetUrl);
  }

  async skinUrl() {
    return this._get((skin) => skin.skinUrl);
  }

  async screenshotUrl() {
    return this._get((skin) => skin.screenshotUrl);
  }

  async webampUrl() {
    return this._get((skin) => skin.webampUrl);
  }

  async tweetStatus() {
    return Skins.getStatus(this._md5);
  }

  async readmeText() {
    return this._get((skin) => skin.readmeText);
  }

  async averageColor() {
    return this._get((skin) => skin.averageColor);
  }

  async imageHash() {
    return this._get((skin) => skin.imageHash);
  }

  async uploader() {
    return this._get(skin => skin.upload);
  }

  internetArchiveItem() {
    return new InternetArchiveItem(this._md5);
  }
}

// The root provides a resolver function for each API endpoint
const root = {
  skin: async ({ md5, query }) => {
    return Skin.fromMd5(md5);
  },
  skins: async ({ imageHash }) => {
    if (imageHash) {
      const matches = await Skins.getMd5sMatchingImageHash(imageHash);
      return matches.map(({ md5 }) => Skin.fromMd5(md5));
    }
    return [];
  },
};

exports.default = function () {
  return graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  });
};
