import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
// GitHub Pages project site is served from /bookora/ — the Pages workflow sets DEPLOY_TARGET=github-pages.
// Local dev and Vercel use the root base '/'.
export default defineConfig({ base: process.env.DEPLOY_TARGET === 'github-pages' ? '/bookora/' : '/', plugins:[react()], resolve:{ alias:{ '@': path.resolve(import.meta.dirname,'./src') } } })
