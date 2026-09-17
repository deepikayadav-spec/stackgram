/* Stackgram — student content feed.
   Standalone build: the seeded feed ships with the page, and everything a
   visitor adds (their name, uploads, likes, follows) is kept in their own
   browser. Nothing is sent anywhere, so one person's likes never reach
   another's. Swapping `Store` for a real API is the only change needed to
   make the feed shared. */
(function () {
  "use strict";

  /* ---------------- tracks ---------------- */
  var TRACKS = [
    { id: "dsa",  name: "DSA",        v: "--t-dsa",  ab: "DS" },
    { id: "full", name: "Full Stack", v: "--t-full", ab: "FS" },
    { id: "apt",  name: "Aptitude",   v: "--t-apt",  ab: "AP" },
    { id: "math", name: "Maths",      v: "--t-math", ab: "MA" },
    { id: "eng",  name: "English",    v: "--t-eng",  ab: "EN" },
    { id: "gen",  name: "GenAI",      v: "--t-gen",  ab: "AI" },
    { id: "misc", name: "Misc",       v: "--t-misc", ab: "MI" }
  ];
  var TMAP = {};
  TRACKS.forEach(function (t) { TMAP[t.id] = t; });
  function tcolor(id) { return "var(" + (TMAP[id] || TMAP.misc).v + ")"; }
  function tname(id) { return (TMAP[id] || TMAP.misc).name; }

  /* ---------------- seeded feed ---------------- */
  var SEED_POSTS = [
    { id: "s01", authorId: "demo-ananya", authorName: "Ananya R.", sample: true,
      title: "Sliding window, but you actually see the window move",
      note: "Six seconds, eight steps. The window is drawn on the array itself, so you can watch L jump forward the moment a repeat enters. Pause on step 4 — that is the one people get wrong.",
      track: "dsa", durationSec: 6, kind: "clip", src: "media/demo_dsa.gif",
      download: "media/demo_dsa.mp4",
      createdAt: "2026-09-15T09:20:00.000Z", tags: ["arrays", "two-pointer", "placement"] },
    { id: "s02", authorId: "demo-vikram", authorName: "Vikram S.", sample: true,
      title: "Fraction flash table: 10 conversions, 11 seconds",
      note: "The conversions worth memorising before any aptitude round. Watch it twice, then cover the right column and recite. Saves about 20 seconds per percentage question.",
      track: "apt", durationSec: 11, kind: "clip", src: "media/demo_aptitude.gif",
      download: "media/demo_aptitude.mp4",
      createdAt: "2026-09-16T14:05:00.000Z", tags: ["percentages", "speed-maths"] },
    { id: "s03", authorId: "demo-meera", authorName: "Meera K.", sample: true,
      title: "Auth in a React + Node app, end to end",
      note: "Full build: signup, JWT in an httpOnly cookie, refresh flow, protected routes. I make the classic mistakes on purpose and then fix them.",
      track: "full", durationSec: 2740, kind: "note",
      createdAt: "2026-09-11T06:40:00.000Z", tags: ["react", "node", "jwt", "auth"] },
    { id: "s04", authorId: "demo-rohit", authorName: "Rohit B.", sample: true,
      title: "Why eigenvectors are just directions that survive",
      note: "Geometric intuition before the determinant grind. Three examples, no proofs.",
      track: "math", durationSec: 903, kind: "note",
      createdAt: "2026-09-13T17:30:00.000Z", tags: ["linear-algebra", "eigenvalues"] },
    { id: "s05", authorId: "demo-sana", authorName: "Sana P.", sample: true,
      title: "Group discussion: 6 openers that don't sound rehearsed",
      note: "Recorded from a mock GD. Includes the two openers that got me cut off, so you can hear the difference.",
      track: "eng", durationSec: 648, kind: "note",
      createdAt: "2026-09-14T11:15:00.000Z", tags: ["gd", "speaking", "interview"] },
    { id: "s06", authorId: "demo-karthik", authorName: "Karthik N.", sample: true,
      title: "RAG over your class notes, whole pipeline in 12 seconds",
      note: "Notes to chunks to embeddings to retrieval to answer. The scores at the retrieve step are the real cosine similarities from my run — chunk 3 gets dropped, and that is the point.",
      track: "gen", durationSec: 12, kind: "clip", src: "media/demo_rag.gif",
      download: "media/demo_rag.mp4",
      createdAt: "2026-09-16T04:55:00.000Z", tags: ["rag", "embeddings", "llm"] },
    { id: "s07", authorId: "demo-ananya", authorName: "Ananya R.", sample: true,
      title: "Dijkstra on a 6-node graph, hand-traced",
      note: "The priority queue table filled in row by row. Pause at each step and predict the next pop.",
      track: "dsa", durationSec: 1120, kind: "note",
      createdAt: "2026-09-09T13:00:00.000Z", tags: ["graphs", "shortest-path"] },
    { id: "s08", authorId: "demo-vikram", authorName: "Vikram S.", sample: true,
      title: "Trains and boats problems in one formula sheet",
      note: "Relative speed reduces both topics to the same three lines. Screenshot it before your test.",
      track: "apt", durationSec: 186, kind: "note",
      createdAt: "2026-09-12T08:10:00.000Z", tags: ["speed-distance", "formula-sheet"] },
    { id: "s09", authorId: "demo-meera", authorName: "Meera K.", sample: true,
      title: "CSS grid in 90 seconds, no framework",
      note: "Two properties do 80% of the work. Live coded a dashboard layout.",
      track: "full", durationSec: 94, kind: "note",
      createdAt: "2026-09-17T05:25:00.000Z", tags: ["css", "grid", "layout"] },
    { id: "s10", authorId: "demo-priya", authorName: "Priya D.", sample: true,
      title: "How I track 300 practice problems without burning out",
      note: "My spreadsheet, the revision interval I use, and what I stopped doing after month two.",
      track: "misc", durationSec: 735, kind: "note",
      createdAt: "2026-09-10T15:45:00.000Z", tags: ["study-plan", "habits"] },
    { id: "s11", authorId: "demo-karthik", authorName: "Karthik N.", sample: true,
      title: "Prompt patterns that stop an agent from looping",
      note: "Four failure traces from my own agent, and the instruction change that fixed each one.",
      track: "gen", durationSec: 1340, kind: "note",
      createdAt: "2026-09-08T10:30:00.000Z", tags: ["agents", "prompting", "debugging"] },
    { id: "s12", authorId: "demo-rohit", authorName: "Rohit B.", sample: true,
      title: "Probability: the 3 questions that decide the marks",
      note: "Conditional, Bayes, expectation. One worked problem each, timed.",
      track: "math", durationSec: 1562, kind: "note",
      createdAt: "2026-09-07T18:20:00.000Z", tags: ["probability", "bayes"] }
  ];

  /* like counts the seeded posts arrive with, so the feed reads as a feed
     in use rather than an empty shell */
  var SEED_LIKES = { s01: 4, s02: 2, s03: 5, s04: 2, s05: 3, s06: 6,
                     s07: 2, s08: 1, s09: 2, s10: 3, s11: 3, s12: 2 };

  /* ---------------- local store ---------------- */
  var KEY = "stackgram.v1";
  var Store = {
    data: { me: null, name: "", posts: [], likes: [], follows: [] },
    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
          var d = JSON.parse(raw);
          if (d && typeof d === "object") {
            this.data = {
              me: d.me || null,
              name: d.name || "",
              posts: Array.isArray(d.posts) ? d.posts : [],
              likes: Array.isArray(d.likes) ? d.likes : [],
              follows: Array.isArray(d.follows) ? d.follows : []
            };
          }
        }
      } catch (e) { /* private window, blocked storage: run in memory */ }
      if (!this.data.me) {
        this.data.me = "you-" + Math.random().toString(36).slice(2, 10);
        this.save();
      }
      return this.data;
    },
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); return true; }
      catch (e) { return false; }
    }
  };

  var S = {
    posts: [], likes: [], follows: [],
    uid: null, myName: "",
    track: "all", q: "", dur: "all", sort: "new", view: "feed",
    storageOk: true
  };

  /* ---------------- helpers ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function toast(msg) {
    var t = el("div", "toast", msg);
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2400);
  }
  function fmtDur(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var p = function (n) { return n < 10 ? "0" + n : "" + n; };
    return h ? h + ":" + p(m) + ":" + p(s) : m + ":" + p(s);
  }
  function parseDur(str) {
    var parts = String(str || "").trim().split(":").map(function (x) { return parseInt(x, 10) || 0; });
    if (!parts.length) return 0;
    return parts.reduce(function (a, b) { return a * 60 + b; }, 0);
  }
  function ago(iso) {
    var d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (!isFinite(d)) return "";
    if (d < 60) return "just now";
    if (d < 3600) return Math.floor(d / 60) + "m ago";
    if (d < 86400) return Math.floor(d / 3600) + "h ago";
    if (d < 604800) return Math.floor(d / 86400) + "d ago";
    return Math.floor(d / 604800) + "w ago";
  }
  function hash(s) {
    var h = 0, i;
    for (i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function avatarColor(seed) {
    var hues = [162, 268, 32, 212, 334, 92, 196];
    return "hsl(" + hues[hash(seed) % hues.length] + " 52% 42%)";
  }
  function initials(name) {
    var parts = String(name || "?").trim().split(/\s+/).slice(0, 2);
    return parts.map(function (p) { return p.charAt(0).toUpperCase(); }).join("") || "?";
  }

  /* ---------------- derived data ---------------- */
  function likeCount(pid) {
    var base = SEED_LIKES[pid] || 0;
    return base + (S.likes.indexOf(pid) === -1 ? 0 : 1);
  }
  function iLiked(pid) { return S.likes.indexOf(pid) !== -1; }
  function iFollow(aid) { return S.follows.indexOf(aid) !== -1; }
  function followerCount(aid) {
    /* seeded creators carry a plausible following; yours counts your own follow */
    var base = aid.indexOf("demo-") === 0 ? 3 + (hash(aid) % 9) : 0;
    return base + (iFollow(aid) ? 1 : 0);
  }
  function displayName(p) {
    if (p.authorId === S.uid) return S.myName || "You";
    return p.authorName || "Someone";
  }
  function durBucket(sec) {
    if (sec < 60) return "s";
    if (sec < 300) return "m";
    if (sec < 1200) return "l";
    return "x";
  }
  function visiblePosts() {
    var q = S.q.trim().toLowerCase();
    var out = S.posts.filter(function (p) {
      if (S.track !== "all" && p.track !== S.track) return false;
      if (S.dur !== "all" && durBucket(p.durationSec || 0) !== S.dur) return false;
      if (S.view === "following" && !iFollow(p.authorId)) return false;
      if (S.view === "you" && p.authorId !== S.uid) return false;
      if (q) {
        var hay = [p.title, p.note, displayName(p), tname(p.track)]
          .concat(p.tags || []).join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    out.sort(function (a, b) {
      if (S.sort === "top") {
        var d = likeCount(b.id) - likeCount(a.id);
        if (d) return d;
      }
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
    return out;
  }

  /* ---------------- rendering ---------------- */
  function renderTracks() {
    var box = $("tracks");
    box.textContent = "";
    var all = el("button", "chip");
    all.setAttribute("aria-pressed", S.track === "all" ? "true" : "false");
    all.appendChild(el("span", "dot"));
    all.appendChild(document.createTextNode("All tracks"));
    all.onclick = function () { S.track = "all"; render(); };
    box.appendChild(all);
    TRACKS.forEach(function (t) {
      var n = el("button", "chip");
      n.style.setProperty("--tc", tcolor(t.id));
      n.setAttribute("aria-pressed", S.track === t.id ? "true" : "false");
      n.appendChild(el("span", "dot"));
      n.appendChild(document.createTextNode(t.name));
      var c = S.posts.filter(function (p) { return p.track === t.id; }).length;
      var b = el("span", "mono", " " + c);
      b.style.opacity = ".6";
      b.style.fontSize = "12px";
      n.appendChild(b);
      n.onclick = function () { S.track = t.id; render(); };
      box.appendChild(n);
    });
  }

  function fallbackCover(box, p, unplayable) {
    var c = tcolor(p.track);
    box.style.background = "linear-gradient(150deg, " + c + ", color-mix(in srgb, " + c + " 55%, #0B1210))";
    box.appendChild(el("div", "paper"));
    box.appendChild(el("div", "mark", (TMAP[p.track] || TMAP.misc).ab));
    box.appendChild(el("div", "ghost", p.title || ""));
    if (unplayable) {
      var n = el("div", null, "Video can't play in this browser — download it to watch.");
      n.style.cssText = "position:absolute;left:10px;right:10px;top:34px;font-size:11px;color:rgba(255,255,255,.88);line-height:1.35";
      box.appendChild(n);
    }
  }

  function coverNode(p, big) {
    var box;
    if (big) {
      box = el("div", "post-media");
    } else {
      box = document.createElement("button");
      box.className = "cover";
      box.type = "button";
      box.setAttribute("aria-label", "Open " + (p.title || "post"));
    }
    if (p.src && (p.kind === "image" || p.kind === "clip")) {
      var img = document.createElement("img");
      img.src = p.src;
      img.alt = p.title || (p.kind === "clip" ? "Animated clip" : "Post image");
      if (p.kind !== "clip") img.loading = "lazy";
      img.addEventListener("error", function () { img.remove(); fallbackCover(box, p); });
      box.appendChild(img);
    } else if (p.src && p.kind === "video") {
      var vid = document.createElement("video");
      vid.src = p.src;
      vid.preload = "metadata";
      vid.addEventListener("loadedmetadata", function () {
        if (!big && vid.currentTime === 0) { try { vid.currentTime = 0.05; } catch (e) {} }
      });
      vid.addEventListener("error", function () { vid.remove(); fallbackCover(box, p); });
      setTimeout(function () {
        if (vid.readyState === 0 && box.contains(vid)) { vid.remove(); fallbackCover(box, p, true); }
      }, 6000);
      if (big) {
        vid.controls = true;
      } else {
        vid.muted = true; vid.playsInline = true; vid.loop = true;
        box.addEventListener("pointerenter", function () {
          if (window.matchMedia("(hover:hover)").matches) {
            var q = vid.play();
            if (q && q.catch) q.catch(function () {});
          }
        });
        box.addEventListener("pointerleave", function () { vid.pause(); vid.currentTime = 0; });
      }
      box.appendChild(vid);
    } else {
      fallbackCover(box, p);
    }
    if (!big) {
      box.appendChild(el("div", "dur mono", fmtDur(p.durationSec)));
      var kindLabel = { video: "Video", clip: "Clip", image: "Image" };
      box.appendChild(el("div", "kind", kindLabel[p.kind] || "Notes"));
    }
    return box;
  }

  function heart(filled) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", filled ? "currentColor" : "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2");
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z");
    s.appendChild(p);
    return s;
  }

  function avatarNode(p, size) {
    var a = el("div", "av", initials(displayName(p)));
    a.style.background = avatarColor(p.authorId);
    if (size) {
      a.style.width = a.style.height = size + "px";
      a.style.fontSize = (size / 2.1) + "px";
    }
    return a;
  }

  function cardNode(p) {
    var card = el("article", "card");
    var cov = coverNode(p, false);
    cov.onclick = function () { openPost(p.id); };
    card.appendChild(cov);

    var body = el("div", "body");
    var tk = el("div", "tk", tname(p.track));
    tk.style.setProperty("--tc", tcolor(p.track));
    body.appendChild(tk);
    body.appendChild(el("div", "ttl", p.title || "Untitled"));

    var who = el("div", "who");
    who.appendChild(avatarNode(p));
    who.appendChild(el("b", null, displayName(p)));
    if (p.sample) who.appendChild(el("span", "sample", "sample"));
    body.appendChild(who);

    var acts = el("div", "acts");
    var like = el("button", "ico");
    like.setAttribute("aria-pressed", iLiked(p.id) ? "true" : "false");
    like.appendChild(heart(iLiked(p.id)));
    like.appendChild(el("span", "mono", String(likeCount(p.id))));
    like.onclick = function (e) { e.stopPropagation(); toggleLike(p.id); };
    acts.appendChild(like);

    var time = el("span", null, ago(p.createdAt));
    time.style.cssText = "margin-left:auto;font-size:11.5px;color:var(--muted)";
    acts.appendChild(time);
    body.appendChild(acts);
    card.appendChild(body);
    return card;
  }

  function renderFeed() {
    var out = $("main-out");
    out.textContent = "";
    var list = visiblePosts();
    $("count").textContent = list.length + (list.length === 1 ? " post" : " posts");
    if (!list.length) {
      var e = el("div", "empty");
      var msgs = {
        you: ["Nothing uploaded yet", "Hit Upload and post a walkthrough, a cheat sheet or a 30-second trick."],
        following: ["You follow no one yet", "Follow a creator from the rail and their uploads land here."],
        feed: ["No posts match those filters", "Clear the search or pick another track."]
      };
      var m = msgs[S.view] || msgs.feed;
      e.appendChild(el("h3", null, m[0]));
      e.appendChild(el("p", null, m[1]));
      out.appendChild(e);
      return;
    }
    var g = el("div", "grid");
    list.forEach(function (p) { g.appendChild(cardNode(p)); });
    out.appendChild(g);
  }

  function renderStats() {
    var box = $("mystats");
    box.textContent = "";
    var mine = S.posts.filter(function (p) { return p.authorId === S.uid; });
    var got = mine.reduce(function (n, p) { return n + likeCount(p.id); }, 0);
    [[mine.length, "Posts"], [followerCount(S.uid), "Followers"], [got, "Likes"]]
      .forEach(function (d) {
        var s = el("div", "stat");
        s.appendChild(el("b", null, String(d[0])));
        s.appendChild(el("span", null, d[1]));
        box.appendChild(s);
      });
    var name = el("button", "btn small", S.myName ? "You post as " + S.myName : "Set your name");
    name.id = "name-btn";
    name.style.cssText = "margin-top:10px;width:100%;justify-content:center";
    name.onclick = openName;
    box.parentNode.appendChild(name);
  }

  function renderCreators() {
    var box = $("creators");
    box.textContent = "";
    var by = {};
    S.posts.forEach(function (p) {
      if (p.authorId === S.uid) return;
      if (!by[p.authorId]) by[p.authorId] = { key: p.authorId, post: p, posts: 0, likes: 0 };
      by[p.authorId].posts++;
      by[p.authorId].likes += likeCount(p.id);
    });
    var list = Object.keys(by).map(function (k) { return by[k]; })
      .sort(function (a, b) { return (b.likes - a.likes) || (b.posts - a.posts); })
      .slice(0, 5);
    if (!list.length) { box.appendChild(el("p", "hint", "No other creators yet.")); return; }
    list.forEach(function (c) {
      var row = el("div", "creator");
      row.appendChild(avatarNode(c.post, 30));
      var meta = el("div", "meta");
      meta.appendChild(el("div", "nm", displayName(c.post)));
      meta.appendChild(el("div", "sub", c.posts + (c.posts === 1 ? " post · " : " posts · ") + c.likes + " likes"));
      row.appendChild(meta);
      var f = el("button", "btn small" + (iFollow(c.key) ? "" : " primary"), iFollow(c.key) ? "Following" : "Follow");
      f.onclick = function () { toggleFollow(c.key); };
      row.appendChild(f);
      box.appendChild(row);
    });
  }

  function renderVolume() {
    var box = $("volume");
    box.textContent = "";
    var max = 1;
    var rows = TRACKS.map(function (t) {
      var n = S.posts.filter(function (p) { return p.track === t.id; }).length;
      if (n > max) max = n;
      return { t: t, n: n };
    }).sort(function (a, b) { return b.n - a.n; });
    rows.forEach(function (r) {
      var row = el("div");
      row.style.cssText = "display:flex;align-items:center;gap:9px;padding:4px 0;cursor:pointer";
      var lb = el("span", null, r.t.name);
      lb.style.cssText = "font-size:12.5px;width:78px;flex:none;color:var(--ink-2)";
      var track = el("div");
      track.style.cssText = "flex:1;height:7px;border-radius:99px;background:var(--surface-2);overflow:hidden";
      var fill = el("div");
      fill.style.cssText = "height:100%;border-radius:99px;width:" + Math.round((r.n / max) * 100) + "%;background:" + tcolor(r.t.id);
      track.appendChild(fill);
      var num = el("span", "mono", String(r.n));
      num.style.cssText = "font-size:12px;color:var(--muted);width:20px;text-align:right";
      row.appendChild(lb); row.appendChild(track); row.appendChild(num);
      row.onclick = function () { S.track = r.t.id; render(); };
      box.appendChild(row);
    });
  }

  function renderBanner() {
    var b = $("banner");
    b.textContent = "";
    if (!S.storageOk) {
      b.appendChild(el("div", "banner",
        "This browser is blocking site storage, so anything you post or like here disappears on reload."));
    }
  }

  function render() {
    ["feed", "following", "you"].forEach(function (v) {
      $("v-" + v).setAttribute("aria-pressed", S.view === v ? "true" : "false");
      $("t-" + v).setAttribute("aria-pressed", S.view === v ? "true" : "false");
    });
    document.querySelectorAll("[data-dur]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.dur === S.dur ? "true" : "false");
    });
    document.querySelectorAll("[data-sort]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.sort === S.sort ? "true" : "false");
    });
    /* the name button is appended to the stats panel each pass — clear it first */
    var stale = $("name-btn");
    if (stale) stale.remove();
    renderBanner();
    renderTracks();
    renderFeed();
    renderStats();
    renderCreators();
    renderVolume();
  }

  /* ---------------- writes ---------------- */
  function persist() {
    Store.data.posts = S.posts.filter(function (p) { return p.authorId === S.uid; });
    Store.data.likes = S.likes;
    Store.data.follows = S.follows;
    Store.data.name = S.myName;
    S.storageOk = Store.save();
    if (!S.storageOk) toast("Couldn't save — browser storage is full or blocked");
  }

  function toggleLike(pid) {
    var i = S.likes.indexOf(pid);
    if (i === -1) S.likes.push(pid); else S.likes.splice(i, 1);
    persist();
    render();
  }

  function toggleFollow(aid) {
    if (aid === S.uid) { toast("You already follow yourself"); return; }
    var i = S.follows.indexOf(aid);
    if (i === -1) { S.follows.push(aid); toast("Following"); } else { S.follows.splice(i, 1); }
    persist();
    render();
  }

  /* ---------------- overlays ---------------- */
  function closeLayer() {
    $("layer").textContent = "";
    document.removeEventListener("keydown", escClose);
  }
  function escClose(e) { if (e.key === "Escape") closeLayer(); }
  function openLayer(sheet) {
    var layer = $("layer");
    layer.textContent = "";
    var scrim = el("div", "scrim");
    scrim.onclick = function (e) { if (e.target === scrim) closeLayer(); };
    scrim.appendChild(sheet);
    layer.appendChild(scrim);
    document.addEventListener("keydown", escClose);
  }

  function openName() {
    var sheet = el("div", "sheet");
    var head = el("div", "sheet-h");
    head.appendChild(el("h2", null, "Your name on Stackgram"));
    var x = el("button", "btn small", "Close");
    x.onclick = closeLayer;
    head.appendChild(x);
    sheet.appendChild(head);

    var b = el("div", "sheet-b");
    var l = el("label", "f");
    l.appendChild(el("span", null, "Display name"));
    var inp = document.createElement("input");
    inp.id = "name-input";
    inp.maxLength = 40;
    inp.value = S.myName;
    inp.placeholder = "Deepika Y.";
    l.appendChild(inp);
    b.appendChild(l);
    b.appendChild(el("p", "hint", "Shown on the posts you upload. Saved in this browser only."));
    var save = el("button", "btn primary", "Save name");
    save.onclick = function () {
      S.myName = inp.value.trim();
      persist();
      closeLayer();
      render();
    };
    b.appendChild(save);
    sheet.appendChild(b);
    openLayer(sheet);
    inp.focus();
  }

  function openPost(pid) {
    var p = S.posts.filter(function (x) { return x.id === pid; })[0];
    if (!p) return;
    var sheet = el("div", "sheet wide");
    var view = el("div", "post-view");
    view.appendChild(coverNode(p, true));

    var side = el("div", "post-side");
    var head = el("div");
    head.style.cssText = "display:flex;align-items:center;gap:9px";
    head.appendChild(avatarNode(p, 34));
    var meta = el("div");
    meta.style.cssText = "min-width:0;flex:1";
    var nm = el("div", null, displayName(p));
    nm.style.cssText = "font-weight:600;font-size:14px";
    meta.appendChild(nm);
    var sub = el("div", null, followerCount(p.authorId) + " followers · " + ago(p.createdAt));
    sub.style.cssText = "font-size:12px;color:var(--muted)";
    meta.appendChild(sub);
    head.appendChild(meta);
    if (p.authorId !== S.uid) {
      var fb = el("button", "btn small" + (iFollow(p.authorId) ? "" : " primary"),
        iFollow(p.authorId) ? "Following" : "Follow");
      fb.onclick = function () { toggleFollow(p.authorId); closeLayer(); openPost(pid); };
      head.appendChild(fb);
    }
    var x = el("button", "btn small", "Close");
    x.onclick = closeLayer;
    head.appendChild(x);
    side.appendChild(head);

    var tk = el("div", "tk", tname(p.track) + " · " + fmtDur(p.durationSec));
    tk.style.setProperty("--tc", tcolor(p.track));
    side.appendChild(tk);
    var h = el("h2", null, p.title || "Untitled");
    h.style.fontSize = "21px";
    side.appendChild(h);
    if (p.note) side.appendChild(el("div", "note", p.note));
    if (p.tags && p.tags.length) {
      var tg = el("div", "tags");
      p.tags.forEach(function (t) {
        var b = el("button", "tag", "#" + t);
        b.onclick = function () { S.q = t; $("q").value = t; closeLayer(); render(); };
        tg.appendChild(b);
      });
      side.appendChild(tg);
    }
    if (p.download) {
      var dl = el("a", "hint", "Download the original MP4");
      dl.href = p.download;
      dl.download = "";
      dl.style.cssText = "color:var(--accent);font-weight:600;text-decoration:none";
      side.appendChild(dl);
    }
    if (p.sample) side.appendChild(el("div", "hint", "Sample post, seeded to show the feed in use."));

    var acts = el("div");
    acts.style.cssText = "display:flex;gap:8px;align-items:center;margin-top:auto;padding-top:10px;border-top:1px solid var(--line)";
    var like = el("button", "ico");
    like.setAttribute("aria-pressed", iLiked(p.id) ? "true" : "false");
    like.appendChild(heart(iLiked(p.id)));
    like.appendChild(el("span", "mono", likeCount(p.id) + (likeCount(p.id) === 1 ? " like" : " likes")));
    like.onclick = function () { toggleLike(p.id); closeLayer(); openPost(pid); };
    acts.appendChild(like);
    if (p.authorId === S.uid) {
      var del = el("button", "btn small", "Delete");
      del.style.marginLeft = "auto";
      del.onclick = function () {
        del.textContent = "Tap again to delete";
        del.onclick = function () {
          S.posts = S.posts.filter(function (x) { return x.id !== p.id; });
          persist();
          closeLayer();
          render();
          toast("Post deleted");
        };
      };
      acts.appendChild(del);
    }
    side.appendChild(acts);
    view.appendChild(side);
    sheet.appendChild(view);
    openLayer(sheet);
  }

  /* ---------------- upload ---------------- */
  var MAX_BYTES = 3 * 1024 * 1024; /* data URLs live in localStorage: keep them small */

  function openUpload() {
    var sheet = el("div", "sheet");
    var head = el("div", "sheet-h");
    head.appendChild(el("h2", null, "New upload"));
    var x = el("button", "btn small", "Close");
    x.onclick = closeLayer;
    head.appendChild(x);
    sheet.appendChild(head);

    var b = el("div", "sheet-b");
    var errBox = el("div", "err");
    errBox.hidden = true;
    b.appendChild(errBox);
    function fail(msg) { errBox.textContent = msg; errBox.hidden = false; }

    var picked = { file: null, kind: "note", url: null };
    var drop = el("div", "drop");
    var fi = document.createElement("input");
    fi.type = "file";
    fi.id = "up-file";
    fi.accept = "image/*,video/*";
    fi.style.display = "none";
    var pick = el("button", "btn", "Choose image, GIF or video");
    pick.onclick = function () { fi.click(); };
    var prev = el("div");
    prev.style.marginTop = "10px";
    drop.appendChild(pick);
    drop.appendChild(fi);
    drop.appendChild(el("p", null, "Any length — a 20-second trick or a 40-minute walkthrough. Keep the file under 3 MB so this browser can store it."));
    drop.appendChild(prev);
    fi.onchange = function () {
      var f = fi.files && fi.files[0];
      if (!f) return;
      if (f.size > MAX_BYTES) {
        fail("That file is " + (f.size / 1048576).toFixed(1) + " MB. This build stores uploads in your browser, so the limit is 3 MB — trim the clip or post it as notes.");
        fi.value = "";
        return;
      }
      errBox.hidden = true;
      picked.file = f;
      picked.kind = f.type.indexOf("video") === 0 ? "video" : (f.type === "image/gif" ? "clip" : "image");
      if (picked.url) URL.revokeObjectURL(picked.url);
      picked.url = URL.createObjectURL(f);
      prev.textContent = "";
      if (picked.kind === "video") {
        var v = document.createElement("video");
        v.src = picked.url;
        v.controls = true;
        v.style.cssText = "max-height:170px;border-radius:9px;width:100%";
        v.onloadedmetadata = function () {
          if (isFinite(v.duration) && v.duration > 0) $("up-dur").value = fmtDur(v.duration);
        };
        prev.appendChild(v);
      } else {
        var im = document.createElement("img");
        im.src = picked.url;
        im.alt = "Selected file preview";
        im.style.cssText = "max-height:170px;border-radius:9px";
        prev.appendChild(im);
      }
      pick.textContent = "Replace file";
    };
    b.appendChild(drop);

    var lt = el("label", "f");
    lt.appendChild(el("span", null, "Title"));
    var ti = document.createElement("input");
    ti.id = "up-title";
    ti.maxLength = 90;
    ti.placeholder = "Sliding window in 3 steps";
    lt.appendChild(ti);
    b.appendChild(lt);

    var two = el("div", "two");
    var ltr = el("label", "f");
    ltr.appendChild(el("span", null, "Track"));
    var sel = document.createElement("select");
    sel.id = "up-track";
    TRACKS.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t.id;
      o.textContent = t.name;
      sel.appendChild(o);
    });
    ltr.appendChild(sel);
    two.appendChild(ltr);
    var ld = el("label", "f");
    ld.appendChild(el("span", null, "Length (mm:ss)"));
    var di = document.createElement("input");
    di.id = "up-dur";
    di.placeholder = "4:30";
    di.inputMode = "numeric";
    ld.appendChild(di);
    two.appendChild(ld);
    b.appendChild(two);

    var ln = el("label", "f");
    ln.appendChild(el("span", null, "Description"));
    var na = document.createElement("textarea");
    na.id = "up-note";
    na.placeholder = "What does this cover, and who is it for?";
    ln.appendChild(na);
    b.appendChild(ln);

    var lg = el("label", "f");
    lg.appendChild(el("span", null, "Tags (comma separated)"));
    var tg = document.createElement("input");
    tg.id = "up-tags";
    tg.placeholder = "arrays, two-pointer, placement";
    lg.appendChild(tg);
    b.appendChild(lg);

    var foot = el("div");
    foot.style.cssText = "display:flex;gap:10px;align-items:center";
    var post = el("button", "btn primary", "Post to feed");
    foot.appendChild(post);
    foot.appendChild(el("span", "hint", "Saved in this browser."));
    b.appendChild(foot);
    sheet.appendChild(b);

    post.onclick = function () {
      var title = ti.value.trim();
      if (!title) { fail("Give the post a title so people can find it in search."); ti.focus(); return; }
      var dur = parseDur(di.value);
      if (!dur && !picked.file) { fail("Add a length (like 4:30) so the duration filters work."); di.focus(); return; }
      errBox.hidden = true;
      post.disabled = true;
      post.textContent = "Posting…";

      var step = picked.file
        ? new Promise(function (resolve, reject) {
            var fr = new FileReader();
            fr.onload = function () { resolve(fr.result); };
            fr.onerror = function () { reject(new Error("read failed")); };
            fr.readAsDataURL(picked.file);
          })
        : Promise.resolve(null);

      step.then(function (dataUrl) {
        var doc = {
          id: "p" + Date.now().toString(36) + hash(title + Math.random()).toString(36).slice(0, 4),
          authorId: S.uid,
          title: title,
          note: na.value.trim(),
          track: sel.value,
          durationSec: dur,
          kind: dataUrl ? picked.kind : "note",
          createdAt: new Date().toISOString(),
          tags: tg.value.split(",").map(function (t) { return t.trim().toLowerCase(); })
            .filter(Boolean).slice(0, 6)
        };
        if (dataUrl) doc.src = dataUrl;
        S.posts.push(doc);
        persist();
        if (!S.storageOk) {
          /* keep it on screen for this visit, but say plainly it is not saved */
          toast("Posted — but this browser wouldn't store it");
        } else {
          toast("Posted to " + tname(sel.value));
        }
        closeLayer();
        render();
      }, function () {
        post.disabled = false;
        post.textContent = "Post to feed";
        fail("Couldn't read that file. Try a smaller one.");
      });
    };

    openLayer(sheet);
    ti.focus();
  }

  /* ---------------- events ---------------- */
  $("new-post").onclick = openUpload;
  $("t-upload").onclick = openUpload;
  $("q").addEventListener("input", function (e) { S.q = e.target.value; renderFeed(); });
  ["feed", "following", "you"].forEach(function (v) {
    var go = function () { S.view = v; render(); window.scrollTo({ top: 0, behavior: "smooth" }); };
    $("v-" + v).onclick = go;
    $("t-" + v).onclick = go;
  });
  document.querySelectorAll("[data-dur]").forEach(function (b) {
    b.onclick = function () { S.dur = b.dataset.dur; render(); };
  });
  document.querySelectorAll("[data-sort]").forEach(function (b) {
    b.onclick = function () { S.sort = b.dataset.sort; render(); };
  });

  /* ---------------- boot ---------------- */
  var saved = Store.load();
  S.uid = saved.me;
  S.myName = saved.name || "";
  S.likes = saved.likes.slice();
  S.follows = saved.follows.slice();
  S.posts = SEED_POSTS.concat(saved.posts);
  S.storageOk = Store.save();
  render();
})();
