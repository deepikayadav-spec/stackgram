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
      track: "full", durationSec: 2740, kind: "clip", src: "media/prev_auth.gif",
      createdAt: "2026-09-11T06:40:00.000Z", tags: ["react", "node", "jwt", "auth"] },
    { id: "s04", authorId: "demo-rohit", authorName: "Rohit B.", sample: true,
      title: "Why eigenvectors are just directions that survive",
      note: "Geometric intuition before the determinant grind. Three examples, no proofs.",
      track: "math", durationSec: 903, kind: "clip", src: "media/prev_eigen.gif",
      createdAt: "2026-09-13T17:30:00.000Z", tags: ["linear-algebra", "eigenvalues"] },
    { id: "s05", authorId: "demo-sana", authorName: "Sana P.", sample: true,
      title: "Group discussion: 6 openers that don't sound rehearsed",
      note: "Recorded from a mock GD. Includes the two openers that got me cut off, so you can hear the difference.",
      track: "eng", durationSec: 648, kind: "clip", src: "media/prev_gd.gif",
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
      track: "dsa", durationSec: 1120, kind: "clip", src: "media/prev_dijkstra.gif",
      createdAt: "2026-09-09T13:00:00.000Z", tags: ["graphs", "shortest-path"] },
    { id: "s08", authorId: "demo-vikram", authorName: "Vikram S.", sample: true,
      title: "Trains and boats problems in one formula sheet",
      note: "Relative speed reduces both topics to the same three lines. Screenshot it before your test.",
      track: "apt", durationSec: 186, kind: "clip", src: "media/prev_trains.gif",
      createdAt: "2026-09-12T08:10:00.000Z", tags: ["speed-distance", "formula-sheet"] },
    { id: "s09", authorId: "demo-meera", authorName: "Meera K.", sample: true,
      title: "CSS grid in 90 seconds, no framework",
      note: "Two properties do 80% of the work. Live coded a dashboard layout.",
      track: "full", durationSec: 94, kind: "clip", src: "media/prev_cssgrid.gif",
      createdAt: "2026-09-17T05:25:00.000Z", tags: ["css", "grid", "layout"] },
    { id: "s10", authorId: "demo-priya", authorName: "Priya D.", sample: true,
      title: "How I track 300 practice problems without burning out",
      note: "My spreadsheet, the revision interval I use, and what I stopped doing after month two.",
      track: "misc", durationSec: 735, kind: "clip", src: "media/prev_tracker.gif",
      createdAt: "2026-09-10T15:45:00.000Z", tags: ["study-plan", "habits"] },
    { id: "s11", authorId: "demo-karthik", authorName: "Karthik N.", sample: true,
      title: "Prompt patterns that stop an agent from looping",
      note: "Four failure traces from my own agent, and the instruction change that fixed each one.",
      track: "gen", durationSec: 1340, kind: "clip", src: "media/prev_agent.gif",
      createdAt: "2026-09-08T10:30:00.000Z", tags: ["agents", "prompting", "debugging"] },
    { id: "s12", authorId: "demo-rohit", authorName: "Rohit B.", sample: true,
      title: "Probability: the 3 questions that decide the marks",
      note: "Conditional, Bayes, expectation. One worked problem each, timed.",
      track: "math", durationSec: 1562, kind: "clip", src: "media/prev_probability.gif",
      createdAt: "2026-09-07T18:20:00.000Z", tags: ["probability", "bayes"] },
    { id: "s13", authorId: "demo-ananya", authorName: "Ananya R.", sample: true,
      title: "Big-O, in plain terms — spoken",
      note: "A 42-second walkthrough with narration: constant, linear and quadratic growth drawn as the input grows. Narrated with a synthetic voice and a drawn presenter, not a recording of a person.",
      track: "dsa", durationSec: 42, kind: "video", src: "media/talk_bigo.mp4",
      preview: "media/talk_bigo.gif",
      createdAt: "2026-09-17T15:10:00.000Z", tags: ["complexity", "big-o", "interview"] },
    { id: "s14", authorId: "demo-karthik", authorName: "Karthik N.", sample: true,
      title: "One attention head, explained out loud",
      note: "Queries, keys and values on a six-word sentence, the softmax over scores, why several heads, why the mask, and where the quadratic cost comes from. Narrated with a synthetic voice and a drawn presenter.",
      track: "gen", durationSec: 100, kind: "video", src: "media/talk_attention.mp4",
      preview: "media/talk_attention.gif",
      createdAt: "2026-09-17T16:20:00.000Z", tags: ["transformers", "attention", "llm"] },
    { id: "s15", authorId: "demo-vikram", authorName: "Vikram S.", sample: true,
      title: "Percentages without a calculator",
      note: "Tenths and halves of tenths, reverse percentages, and why a 10% rise followed by a 10% fall leaves you 1% down. Narrated with a synthetic voice and a drawn presenter.",
      track: "apt", durationSec: 88, kind: "video", src: "media/talk_percent.mp4",
      preview: "media/talk_percent.gif",
      createdAt: "2026-09-17T17:05:00.000Z", tags: ["percentages", "mental-maths", "speed"] }
  ];

  /* like counts the seeded posts arrive with, so the feed reads as a feed in
     use rather than an empty shell */
  var SEED_LIKES = { s01: 4, s02: 2, s03: 5, s04: 2, s05: 3, s06: 6,
                     s07: 2, s08: 1, s09: 2, s10: 3, s11: 3, s12: 2 };

  /* a couple of seeded threads, so the comment UI shows what it is for */
  var SEED_COMMENTS = {
    s01: [
      { id: "c1", authorId: "demo-vikram", authorName: "Vikram S.", sample: true,
        text: "Step 4 is exactly where I kept losing track. The pause helps.",
        at: "2026-09-15T12:10:00.000Z" },
      { id: "c2", authorId: "demo-priya", authorName: "Priya D.", sample: true,
        text: "Can you do the same for the longest repeating character replacement?",
        at: "2026-09-16T07:40:00.000Z" }
    ],
    s06: [
      { id: "c3", authorId: "demo-meera", authorName: "Meera K.", sample: true,
        text: "The retrieval scores being real numbers makes this so much clearer.",
        at: "2026-09-16T09:05:00.000Z" }
    ]
  };

  var SEED_VIEWS = { s01: 412, s02: 288, s03: 1530, s04: 640, s05: 502, s06: 1184,
                     s07: 733, s08: 214, s09: 96, s10: 388, s11: 910, s12: 655, s13: 1260, s14: 2140, s15: 1475 };

  var KEY = "stackgram.v1";
  var MAX_BYTES = 3 * 1024 * 1024; /* uploads become data URLs in localStorage */

  var state = { me: null, name: "", posts: [], likes: [], follows: [], comments: {}, views: [] };
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
        follows: Array.isArray(d.follows) ? d.follows : [],
        comments: (d.comments && typeof d.comments === "object") ? d.comments : {},
        views: Array.isArray(d.views) ? d.views : []
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
    /* a light looping preview for thumbnails, when a post has one */
    previewSrc: function (p) { return p.preview || ""; },

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

    viewCount: function (postId) {
      return (SEED_VIEWS[postId] || 0) + (state.views.indexOf(postId) === -1 ? 0 : 1);
    },
    addView: function (postId) {
      if (state.views.indexOf(postId) !== -1) return;
      state.views.push(postId);
      changed();
    },

    comments: function (postId) {
      var seeded = SEED_COMMENTS[postId] || [];
      var mine = state.comments[postId] || [];
      return seeded.concat(mine).sort(function (a, b) {
        return String(a.at).localeCompare(String(b.at));
      });
    },
    commentCount: function (postId) { return this.comments(postId).length; },
    canComment: function () { return true; },
    addComment: function (postId, text) {
      if (!state.comments[postId]) state.comments[postId] = [];
      var c = {
        id: "c" + Date.now().toString(36) + hash(text + Math.random()).toString(36).slice(0, 4),
        authorId: state.me,
        text: text,
        at: new Date().toISOString()
      };
      state.comments[postId].push(c);
      if (!write()) {
        state.comments[postId].pop();
        onChange();
        return Promise.reject(new Error("This browser wouldn't store that comment."));
      }
      onChange();
      return Promise.resolve();
    },
    deleteComment: function (postId, commentId) {
      var mine = state.comments[postId] || [];
      state.comments[postId] = mine.filter(function (c) { return c.id !== commentId; });
      changed();
      return Promise.resolve();
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
