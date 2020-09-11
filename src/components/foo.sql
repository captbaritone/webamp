PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

--- Add foreign key to tweets
CREATE TABLE tweets_new( 
    id INTEGER NOT NULL UNIQUE, 
    url TEXT, -- When is this null?
    likes INTEGER,
    skin_md5 TEXT, -- When is this null?
    tweet_id TEXT, -- When is this null?
    FOREIGN KEY(skin_md5) REFERENCES skins (md5)
);

INSERT INTO tweets_new SELECT * FROM tweets;

DROP TABLE tweets;

ALTER TABLE tweets_new RENAME TO tweets;


-- Add foreign key to files
CREATE TABLE files_new(
    id INTEGER NOT NULL UNIQUE,
    file_path TEXT NOT NULL,
    source_attribution TEXT,
    skin_md5 TEXT NOT NULL,
    FOREIGN KEY (skin_md5) REFERENCES skins (md5)
);

INSERT INTO files_new SELECT * FROM files;

DROP TABLE files;

ALTER TABLE files_new RENAME TO files;

-- Add foreign key to ia_items
CREATE TABLE ia_items_new(
    id INTEGER NOT NULL UNIQUE,
    skin_md5 TEXT NOT NULL,
    identifier TEXT NOT NULL,
    FOREIGN KEY (skin_md5) REFERENCES skins (md5)
);

INSERT INTO ia_items_new SELECT * FROM ia_items;

DROP TABLE ia_items;

ALTER TABLE ia_items_new RENAME TO ia_items;



-- Add foreign key to skin_reviews
CREATE TABLE skin_reviews_new(
    id INTEGER NOT NULL UNIQUE,
    skin_md5 TEXT NOT NULL,
    review TEXT,
    FOREIGN KEY (skin_md5) REFERENCES skins (md5)
);

INSERT INTO skin_reviews_new SELECT * FROM skin_reviews;

DROP TABLE skin_reviews;

ALTER TABLE skin_reviews_new RENAME TO skin_reviews;

-- Add foreign key to nsfw_predictions
CREATE TABLE nsfw_predictions_new(
    id INTEGER NOT NULL UNIQUE,
    porn REAL,
    neutral REAL,
    sexy REAL,
    hentai REAL,
    drawing REAL,
    skin_md5 TEXT NOT NULL,
    FOREIGN KEY (skin_md5) REFERENCES skins (md5)
);

INSERT INTO nsfw_predictions_new SELECT * FROM nsfw_predictions;

DROP TABLE nsfw_predictions;

ALTER TABLE nsfw_predictions_new RENAME TO nsfw_predictions;
CREATE UNIQUE INDEX idx_skins_md5 ON skins(md5);
CREATE INDEX idx_nsfw_predictions_skin_md5 ON nsfw_predictions(skin_md5);
CREATE INDEX idx_tweets_skin_md5 ON tweets(skin_md5);
CREATE INDEX idx_files_new_skin_md5 ON files(skin_md5);
CREATE INDEX idx_ia_items_skin_md5 ON ia_items(skin_md5);
CREATE INDEX idx_skin_reviews_skin_md5 ON skin_reviews(skin_md5);

COMMIT;

PRAGMA foreign_keys = ON;