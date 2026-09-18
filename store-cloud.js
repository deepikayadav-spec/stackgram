/* Stackgram store — claude.ai artifact build.
   Posts, likes and follows live in the artifact's shared database, so every
   viewer sees the same feed live. Uploaded files go to the artifact's asset
   store, which only viewers with edit access can write. */
window.StackgramStore = (function () {
  "use strict";

  var MAX_BYTES = 20 * 1024 * 1024;

  var db = null, assets = null, user = null;
  var uid = null, myName = "", canWrite = null, ready = false;
  var posts = [], likes = [], follows = [], comments = [], names = {};
  var onChange = function () {};
  var mediaCache = {};
  var pendingNames = false;

  function safeId(s) {
    return String(s || "").replace(/[^A-Za-z0-9_\-.~:@+]/g, "-").slice(0, 120);
  }
  function hash(s) {
    var h = 0, i;
    for (i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  /* Names arrive asynchronously from the user capability; resolve whoever is
     on screen and re-render once they land. */
  function resolveNames() {
    if (!user || !user.profiles || pendingNames) return;
    var ids = [];
    posts.concat(comments).forEach(function (p) {
      var who = p.authorId;
      if (who && !p.authorName && who !== uid && !(who in names)) {
        if (ids.indexOf(who) === -1) ids.push(who);
      }
    });
    if (!ids.length) return;
    pendingNames = true;
    Promise.resolve(user.profiles(ids)).then(function (ps) {
      pendingNames = false;
      if (!ps) return;
      ids.forEach(function (id) { names[id] = (ps[id] && ps[id].name) || ""; });
      onChange();
    }, function () { pendingNames = false; });
  }

  function subscribe() {
    db.collection("posts").onSnapshot(function (snap) {
      /* snapshot bodies are frozen — copy before touching them */
      posts = snap.docs.map(function (d) {
        var o = Object.assign({}, d.data() || {});
        if (!o.id) o.id = d.id;
        return o;
      });
      onChange();
      resolveNames();
    }, function () {});

    db.collection("likes").onSnapshot(function (snap) {
      likes = snap.docs.map(function (d) { return d.data() || {}; });
      onChange();
    }, function () {});

    db.collection("follows").onSnapshot(function (snap) {
      follows = snap.docs.map(function (d) { return d.data() || {}; });
      onChange();
    }, function () {});

    db.collection("comments").onSnapshot(function (snap) {
      comments = snap.docs.map(function (d) {
        var o = Object.assign({}, d.data() || {});
        o.id = d.id;
        return o;
      });
      onChange();
      resolveNames();
    }, function () {});
  }

  return {
    init: function (render) {
      onChange = render || onChange;
      if (!window.claude || !window.claude.use) { ready = true; onChange(); return; }

      claude.use("user").then(function (u) {
        user = u;
        if (!u) return;
        return Promise.all([
          Promise.resolve(u.id()).catch(function () { return null; }),
          Promise.resolve(u.can ? u.can("data.write") : null).catch(function () { return null; })
        ]).then(function (r) {
          uid = r[0] || null;
          canWrite = (r[1] === null || r[1] === undefined) ? null : !!r[1];
          onChange();
        });
      }).catch(function () {});

      claude.use("assets").then(function (a) { assets = a || null; onChange(); }).catch(function () {});

      claude.use("db").then(function (d) {
        ready = true;
        db = d || null;
        if (db) subscribe();
        onChange();
      }).catch(function () { ready = true; onChange(); });

      setTimeout(function () { if (!ready) { ready = true; onChange(); } }, 12000);
    },

    uid: function () { return uid; },
    name: function () { return myName; },
    nameFor: function (id) { return names[id] || ""; },
    canSetName: function () { return false; },
    setName: function () {},

    posts: function () { return posts; },

    /* stored assets serve fine over fetch but stall the media loader when a
       <video> requests them directly, so hand video an object URL instead */
    mediaSrc: function (p) {
      if (!p.assetId) return p.src || "";
      var url = "/_blob/" + p.assetId;
      if (p.kind !== "video") return url;
      if (!mediaCache[p.assetId]) {
        mediaCache[p.assetId] = "";
        fetch(url).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) {
          if (!b) return;
          mediaCache[p.assetId] = URL.createObjectURL(b);
          onChange();
        }, function () {});
      }
      return mediaCache[p.assetId];
    },

    likeCount: function (pid) {
      var n = 0, i;
      for (i = 0; i < likes.length; i++) if (likes[i].postId === pid) n++;
      return n;
    },
    iLiked: function (pid) {
      return !!(uid && likes.some(function (l) { return l.postId === pid && l.userId === uid; }));
    },
    toggleLike: function (pid) {
      if (!db || !uid) return;
      var ref = db.collection("likes").doc(safeId(pid) + "__" + safeId(uid));
      if (this.iLiked(pid)) ref.delete().catch(function () {});
      else ref.set({ postId: pid, userId: uid, at: new Date().toISOString() }).catch(function () {});
    },

    iFollow: function (id) {
      return !!(uid && follows.some(function (f) { return f.followerId === uid && f.targetId === id; }));
    },
    followerCount: function (id) {
      var n = 0, i;
      for (i = 0; i < follows.length; i++) if (follows[i].targetId === id) n++;
      return n;
    },
    toggleFollow: function (id) {
      if (!db || !uid || id === uid) return;
      var ref = db.collection("follows").doc(safeId(uid) + "__" + safeId(id));
      if (this.iFollow(id)) ref.delete().catch(function () {});
      else ref.set({ followerId: uid, targetId: id, at: new Date().toISOString() }).catch(function () {});
    },

    comments: function (postId) {
      return comments.filter(function (c) { return c.postId === postId; })
        .sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
    },
    commentCount: function (postId) {
      var n = 0, i;
      for (i = 0; i < comments.length; i++) if (comments[i].postId === postId) n++;
      return n;
    },
    canComment: function () { return !!(db && uid && canWrite !== false); },
    addComment: function (postId, text) {
      if (!this.canComment()) return Promise.reject(new Error("You have read-only access here"));
      var id = "c" + Date.now().toString(36) + hash(text + Math.random()).toString(36).slice(0, 4);
      return db.collection("comments").doc(id).set({
        postId: postId, authorId: uid, text: text, at: new Date().toISOString()
      }).then(function () {}, function () {
        throw new Error("Couldn't post that comment.");
      });
    },
    deleteComment: function (postId, commentId) {
      if (!db) return Promise.reject(new Error("not connected"));
      return db.collection("comments").doc(commentId).delete();
    },

    canPost: function () { return !!(db && uid && canWrite !== false); },
    postBlockedReason: function () {
      if (!db) return "Not connected to the shared feed";
      if (!uid) return "Sign in to post";
      return "You have read-only access here";
    },
    canAttach: function () { return !!assets; },
    attachHint: function () {
      return assets
        ? "Any length, up to 20 MB per file."
        : "File upload needs edit access on this artifact. You can still post notes.";
    },
    /* the artifact viewer never grants a page download permission */
    maxBytes: function () { return MAX_BYTES; },
    allowDownloads: function () { return false; },

    addPost: function (doc, file) {
      if (!this.canPost()) return Promise.reject(new Error(this.postBlockedReason()));
      var step = (file && assets)
        ? assets.upload(file).then(function (r) { return r && r.id; })
        : Promise.resolve(null);
      return step.then(function (assetId) {
        doc.id = "p" + Date.now().toString(36) + hash(doc.title + Math.random()).toString(36).slice(0, 4);
        doc.authorId = uid;
        doc.createdAt = new Date().toISOString();
        if (assetId) doc.assetId = assetId; else doc.kind = "note";
        return db.collection("posts").doc(doc.id).set(doc);
      }).then(function () {}, function (e) {
        if (e && e.code === "quota_exceeded") throw new Error("The feed is full. Delete an old post and try again.");
        throw new Error("Upload failed. Check the file size and try again.");
      });
    },

    updatePost: function (id, patch, file, kind) {
      if (!db) return Promise.reject(new Error("Not connected to the shared feed"));
      var post = posts.filter(function (p) { return p.id === id; })[0];
      if (!post || post.authorId !== uid) {
        return Promise.reject(new Error("You can only edit your own posts."));
      }
      var step = (file && assets)
        ? assets.upload(file).then(function (r) { return r && r.id; })
        : Promise.resolve(null);
      return step.then(function (assetId) {
        var body = Object.assign({}, patch);
        if (assetId) { body.assetId = assetId; body.kind = kind || post.kind; }
        return db.collection("posts").doc(id).update(body);
      }).then(function () {}, function (e) {
        throw new Error((e && e.message) || "Couldn't save those changes.");
      });
    },

    deletePost: function (id) {
      if (!db) return Promise.reject(new Error("not connected"));
      return db.collection("posts").doc(id).delete();
    },

    notice: function () {
      if (ready && !db) return "Preview mode — this copy of the page can't reach the shared feed, so posts, likes and follows won't be saved.";
      if (ready && canWrite === false) return "You're viewing in read-only mode. Ask the owner for interact access to post, like and follow.";
      return "";
    }
  };
})();
