/* Stackgram — UI layer.
   Reads and writes through window.StackgramStore, so the same interface
   runs on the shared claude.ai database and on the standalone build that
   keeps everything in the visitor's own browser. */
(function () {
  "use strict";

  var Store = window.StackgramStore;

  var TRACKS = [
    { id: "dsa",  name: "DSA",        v: "--t-dsa" },
    { id: "full", name: "Full Stack", v: "--t-full" },
    { id: "apt",  name: "Aptitude",   v: "--t-apt" },
    { id: "math", name: "Maths",      v: "--t-math" },
    { id: "eng",  name: "English",    v: "--t-eng" },
    { id: "gen",  name: "GenAI",      v: "--t-gen" },
    { id: "misc", name: "Misc",       v: "--t-misc" }
  ];
  var TMAP = {};
  TRACKS.forEach(function (t) { TMAP[t.id] = t; });
  function tcolor(id) { return "var(" + (TMAP[id] || TMAP.misc).v + ")"; }
  function tname(id) { return (TMAP[id] || TMAP.misc).name; }

  var view = { tab: "feed", track: "all", q: "", dur: "all", sort: "new", archived: false };

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
    return parts.length ? parts.reduce(function (a, b) { return a * 60 + b; }, 0) : 0;
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
    return "hsl(" + hues[hash(seed) % hues.length] + " 50% 40%)";
  }
  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2)
      .map(function (p) { return p.charAt(0).toUpperCase(); }).join("") || "?";
  }
  function authorName(p) {
    if (p.authorId && p.authorId === Store.uid()) return Store.name() || "You";
    return p.authorName || Store.nameFor(p.authorId) || "Someone";
  }
  function commentAuthor(c) {
    if (c.authorId && c.authorId === Store.uid()) return Store.name() || "You";
    return c.authorName || Store.nameFor(c.authorId) || "Someone";
  }

  function durBucket(sec) {
    if (sec < 60) return "s";
    if (sec < 300) return "m";
    if (sec < 1200) return "l";
    return "x";
  }

  function visiblePosts() {
    var q = view.q.trim().toLowerCase();
    var out = Store.posts().filter(function (p) {
      if (view.track !== "all" && p.track !== view.track) return false;
      if (view.dur !== "all" && durBucket(p.durationSec || 0) !== view.dur) return false;
      if (view.tab === "following" && !Store.iFollow(p.authorId)) return false;
      /* the search tab searches everything, so it filters like the feed */
      if (view.tab === "you" && p.authorId !== Store.uid()) return false;
      if (view.tab === "shorts" && !isShort(p)) return false;
      /* an archived post is visible only to its creator, on the You tab with
         the archive open */
      var mine = p.authorId === Store.uid();
      if (p.archived && !(mine && view.tab === "you" && view.archived)) return false;
      if (!p.archived && mine && view.tab === "you" && view.archived) return false;
      if (q) {
        var hay = [p.title, p.note, authorName(p), tname(p.track)]
          .concat(p.tags || []).join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    out.sort(function (a, b) {
      if (view.sort === "top") {
        var d = Store.likeCount(b.id) - Store.likeCount(a.id);
        if (d) return d;
      }
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
    return out;
  }

  /* ---------------- pieces ---------------- */
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
  function bubble() {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2");
    s.setAttribute("stroke-linejoin", "round");
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M21 12a8 8 0 0 1-8 8H4l2.2-3.1A8 8 0 1 1 21 12Z");
    s.appendChild(p);
    return s;
  }

  function avatarNode(p, size) {
    var a = el("div", "av", initials(authorName(p)));
    a.style.background = avatarColor(p.authorId || "anon");
    if (size) {
      a.style.width = a.style.height = size + "px";
      a.style.fontSize = (size / 2.2) + "px";
    }
    return a;
  }
  function plainCover(box, p, msg) {
    box.style.background = tcolor(p.track);
    box.appendChild(el("div", "ghost", p.title || ""));
    if (msg) {
      var n = el("div", null, msg);
      n.style.cssText = "position:absolute;left:12px;right:12px;top:12px;font-size:11px;color:rgba(255,255,255,.9)";
      box.appendChild(n);
    }
  }
  function coverNode(p, mode) {
    var big = mode === true;
    var box;
    if (big) {
      box = el("div", "post-media");
    } else {
      box = document.createElement("button");
      box.className = mode || "media";
      box.type = "button";
      box.setAttribute("aria-label", "Open " + (p.title || "post"));
    }
    var src = Store.mediaSrc(p);
    if (src && (p.kind === "image" || p.kind === "clip")) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = p.title || "Post media";
      if (p.kind !== "clip") img.loading = "lazy";
      img.addEventListener("error", function () { img.remove(); plainCover(box, p); });
      box.appendChild(img);
    } else if (src && p.kind === "video") {
      var vid = document.createElement("video");
      vid.src = src;
      vid.preload = "metadata";
      vid.addEventListener("loadedmetadata", function () {
        if (!big && vid.currentTime === 0) { try { vid.currentTime = 0.05; } catch (e) {} }
      });
      vid.addEventListener("error", function () { vid.remove(); plainCover(box, p); });
      setTimeout(function () {
        if (vid.readyState === 0 && box.contains(vid)) {
          vid.remove();
          plainCover(box, p, "Video can't play in this view");
        }
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
      plainCover(box, p);
    }
    if (!big) box.appendChild(el("div", "dur mono", fmtDur(p.durationSec)));
    return box;
  }

  function ownerMenuButton(p, cls) {
    var menu = el("button", cls, "⋯");
    menu.type = "button";
    menu.title = "Edit, archive or delete";
    menu.setAttribute("aria-label", "Options for " + (p.title || "your post"));
    menu.onclick = function (e) { e.stopPropagation(); openOwnerMenu(p.id); };
    return menu;
  }

  /* Under a minute is a Short; anything longer is a video. One rule, and it
     decides the shape everywhere. */
  function isShort(p) { return (p.durationSec || 0) < 60; }

  function viewLine(p) {
    var v = Store.viewCount(p.id);
    return v + (v === 1 ? " view · " : " views · ") + ago(p.createdAt);
  }

  /* A Short on the home shelf: portrait thumbnail, title, views. */
  function shelfItem(p) {
    var item = el("div", "shelf-item");
    var m = coverNode(p, "media");
    m.onclick = function () { openShorts(p.id); };
    if (p.archived) m.appendChild(el("div", "flag", "Archived"));
    item.appendChild(m);
    item.appendChild(el("div", "t", p.title || "Untitled"));
    item.appendChild(el("div", "s", Store.viewCount(p.id) + " views"));
    return item;
  }

  /* A long video on home: 16:9 thumbnail beside title, channel and views. */
  function videoRow(p) {
    var row = el("div", "vrow");
    if (p.archived) row.classList.add("archived");
    var m = coverNode(p, "media");
    m.onclick = function () { openPost(p.id); };
    if (p.archived) m.appendChild(el("div", "flag", "Archived"));
    row.appendChild(m);

    var info = el("div", "info");
    info.appendChild(avatarNode(p, 32));
    var txt = el("div", "txt");
    var t = el("div", "t", p.title || "Untitled");
    t.style.cursor = "pointer";
    t.onclick = function () { openPost(p.id); };
    txt.appendChild(t);
    txt.appendChild(el("div", "s", authorName(p) + (p.sample ? " · sample" : "")));
    txt.appendChild(el("div", "s", viewLine(p) + " · " + tname(p.track)));
    if (p.note) txt.appendChild(el("div", "note", p.note));
    info.appendChild(txt);
    if (p.authorId && p.authorId === Store.uid()) {
      info.appendChild(ownerMenuButton(p, "owner-menu"));
    }
    row.appendChild(info);
    return row;
  }

  /* One Short in the vertical player. */
  function shortNode(p) {
    var box = el("div", "short");
    var m = coverNode(p, "media");
    m.onclick = function () { openPost(p.id); };
    box.appendChild(m);

    var burst = el("div", "burst");
    burst.appendChild(heart(true));
    box.appendChild(burst);
    box.addEventListener("dblclick", function (e) {
      e.preventDefault();
      if (!Store.iLiked(p.id)) Store.toggleLike(p.id);
      burst.classList.remove("on");
      void burst.offsetWidth;
      burst.classList.add("on");
    });

    var info = el("div", "short-info");
    var who = el("div", "who");
    who.appendChild(avatarNode(p, 26));
    who.appendChild(document.createTextNode(authorName(p)));
    if (p.authorId && p.authorId !== Store.uid()) {
      var sub = el("button", "btn small" + (Store.iFollow(p.authorId) ? "" : " primary"),
        Store.iFollow(p.authorId) ? "Subscribed" : "Subscribe");
      sub.onclick = function (e) { e.stopPropagation(); Store.toggleFollow(p.authorId); };
      who.appendChild(sub);
    }
    info.appendChild(who);
    info.appendChild(el("div", "t", p.title || "Untitled"));
    info.appendChild(el("div", "s", viewLine(p) + " · " + fmtDur(p.durationSec)));
    box.appendChild(info);

    var rail = el("div", "short-rail");
    var like = el("button");
    like.setAttribute("aria-pressed", Store.iLiked(p.id) ? "true" : "false");
    like.appendChild(heart(Store.iLiked(p.id)));
    like.appendChild(el("span", null, String(Store.likeCount(p.id))));
    like.onclick = function (e) { e.stopPropagation(); Store.toggleLike(p.id); };
    rail.appendChild(like);

    var com = el("button");
    com.appendChild(bubble());
    com.appendChild(el("span", null, String(Store.commentCount(p.id))));
    com.onclick = function (e) { e.stopPropagation(); openPost(p.id, true); };
    rail.appendChild(com);

    if (p.authorId === Store.uid()) {
      var more = el("button");
      more.appendChild(el("span", null, "⋯"));
      more.style.fontSize = "22px";
      more.onclick = function (e) { e.stopPropagation(); openOwnerMenu(p.id); };
      rail.appendChild(more);
    }
    box.appendChild(rail);
    return box;
  }

  /* A profile tile: square, media only — the You tab is a contact sheet. */
  function tileNode(p) {
    var wrap = el("div");
    wrap.style.position = "relative";
    var tile = coverNode(p, "tile");
    if (p.archived) tile.classList.add("archived");
    tile.onclick = function () { openPost(p.id); };
    wrap.appendChild(tile);
    if (p.authorId === Store.uid()) wrap.appendChild(ownerMenuButton(p, "tile-menu"));
    return wrap;
  }


  function myPosts(archived) {
    return Store.posts().filter(function (p) {
      return p.authorId === Store.uid() && !!p.archived === !!archived;
    });
  }

  function creatorRows() {
    var by = {};
    Store.posts().forEach(function (p) {
      if (!p.authorId || p.authorId === Store.uid()) return;
      if (!by[p.authorId]) by[p.authorId] = { id: p.authorId, post: p, posts: 0, likes: 0 };
      by[p.authorId].posts++;
      by[p.authorId].likes += Store.likeCount(p.id);
    });
    return Object.keys(by).map(function (k) { return by[k]; })
      .sort(function (a, b) { return (b.likes - a.likes) || (b.posts - a.posts); });
  }

  function suggestNode() {
    var box = el("div", "suggest");
    creatorRows().slice(0, 5).forEach(function (c) {
      var row = el("div", "creator");
      row.appendChild(avatarNode(c.post, 28));
      row.appendChild(el("div", "nm", authorName(c.post)));
      var f = el("button", "btn small" + (Store.iFollow(c.id) ? "" : " primary"),
        Store.iFollow(c.id) ? "Subscribed" : "Subscribe");
      f.onclick = function () { Store.toggleFollow(c.id); };
      row.appendChild(f);
      box.appendChild(row);
    });
    return box;
  }

  /* ---------------- views ---------------- */
  function renderTracks() {
    var box = $("tracks");
    box.textContent = "";
    var mk = function (id, label) {
      var n = el("button", "chip", label);
      if (id !== "all") n.style.setProperty("--tc", tcolor(id));
      n.setAttribute("aria-pressed", view.track === id ? "true" : "false");
      n.onclick = function () { view.track = id; render(); };
      return n;
    };
    box.appendChild(mk("all", "All"));
    TRACKS.forEach(function (t) { box.appendChild(mk(t.id, t.name)); });
  }

  function renderBoard() {
    var box = $("board");
    box.textContent = "";
    box.hidden = view.tab !== "you";
    if (view.tab !== "you") return;
    var mine = myPosts(false);
    var likes = mine.reduce(function (n, p) { return n + Store.likeCount(p.id); }, 0);
    [[mine.length, "Posts"], [Store.followerCount(Store.uid()), "Followers"], [likes, "Likes"]]
      .forEach(function (d) {
        var s = el("div", "stat");
        s.appendChild(el("b", null, String(d[0])));
        s.appendChild(el("span", null, d[1]));
        box.appendChild(s);
      });
    var right = el("div");
    right.style.cssText = "margin-left:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap";
    var archived = myPosts(true).length;
    var t = el("button", "btn small" + (view.archived ? " primary" : ""),
      view.archived ? "Showing archive (" + archived + ")" : "Archive (" + archived + ")");
    t.onclick = function () { view.archived = !view.archived; render(); };
    right.appendChild(t);
    if (Store.canSetName()) {
      var b = el("button", "btn small", Store.name() ? "Posting as " + Store.name() : "Set your name");
      b.onclick = openName;
      right.appendChild(b);
    }
    box.appendChild(right);
  }

  function renderFeed() {
    var out = $("main-out");
    out.textContent = "";
    var list = visiblePosts();
    $("count").textContent = list.length + (list.length === 1 ? " post" : " posts");
    if (!list.length) {
      var e = el("div", "empty");
      if (view.tab === "you" && view.archived) {
        e.appendChild(el("h3", null, "Nothing archived"));
        e.appendChild(el("p", null, "Archiving a post hides it from the feed but keeps it here."));
      } else if (view.tab === "you") {
        e.appendChild(el("h3", null, "Nothing uploaded yet"));
        e.appendChild(el("p", null, "Post a walkthrough, a cheat sheet or a 30-second trick."));
      } else if (view.tab === "following") {
        e.appendChild(el("h3", null, "No subscriptions yet"));
        e.appendChild(el("p", null, "Subscribe to a creator and their uploads land here."));
        e.appendChild(suggestNode());
      } else if (view.tab === "search" && !view.q.trim()) {
        e.appendChild(el("h3", null, "Search Stackgram"));
        e.appendChild(el("p", null, "Type a topic, a creator or a tag — or pick a track above."));
      } else {
        e.appendChild(el("h3", null, "No posts match"));
        e.appendChild(el("p", null, "Clear the search or pick another track."));
      }
      out.appendChild(e);
      return;
    }
    if (view.tab === "you") {
      var tiles = el("div", "tiles");
      list.forEach(function (p) { tiles.appendChild(tileNode(p)); });
      out.appendChild(tiles);
      return;
    }
    if (view.tab === "shorts") {
      var shorts = el("div", "shorts");
      list.forEach(function (p) { shorts.appendChild(shortNode(p)); });
      out.appendChild(shorts);
      return;
    }
    /* home, search and subscriptions: Shorts on a shelf, videos in rows */
    var shortList = list.filter(isShort);
    var videoList = list.filter(function (p) { return !isShort(p); });
    if (shortList.length) {
      var h = el("div", "section-h");
      h.appendChild(el("span", "dot"));
      h.appendChild(document.createTextNode("Shorts"));
      out.appendChild(h);
      var shelf = el("div", "shelf");
      shortList.forEach(function (p) { shelf.appendChild(shelfItem(p)); });
      out.appendChild(shelf);
    }
    if (videoList.length) {
      if (shortList.length) out.appendChild(el("div", "section-h", "Videos"));
      var rows = el("div", "rows");
      videoList.forEach(function (p) { rows.appendChild(videoRow(p)); });
      out.appendChild(rows);
    }
  }

  function render() {
    ["feed", "shorts", "search", "following", "you"].forEach(function (v) {
      $("t-" + v).setAttribute("aria-pressed", view.tab === v ? "true" : "false");
    });
    $("searchbar").hidden = view.tab !== "search";
    $("scroller").classList.toggle("snap", view.tab === "shorts");
    $("f-dur").value = view.dur;
    $("f-sort").value = view.sort;
    var note = Store.notice();
    $("banner").textContent = "";
    if (note) $("banner").appendChild(el("div", "banner", note));
    renderTracks();
    renderBoard();
    renderFeed();
  }

  /* ---------------- overlays ---------------- */
  /* An open sheet is a history entry, so the browser and phone back button
     close it instead of leaving the app. */
  var sheetOpen = false;

  function dismissLayer() {
    $("layer").textContent = "";
    sheetOpen = false;
    document.removeEventListener("keydown", escClose);
  }
  function closeLayer() {
    if (sheetOpen && window.history.state && window.history.state.stackgramSheet) {
      window.history.back();   /* popstate dismisses it */
      return;
    }
    dismissLayer();
  }
  function escClose(e) { if (e.key === "Escape") closeLayer(); }
  function openLayer(sheet) {
    var layer = $("layer");
    layer.textContent = "";
    var scrim = el("div", "scrim");
    scrim.onclick = function (e) { if (e.target === scrim) closeLayer(); };
    scrim.appendChild(sheet);
    layer.appendChild(scrim);
    if (!sheetOpen) {
      try { window.history.pushState({ stackgramSheet: true }, ""); } catch (e) {}
      sheetOpen = true;
    }
    document.addEventListener("keydown", escClose);
  }
  window.addEventListener("popstate", function () { if (sheetOpen) dismissLayer(); });

  function backArrow() {
    var b = el("button", "back");
    b.type = "button";
    b.setAttribute("aria-label", "Back");
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M15 5l-7 7 7 7");
    svg.appendChild(p);
    b.appendChild(svg);
    b.onclick = closeLayer;
    return b;
  }

  function sheetHead(title) {
    var head = el("div", "sheet-h");
    head.appendChild(backArrow());
    head.appendChild(el("h2", null, title));
    return head;
  }

  function openName() {
    var sheet = el("div", "sheet");
    sheet.appendChild(sheetHead("Your name"));
    var b = el("div", "sheet-b");
    var l = el("label", "f");
    l.appendChild(el("span", null, "Display name"));
    var inp = document.createElement("input");
    inp.id = "name-input";
    inp.maxLength = 40;
    inp.value = Store.name();
    inp.placeholder = "Deepika Y.";
    l.appendChild(inp);
    b.appendChild(l);
    b.appendChild(el("p", "hint", "Shown on the posts you upload."));
    var save = el("button", "btn primary", "Save");
    save.onclick = function () { Store.setName(inp.value.trim()); closeLayer(); };
    b.appendChild(save);
    sheet.appendChild(b);
    openLayer(sheet);
    inp.focus();
  }

  /* ---------------- creator controls ---------------- */
  function openOwnerMenu(pid) {
    var p = Store.posts().filter(function (x) { return x.id === pid; })[0];
    if (!p) return;
    var sheet = el("div", "sheet");
    sheet.appendChild(sheetHead(p.title || "Your post"));
    var b = el("div", "sheet-b");
    var list = el("div", "menu-list");

    var open = el("button", null, "Open");
    open.onclick = function () { openPost(pid); };
    list.appendChild(open);

    var edit = el("button", null, "Edit details");
    edit.onclick = function () { openComposer(p); };
    list.appendChild(edit);

    var arch = el("button", null, p.archived
      ? "Unarchive — put it back in the feed"
      : "Archive — hide it from the feed, keep it in You");
    arch.onclick = function () { setArchived(p, !p.archived); };
    list.appendChild(arch);

    var del = el("button", "danger", "Delete permanently");
    del.onclick = function () { confirmDelete(p); };
    list.appendChild(del);

    b.appendChild(list);
    sheet.appendChild(b);
    openLayer(sheet);
  }

  function setArchived(p, on) {
    Store.updatePost(p.id, { archived: !!on }).then(function () {
      closeLayer();
      toast(on ? "Archived — only you can see it now" : "Back in the feed");
    }, function (e) {
      toast((e && e.message) || "Couldn't update that post");
    });
  }

  function confirmDelete(p) {
    var sheet = el("div", "sheet");
    sheet.appendChild(sheetHead("Delete this post?"));
    var b = el("div", "sheet-b");
    b.appendChild(el("div", "ttl", p.title || "Untitled"));
    b.appendChild(el("p", "hint",
      "Deleting removes the post and its likes for everyone, and can't be undone. "
      + "To take it out of the feed but keep it, archive it instead."));
    var row = el("div");
    row.style.cssText = "display:flex;gap:10px";
    var go = el("button", "btn primary", "Delete");
    go.style.background = "var(--hot)";
    go.onclick = function () {
      go.disabled = true;
      go.textContent = "Deleting…";
      Store.deletePost(p.id).then(function () { closeLayer(); toast("Post deleted"); },
        function () { go.disabled = false; go.textContent = "Delete"; toast("Couldn't delete"); });
    };
    var keep = el("button", "btn", "Archive instead");
    keep.onclick = function () { setArchived(p, true); };
    var cancel = el("button", "btn", "Cancel");
    cancel.onclick = closeLayer;
    row.appendChild(go);
    row.appendChild(keep);
    row.appendChild(cancel);
    b.appendChild(row);
    sheet.appendChild(b);
    openLayer(sheet);
  }

  function openPost(pid, focusComment) {
    var p = Store.posts().filter(function (x) { return x.id === pid; })[0];
    if (!p) return;
    Store.addView(p.id);
    var sheet = el("div", "sheet wide");
    var wrap = el("div", "post-view");
    wrap.appendChild(coverNode(p, true));

    var side = el("div", "post-side");
    var head = el("div");
    head.style.cssText = "display:flex;align-items:center;gap:9px";
    head.appendChild(backArrow());
    head.appendChild(avatarNode(p, 32));
    var meta = el("div");
    meta.style.cssText = "flex:1;min-width:0";
    var nm = el("div", null, authorName(p));
    nm.style.cssText = "font-weight:600;font-size:14px";
    meta.appendChild(nm);
    var sub = el("div", null, Store.followerCount(p.authorId) + " subscribers · " + viewLine(p));
    sub.style.cssText = "font-size:12px;color:var(--muted)";
    meta.appendChild(sub);
    head.appendChild(meta);
    if (p.authorId && p.authorId !== Store.uid()) {
      var fb = el("button", "btn small" + (Store.iFollow(p.authorId) ? "" : " primary"),
        Store.iFollow(p.authorId) ? "Subscribed" : "Subscribe");
      fb.onclick = function () { Store.toggleFollow(p.authorId); openPost(pid); };
      head.appendChild(fb);
    }
    side.appendChild(head);

    var line = el("div", "hint", tname(p.track) + " · " + fmtDur(p.durationSec));
    side.appendChild(line);
    var h = el("h2", null, p.title || "Untitled");
    h.style.fontSize = "20px";
    side.appendChild(h);
    if (p.note) side.appendChild(el("div", "note", p.note));
    if (p.tags && p.tags.length) {
      var tg = el("div", "tags");
      p.tags.forEach(function (t) {
        var b = el("button", "tag", "#" + t);
        b.onclick = function () { view.q = t; $("q").value = t; closeLayer(); goTo("search"); };
        tg.appendChild(b);
      });
      side.appendChild(tg);
    }
    /* download-link:start (stripped from the artifact build: its viewer
       never grants a page download permission, so the link would be dead) */
    if (p.download && Store.allowDownloads()) {
      var dl = el("a", "hint", "Download the original MP4");
      dl.href = p.download;
      dl.download = "";
      dl.style.cssText = "color:var(--accent);font-weight:600;text-decoration:none";
      side.appendChild(dl);
    }
    /* download-link:end */
    if (p.sample) side.appendChild(el("div", "hint", "Sample post, seeded to show the feed in use."));

    /* comments live under the caption, where people look for them */
    var cbox = el("div", "comments");
    var list = Store.comments(p.id);
    if (!list.length) cbox.appendChild(el("p", "hint", "No comments yet."));
    list.forEach(function (c) {
      var row = el("div", "comment");
      var who = { authorId: c.authorId, authorName: c.authorName };
      row.appendChild(avatarNode(who, 26));
      var body = el("div", "body");
      var line = el("div", "line");
      line.appendChild(el("b", null, commentAuthor(c)));
      line.appendChild(document.createTextNode(" " + c.text));
      body.appendChild(line);
      body.appendChild(el("div", "when", ago(c.at)));
      row.appendChild(body);
      if (c.authorId === Store.uid() || p.authorId === Store.uid()) {
        var d = el("button", "del", "Delete");
        d.onclick = function () {
          Store.deleteComment(p.id, c.id).then(function () { openPost(pid, false); },
            function () { toast("Couldn't delete that comment"); });
        };
        row.appendChild(d);
      }
      cbox.appendChild(row);
    });
    if (Store.canComment()) {
      var form = el("div", "comment-form");
      var inp = document.createElement("input");
      inp.id = "comment-input";
      inp.maxLength = 300;
      inp.placeholder = "Add a comment…";
      var send = el("button", null, "Post");
      send.disabled = true;
      inp.addEventListener("input", function () { send.disabled = !inp.value.trim(); });
      var submit = function () {
        var text = inp.value.trim();
        if (!text) return;
        send.disabled = true;
        Store.addComment(p.id, text).then(function () { openPost(pid, true); },
          function (e) { send.disabled = false; toast((e && e.message) || "Couldn't post that comment"); });
      };
      send.onclick = submit;
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
      form.appendChild(inp);
      form.appendChild(send);
      cbox.appendChild(form);
    }
    side.appendChild(cbox);

    var acts = el("div");
    acts.style.cssText = "display:flex;gap:10px;align-items:center;margin-top:auto;padding-top:10px;border-top:1px solid var(--line)";
    var like = el("button", "ico");
    like.setAttribute("aria-pressed", Store.iLiked(p.id) ? "true" : "false");
    like.appendChild(heart(Store.iLiked(p.id)));
    var n = Store.likeCount(p.id);
    like.appendChild(el("span", "mono", n + (n === 1 ? " like" : " likes")));
    like.onclick = function () { Store.toggleLike(p.id); openPost(pid); };
    acts.appendChild(like);
    if (p.authorId === Store.uid()) {
      var own = el("div");
      own.style.cssText = "margin-left:auto;display:flex;gap:8px";
      var edit = el("button", "btn small", "Edit");
      edit.onclick = function () { openComposer(p); };
      own.appendChild(edit);
      var arch = el("button", "btn small", p.archived ? "Unarchive" : "Archive");
      arch.onclick = function () { setArchived(p, !p.archived); };
      own.appendChild(arch);
      var del = el("button", "btn small", "Delete");
      del.onclick = function () { confirmDelete(p); };
      own.appendChild(del);
      acts.appendChild(own);
    }
    side.appendChild(acts);
    wrap.appendChild(side);
    sheet.appendChild(wrap);
    openLayer(sheet);
    if (focusComment) {
      var box = $("comment-input");
      if (box) { box.focus(); box.scrollIntoView({ block: "center" }); }
    }
  }

  /* One sheet for both jobs: `existing` means edit that post, otherwise post
     a new one. */
  function openComposer(existing) {
    if (!existing && !Store.canPost()) { toast(Store.postBlockedReason()); return; }
    var sheet = el("div", "sheet");
    sheet.appendChild(sheetHead(existing ? "Edit post" : "New upload"));
    var b = el("div", "sheet-b");
    var errBox = el("div", "err");
    errBox.hidden = true;
    b.appendChild(errBox);
    function fail(msg) { errBox.textContent = msg; errBox.hidden = false; }

    var picked = { file: null, kind: "note", url: null };
    if (Store.canAttach()) {
      var row = el("div");
      row.style.cssText = "display:flex;flex-direction:column;gap:8px";
      var fi = document.createElement("input");
      fi.type = "file";
      fi.id = "up-file";
      fi.accept = "image/*,video/*";
      fi.style.display = "none";
      var hasMedia = existing && existing.kind !== "note";
      var pick = el("button", "btn", hasMedia ? "Replace file" : "Choose image, GIF or video");
      pick.onclick = function () { fi.click(); };
      var prev = el("div");
      if (hasMedia) {
        var cur = document.createElement("img");
        cur.src = Store.mediaSrc(existing);
        cur.alt = "Current file";
        cur.style.cssText = "max-height:120px;border-radius:9px";
        prev.appendChild(cur);
      }
      row.appendChild(pick);
      row.appendChild(fi);
      row.appendChild(el("p", "hint", "Any length. " + Store.attachHint()));
      row.appendChild(prev);
      fi.onchange = function () {
        var f = fi.files && fi.files[0];
        if (!f) return;
        if (f.size > Store.maxBytes()) {
          fail("That file is " + (f.size / 1048576).toFixed(1) + " MB — the limit is " +
               Math.round(Store.maxBytes() / 1048576) + " MB.");
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
          v.style.cssText = "max-height:150px;border-radius:9px;width:100%";
          v.onloadedmetadata = function () {
            if (isFinite(v.duration) && v.duration > 0) $("up-dur").value = fmtDur(v.duration);
          };
          prev.appendChild(v);
        } else {
          var im = document.createElement("img");
          im.src = picked.url;
          im.alt = "Selected file preview";
          im.style.cssText = "max-height:150px;border-radius:9px";
          prev.appendChild(im);
        }
        pick.textContent = "Replace file";
      };
      b.appendChild(row);
    } else if (!existing) {
      b.appendChild(el("p", "hint", Store.attachHint()));
    }

    var lt = el("label", "f");
    lt.appendChild(el("span", null, "Title"));
    var ti = document.createElement("input");
    ti.id = "up-title";
    ti.maxLength = 90;
    ti.placeholder = "Sliding window in 3 steps";
    if (existing) ti.value = existing.title || "";
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
    if (existing) sel.value = existing.track || "misc";
    ltr.appendChild(sel);
    two.appendChild(ltr);
    var ld = el("label", "f");
    ld.appendChild(el("span", null, "Length (mm:ss)"));
    var di = document.createElement("input");
    di.id = "up-dur";
    di.placeholder = "4:30";
    di.inputMode = "numeric";
    if (existing) di.value = fmtDur(existing.durationSec);
    ld.appendChild(di);
    two.appendChild(ld);
    b.appendChild(two);

    var ln = el("label", "f");
    ln.appendChild(el("span", null, "Description"));
    var na = document.createElement("textarea");
    na.id = "up-note";
    na.placeholder = "What does this cover, and who is it for?";
    if (existing) na.value = existing.note || "";
    ln.appendChild(na);
    b.appendChild(ln);

    var lg = el("label", "f");
    lg.appendChild(el("span", null, "Tags"));
    var tg = document.createElement("input");
    tg.id = "up-tags";
    tg.placeholder = "arrays, two-pointer, placement";
    if (existing && existing.tags) tg.value = existing.tags.join(", ");
    lg.appendChild(tg);
    b.appendChild(lg);

    var actions = el("div");
    actions.style.cssText = "display:flex;gap:10px;align-items:center;flex-wrap:wrap";
    var post = el("button", "btn primary", existing ? "Save changes" : "Post");
    actions.appendChild(post);
    if (existing) {
      var arch = el("button", "btn", existing.archived ? "Unarchive" : "Archive");
      arch.onclick = function () { setArchived(existing, !existing.archived); };
      actions.appendChild(arch);
      var del = el("button", "btn", "Delete");
      del.onclick = function () { confirmDelete(existing); };
      actions.appendChild(del);
    }

    post.onclick = function () {
      var title = ti.value.trim();
      if (!title) { fail("Give the post a title so people can find it in search."); ti.focus(); return; }
      var dur = parseDur(di.value);
      if (!dur && !picked.file && !existing) {
        fail("Add a length (like 4:30) so the filters work.");
        di.focus();
        return;
      }
      errBox.hidden = true;
      post.disabled = true;
      post.textContent = existing ? "Saving…" : "Posting…";
      var fields = {
        title: title,
        note: na.value.trim(),
        track: sel.value,
        durationSec: dur,
        tags: tg.value.split(",").map(function (t) { return t.trim().toLowerCase(); })
          .filter(Boolean).slice(0, 6)
      };
      var done = existing
        ? Store.updatePost(existing.id, fields, picked.file, picked.kind)
        : Store.addPost(Object.assign({ kind: picked.file ? picked.kind : "note" }, fields), picked.file);
      done.then(function () {
        closeLayer();
        toast(existing ? "Changes saved" : "Posted to " + tname(sel.value));
      }, function (e) {
        post.disabled = false;
        post.textContent = existing ? "Save changes" : "Post";
        fail((e && e.message) || "Couldn't save that. Try a smaller file.");
      });
    };
    b.appendChild(actions);
    sheet.appendChild(b);
    openLayer(sheet);
    ti.focus();
  }


  /* ---------------- events ---------------- */
  function openShorts(pid) {
    goTo("shorts");
    var idx = visiblePosts().map(function (p) { return p.id; }).indexOf(pid);
    if (idx < 0) return;
    var node = $("main-out").querySelectorAll(".short")[idx];
    if (node) node.scrollIntoView({ block: "center" });
  }

  function goTo(tab) {
    view.tab = tab;
    if (tab !== "you") view.archived = false;
    render();
    $("scroller").scrollTo({ top: 0, behavior: "smooth" });
    if (tab === "search") $("q").focus();
  }

  $("t-upload").onclick = function () { openComposer(null); };
  $("q").addEventListener("input", function (e) { view.q = e.target.value; renderFeed(); });
  ["feed", "shorts", "search", "following", "you"].forEach(function (v) {
    $("t-" + v).onclick = function () { goTo(v); };
  });
  $("f-dur").onchange = function (e) { view.dur = e.target.value; render(); };
  $("f-sort").onchange = function (e) { view.sort = e.target.value; render(); };

  /* ---------------- boot ---------------- */
  render();
  Store.init(render);
})();
