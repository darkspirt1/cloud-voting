import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Elections from './pages/Elections';
import Ballot from './pages/Ballot';
import Results from './pages/Results';
import CreateElection from './pages/CreateElection';

function Navbar() {
  const { voter, logout } = useAuth();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">🗳 VoteCloud</Link>
      <div className="navbar-links">
        {voter ? (
          <>
            {voter?.is_admin && (
              <Link to="/create-election" className="btn btn-sm"
                style={{
                  background: 'rgba(124,58,237,0.2)', color: '#A855F7',
                  border: '1px solid rgba(124,58,237,0.3)', padding: '8px 16px'
                }}>
                + New Election
              </Link>
            )}
            <Link to="/elections" className="btn btn-ghost">Elections</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="nav-avatar">{voter.full_name?.[0] || 'V'}</div>
              <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                {voter.full_name?.split(' ')[0]}
              </span>
            </div>
            <button onClick={logout} className="btn btn-ghost"
              style={{ color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '9px 22px' }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A0F35',
              color: '#fff',
              border: '1px solid #2D1B69',
              borderRadius: 12,
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/elections" element={<ProtectedRoute><Elections /></ProtectedRoute>} />
          <Route path="/ballot/:id" element={<ProtectedRoute><Ballot /></ProtectedRoute>} />
          <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/create-election" element={<ProtectedRoute><CreateElection /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}