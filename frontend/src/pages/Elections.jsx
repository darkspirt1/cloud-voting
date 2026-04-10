import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ACCENT = { active:'#7C3AED', draft:'#F59E0B', closed:'#EF4444' };

export default function Elections() {
  const navigate      = useNavigate();
  const { voter }     = useAuth();
  const [elections,   setElections]   = useState([]);
  const [myVotes,     setMyVotes]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const [elRes, vRes] = await Promise.all([
          api.get('/elections/'),
          api.get('/votes/my-votes'),
        ]);
        setElections(elRes.data);
        setMyVotes(vRes.data.map(v => v.election_id));
      } catch { toast.error('Failed to load elections'); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === 'all'
    ? elections
    : elections.filter(e => e.status === filter);

  if (loading) return (
    <div className="page-center">
      <div style={{ textAlign:'center' }}>
        <div className="spinner" style={{ margin:'0 auto 16px' }} />
        <p style={{ color:'#9CA3AF' }}>Loading elections...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="orb-bg">
        <div className="orb orb-1" style={{ opacity:.4 }} />
        <div className="orb orb-2" style={{ opacity:.35 }} />
      </div>
      <div className="page">

        {/* Header */}
        <div className="fade-up" style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'2.8rem', fontWeight:800, marginBottom:6 }}>
            Elections
          </h1>
          <p style={{ color:'#9CA3AF' }}>{elections.length} election{elections.length !== 1 ? 's' : ''} available</p>
        </div>

        {/* Filter tabs */}
        <div className="fade-up-1" style={{ display:'flex', gap:8, marginBottom:32, flexWrap:'wrap' }}>
          {['all','active','draft','closed'].map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding:'8px 22px', borderRadius:20, border:'none', cursor:'pointer',
              fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:'0.85rem',
              textTransform:'capitalize', transition:'all 0.2s',
              background: filter === t
                ? 'linear-gradient(135deg,#7C3AED,#EC4899)'
                : 'rgba(45,27,105,0.5)',
              color: filter === t ? '#fff' : '#9CA3AF',
            }}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="card" style={{ padding:48, textAlign:'center', color:'#9CA3AF' }}>
            No elections found.
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))', gap:24 }}>
            {filtered.map((el, i) => {
              const hasVoted = myVotes.includes(el.id);
              const color    = ACCENT[el.status] || '#7C3AED';
              return (
                <div key={el.id} className={`card fade-up-${Math.min(i+1,4)}`}
                  style={{ padding:'26px 22px', borderTop:`3px solid ${color}` }}>

                  <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'flex-start', marginBottom:14 }}>
                    <span className={`badge badge-${el.status}`}>
                      {el.status === 'active' && '● '}{el.status}
                    </span>
                    {hasVoted && (
                      <span style={{ background:'rgba(16,185,129,0.15)', color:'#10B981',
                        border:'1px solid rgba(16,185,129,0.3)', borderRadius:20,
                        padding:'4px 12px', fontSize:'0.72rem', fontWeight:700 }}>
                        ✓ Voted
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.15rem',
                    fontWeight:700, marginBottom:8, lineHeight:1.35 }}>
                    {el.title}
                  </h3>
                  <p style={{ color:'#9CA3AF', fontSize:'0.85rem', marginBottom:16, lineHeight:1.6 }}>
                    {el.description}
                  </p>

                  <div style={{ display:'flex', gap:18, padding:'12px 0',
                    borderTop:'1px solid #2D1B69', borderBottom:'1px solid #2D1B69', marginBottom:18 }}>
                    <span style={{ fontSize:'0.8rem', color:'#9CA3AF' }}>
                      👥 {el.candidates?.length} candidates
                    </span>
                    <span style={{ fontSize:'0.8rem', color:'#9CA3AF' }}>
                      📅 {new Date(el.ends_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {el.status === 'active' && !hasVoted && (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/ballot/${el.id}`)}>
                        Cast Vote →
                      </button>
                    )}
                    <button className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/results/${el.id}`)}>
                      View Results
                    </button>
                    {voter?.is_admin && el.status === 'draft' && (
                      <button className="btn btn-sm btn-success"
                        onClick={async () => {
                          try { await api.patch(`/elections/${el.id}/activate`);
                            toast.success('Election activated!'); window.location.reload();
                          } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); }
                        }}>
                        Activate
                      </button>
                    )}
                    {voter?.is_admin && el.status === 'active' && (
                      <button className="btn btn-danger btn-sm"
                        onClick={async () => {
                          try { await api.patch(`/elections/${el.id}/close`);
                            toast.success('Election closed!'); window.location.reload();
                          } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); }
                        }}>
                        Close
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}