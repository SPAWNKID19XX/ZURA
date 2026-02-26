import './App.css'
import { Route, Routes } from 'react-router-dom'
import { NavBar } from "./components/nav-bar/nav-bar"
import { Footer } from "./components/footer/footer"
import { LoginPage } from './pages/login-page/LoginPage'
import { SignupPage } from './pages/signup-page/SignupPage'
import { MyAccountPage } from './pages/my-account-page/MyAccountPage'
import { TasksPage } from './pages/tasks-page/TasksPage'
import { CreateTaskPage } from './pages/tasks-page/CreateTaskPage'
import { ProjectsPage } from './pages/projects-page/ProjectsPage'
import { BoardsPage } from './pages/boards-page/BoardsPage'
import { TeamsPage } from './pages/teams-page/TeamsPage'
import { EmployeesPage } from './pages/employees-page/EmployeesPage'
import { NotificationsPage } from './pages/notifications-page/NotificationsPage'
import { ProtectedRoute } from './api/privateRouts'

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
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/create" element={<CreateTaskPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
      <Footer />
    </>
  )
}

export default App
