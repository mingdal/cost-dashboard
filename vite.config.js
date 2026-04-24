import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ base를 본인의 GitHub 저장소 이름으로 변경하세요
// 예: 저장소 이름이 "cost-dashboard"이면 '/cost-dashboard/'
export default defineConfig({
  plugins: [react()],
  base: '/cost-dashboard/',
})
