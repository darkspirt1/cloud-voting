// src/pages/CreateElection.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CreateElection() {
  const navigate   = useNavigate();
  const { voter }  = useAuth();
  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState({
    title:       '',
    description: '',
    starts_at:   '',
    ends_at:     '',
  });
  const [candidates, setCandidates] = useState([
    { name: '', description: '' },
    { name: '', description: '' },
  ]);

  // Redirect non-admins immediately
  if (!voter?.is_admin) {
    return (
      <div className="page-center">
        <div className="card card-accent" style={{ padding:'40px', textAlign:'center', maxWidth:420 }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>🚫</div>
          <h2 style={{ fontFamily:'Syne,sans-serif', marginBottom:8 }}>Access Denied</h2>
          <p style={{ color:'#9CA3AF', marginBottom:24 }}>
            Only administrators can create elections.
          </p>
          <button className="btn btn-outline btn-full" onClick={() => navigate('/elections')}>
            ← Back to Elections
          </button>
        </div>
      </div>
    );
  }

  const addCandidate = () => {
    if (candidates.length >= 8) return toast.error('Maximum 8 candidates allowed');
    setCandidates([...candidates, { name: '', description: '' }]);
  };

  const removeCandidate = (index) => {
    if (candidates.length <= 2) return toast.error('Minimum 2 candidates required');
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const updateCandidate = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!form.title.trim()) return toast.error('Election title is required');
    if (!form.starts_at)    return toast.error('Start date is required');
    if (!form.ends_at)      return toast.error('End date is required');
    if (new Date(form.ends_at) <= new Date(form.starts_at))
      return toast.error('End date must be after start date');

    const filledCandidates = candidates.filter(c => c.name.trim());
    if (filledCandidates.length < 2)
      return toast.error('At least 2 candidates with names are required');

    setLoading(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        starts_at:   new Date(form.starts_at).toISOString(),
        ends_at:     new Date(form.ends_at).toISOString(),
        candidates:  filledCandidates.map(c => ({
          name:        c.name.trim(),
          description: c.description.trim() || null,
        })),
      };
      const res = await api.post('/elections/', payload);
      toast.success('Election created successfully! 🎉');
      navigate(`/elections`);
    } catch(err) {
      toast.error(err.response?.data?.detail || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="orb-bg">
        <div className="orb orb-1" style={{ opacity:.4 }} />
        <div className="orb orb-2" style={{ opacity:.35 }} />
      </div>

      <div className="page" style={{ maxWidth:760, margin:'0 auto' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom:32 }}>
          <button onClick={() => navigate('/elections')}
            style={{ background:'none', border:'none', color:'#9CA3AF',
              cursor:'pointer', fontSize:'0.9rem', marginBottom:16,
              display:'flex', alignItems:'center', gap:6, padding:0 }}>
            ← Back to Elections
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
            <span className="badge badge-admin">👑 Admin</span>
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'2.4rem', fontWeight:800 }}>
            Create Election
          </h1>
          <p style={{ color:'#9CA3AF', marginTop:6 }}>
            Set up a new election with candidates
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Election Details Card ── */}
          <div className="card card-accent fade-up-1" style={{ padding:'28px 24px', marginBottom:20 }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.1rem',
              fontWeight:700, marginBottom:20, color:'#A855F7' }}>
              📋 Election Details
            </h3>

            <div className="input-wrap">
              <label className="input-label">Election Title *</label>
              <input className="input" placeholder="e.g. Student Council President 2025"
                required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="input-wrap">
              <label className="input-label">Description</label>
              <textarea className="input" rows={3}
                placeholder="Brief description of this election..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ resize:'vertical', minHeight:80 }} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="input-wrap" style={{ marginBottom:0 }}>
                <label className="input-label">Start Date & Time *</label>
                <input className="input" type="datetime-local" required
                  value={form.starts_at}
                  min={new Date().toISOString().slice(0,16)}
                  onChange={e => setForm({ ...form, starts_at: e.target.value })}
                  style={{ colorScheme:'dark' }} />
              </div>
              <div className="input-wrap" style={{ marginBottom:0 }}>
                <label className="input-label">End Date & Time *</label>
                <input className="input" type="datetime-local" required
                  value={form.ends_at}
                  min={form.starts_at || new Date().toISOString().slice(0,16)}
                  onChange={e => setForm({ ...form, ends_at: e.target.value })}
                  style={{ colorScheme:'dark' }} />
              </div>
            </div>
          </div>

          {/* ── Candidates Card ── */}
          <div className="card fade-up-2"
            style={{ padding:'28px 24px', marginBottom:24, borderTop:'3px solid #06B6D4' }}>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.1rem',
                fontWeight:700, color:'#06B6D4' }}>
                👥 Candidates
                <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:'0.8rem',
                  color:'#9CA3AF', fontWeight:400, marginLeft:10 }}>
                  ({candidates.length}/8) · min 2 required
                </span>
              </h3>
              <button type="button" onClick={addCandidate}
                className="btn btn-sm"
                style={{ background:'rgba(6,182,212,0.15)', color:'#06B6D4',
                  border:'1px solid rgba(6,182,212,0.3)' }}>
                + Add Candidate
              </button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {candidates.map((c, i) => (
                <div key={i} style={{ background:'rgba(45,27,105,0.3)',
                  border:'1px solid #2D1B69', borderRadius:16, padding:'18px 16px',
                  position:'relative' }}>

                  {/* Candidate number badge */}
                  <div style={{ position:'absolute', top:-12, left:16,
                    background:'linear-gradient(135deg,#7C3AED,#EC4899)',
                    borderRadius:20, padding:'2px 12px',
                    fontSize:'0.72rem', fontWeight:700, color:'#fff' }}>
                    Candidate {i + 1}
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:6 }}>
                    <div>
                      <label className="input-label">Full Name *</label>
                      <input className="input"
                        placeholder={`e.g. Priya Patel`}
                        value={c.name}
                        onChange={e => updateCandidate(i, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">Description / Role</label>
                      <input className="input"
                        placeholder="e.g. 3rd year · Computer Science"
                        value={c.description}
                        onChange={e => updateCandidate(i, 'description', e.target.value)} />
                    </div>
                  </div>

                  {/* Remove button */}
                  {candidates.length > 2 && (
                    <button type="button" onClick={() => removeCandidate(i)}
                      style={{ position:'absolute', top:10, right:12,
                        background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                        color:'#EF4444', borderRadius:8, padding:'4px 10px',
                        fontSize:'0.75rem', cursor:'pointer', fontWeight:600 }}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Preview of candidate avatars */}
            {candidates.some(c => c.name.trim()) && (
              <div style={{ marginTop:20, padding:'14px 16px',
                background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.2)',
                borderRadius:12 }}>
                <p style={{ fontSize:'0.75rem', color:'#9CA3AF', marginBottom:10,
                  textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>
                  Preview
                </p>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {candidates.filter(c => c.name.trim()).map((c, i) => {
                    const colors = ['#7C3AED','#06B6D4','#EC4899','#10B981','#F59E0B'];
                    const color  = colors[i % colors.length];
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8,
                        background:`${color}18`, border:`1px solid ${color}33`,
                        borderRadius:20, padding:'6px 14px' }}>
                        <div style={{ width:28, height:28, borderRadius:'50%',
                          background:`${color}44`, display:'flex', alignItems:'center',
                          justifyContent:'center', fontFamily:'Syne,sans-serif',
                          fontWeight:700, fontSize:'0.85rem', color }}>
                          {c.name[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize:'0.85rem', fontWeight:600, color:'#e5e7eb' }}>
                          {c.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Summary before submit ── */}
          {form.title && candidates.filter(c => c.name.trim()).length >= 2 && (
            <div className="fade-up-3" style={{ background:'rgba(16,185,129,0.08)',
              border:'1px solid rgba(16,185,129,0.25)', borderRadius:16,
              padding:'16px 20px', marginBottom:20 }}>
              <p style={{ fontSize:'0.8rem', color:'#10B981', fontWeight:600, marginBottom:8 }}>
                ✓ Ready to create
              </p>
              <p style={{ fontSize:'0.85rem', color:'#9CA3AF' }}>
                <strong style={{ color:'#e5e7eb' }}>{form.title}</strong> ·{' '}
                {candidates.filter(c => c.name.trim()).length} candidates ·{' '}
                {form.ends_at
                  ? `Ends ${new Date(form.ends_at).toLocaleDateString()}`
                  : 'End date not set'}
              </p>
            </div>
          )}

          {/* Submit */}
          <button className="btn btn-primary btn-full fade-up-4"
            type="submit" disabled={loading}
            style={{ padding:'16px', fontSize:'1rem' }}>
            {loading
              ? <><span className="spinner" style={{ width:18,height:18,borderWidth:2 }} /> Creating Election...</>
              : '🗳 Create Election'}
          </button>

          <p style={{ textAlign:'center', marginTop:12, fontSize:'0.78rem', color:'#6B7280' }}>
            The election will be in <strong style={{ color:'#F59E0B' }}>draft</strong> status after creation.
            Activate it from the Elections page when ready.
          </p>

        </form>
      </div>
    </>
  );
}