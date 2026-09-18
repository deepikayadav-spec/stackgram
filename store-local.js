/* Stackgram store — standalone build.
   The seeded feed ships with the page; a visitor's name, uploads, likes and
   follows live in their own browser. Nothing is sent anywhere, so one
   person's likes never reach another's. */
window.StackgramStore = (function () {
  "use strict";

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

  /* like counts the seeded posts arrive with, so the feed reads as a feed in
     use rather than an empty shell */
  var SEED_LIKES = { s01: 4, s02: 2, s03: 5, s04: 2, s05: 3, s06: 6,
                     s07: 2, s08: 1, s09: 2, s10: 3, s11: 3, s12: 2 };

  var KEY = "stackgram.v1";
  var MAX_BYTES = 3 * 1024 * 1024; /* uploads become data URLs in localStorage */

  var state = { me: null, name: "", posts: [], likes: [], follows: [] };
  var storageOk = true;
  var onChange = function () {};

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (!d || typeof d !== "object") return;
      state = {
        me: d.me || null,
        name: d.name || "",
        posts: Array.isArray(d.posts) ? d.posts : [],
        likes: Array.isArray(d.likes) ? d.likes : [],
        follows: Array.isArray(d.follows) ? d.follows : []
      };
    } catch (e) { /* private window or blocked storage: run in memory */ }
  }
  function write() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOk = true; }
    catch (e) { storageOk = false; }
    return storageOk;
  }
  function changed() { write(); onChange(); }
  function hash(s) {
    var h = 0, i;
    for (i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  return {
    init: function (render) {
      onChange = render || onChange;
      read();
      if (!state.me) { state.me = "you-" + Math.random().toString(36).slice(2, 10); }
      write();
      onChange();
    },

    uid: function () { return state.me; },
    name: function () { return state.name; },
    nameFor: function () { return ""; },
    canSetName: function () { return true; },
    setName: function (v) { state.name = v; changed(); },

    posts: function () { return SEED_POSTS.concat(state.posts); },
    mediaSrc: function (p) { return p.src || ""; },

    likeCount: function (pid) {
      return (SEED_LIKES[pid] || 0) + (state.likes.indexOf(pid) === -1 ? 0 : 1);
    },
    iLiked: function (pid) { return state.likes.indexOf(pid) !== -1; },
    toggleLike: function (pid) {
      var i = state.likes.indexOf(pid);
      if (i === -1) state.likes.push(pid); else state.likes.splice(i, 1);
      changed();
    },

    iFollow: function (id) { return state.follows.indexOf(id) !== -1; },
    followerCount: function (id) {
      /* seeded creators carry a plausible following; yours counts your own */
      var base = String(id).indexOf("demo-") === 0 ? 3 + (hash(id) % 9) : 0;
      return base + (this.iFollow(id) ? 1 : 0);
    },
    toggleFollow: function (id) {
      if (id === state.me) return;
      var i = state.follows.indexOf(id);
      if (i === -1) state.follows.push(id); else state.follows.splice(i, 1);
      changed();
    },

    canPost: function () { return true; },
    postBlockedReason: function () { return ""; },
    canAttach: function () { return true; },
    attachHint: function () { return "Files are kept in this browser, so the limit is 3 MB."; },
    maxBytes: function () { return MAX_BYTES; },
    allowDownloads: function () { return true; },

    addPost: function (doc, file) {
      var step = file
        ? new Promise(function (resolve, reject) {
            var fr = new FileReader();
            fr.onload = function () { resolve(fr.result); };
            fr.onerror = function () { reject(new Error("Couldn't read that file.")); };
            fr.readAsDataURL(file);
          })
        : Promise.resolve(null);
      return step.then(function (dataUrl) {
        doc.id = "p" + Date.now().toString(36) + hash(doc.title + Math.random()).toString(36).slice(0, 4);
        doc.authorId = state.me;
        doc.createdAt = new Date().toISOString();
        if (dataUrl) doc.src = dataUrl;
        state.posts.push(doc);
        if (!write()) {
          state.posts.pop();
          onChange();
          throw new Error("This browser wouldn't store that — try a smaller file.");
        }
        onChange();
      });
    },

    /* Only your own posts are editable; the seeded ones are read-only. */
    updatePost: function (id, patch, file, kind) {
      var post = state.posts.filter(function (p) { return p.id === id; })[0];
      if (!post) return Promise.reject(new Error("You can only edit your own posts."));
      var step = file
        ? new Promise(function (resolve, reject) {
            var fr = new FileReader();
            fr.onload = function () { resolve(fr.result); };
            fr.onerror = function () { reject(new Error("Couldn't read that file.")); };
            fr.readAsDataURL(file);
          })
        : Promise.resolve(null);
      return step.then(function (dataUrl) {
        var before = JSON.stringify(post);
        Object.keys(patch).forEach(function (k) { post[k] = patch[k]; });
        if (dataUrl) { post.src = dataUrl; post.kind = kind || post.kind; }
        if (!write()) {
          var restored = JSON.parse(before);
          Object.keys(restored).forEach(function (k) { post[k] = restored[k]; });
          onChange();
          throw new Error("This browser wouldn't store that — try a smaller file.");
        }
        onChange();
      });
    },

    deletePost: function (id) {
      state.posts = state.posts.filter(function (p) { return p.id !== id; });
      changed();
      return Promise.resolve();
    },

    notice: function () {
      if (!storageOk) return "This browser is blocking site storage, so anything you post or like here disappears on reload.";
      return "";
    }
  };
})();
