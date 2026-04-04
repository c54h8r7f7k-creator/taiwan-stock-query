import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// React 18 進入點
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('找不到根元素 #root')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
