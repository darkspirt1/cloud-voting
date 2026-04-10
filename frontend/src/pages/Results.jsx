import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#7C3AED', '#06B6D4', '#EC4899', '#10B981', '#F59E0B'];

function CustomTooltip({ active, payload, label, isAdmin }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1A0F35', border: '1px solid #2D1B69',
      borderRadius: 12, padding: '12px 16px'
    }}>
      <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#A855F7', fontWeight: 600 }}>
        {isAdmin ? `${payload[0].value} votes` : `${payload[0].value}%`}
      </p>
    </div>
  );
}

export default function Results() {
  const { id } = useParams();
  const location = useLocation();
  const { voter } = useAuth();
  const receipt = location.state?.receipt;
  const isAdmin = voter?.is_admin;

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const res = await api.get(`/elections/${id}/results`);
      setResults(res.data);
    } catch { toast.error('Failed to load results'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchResults();
    const iv = setInterval(fetchResults, 10000);
    return () => clearInterval(iv);
  }, [id]);

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (!results) return <div className="page-center"><p>Results not found.</p></div>;

  // ⭐ KEY: admin sees vote counts, voter sees only percentages
  const chartData = results.candidates.map(c => ({
    name: c.name.split(' ')[0],
    value: isAdmin ? c.vote_count : c.percentage,
  }));

  return (
    <>
      <div className="orb-bg">
        <div className="orb orb-1" style={{ opacity: .35, background: 'rgba(6,182,212,0.2)' }} />
        <div className="orb orb-2" style={{ opacity: .3 }} />
      </div>
      <div className="page" style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Admin banner */}
        {isAdmin && (
          <div className="fade-up" style={{
            background: 'rgba(124,58,237,0.12)', borderLeft: '4px solid #7C3AED',
            border: '1px solid rgba(124,58,237,0.3)', borderRadius: '0 14px 14px 0',
            padding: '14px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <span className="badge badge-admin">👑 Admin View</span>
            <span style={{ color: '#A855F7', fontSize: '0.9rem', fontWeight: 600 }}>
              Exact vote counts visible — hidden from regular voters
            </span>
          </div>
        )}

        {/* Receipt */}
        {receipt && (
          <div className="fade-up" style={{
            background: 'rgba(16,185,129,0.1)', borderLeft: '4px solid #10B981',
            border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0 14px 14px 0',
            padding: '14px 20px', marginBottom: 24
          }}>
            <p style={{ color: '#10B981', fontWeight: 600, marginBottom: 4 }}>✓ Vote recorded successfully</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
              Receipt:{' '}
              <code style={{
                background: 'rgba(16,185,129,0.15)', padding: '2px 8px',
                borderRadius: 6, color: '#10B981'
              }}>{receipt}</code>
            </p>
          </div>
        )}

        {/* Main results card */}
        <div className="card card-accent fade-up-1" style={{ padding: '32px 28px' }}>

          {/* Title row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12
          }}>
            <div>
              <h2 style={{
                fontFamily: 'Syne,sans-serif', fontSize: '1.8rem',
                fontWeight: 800, marginBottom: 6
              }}>
                {results.title}
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                {results.status === 'active' ? 'Live Results · ' : 'Final Results · '}
                {isAdmin
                  ? <strong style={{ color: '#A855F7' }}>{results.total_votes} votes cast</strong>
                  : 'Percentages only'}
              </p>
            </div>
            <span className={`badge ${results.status === 'active' ? 'badge-live' : 'badge-closed'}`}>
              {results.status === 'active' ? '● Live' : 'Final'}
            </span>
          </div>

          {/* Winner banner */}
          {results.winner && (
            <div style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16,
              padding: '16px 20px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              <span style={{ fontSize: '2rem' }}>🏆</span>
              <div>
                <p style={{
                  fontFamily: 'Syne,sans-serif', fontWeight: 700,
                  color: '#F59E0B', fontSize: '1.1rem'
                }}>
                  Winner: {results.winner.name}
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: 2 }}>
                  {isAdmin
                    ? `${results.winner.vote_count} votes (${results.winner.percentage}%)`
                    : `${results.winner.percentage}% of votes`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Admin-only stats */}
          {isAdmin && results.total_votes > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: 14, marginBottom: 28
            }}>
              {[
                { label: 'Total Votes', value: results.total_votes, color: '#7C3AED' },
                { label: 'Candidates', value: results.candidates.length, color: '#06B6D4' },
                { label: 'Leading', value: results.candidates[0]?.name.split(' ')[0], color: '#F59E0B' },
              ].map(s => (
                <div key={s.label} style={{
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}30`, borderRadius: 14, padding: '16px 18px'
                }}>
                  <div style={{
                    fontSize: '1.7rem', fontFamily: 'Syne,sans-serif',
                    fontWeight: 800, color: s.color
                  }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Bar chart */}
          {results.total_votes > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{
                fontSize: '0.72rem', color: '#9CA3AF', marginBottom: 12,
                textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600
              }}>
                {isAdmin ? 'Vote Distribution' : 'Percentage Breakdown'}
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D1B69" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12, fontFamily: 'DM Sans' }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12, fontFamily: 'DM Sans' }} />
                  <Tooltip content={<CustomTooltip isAdmin={isAdmin} />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Candidate rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.candidates.map((c, i) => (
              <div key={c.id} style={{
                background: 'rgba(26,15,53,0.6)',
                border: `1px solid ${i === 0 && results.total_votes > 0 ? '#7C3AED44' : '#2D1B69'}`,
                borderRadius: 16, padding: '16px 20px'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: `${COLORS[i % COLORS.length]}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Syne,sans-serif', fontWeight: 700,
                      color: COLORS[i % COLORS.length], fontSize: '1.05rem'
                    }}>
                      {c.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</p>
                      {/* ⭐ ADMIN ONLY — exact vote count */}
                      {isAdmin && (
                        <p style={{
                          fontSize: '0.88rem', color: COLORS[i % COLORS.length],
                          fontFamily: 'Syne,sans-serif', fontWeight: 700, marginTop: 2
                        }}>
                          {c.vote_count} votes
                          <span style={{
                            color: '#9CA3AF', fontFamily: 'DM Sans,sans-serif',
                            fontWeight: 400, fontSize: '0.72rem', marginLeft: 8
                          }}>
                            admin only
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '1.6rem', fontFamily: 'Syne,sans-serif',
                    fontWeight: 800, color: COLORS[i % COLORS.length]
                  }}>
                    {c.percentage}%
                  </span>
                </div>
                <div className="progress-bg" style={{ height: 10 }}>
                  <div className="progress-fill" style={{
                    width: `${c.percentage}%`,
                    background: `linear-gradient(90deg,${COLORS[i % COLORS.length]},${COLORS[i % COLORS.length]}77)`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: '#6B7280' }}>
            {isAdmin
              ? '📊 Admin view — vote counts update every 10 seconds'
              : '🔒 Voter view — only percentages shown · updates every 10s'}
          </p>

          {/* Admin action buttons */}
          {isAdmin && (
            <div style={{
              display: 'flex', gap: 10, marginTop: 24,
              paddingTop: 20, borderTop: '1px solid #2D1B69', flexWrap: 'wrap'
            }}>
              {results.status === 'active' && (
                <button className="btn btn-danger btn-sm"
                  onClick={async () => {
                    try {
                      await api.patch(`/elections/${id}/close`);
                      toast.success('Election closed!'); fetchResults();
                    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
                  }}>
                  ⏹ Close Election
                </button>
              )}
              <button className="btn btn-cyan btn-sm">📥 Export CSV</button>
              <button className="btn btn-outline btn-sm">🔗 Share Results</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
