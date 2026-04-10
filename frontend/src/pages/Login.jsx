import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email:'', password:'' });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', form.email);
      params.append('password', form.password);
      const res = await axios.post('http://localhost:8000/api/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      login(res.data.voter, res.data.access_token);
      toast.success(`Welcome back, ${res.data.voter.full_name}! 🎉`);
      navigate('/elections');
    } catch(err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="orb-bg">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>
      <div className="page-center">
        <div style={{ width:'100%', maxWidth:480 }}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.6rem', fontWeight:800,
              background:'linear-gradient(90deg,#A855F7,#EC4899)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              marginBottom:8 }}>
              🗳 VoteCloud
            </div>
            <p style={{ color:'#9CA3AF', fontSize:'0.9rem' }}>Sign in to cast your vote</p>
          </div>

          <div className="card card-accent fade-up" style={{ padding:'40px 36px' }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.8rem',
              fontWeight:800, marginBottom:6 }}>
              Welcome back
            </h2>
            <p style={{ color:'#9CA3AF', marginBottom:28, fontSize:'0.9rem' }}>
              Access your secure voting dashboard
            </p>

            <form onSubmit={handleSubmit}>
              <div className="input-wrap">
                <label className="input-label">Email</label>
                <input className="input" type="email" placeholder="rahul@example.com" required
                  value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} />
              </div>
              <div className="input-wrap">
                <label className="input-label">Password</label>
                <input className="input" type="password" placeholder="Your password" required
                  value={form.password} onChange={e => setForm({ ...form, password:e.target.value })} />
              </div>

              <button className="btn btn-primary btn-full" type="submit"
                disabled={loading} style={{ marginTop:8, padding:'15px' }}>
                {loading
                  ? <><span className="spinner" style={{ width:18,height:18,borderWidth:2 }} /> Signing in...</>
                  : 'Sign In →'}
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:24, fontSize:'0.875rem', color:'#9CA3AF' }}>
              New here?{' '}
              <Link to="/register" style={{ color:'#A855F7', fontWeight:600, textDecoration:'none' }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}