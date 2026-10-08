import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

// Keep the existing reference entry and add an isolated experimental Lab page.
export default defineConfig({
  base:'/meridian/',
  build:{
    rollupOptions:{
      input:{
        main:fileURLToPath(new URL('./index.html',import.meta.url)),
        livingControls:fileURLToPath(new URL('./lab/living-controls/index.html',import.meta.url))
      }
    }
  }
});
