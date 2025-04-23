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
		client: {start:"_app/immutable/entry/start.DL7DO1um.js",app:"_app/immutable/entry/app.CEbGhWU2.js",imports:["_app/immutable/entry/start.DL7DO1um.js","_app/immutable/chunks/BvK8wjA0.js","_app/immutable/chunks/XrXDYhV9.js","_app/immutable/chunks/CVAQYCPX.js","_app/immutable/entry/app.CEbGhWU2.js","_app/immutable/chunks/XrXDYhV9.js","_app/immutable/chunks/DYMbm4s-.js","_app/immutable/chunks/JmO34ccS.js","_app/immutable/chunks/DA3f3Alq.js","_app/immutable/chunks/CVAQYCPX.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CLqAbLqC.js')),
			__memo(() => import('./chunks/1-_GGHeSOu.js'))
		],
		routes: [
			{
				id: "/api/chat",
				pattern: /^\/api\/chat\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-wT1r-yX6.js'))
			}
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set(["/"]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
