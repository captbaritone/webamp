#!/usr/bin/env python3
"""Tweet Winamp Skins

Usage:
  tweet.py tweet <hash> <filename> [--dry]
  tweet.py list
  tweet.py debug
  tweet.py sort

Options:
  -h --help               Show this screen.
  --version               Show version.
  --dry                   Don't actually post a tweet
"""

import sys
import requests
import os
import re
import random
import json
import urllib
import hashlib
import twitter
from tempfile import NamedTemporaryFile
from PIL import Image
from docopt import docopt
from collections import defaultdict
from config import CONFIG


def get_api():
    return twitter.Api(
        consumer_key=CONFIG["consumer_key"],
        consumer_secret=CONFIG["consumer_secret"],
        access_token_key=CONFIG["access_token_key"],
        access_token_secret=CONFIG["access_token_secret"],
    )


def tweet(text, img_path=None):
    api = get_api()
    status = api.PostUpdate(text, img_path)
    return "https://twitter.com/winampskins/status/%s" % status.id_str


def find(dir):
    for root, _, files in os.walk(dir):
        for file in files:
            yield os.path.join(root, file)


def md5_file(path):
    hash_md5 = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


def tweet_skin(md5, skin_name, dry):
    screenshot_url = get_screenshot_url(md5)

    screenshot_path = NamedTemporaryFile(suffix=".png").name
    urllib.request.urlretrieve(screenshot_url, screenshot_path)

    return tweet_image(skin_name, md5, screenshot_path, dry)


def get_screenshot_url(md5):
    return "https://cdn.webampskins.org/screenshots/%s.png" % md5


def tweet_image(skin_name, md5, screenshot_path, dry):
    # Trick Twitter into keeping the skin a PNG
    img = Image.open(screenshot_path)
    img = img.convert("RGBA")  # ensure 32-bit
    [w, h] = img.size
    pixels = img.load()

    # set bottom-right pixel to 254 alpha
    pixels[w - 1, h - 1] = pixels[w - 1, h - 1][:3] + (243,)

    # Resize to 2x so that pixels remain a bit more crisp when resized
    w, h = (2 * w, 2 * h)
    img = img.resize((w, h), 0)

    img.save(screenshot_path)

    museum_url = "https://skins.webamp.org/skin/%s" % md5

    status_message = "%s\n\n%s" % (
        skin_name,
        museum_url,
    )
    if not dry:
        return tweet(status_message, screenshot_path)
    return "DUMMY URL"


# TODO: Deupe and make a generator
# TODO: Ignore replies
def get_all_tweets():
    api = get_api()
    min_id = None
    done = False
    tweets = []
    while not done:
        new_tweets = api.GetUserTimeline(
            screen_name="winampskins",
            trim_user=True,
            count=200,
            include_rts=False,
            max_id=min_id,
        )
        min_id = min([tweet.id for tweet in new_tweets])
        tweets.extend(new_tweets)
        if len(new_tweets) == 1:
            done = True

    return tweets


def extract_hash(foo):
    match = re.search(r"([a-fA-F\d]{32})", foo)
    if match:
        return match.group()


if __name__ == "__main__":
    arguments = docopt(__doc__, version="Tweet Winamp Skins 0.1")
    dry = arguments.get("--dry")
    if arguments.get("list"):
        filenames = open("filenames.txt", "w")
        for f in find("../automatedScreenshots/skins"):
            if f.endswith(".wsz"):
                md5 = md5_file(f)
                filenames.write("%s %s\n" % (md5, os.path.basename(f)))

    elif arguments.get("tweet"):
        hash = arguments.get("<hash>")
        filename = arguments.get("<filename>")
        print(tweet_skin(hash, filename, dry))
    elif arguments.get("sort"):
        api = get_api()
        all_tweets = get_all_tweets()
        for tweet in all_tweets:
            hashes = [extract_hash(url.expanded_url) for url in tweet.urls]
            if not len(hashes):
                # print("No hash found in %s" % tweet)
                # These are mostly replies
                continue
            if hashes[0]:
                print("%s %s %s" % (hashes[0], tweet.favorite_count, tweet.id))
