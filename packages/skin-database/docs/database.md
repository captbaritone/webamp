# Database

The Winamp Skin Museum, and related projects (Twitter bot, Discord bot), are powered by an SQLite database which is not included in this repository, but a copy can be obtained by reaching out directly.

For reference, the tables/colums are as follows:

## algolia_field_updates

The search feature on [skins.webamp.org](https://skins.webamp.org) is powered by [Algolia](https://www.algolia.com/) third-party search. Data about each skin is pushed up to Algolia as it changes. In order to make re-indexing (pushing) efficient, in the case that we want to invalidate some values, here we track each time we update a field in Algolia.

- `id` A unique ID for this update
- `update_timestamp` The time at which this field was pushed to Algolia
- `field` The field in the search index that was updated
- `skin_md5` The md5 hash of the skin (see the `skins` table)

## instagram_posts

For a while we were posting skins to [Instagram](https://www.instagram.com/winampskinsbot/) trying to replicate the success of the Twitter bot. It didn't catch on, so we stopped. However, we have an index of all the posts that were made.

- `id` A unique ID for this post (local to this database)
- `skin_md5` The md5 hash of the skin that was posted (see the `skins` table)
- `post_id` The Instagram ID of this post
- `url` The URL of this Instagram post

## screenshot_updates

The Winamp Skin Museum's main feature is uniform screenshots of each classic Winamp skin. These screenshots are generated using a script that [Puppeteer](https://pptr.dev/) and webamp.org. If we make changes to that script, or fix bugs in Webamp, we may want to retake these screenshots and reupload them to S3. Similarly, we may want to track skins which fail to render or otherwise work in the screenshot script. This table records each time we retake the screenshots so that we can inteligently decide if we want to retake the screenshot at any given time.

- `id` A unique ID for this update
- `update_timestamp` When the screenshot was taken
- `skin_md5` The md5 hash of the skin that was updated (see the `skins` table)
- `success` (bool) Was this screenshot/update successful?
- `error_message` (string) Error message encountered when taking the sceenshot

## archive_files

Each skin is actually a zip file. As part of the database, we examine the contents of each zip archvive and record metadata about the inner files. Each row in this table represents a file found within a Winamp skin's zip archive.

- `id` A unique ID for this file
- `skin_md5` The md5 hash of the skin that this file was found within (see the `skins` table)
- `file_name` The file path of this file within the archive
- `file_md5` The md5 hash of the file after being extracted from the zip
- `file_date` The date that the file was created (according to the zip metadata)
- ~~`uncompressed_size` The size of the file, afterbeing decompressed~~ **Deprecated, see the `file_info` table.**
- ~~`text_content` If the file is a text file, this column contains that text~~ **Deprecated, see the `file_info` table.**
- `is_directory` (bool) Is this file a directory?

## key_value

For some cron jobs and async tasks we want to track arbitrary state and efficiency is not a concern. For these quick things we have a key/value store where the value is often a json blob, and we just overwrite the whole thing each time.

`key` - I'll give you one guess...
`value` - I think you can see where I'm going here

## skin_reviews

Before a skin can be tweeted by the Twitter bot, it must firt be approved by someone in the Discord server. This helps keep the quality bar somewhat high (fewer low effort skins getting shared) and also helps us avoid sharing NSFW skins on Twitter.

Additionally, skins marked as NSFW are blurred and down-ranked on the Skin Musuem.

These are all human reviews. Note that the bot will create both a `NSFW` and `REJECTED` review when a skin is marked as NSFW.

- `id` A unique ID for this review
- `skin_md5` The md5 hash of the skin being reviewed (see the `skins` table)
- `review` One of `REJECTED`, `APPROVED`, `NSFW`
- `reviewer` (Often missing) the user who did the review

## file_info

Metadata about files extracted from zip files. Because many skins contain the same files, or some files are duplicated in many skins, we normalize them here so that we only have one row for each file, no matter how many skins it appears within.

- `id` A unique ID for this file
- `file_md5` The md5 hash of the file after being extracted from the zip (see the `archive_files` table)
- `file_date` The date that the file was created (according to the zip metadata)
- `size_in_bytes` The size of the file, afterbeing decompressed
- `text_content` If the file is a text file, this column contains that text

## skin_uploads

When a user attempts to upload a file at the Museum, they first request an upload URL so that they can upload the file directly to S3. Then, once they have uploaded it, they notify our server, and we kick off a job to download the skin from S3 and screenshot/scrape it as we have capacity. This approach lets us scale to an unlimited number of uploads during a spike in traffic, and we will process them at our leisure.

The status of an in-progress upload is tracked in this table, and it is used by the server as a task queue to track skins that need to be processed.

First a user requests a URL for a skin (based on its md5) (`URL_REQUESTED`) once they've uploaded to S3, they notify us (`UPLOAD_REPORTED`), finally the file is processed and it ends up as either `ERRORED` or `ARCHIVED` (success!)

- `id` A unique ID for this upload attempt. This is used in the S3 filename that the user is given permission to create.
- `skin_md5` The md5 of this uploaded file. Note that not all skins here will end up in the `skins` table. Either due to uploads not completing, or processing error, or the file is not actually a skin.
- `status` Where in the pipeline is this upload: `ERRORED`, `UPLOAD_REPORTED`, `URL_REQUESTED`, `ARCHIVED`.
- `filename` The filename that the user had for the file when they uploaded it (files on S3 file name is based on `id`, so we need the filename here.

## files

Information about skin files that we have injested. Since `skins` are indexed by their `md5` content, we may have encounted the same skin file under multiple filenames. This table shows all the filenames we've encountered for each skin, and (in some cases) where we got the file.

- `id` A unique ID for this file
- `file_path` The file path (directory and name) of the skin file
- `skin_md5` The md5 hash of the file (see the `skins` table)
- `source_attribution` Where we found this file (if known)

## skins

Information about a given Winamp skin. Each item in the Winamp Skin Museum corresponds to a row in this table with a `skin_type` of `1` (classic).

- `id` A unique ID for the skin (not really used, though it should be. Instead every other table references skins by `md5`)
- `md5` The md5 hash of the skin file. Most other tables reference skins by this value. Usually with a column named `skin_md5` We should probably fix that and use `id`
- `skin_type` One of `1` (classic), `2` (modern), `3` (pack), `4` (invalid)
- `emails` A space-separated list of emails extracted from the skin's text files
- `readme_text` Using a herusitic, we identify files in the skin archive that are likely to be readme or readme-like files and index them here. This should probably be done dynamically at query time and we should find this value in the `file_info` table.

## ia_items

Each skin in the Museum should be persisted to the [Internet Archive](https://archive.org) for preservation. This is done daily and we keep a local cache of what information the Internet Archive has about each skin.

- `id` A unique ID for this internet archive item (local to this database)
- `skin_md5` The md5 hash of the skin (see the `skins` table)
- `identifier` The unique identifier used by the archive for this item (this is used in the URL of the item and for API queries)
- `metadata` A JSON blob contanining the Internet Archive's metdata about the item
- `metadata_timestamp` The last time we scraped the metadata from their API (I _think_)

## refreshes

Much of the data in the database is derived from the skin archives themselves. However, we don't have all the skin files locally, they are in S3. So, we only periodically download them and re-extract all the data/screenshots. This table records each time we do this. This way we can know which skins need to be refreshed.

- `id` A unique ID for this refresh
- `skin_md5` The md5 hash of the skin (see the `skins` table)
- `error` Any error we encountered during the refresh
- `timestamp` When we performed the refresh

## tweets

The Twitter bot [@winampskins](https://twitter.com/winampskins) tweets. Likes and retweets are scraped nightly, but can only read the most recent tweets. Like/retweets on older tweets are not seen by us, so the numbers represent a lower bound. Additionally, the Twitter API only lets you go back so far, so we may be missing some Tweets, since we didn't index these from the very begininig.

Finally, not all tweets that the bot tweets are scritly skins. Some are manual tweets or retweets. So, not every tweet will have a `skin_md5`.

- `id` A unique ID for this tweet (local to this database)
- `likes` The number of likes the tweet got
- `retweets` The number of retweets the tweet got
- `skin_md5` The md5 hash of the skin that was tweeted (see the `skins` table) **Note** Not all tweets reference a skin
- `tweet_id` The ID for this tweet, as assigned by Twitter. This can be used to construct the tweet URL

## knex_migrations

Metadata about migrations that have been run on the database. Used for making database changes

## knex_migrations_lock

Used to ensure migrations are applied correctly.

## museum_sort_overrides

Used for making editorial decisions about how individual skins show up in the main scroll of the Winamp Skin Museum. Used for boosting the default skins and hiding aparent duplicates. In reality there are many many near or actual dupes, but we manually cull duplicates that appear in the first few pages.

- `id` A unique ID for this override (local to this database)
- `skin_md5` The md5 hash of the skin that is being overridden
- `score` A score for how highly rated this skin should be. Negative numbers mean the skin should be hidden.
- `comment` Explains why the skin was ranked this way
