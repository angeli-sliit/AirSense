import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import RequireAuth from './components/RequireAuth'
import Header from './components/Header'
import './index.css'
import Workspace from './Workspace.jsx'
import Home from './Home.jsx'
import Signin from './pages/Signin.jsx'
import Signup from './pages/Signup.jsx'
import PrintComparisonReport from './pages/PrintComparisonReport.jsx'
import PrintForecastReport from './pages/PrintForecastReport.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/workspace" 
            element={
              <RequireAuth>
                <Workspace />
              </RequireAuth>
            } 
          />
          <Route 
            path="/print-comparison-report" 
            element={
              <RequireAuth>
                <PrintComparisonReport />
              </RequireAuth>
            } 
          />
          <Route 
            path="/print-forecast-report" 
            element={
              <RequireAuth>
                <PrintForecastReport />
              </RequireAuth>
            } 
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
