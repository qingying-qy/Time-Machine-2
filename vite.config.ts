import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      plugins: [react()],
      build: {
        target: 'es2015', // 强制翻译成旧版代码，解决白屏
        cssTarget: 'chrome61' 
      },
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
      },
      resolve: {
        alias: { '@': path.resolve(__dirname, '.') }
      }
    };
});