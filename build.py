"""Build both Stackgram front ends from the shared sources.

  body.html + app.css + app.js
      + store-local.js  ->  index.html      (this site, static hosting)
      + store-cloud.js  ->  ../stackgram.html (claude.ai artifact)

Run this after touching any shared file; the two builds must not drift.
"""
import hashlib
import pathlib
import re

here = pathlib.Path(__file__).parent

BODY = (here / "body.html").read_text(encoding="utf-8").rstrip()
CSS = (here / "app.css").read_text(encoding="utf-8").rstrip()
APP = (here / "app.js").read_text(encoding="utf-8").rstrip()

FONTS = (
    "https://fonts.googleapis.com/css2?"
    "family=Bricolage+Grotesque:opsz,wght@12..96,800"
    "&family=IBM+Plex+Mono:wght@500"
    "&family=Public+Sans:wght@400;600&display=swap"
)

DOWNLOAD_BLOCK = re.compile(
    r"[ \t]*/\* download-link:start.*?download-link:end \*/\n",
    re.S,
)


def strip_downloads(js: str) -> str:
    """Remove the download-link block: the artifact viewer blocks page-driven
    downloads, so shipping that code would only add a dead control."""
    return DOWNLOAD_BLOCK.sub("", js)


def stamp(name: str) -> str:
    """Append a content hash so a browser can never serve a stale build."""
    digest = hashlib.sha1((here / name).read_bytes()).hexdigest()[:8]
    return f"{name}?v={digest}"


def build_site() -> pathlib.Path:
    out = here / "index.html"
    css = stamp("app.css")
    store = stamp("store-local.js")
    app = stamp("app.js")
    out.write_text(
        f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Stackgram</title>
<meta name="description" content="A student content feed for DSA, Full Stack, Aptitude, Maths, English, GenAI and Misc - upload clips or notes of any length, collect likes and followers.">
<meta name="theme-color" content="#0E6E58">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>%F0%9F%93%9A</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="{css}">
</head>
<body>
{BODY}

<script src="{store}"></script>
<script src="{app}"></script>
</body>
</html>
""",
        encoding="utf-8",
    )
    return out


def build_artifact() -> pathlib.Path:
    """One self-contained file, no html/head/body wrapper: the viewer adds it."""
    out = here.parent / "stackgram.html"
    parts = [
        "<title>Stackgram</title>",
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        f'<link rel="stylesheet" href="{FONTS}">',
        "<style>",
        CSS,
        "</style>",
        "",
        BODY,
        "",
        "<script>",
        (here / "store-cloud.js").read_text(encoding="utf-8").rstrip(),
        "</script>",
        "<script>",
        strip_downloads(APP + "\n").rstrip(),
        "</script>",
    ]
    out.write_text("\n".join(parts) + "\n", encoding="utf-8")
    return out


for path in (build_site(), build_artifact()):
    print("wrote", path, path.stat().st_size, "bytes")
