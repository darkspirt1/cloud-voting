import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const COLORS = ['#7C3AED','#06B6D4','#EC4899','#10B981','#F59E0B'];

export default function Ballot() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [election,   setElection]   = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/elections/${id}`)
      .then(r => setElection(r.data))
      .catch(() => toast.error('Election not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async () => {
    if (!selected) return toast.error('Please select a candidate');
    setSubmitting(true);
    try {
      const res = await api.post('/votes/cast', {
        election_id: id, candidate_id: selected,
      });
      toast.success('Vote cast successfully! 🎉');
      navigate(`/results/${id}`, { state: { receipt: res.data.receipt_token } });
    } catch(err) {
      toast.error(err.response?.data?.detail || 'Failed to cast vote');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="page-center"><div className="spinner" /></div>
  );
  if (!election) return (
    <div className="page-center"><p style={{ color:'#9CA3AF' }}>Election not found.</p></div>
  );

  const selectedCand = election.candidates?.find(c => c.id === selected);

  return (
    <>
      <div className="orb-bg">
        <div className="orb orb-1" style={{ opacity:.35, top:200 }} />
        <div className="orb orb-2" style={{ opacity:.3 }} />
      </div>
      <div className="page-center" style={{ alignItems:'flex-start', paddingTop:40 }}>
        <div style={{ width:'100%', maxWidth:600 }}>

          {/* Header */}
          <div className="fade-up" style={{ marginBottom:24 }}>
            <p style={{ fontSize:'0.72rem', color:'#A855F7', fontWeight:600,
              textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>
              🗳 Official Ballot
            </p>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'2rem',
              fontWeight:800, marginBottom:6 }}>
              {election.title}
            </h2>
            <p style={{ color:'#9CA3AF', fontSize:'0.9rem' }}>{election.description}</p>
          </div>

          <div className="card card-accent fade-up-1" style={{ padding:'28px 24px' }}>
            <p style={{ fontSize:'0.75rem', color:'#9CA3AF', fontWeight:600,
              textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:18 }}>
              Select one candidate:
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:22 }}>
              {election.candidates?.map((c, i) => {
                const color      = COLORS[i % COLORS.length];
                const isSelected = selected === c.id;
                return (
                  <div key={c.id} onClick={() => setSelected(c.id)}
                    style={{
                      padding:'16px 18px', borderRadius:16, cursor:'pointer',
                      background: isSelected ? `${color}18` : 'rgba(45,27,105,0.3)',
                      border:`2px solid ${isSelected ? color : '#2D1B69'}`,
                      display:'flex', alignItems:'center', gap:14, transition:'all 0.2s',
                      transform: isSelected ? 'scale(1.015)' : 'scale(1)',
                      boxShadow: isSelected ? `0 0 24px ${color}30` : 'none',
                    }}>
                    {/* Radio button */}
                    <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0,
                      border:`2px solid ${isSelected ? color : '#2D1B69'}`,
                      background: isSelected ? color : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all 0.2s' }}>
                      {isSelected && (
                        <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />
                      )}
                    </div>
                    {/* Avatar */}
                    <div style={{ width:50, height:50, borderRadius:'50%', flexShrink:0,
                      background:`linear-gradient(135deg,${color},${color}88)`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'1.2rem', color:'#fff' }}>
                      {c.name[0]}
                    </div>
                    {/* Name + role */}
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, fontSize:'0.98rem',
                        color: isSelected ? '#fff' : '#e5e7eb' }}>{c.name}</p>
                      {c.description && (
                        <p style={{ color:'#9CA3AF', fontSize:'0.82rem', marginTop:2 }}>
                          {c.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <span style={{ background:`${color}33`, color, borderRadius:20,
                        padding:'4px 12px', fontSize:'0.72rem', fontWeight:700, whiteSpace:'nowrap' }}>
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Confirmation */}
            {selected && (
              <div style={{ background:'rgba(124,58,237,0.1)',
                border:'1px solid rgba(124,58,237,0.3)', borderRadius:12,
                padding:'12px 16px', marginBottom:18,
                fontSize:'0.9rem', color:'#A855F7' }}>
                You selected: <strong>{selectedCand?.name}</strong>
              </div>
            )}

            {/* Submit */}
            <button className="btn btn-primary btn-full" onClick={handleVote}
              disabled={!selected || submitting}
              style={{ padding:'16px', fontSize:'1rem' }}>
              {submitting
                ? <><span className="spinner" style={{ width:18,height:18,borderWidth:2 }} /> Submitting...</>
                : '🗳 Submit Ballot'}
            </button>

            <p style={{ textAlign:'center', marginTop:14, fontSize:'0.78rem', color:'#6B7280' }}>
              Your vote is anonymous and cannot be changed after submission.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}