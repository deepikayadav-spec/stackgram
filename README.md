# Stackgram

A student content feed for engineering-prep material: upload a clip or a set of
notes of any length, tag it to a track, and collect likes and followers.

Tracks: **DSA · Full Stack · Aptitude · Maths · English · GenAI · Misc**

## What it does

- **Feed** of posts as 4:5 cards, with a duration pill and a track-coloured cover
- **Search** across titles, descriptions, creator names, tags and track names
- **Filters** by track, by length (under 1 min / 1–5 / 5–20 / 20 min+) and by newest or most liked
- **Upload** an image, GIF or video with a title, track, length, description and tags;
  video length is read from the file automatically
- **Likes and follows**, a Following tab, a Your board panel (posts / followers / likes)
  and a creators-to-follow rail ranked by likes earned
- **Phone and laptop layouts**: bottom tab bar and full-screen sheets under 640px,
  feed-plus-rail above it; light and dark themes follow the OS

## Data, and the one thing to know

This build has **no backend**. The 12 seeded posts and the three demo clips ship
with the page. Everything a visitor does — their display name, uploads, likes,
follows — is stored in **their own browser** via `localStorage`, so it survives a
reload but is never shared with anyone else. Uploads are held as data URLs, hence
the 3 MB per-file cap.

To make the feed genuinely shared, replace the `Store` object in `app.js` with API
calls (Vercel Postgres/Neon for the rows, Vercel Blob for the files) — the rest of
the app reads and writes through it and does not change.

## Demo clips

`media/*.gif` are generated teaching animations (sliding window, a RAG pipeline, a
fraction flash table), rendered with ffmpeg. They are not recordings of people. The
matching `media/*.mp4` originals are linked from each post as a download.

## Run locally

Any static server, e.g.:

```bash
python -m http.server 8000
```

then open http://localhost:8000

## Deploy

Static site — no build step. On Vercel: import the repo, framework preset **Other**,
leave build command and output directory empty.
