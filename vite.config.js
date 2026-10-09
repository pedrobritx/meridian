import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

// Keep the existing reference entry and add an isolated experimental Lab page.
export default defineConfig({
  base:'/meridian/',
  build:{
    rollupOptions:{
      input:{
        main:fileURLToPath(new URL('./index.html',import.meta.url)),
        livingControls:fileURLToPath(new URL('./lab/living-controls/index.html',import.meta.url)),
        livingWorkspace:fileURLToPath(new URL('./lab/living-workspace/index.html',import.meta.url)),
        livingEnvironments:fileURLToPath(new URL('./lab/living-environments/index.html',import.meta.url)),
        forestReference:fileURLToPath(new URL('./lab/forest-reference/index.html',import.meta.url))
      }
    }
  }
});
