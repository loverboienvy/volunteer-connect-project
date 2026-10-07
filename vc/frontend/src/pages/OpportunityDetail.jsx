import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../Toast';
import Icon from '../components/Icon';
import { Meter, catOf, fmtLong } from '../components/OppCard';
import { Empty } from '../components/ui';

export default function OpportunityDetail() {
  const { id } = useParams(); const nav = useNavigate(); const loc = useLocation(); const { user } = useAuth(); const toast = useToast();
  const [o, setO] = useState(null); const [mine, setMine] = useState(null); const [missing, setMissing] = useState(false); const [busy, setBusy] = useState(false);

  const load = () => {
    api.get(`/opportunities/${id}`).then((r) => setO(r.data)).catch(() => setMissing(true));
    if (user?.role === 'volunteer')
      api.get('/me/signups').then((r) => setMine(r.data.data.find((s) => s.opportunity_id === +id) || null));
  };
  useEffect(load, [id, user]);

  const signUp = async () => {
    if (!user) return nav('/login', { state: { from: loc.pathname } });
    setBusy(true);
    try { await api.post(`/opportunities/${id}/signup`); toast("You're signed up. See you there!"); load(); }
    catch (e) { toast(errMsg(e), 'err'); }
    finally { setBusy(false); }
  };

  if (missing) return <Empty icon="search" title="Opportunity not found" text="It may have been removed or is still a draft." to="/opportunities" cta="Browse opportunities" />;
  if (!o) return <div className="skel" style={{ minHeight: 360 }} />;
  const c = catOf(o.category); const left = o.slots - o.signups_count;
  const reqs = (o.requirements || '').split('\n').map((r) => r.trim()).filter(Boolean);

  let action;
  if (user?.role === 'organization') action = <Link className="btn g full" to={`/edit/${o.id}`}><Icon name="edit" />Edit this opportunity</Link>;
  else if (mine) action = <button className="btn g full lg" disabled><Icon name="check" />{mine.status === 'completed' ? 'Completed' : "You're signed up"}</button>;
  else if (left <= 0) action = <button className="btn g full lg" disabled>This opportunity is full</button>;
  else action = <button className="btn full lg" onClick={signUp} disabled={busy}>{busy ? 'Signing up…' : user ? 'Sign up to volunteer' : 'Log in to sign up'}</button>;

  return (
    <>
      <Link className="back" to="/opportunities"><Icon name="back" />Back to opportunities</Link>
      <div className="detail">
        <div>
          <div className="d-head" style={{ '--h': c.h }}>
            <span className="badge pri"><Icon name={c.icon} />{o.category}</span>
            <h1>{o.title}</h1>
            <div className="mut row"><Icon name="building" />Organized by <b style={{ color: 'var(--ink)' }}>{o.organization?.name}</b></div>
          </div>
          <div className="card">
            <h2>About this opportunity</h2>
            <p className="prose">{o.description}</p>
            <h2 style={{ marginTop: 24 }}>Requirements</h2>
            {reqs.length ? <ul className="reqs">{reqs.map((r, i) => <li key={i}><Icon name="check" />{r}</li>)}</ul> : <p className="mut">No special requirements. Everyone is welcome.</p>}
          </div>
        </div>
        <aside className="card aside">
          {action}
          <ul className="facts">
            <li><span className="fi"><Icon name="calendar" /></span><div><small>Date</small><b>{fmtLong(o.date)}</b></div></li>
            <li><span className="fi"><Icon name="pin" /></span><div><small>Location</small><b>{o.location}</b></div></li>
            <li><span className="fi"><Icon name="clock" /></span><div><small>Estimated time</small><b>{o.hours} hour{o.hours > 1 ? 's' : ''}</b></div></li>
            <li><span className="fi"><Icon name="star" /></span><div><small>Skills needed</small><b>{o.skills || 'Anyone can join'}</b></div></li>
          </ul>
          <Meter filled={o.signups_count} slots={o.slots} />
        </aside>
      </div>
    </>
  );
}
