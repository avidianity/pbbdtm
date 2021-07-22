<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Document Tracking and Monitoring System" />
    <link rel="icon" type="image/png" sizes="196x196" href="/assets/favicon-196.png" />
    <link rel="apple-touch-icon" href="/assets/apple-icon-180.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <link rel="manifest" href="/manifest.json" />
    <title>PUPBBDMS</title>
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700,200" rel="stylesheet" />
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css" rel="stylesheet" />
    <link href="/assets/css/bootstrap.min.css" rel="stylesheet" />
    <link href="/assets/css/paper-dashboard.css?v=2.0.1" rel="stylesheet" id="dashboard-styles" />
    <link href="/assets/demo/demo.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css" />
    <script src="/assets/js/core/jquery.min.js"></script>
    <script src="/assets/js/core/popper.min.js"></script>
    <script src="/assets/js/core/bootstrap.min.js"></script>
    <script src="/assets/js/plugins/perfect-scrollbar.jquery.min.js"></script>
    <script src="/assets/js/plugins/chartjs.min.js"></script>
    <script src="/assets/js/plugins/bootstrap-notify.js"></script>
    <script src="/assets/js/paper-dashboard.min.js?v=2.0.1" type="text/javascript"></script>
    <link href="/static/css/2.2a74e5a1.chunk.css" rel="stylesheet">
    <link href="/static/css/main.4d9348d6.chunk.css" rel="stylesheet">
</head>

<body style="background-color:#f4f3ef"><noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script>
        ! function(e) {
            function r(r) {
                for (var n, i, a = r[0], c = r[1], f = r[2], s = 0, p = []; s < a.length; s++) i = a[s], Object.prototype.hasOwnProperty.call(o, i) && o[i] && p.push(o[i][0]), o[i] = 0;
                for (n in c) Object.prototype.hasOwnProperty.call(c, n) && (e[n] = c[n]);
                for (l && l(r); p.length;) p.shift()();
                return u.push.apply(u, f || []), t()
            }

            function t() {
                for (var e, r = 0; r < u.length; r++) {
                    for (var t = u[r], n = !0, a = 1; a < t.length; a++) {
                        var c = t[a];
                        0 !== o[c] && (n = !1)
                    }
                    n && (u.splice(r--, 1), e = i(i.s = t[0]))
                }
                return e
            }
            var n = {},
                o = {
                    1: 0
                },
                u = [];

            function i(r) {
                if (n[r]) return n[r].exports;
                var t = n[r] = {
                    i: r,
                    l: !1,
                    exports: {}
                };
                return e[r].call(t.exports, t, t.exports, i), t.l = !0, t.exports
            }
            i.e = function(e) {
                var r = [],
                    t = o[e];
                if (0 !== t)
                    if (t) r.push(t[2]);
                    else {
                        var n = new Promise((function(r, n) {
                            t = o[e] = [r, n]
                        }));
                        r.push(t[2] = n);
                        var u, a = document.createElement("script");
                        a.charset = "utf-8", a.timeout = 120, i.nc && a.setAttribute("nonce", i.nc), a.src = function(e) {
                            return i.p + "static/js/" + ({} [e] || e) + "." + {
                                3: "7c9343f7"
                            } [e] + ".chunk.js"
                        }(e);
                        var c = new Error;
                        u = function(r) {
                            a.onerror = a.onload = null, clearTimeout(f);
                            var t = o[e];
                            if (0 !== t) {
                                if (t) {
                                    var n = r && ("load" === r.type ? "missing" : r.type),
                                        u = r && r.target && r.target.src;
                                    c.message = "Loading chunk " + e + " failed.\n(" + n + ": " + u + ")", c.name = "ChunkLoadError", c.type = n, c.request = u, t[1](c)
                                }
                                o[e] = void 0
                            }
                        };
                        var f = setTimeout((function() {
                            u({
                                type: "timeout",
                                target: a
                            })
                        }), 12e4);
                        a.onerror = a.onload = u, document.head.appendChild(a)
                    } return Promise.all(r)
            }, i.m = e, i.c = n, i.d = function(e, r, t) {
                i.o(e, r) || Object.defineProperty(e, r, {
                    enumerable: !0,
                    get: t
                })
            }, i.r = function(e) {
                "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                    value: "Module"
                }), Object.defineProperty(e, "__esModule", {
                    value: !0
                })
            }, i.t = function(e, r) {
                if (1 & r && (e = i(e)), 8 & r) return e;
                if (4 & r && "object" == typeof e && e && e.__esModule) return e;
                var t = Object.create(null);
                if (i.r(t), Object.defineProperty(t, "default", {
                        enumerable: !0,
                        value: e
                    }), 2 & r && "string" != typeof e)
                    for (var n in e) i.d(t, n, function(r) {
                        return e[r]
                    }.bind(null, n));
                return t
            }, i.n = function(e) {
                var r = e && e.__esModule ? function() {
                    return e.default
                } : function() {
                    return e
                };
                return i.d(r, "a", r), r
            }, i.o = function(e, r) {
                return Object.prototype.hasOwnProperty.call(e, r)
            }, i.p = "/", i.oe = function(e) {
                throw console.error(e), e
            };
            var a = this.webpackJsonpjeff = this.webpackJsonpjeff || [],
                c = a.push.bind(a);
            a.push = r, a = a.slice();
            for (var f = 0; f < a.length; f++) r(a[f]);
            var l = c;
            t()
        }([])
    </script>
    <script src="/static/js/2.855f14a4.chunk.js"></script>
    <script src="/static/js/main.e677c8e1.chunk.js"></script>
</body>

</html>