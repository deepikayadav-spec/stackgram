"""Assemble the claude.ai artifact from the same body/CSS/UI files as the site.

The artifact is one self-contained HTML file with no <html>/<head>/<body>
wrapper (the viewer supplies those) and uses the shared-database store.
"""
import pathlib

here = pathlib.Path(__file__).parent
out = here.parent / "stackgram.html"

parts = [
    "<title>Stackgram</title>",
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    "family=Bricolage+Grotesque:opsz,wght@12..96,800&family=IBM+Plex+Mono:wght@500"
    '&family=Public+Sans:wght@400;600&display=swap">',
    "<style>",
    (here / "app.css").read_text(encoding="utf-8").rstrip(),
    "</style>",
    "",
    (here / "body.html").read_text(encoding="utf-8").rstrip(),
    "",
    "<script>",
    (here / "store-cloud.js").read_text(encoding="utf-8").rstrip(),
    "</script>",
    "<script>",
    (here / "app.js").read_text(encoding="utf-8").rstrip(),
    "</script>",
]
out.write_text("\n".join(parts) + "\n", encoding="utf-8")
print("wrote", out, out.stat().st_size, "bytes")
