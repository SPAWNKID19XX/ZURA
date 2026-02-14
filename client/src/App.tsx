import './App.css'
import { Route, Routes } from 'react-router-dom' 
import { NavBar } from "./components/nav-bar/nav-bar"
import { Footer } from "./components/footer/footer"
import { LoginPage } from './pages/login-page/LoginPage'
import { SignupPage } from './pages/signup-page/SignupPage'
function App() {
  return (  
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<div>Главная страница Zura</div>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
