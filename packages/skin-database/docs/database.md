# Database

The Winamp Skin Museum, and related projects, are powered by an SQLite database which is not included in this repository, but a copy can be obtained by reaching out directly.

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

## knex_migrations

## skin_uploads

## files

## knex_migrations_lock

## skins

## ia_items

## refreshes

## tweets
