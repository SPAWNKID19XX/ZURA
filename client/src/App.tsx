import './App.css'
import { Route, Routes } from 'react-router-dom' 
import { NavBar } from "./components/nav-bar/nav-bar"
import { Footer } from "./components/footer/footer"
import { LoginPage } from './pages/login-page/LoginPage'

function App() {
  return (  
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<div>Главная страница Zura</div>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
