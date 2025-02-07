// vite.config.ts
import { vitePlugin as remix } from "file:///F:/code/canny-ecosystem/node_modules/@remix-run/dev/dist/index.js";
import { defineConfig } from "file:///F:/code/canny-ecosystem/node_modules/vite/dist/node/index.js";
import { flatRoutes } from "file:///F:/code/canny-ecosystem/node_modules/remix-flat-routes/dist/index.js";
import tsconfigPaths from "file:///F:/code/canny-ecosystem/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      },
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: [
            ".*",
            "**/*.css",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__*.*",
            // This is for server-side utilities you want to colocate next to
            // your routes without making an additional directory.
            // If you need a route that includes "server" or "client" in the
            // filename, use the escape brackets like: my-route.[server].tsx
            "**/*.server.*",
            "**/*.client.*"
          ]
        });
      }
    }),
    tsconfigPaths()
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxjb2RlXFxcXGNhbm55LWVjb3N5c3RlbVxcXFxhcHBzXFxcXHBheXJvbGxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXGNvZGVcXFxcY2FubnktZWNvc3lzdGVtXFxcXGFwcHNcXFxccGF5cm9sbFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovY29kZS9jYW5ueS1lY29zeXN0ZW0vYXBwcy9wYXlyb2xsL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgdml0ZVBsdWdpbiBhcyByZW1peCB9IGZyb20gXCJAcmVtaXgtcnVuL2RldlwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgeyBmbGF0Um91dGVzIH0gZnJvbSBcInJlbWl4LWZsYXQtcm91dGVzXCI7XHJcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlbWl4KHtcclxuICAgICAgZnV0dXJlOiB7XHJcbiAgICAgICAgdjNfZmV0Y2hlclBlcnNpc3Q6IHRydWUsXHJcbiAgICAgICAgdjNfcmVsYXRpdmVTcGxhdFBhdGg6IHRydWUsXHJcbiAgICAgICAgdjNfdGhyb3dBYm9ydFJlYXNvbjogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgcm91dGVzOiBhc3luYyAoZGVmaW5lUm91dGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGZsYXRSb3V0ZXMoXCJyb3V0ZXNcIiwgZGVmaW5lUm91dGVzLCB7XHJcbiAgICAgICAgICBpZ25vcmVkUm91dGVGaWxlczogW1xyXG4gICAgICAgICAgICBcIi4qXCIsXHJcbiAgICAgICAgICAgIFwiKiovKi5jc3NcIixcclxuICAgICAgICAgICAgXCIqKi8qLnRlc3Que2pzLGpzeCx0cyx0c3h9XCIsXHJcbiAgICAgICAgICAgIFwiKiovX18qLipcIixcclxuICAgICAgICAgICAgLy8gVGhpcyBpcyBmb3Igc2VydmVyLXNpZGUgdXRpbGl0aWVzIHlvdSB3YW50IHRvIGNvbG9jYXRlIG5leHQgdG9cclxuICAgICAgICAgICAgLy8geW91ciByb3V0ZXMgd2l0aG91dCBtYWtpbmcgYW4gYWRkaXRpb25hbCBkaXJlY3RvcnkuXHJcbiAgICAgICAgICAgIC8vIElmIHlvdSBuZWVkIGEgcm91dGUgdGhhdCBpbmNsdWRlcyBcInNlcnZlclwiIG9yIFwiY2xpZW50XCIgaW4gdGhlXHJcbiAgICAgICAgICAgIC8vIGZpbGVuYW1lLCB1c2UgdGhlIGVzY2FwZSBicmFja2V0cyBsaWtlOiBteS1yb3V0ZS5bc2VydmVyXS50c3hcclxuICAgICAgICAgICAgXCIqKi8qLnNlcnZlci4qXCIsXHJcbiAgICAgICAgICAgIFwiKiovKi5jbGllbnQuKlwiLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgdHNjb25maWdQYXRocygpLFxyXG4gIF0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdTLFNBQVMsY0FBYyxhQUFhO0FBQzVVLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsa0JBQWtCO0FBQzNCLE9BQU8sbUJBQW1CO0FBRTFCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLFFBQVE7QUFBQSxRQUNOLG1CQUFtQjtBQUFBLFFBQ25CLHNCQUFzQjtBQUFBLFFBQ3RCLHFCQUFxQjtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxRQUFRLE9BQU8saUJBQWlCO0FBQzlCLGVBQU8sV0FBVyxVQUFVLGNBQWM7QUFBQSxVQUN4QyxtQkFBbUI7QUFBQSxZQUNqQjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFLQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsY0FBYztBQUFBLEVBQ2hCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
