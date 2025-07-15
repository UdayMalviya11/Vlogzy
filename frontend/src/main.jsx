import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext'
import { PostsProvider } from './context/PostsContext'
import { AllPostsProvider } from './context/AllPostsContext'

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <PostsProvider>
      <AllPostsProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </AllPostsProvider>
    </PostsProvider>
  </UserProvider>,
)
