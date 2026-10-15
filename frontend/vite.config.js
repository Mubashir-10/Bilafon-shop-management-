import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // Electron ke local file paths ke liye
  plugins: [react()],
});