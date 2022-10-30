-- Precompute the sort order for the skin musuem.
INSERT INTO museum_sort_order (skin_md5) 

    -- A tweet score for each skin based on its tweets.
    WITH skin_tweets as (
        SELECT
            skin_md5,
            MAX(likes) as likes,
            MAX(retweets) as retweets,
            (IFNULL(likes, 0) + (IFNULL(retweets, 0) * 1.5)) AS tweet_score
        FROM
            tweets
        GROUP BY
            skin_md5
    )

    SELECT
        skins.md5
        -- files.file_path,
        -- skin_reviews.review = 'NSFW' AS nsfw
    FROM
        skins
        LEFT JOIN museum_sort_overrides ON museum_sort_overrides.skin_md5 = skins.md5
        LEFT JOIN skin_tweets ON skin_tweets.skin_md5 = skins.md5
        LEFT JOIN skin_reviews ON skin_reviews.skin_md5 = skins.md5
        LEFT JOIN files ON files.skin_md5 = skins.md5
        LEFT JOIN refreshes ON refreshes.skin_md5 = skins.md5
    WHERE
        -- Only show classic skins
        skin_type = 1
        -- Hide skins that are dupes or we otherwise want to hide
        AND (museum_sort_overrides.score IS NULL OR museum_sort_overrides.score > 0)
        -- Hides skins that might not have a valid screenshot
        AND refreshes.error IS NULL
    GROUP BY
        skins.md5
    ORDER BY
        -- The secret sauce of the Winamp Skin Museum.
        -- We try to rank skins based on how interesting they are to a modern
        -- audience by leveraging data accumulated by the @winampskins Twitter bot.
        
        -- 1. Manaully currated skins (the default skin and classic ports of the default modern skins)
        -- 2. All tweeted skins ranked by (likes + retweets * 1.5)
        -- 3. All approved skins that have not yet been tweeted
        -- 4. All unreviewed skins
        -- 5. All rejected skins
        -- 6. All NSFW skins

        -- Show manually currated skins (default skins) first
        museum_sort_overrides.score DESC,
        -- Sort skins by their popularity on Twitter
        tweet_score DESC,
        -- Push NSFW skins to the bottom
        skin_reviews.review = 'NSFW' ASC,
        -- Skins that have been approved are better than others
        skin_reviews.review = 'APPROVED' DESC,
        -- Skins that have been rejected are worse than those that have not been reviewed
        skin_reviews.review = 'REJECTED' ASC;