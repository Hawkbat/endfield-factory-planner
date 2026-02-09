import { createRoot } from 'react-dom/client'
import { App } from './components/App.tsx'

const appRoot = document.createElement('div')
appRoot.id = 'app-root'
document.body.appendChild(appRoot)

const root = createRoot(appRoot)

root.render(<App />)
