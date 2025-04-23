const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.BGPQNQJu.js",app:"_app/immutable/entry/app.CsNVfci1.js",imports:["_app/immutable/entry/start.BGPQNQJu.js","_app/immutable/chunks/4VSaLnKC.js","_app/immutable/chunks/Drkbx91g.js","_app/immutable/chunks/CzHGqfso.js","_app/immutable/entry/app.CsNVfci1.js","_app/immutable/chunks/Drkbx91g.js","_app/immutable/chunks/9HmzWm-j.js","_app/immutable/chunks/DL4Cwa5e.js","_app/immutable/chunks/CA3MNjiG.js","_app/immutable/chunks/CzHGqfso.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-Bdc92fxb.js')),
			__memo(() => import('./chunks/1-whCrAkn5.js')),
			__memo(() => import('./chunks/2-5tU83AIu.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/chat",
				pattern: /^\/api\/chat\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BZ5AD1MV.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
