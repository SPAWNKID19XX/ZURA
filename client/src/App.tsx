import './App.css'
import { Route, Routes } from 'react-router-dom' 
import { NavBar } from "./components/nav-bar/nav-bar"
import { Footer } from "./components/footer/footer"
import { LoginPage } from './pages/login-page/LoginPage'
import { SignupPage } from './pages/signup-page/SignupPage'
import { MyAccountPage } from './pages/my-account-page/MyAccountPage'
import {ProtectedRoute} from './api/privateRouts'

function App() {
  return (  
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<div>Главная страница Zura</div>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/my_account" element={<MyAccountPage />} />
        </Route>
      </Routes>
      <Footer />
    </>
  )
}

export default App
