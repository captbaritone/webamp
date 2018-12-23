#!/usr/bin/env python3
"""Tweet Winamp Skins

Usage:
  tweet.py post [--dry]
  tweet.py review [--dry]
  tweet.py manual <hash>
  tweet.py list
  tweet.py debug
  tweet.py sort

Options:
  -h --help               Show this screen.
  --version               Show version.
  --dry                   Don't actually post a tweet
"""

import requests
import os
import re
import random
import json
import urllib
import hashlib
import boto3
import twitter
from tempfile import NamedTemporaryFile
from PIL import Image
from docopt import docopt
from collections import defaultdict
from discord_hooks import Webhook

# Create webhook
from config import CONFIG


def getChar():
    try:
        # for Windows-based systems
        import msvcrt  # If successful, we are on Windows

        return msvcrt.getch()

    except ImportError:
        # for POSIX-based systems (with termios & tty support)
        import tty
        import sys
        import termios  # raises ImportError if unsupported

        fd = sys.stdin.fileno()
        oldSettings = termios.tcgetattr(fd)

        try:
            tty.setcbreak(fd)
            answer = sys.stdin.read(1)
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, oldSettings)

        return answer


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


def get_lines(path):
    temp_path = NamedTemporaryFile().name
    s3 = boto3.resource("s3")
    s3.meta.client.download_file("winamp2-js-skins", path, temp_path)
    with open(temp_path, "r") as f:
        return [l.strip() for l in f.readlines()]


def append_line(path, line):
    temp_path = NamedTemporaryFile().name
    s3 = boto3.resource("s3")
    s3.meta.client.download_file("winamp2-js-skins", path, temp_path)
    with open(temp_path, "a") as f:
        f.write("%s\n" % line)
    s3.meta.client.upload_file(temp_path, "winamp2-js-skins", path)


def review():
    approved = get_lines("approved.txt")
    tweeted = get_lines("tweeted.txt")
    rejected = get_lines("rejected.txt")

    all_skins = []

    filenames = dict()
    for pair in get_lines("filenames.txt"):
        [md5, filename] = pair.strip().split(" ")
        filenames[md5] = filename
        all_skins.append(md5)

    potentials = list(set(all_skins) - set(approved) - set(tweeted) - set(rejected))

    potentials.sort()

    number_of_potentials = len(potentials)

    print("%s skins to review. Look busy!" % number_of_potentials)

    for md5 in potentials:
        screenshot_url = get_screenshot_url(md5)
        screenshot_path = NamedTemporaryFile(suffix="png").name
        try:
            urllib.request.urlretrieve(screenshot_url, screenshot_path)
        except urllib.request.HTTPError:
            print("Failed to download %s" % screenshot_url)
            continue
        skin_name = filenames[md5]
        print("Found %s" % skin_name)
        os.system('open --background "%s"' % screenshot_path)
        print("Approve? (y/n/q/t)")
        res = getChar()
        if res is "q":
            return
        elif res is "y":
            append_line("approved.txt", md5)
            print("Approved %s" % skin_name)
        elif res is "n":
            append_line("rejected.txt", md5)
            print("Rejected %s" % skin_name)
        elif res is "t":
            tweet_skin(md5)
            return
        else:
            print("Invalid input")


def main(dry):
    approved = get_lines("approved.txt")
    tweeted = get_lines("tweeted.txt")

    candidates = list(set(approved) - set(tweeted))
    number_of_potentials = len(candidates)
    print("Found %s approved skins" % number_of_potentials)
    if number_of_potentials <= 10:
        msg = (
            "I'm down to only %s approved skins to tweet. You should review some more."
            % number_of_potentials
        )
        Webhook(CONFIG["discord_url"], msg=msg).post()

    if not number_of_potentials:
        print("Exiting")
        return

    tweet_skin(candidates[0])


def tweet_skin(md5):
    print("Going to Tweet the skin with md5 hash %s" % md5)
    filenames = dict()
    for pair in get_lines("filenames.txt"):
        [file_md5, filename] = pair.strip().split(" ")
        filenames[file_md5] = filename

    skin_name = filenames[md5]
    assert skin_name
    skin_url = get_skin_url(md5)
    screenshot_url = get_screenshot_url(md5)

    screenshot_path = NamedTemporaryFile(suffix=".png").name
    urllib.request.urlretrieve(screenshot_url, screenshot_path)

    if not url_is_good(skin_url):
        print("URL %s is no good. Aborting." % skin_url)
        return

    tweet_image(skin_name, md5, skin_url, screenshot_path, True)


def get_skin_url(md5):
    return "https://s3.amazonaws.com/webamp-uploaded-skins/skins/%s.wsz" % md5


def get_screenshot_url(md5):
    return "https://s3.amazonaws.com/webamp-uploaded-skins/screenshots/%s.png" % md5


def tweet_image(skin_name, md5, skin_url, screenshot_path, double):
    # Trick Twitter into keeping the skin a PNG
    img = Image.open(screenshot_path)
    img = img.convert("RGBA")  # ensure 32-bit
    [w, h] = img.size
    pixels = img.load()

    # set bottom-right pixel to 254 alpha
    pixels[w - 1, h - 1] = pixels[w - 1, h - 1][:3] + (243,)

    # Resize to 2x so that pixels remain a bit more crisp when resized
    if double:
        w, h = (2 * w, 2 * h)
        img = img.resize((w, h), 0)

    img.save(screenshot_path)

    escaped_skin_url = urllib.parse.quote(skin_url)

    winamp2_js_url = "https://webamp.org/?%s" % escaped_skin_url

    status_message = """%s
Try Online: %s
Download: %s""" % (
        skin_name,
        winamp2_js_url,
        skin_url,
    )
    if not dry:
        url = tweet(status_message, screenshot_path)
        Webhook(CONFIG["discord_url"], msg=url).post()
        append_line("tweeted.txt", md5)
    else:
        print("Would have tweeted: %s" % status_message)
        print("With media file: %s" % screenshot_path)
    print("Done!")


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
    if arguments.get("review"):
        review()
    elif arguments.get("post"):
        main(dry=dry)
    elif arguments.get("list"):
        filenames = open("filenames.txt", "w")
        for f in find("../automatedScreenshots/skins"):
            if f.endswith(".wsz"):
                md5 = md5_file(f)
                filenames.write("%s %s\n" % (md5, os.path.basename(f)))

    elif arguments.get("manual"):
        hash = arguments.get("<hash>")
        if hash:
            tweet_skin(hash)
        else:
            print("Whoops, no hash")
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
                print("%s %s" % (hashes[0], tweet.favorite_count))
