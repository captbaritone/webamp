#!/usr/bin/env python
"""Tweet Winamp Skins

Usage:
  tweet.py [--dry]

Options:
  -h --help               Show this screen.
  --version               Show version.
  --dry                   Don't actually post a tweet
"""

import requests
import os
import random
import json
import urllib
import hashlib
import boto3
import twitter
from docopt import docopt

from config import CONFIG


def tweet(text, img_path):
    api = twitter.Api(
        consumer_key=CONFIG['consumer_key'],
        consumer_secret=CONFIG['consumer_secret'],
        access_token_key=CONFIG['access_token_key'],
        access_token_secret=CONFIG['access_token_secret'])
    api.PostMedia(text, img_path)


def find(dir):
    for root, sub_folders, files in os.walk(dir):
        for file in files:
            yield os.path.join(root, file)


def random_skin():
    return random.choice([f for f in find("../automatedScreenshots") if f.endswith(".wsz")])


def screenshot_by_md5(md5):
    screenshots = find("../automatedScreenshots/screenshots/")
    matchin_screenshots = [
        f for f in screenshots if f.endswith("%s.png" % md5)]
    if(len(matchin_screenshots) is not 1):
        return None
    return matchin_screenshots[0]


def url_is_good(url):
    try:
        r = requests.head(url)
        return r.status_code == 200
        # prints the int of the status code. Find more at httpstatusrappers.com :)
    except Exception:
        return False


def md5_file(path):
    hash_md5 = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


def find_skin_with_screenshot():
    skin_path = random_skin()

    md5 = md5_file(skin_path)
    screenshot_path = screenshot_by_md5(md5)
    if(not screenshot_path):
        print "Could not find the screenshot, trying again..."
        return find_skin_with_screenshot()
    return skin_path, screenshot_path, md5

def dispatch(action):
    with open("./action_log.json", 'r') as f:
        action_log = json.load(f)
    action_log.append(action)
    with open("./action_log.json", 'w') as f:
        json.dump(action_log, f)

def main(dry):
    skin_path, screenshot_path, md5 = find_skin_with_screenshot()
    dispatch({"type": "FOUND_SCREENSHOT", "skin_path": skin_path, "screenshot_path": screenshot_path, "md5": md5})
    skin_name = os.path.basename(skin_path)
    print "Found %s" % skin_name
    os.system("open \"%s\"" % screenshot_path)
    res = raw_input("continue?")
    if(res is not "y"):
        dispatch({"type": "REJECTED_SKIN", "md5": md5})
        return main(dry)
    print "Screenshot: %s" % screenshot_path

    print "Uploading to S3..."
    s3 = boto3.resource('s3')
    s3.meta.client.upload_file(
        skin_path, 'winamp2-js-skins', skin_name, {'ACL': 'public-read'})

    skin_url = "https://s3-us-west-2.amazonaws.com/winamp2-js-skins/%s" % skin_name
    dispatch({"type": "UPLOADED_SKIN", "md5": md5, "skin_url": skin_url})
    print "Done: %s" % skin_url

    print "Going to check that URL..."
    if not url_is_good(skin_url):
        dispatch({"type": "FOUND_INVALID_URL", "md5": md5, "skin_url": skin_url})
        print "URL is no good"
        return

    options = {"skinUrl": skin_url}

    options_query = urllib.quote(json.dumps(options))

    winamp2_js_url = "https://jordaneldredge.com/projects/winamp2-js/#%s" % options_query

    status_message = """%s
Try: %s
Download: %s""" % (skin_name, winamp2_js_url, skin_url)
    tweet(status_message, screenshot_path)
    dispatch({"type": "TWEETED", "md5": md5, "message": status_message})
    print "Done!"


if __name__ == "__main__":
    arguments = docopt(__doc__, version='Tweet Winamp Skins 0.1')
    main(dry=arguments.get("--dry"))
