#!/usr/bin/env python
"""Tweet Winamp Skins

Usage:
  tweet.py post [--dry]
  tweet.py review [--dry]
  tweet.py debug

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
from sets import Set
from collections import defaultdict

from config import CONFIG

LOCAL_LOG_PATH = "./action_log.json";

LOCKED = False

class ActionLog():
    def __init__(self):
        s3 = boto3.resource('s3')
        s3.meta.client.download_file('winamp2-js-skins', "action_log.json", LOCAL_LOG_PATH)
        with open(LOCAL_LOG_PATH, 'r') as f:
            self.action_log = json.load(f)

    def __enter__(self):
        global LOCKED
        if LOCKED:
            raise Exception("Tried to access the action log while locked")
        LOCKED = True
        return self.action_log

    def __exit__(self, *args):
        global LOCKED
        with open(LOCAL_LOG_PATH, 'w') as f:
            json.dump(self.action_log, f)
        s3 = boto3.resource('s3')
        s3.meta.client.upload_file(LOCAL_LOG_PATH, 'winamp2-js-skins', "action_log.json")
        LOCKED = False


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
    skins = get_state()
    skin_path = random_skin()
    md5 = md5_file(skin_path)
    if(md5 in skins):
        print "Already handled %s. Trying again..." % md5
        return find_skin_with_screenshot()
    screenshot_path = screenshot_by_md5(md5)
    if(not screenshot_path):
        print "Could not find the screenshot, trying again..."
        return find_skin_with_screenshot()
    dispatch({"type": "FOUND_SCREENSHOT", "skin_path": skin_path,
              "screenshot_path": screenshot_path, "md5": md5})
    return skin_path, screenshot_path, md5


def dispatch(action):
    with ActionLog() as action_log:
        action_log.append(action)


def get_state():
    def get_default_skin():
        return dict()

    skins = defaultdict(get_default_skin)

    with ActionLog() as action_log:
        for action in action_log:
            if(action['type'] == "FOUND_SCREENSHOT"):
                skin = skins[action['md5']]
                skin['md5'] = action['md5']
                skin['has_screenshot'] = True
                skin['screenshot_path'] = action['screenshot_path']
                skin['skin_path'] = action['skin_path']
            if(action['type'] == "TWEETED"):
                skin = skins[action['md5']]
                skin['tweeted'] = True
            if(action['type'] == "REJECTED_SKIN"):
                skin = skins[action['md5']]
                skin['rejected'] = True
            if(action['type'] == "APPROVED_SKIN"):
                skin = skins[action['md5']]
                skin['approved'] = True
            if(action['type'] == "UPLOADED_SKIN"):
                skin = skins[action['md5']]
                skin['skin_url'] = action['skin_url']

    return skins


def review():
    while(True):
        skin_path, screenshot_path, md5 = find_skin_with_screenshot()
        skin_name = os.path.basename(skin_path)
        print "Found %s" % skin_name
        os.system("open \"%s\"" % screenshot_path)
        res = raw_input("Approve? (y/n/q)")
        if(res is "q"):
            return
        elif(res is "y"):
            dispatch({"type": "APPROVED_SKIN", "md5": md5, "skin_path": skin_path})
            print "Approved %s" % skin_name
        elif(res is "n"):
            dispatch({"type": "REJECTED_SKIN", "md5": md5})
            print "Rejected %s" % skin_name
        else:
            print "Invalid input"


def main(dry):

    state = get_state()
    approved = []
    for skin in state.itervalues():
        if skin.get('approved') and not skin.get('tweeted'):
            approved.append(skin)

    print "Found %s approved skins" % len(approved)
    if not len(approved):
        print "Exiting"
        return
    skin = approved[0]

    skin_path = skin.get('skin_path')
    skin_name = os.path.basename(skin_path)
    skin_url = skin.get('skin_url')
    md5 = skin.get('md5')
    screenshot_path = skin.get('screenshot_path')

    assert skin_name
    assert md5
    assert screenshot_path

    if(not skin_url):
        print "Uploading to S3..."
        s3 = boto3.resource('s3')
        s3.meta.client.upload_file(skin_path, 'winamp2-js-skins', skin_name, {'ACL': 'public-read'})

        skin_url = "https://s3-us-west-2.amazonaws.com/winamp2-js-skins/%s" % skin_name
        dispatch({"type": "UPLOADED_SKIN", "md5": md5, "skin_url": skin_url})
        print "Done: %s" % skin_url

    print "Going to check that URL..."
    if not url_is_good(skin_url):
        dispatch({"type": "FOUND_INVALID_URL",
                  "md5": md5, "skin_url": skin_url})
        print "URL is no good. Aborting."
        return

    options = {"skinUrl": skin_url}

    options_query = urllib.quote(json.dumps(options))

    winamp2_js_url = "https://jordaneldredge.com/projects/winamp2-js/#%s" % options_query

    status_message = """%s
Try Online: %s
Download: %s""" % (skin_name, winamp2_js_url, skin_url)
    if not dry:
        tweet(status_message, screenshot_path)
        dispatch({"type": "TWEETED", "md5": md5, "message": status_message})
    else:
        print "Would have tweeted: %" % status_message
        print "With media file: %" % screenshot_path
    print "Done!"


if __name__ == "__main__":
    arguments = docopt(__doc__, version='Tweet Winamp Skins 0.1')
    dry = arguments.get("--dry")
    if(arguments.get("review")):
        review()
    elif(arguments.get("post")):
        main(dry=dry)
