import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE = 'http://localhost:8000/api';

export default function Register() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState('register');
  const [loading, setLoading] = useState(false);
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [form,    setForm]    = useState({ full_name:'', email:'', password:'' });

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${BASE}/auth/register`, form);
      setEmail(form.email);
      toast.success('Account created! Check backend terminal for OTP.');
      setStep('verify');
    } catch(err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${BASE}/auth/verify-otp`, { email, otp });
      toast.success('Email verified! You can now log in.');
      navigate('/login');
    } catch(err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="orb-bg">
        <div className="orb orb-1" /><div className="orb orb-2" />
      </div>
      <div style={{ position:'relative', zIndex:1, display:'flex', minHeight:'calc(100vh - 72px)' }}>

        {/* ── Left brand panel ── */}
        <div style={{ flex:'0 0 480px', background:'linear-gradient(160deg,#1A0535,#0D0321)',
          padding:'60px 50px', display:'flex', flexDirection:'column',
          justifyContent:'center', borderRight:'1px solid #2D1B69' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.3rem',
            fontWeight:800, marginBottom:60,
            background:'linear-gradient(90deg,#A855F7,#EC4899)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            🗳 VoteCloud
          </div>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'3.2rem',
            fontWeight:800, lineHeight:1.1, marginBottom:12 }}>
            Your vote<br />matters.
          </h2>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'3.2rem',
            fontWeight:800, lineHeight:1.1, marginBottom:32,
            background:'linear-gradient(90deg,#A855F7,#EC4899)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Make it count.
          </h2>
          <p style={{ color:'#9CA3AF', fontSize:'1rem', lineHeight:1.7, marginBottom:40 }}>
            Join the most secure cloud-based voting platform. Fast, transparent, tamper-proof.
          </p>
          {['End-to-end encrypted','OTP identity verification',
            'Anonymous ballot system','Live results dashboard'].map(f => (
            <div key={f} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:4, height:28, borderRadius:2,
                background:'linear-gradient(180deg,#7C3AED,#EC4899)', flexShrink:0 }} />
              <span style={{ color:'#9CA3AF', fontSize:'0.9rem' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* ── Right form panel ── */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          padding:'40px 20px', background:'rgba(19,9,41,0.5)' }}>
          <div style={{ width:'100%', maxWidth:520 }}>
            <div className="card card-accent" style={{ padding:'40px 36px' }}>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.9rem',
                fontWeight:800, marginBottom:6 }}>
                {step === 'register' ? 'Create Account' : 'Verify Email'}
              </h2>
              <p style={{ color:'#9CA3AF', marginBottom:28, fontSize:'0.9rem' }}>
                {step === 'register'
                  ? 'Join the secure voting platform'
                  : `Enter the 6-digit OTP from your backend terminal`}
              </p>

              {step === 'register' ? (
                <form onSubmit={handleRegister}>
                  {[
                    ['Full Name','text','full_name','Rahul Sharma'],
                    ['Email','email','email','rahul@example.com'],
                    ['Password','password','password','Min 6 characters'],
                  ].map(([label, type, key, placeholder]) => (
                    <div className="input-wrap" key={key}>
                      <label className="input-label">{label}</label>
                      <input className="input" type={type} placeholder={placeholder} required
                        minLength={key === 'password' ? 6 : undefined}
                        value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })} />
                    </div>
                  ))}
                  <button className="btn btn-primary btn-full" type="submit" disabled={loading}
                    style={{ marginTop:8 }}>
                    {loading ? <><span className="spinner" style={{ width:18,height:18,borderWidth:2 }} /> Creating...</>
                             : 'Create Account →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerify}>
                  <div className="input-wrap">
                    <label className="input-label">OTP Code</label>
                    <input className="input" placeholder="6-digit code" maxLength={6} required
                      value={otp} onChange={e => setOtp(e.target.value)}
                      style={{ fontSize:'2rem', letterSpacing:'0.6rem',
                        textAlign:'center', fontFamily:'Syne,sans-serif', fontWeight:700 }} />
                    <div style={{ marginTop:10, background:'rgba(245,158,11,0.1)',
                      border:'1px solid rgba(245,158,11,0.3)', borderRadius:10,
                      padding:'10px 14px', fontSize:'0.82rem', color:'#F59E0B' }}>
                      💡 Check your backend terminal (VS Code) for the OTP code
                    </div>
                  </div>
                  <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Email →'}
                  </button>
                  <button type="button"
                    onClick={() => setStep('register')}
                    className="btn btn-outline btn-full" style={{ marginTop:10 }}>
                    ← Back
                  </button>
                </form>
              )}

              <p style={{ textAlign:'center', marginTop:24, fontSize:'0.875rem', color:'#9CA3AF' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color:'#A855F7', fontWeight:600, textDecoration:'none' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}