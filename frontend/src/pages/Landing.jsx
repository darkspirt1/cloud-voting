import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>
      <div className="orb-bg">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>
      <div style={{ position:'relative', zIndex:1, minHeight:'calc(100vh - 72px)',
        display:'flex', alignItems:'center', padding:'0 80px', gap:80, flexWrap:'wrap' }}>

        {/* ── Left hero ── */}
        <div style={{ flex:1, minWidth:320, maxWidth:620 }}>
          <div className="fade-up" style={{ display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)',
            borderRadius:20, padding:'6px 16px', marginBottom:28 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#10B981',
              display:'inline-block', animation:'pulse-live 2s infinite' }} />
            <span style={{ fontSize:'0.8rem', color:'#A855F7', fontWeight:600 }}>
              Live elections open now
            </span>
          </div>

          <h1 className="fade-up-1"
            style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(3rem,5vw,5.2rem)',
              fontWeight:800, lineHeight:1.05, marginBottom:0 }}>
            Vote Smart,
          </h1>
          <h1 className="fade-up-1"
            style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(3rem,5vw,5.2rem)',
              fontWeight:800, lineHeight:1.05, marginBottom:28,
              background:'linear-gradient(90deg,#A855F7 0%,#EC4899 50%,#06B6D4 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              backgroundSize:'200% auto', animation:'shimmer 3s linear infinite' }}>
            Vote Secure.
          </h1>

          <p className="fade-up-2" style={{ fontSize:'1.1rem', color:'#9CA3AF',
            lineHeight:1.75, marginBottom:40, maxWidth:500 }}>
            The future of democratic voting — fast, transparent,
            and tamper-proof. Built on AWS Cloud with end-to-end encryption.
          </p>

          <div className="fade-up-3" style={{ display:'flex', gap:14, marginBottom:44, flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-primary">Start Voting →</Link>
            <Link to="/login"    className="btn btn-outline">Sign In</Link>
          </div>

          <div className="fade-up-4" style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {[
              ['🔒','Encrypted','#7C3AED'],
              ['✅','One Vote','#06B6D4'],
              ['📊','Live Results','#10B981'],
              ['⚡','Realtime','#F59E0B'],
            ].map(([icon, label, color]) => (
              <div key={label} style={{ background:`${color}22`, border:`1px solid ${color}44`,
                borderRadius:20, padding:'8px 16px',
                display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:'0.85rem' }}>{icon}</span>
                <span style={{ fontSize:'0.8rem', color, fontWeight:600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right card ── */}
        <div className="fade-up-2" style={{ flex:'0 0 440px', minWidth:300 }}>
          <div className="card card-accent" style={{ padding:'28px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:'0.72rem', color:'#A855F7', fontWeight:600,
                textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Active Election
              </span>
              <span className="badge badge-live">● Live</span>
            </div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.1rem', fontWeight:700, marginBottom:4 }}>
              Student Council President 2025
            </h3>
            <p style={{ fontSize:'0.8rem', color:'#9CA3AF', marginBottom:18 }}>
              3 Candidates · Ends Dec 31
            </p>
            <div style={{ height:1, background:'#2D1B69', marginBottom:16 }} />

            {[
              { name:'Priya Patel',  pct:68, color:'#7C3AED' },
              { name:'Arjun Mehta', pct:21, color:'#06B6D4' },
              { name:'Sara Khan',   pct:11, color:'#EC4899' },
            ].map(({ name, pct, color }) => (
              <div key={name} style={{ background:'rgba(45,27,105,0.4)', borderRadius:12,
                padding:'12px 14px', marginBottom:8,
                display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:'50%',
                  background:`${color}33`, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'Syne,sans-serif', fontWeight:700, color, fontSize:'0.95rem' }}>
                  {name[0]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:5 }}>{name}</div>
                  <div className="progress-bg" style={{ height:7 }}>
                    <div className="progress-fill" style={{ width:`${pct}%`, background:`${color}CC` }} />
                  </div>
                </div>
                <div style={{ fontSize:'0.95rem', fontWeight:700, color, minWidth:36, textAlign:'right' }}>
                  {pct}%
                </div>
              </div>
            ))}

            <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop:18 }}>
              Cast Your Vote →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}