import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Icon from '../components/Icon';
import { CATEGORIES, catOf } from '../components/OppCard';
import { Empty, Skeletons, Stat } from '../components/ui';

export default function Reports() {
  const { user } = useAuth();
  const [r, setR] = useState(null);
  useEffect(() => { api.get('/reports/summary').then((x) => setR(x.data)); }, []);
  if (!r) return <><h1>Report summary</h1><Skeletons n={3} /></>;
  const by = Object.entries(r.hours_by_category || {}).sort((a, b) => b[1] - a[1]); const mx = Math.max(1, ...by.map(([, h]) => h));
  const download = () => { // export the report as a JSON file (data interchange)
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }));
    a.download = 'volunteer-report.json'; a.click();
  };
  return (
    <>
      <div className="page-head">
        <div><h1>Report summary</h1><p className="mut">{user.name} · generated {new Date(r.generated_at).toLocaleDateString('en-PH', { dateStyle: 'long' })}</p></div>
        <div className="row no-print">
          <button className="btn g" onClick={() => window.print()}><Icon name="printer" />Print</button>
          <button className="btn" onClick={download}><Icon name="download" />Download JSON</button>
        </div>
      </div>
      <div className="stats">
        <Stat n={r.total_hours} label="Total hours" icon="clock" />
        <Stat n={r.total_activities} label="Activities" icon="list" tone="a" />
        <Stat n={r.completed} label="Completed" icon="check" tone="b" />
      </div>
      <div className="card">
        <h2>Hours by category</h2>
        {by.map(([c, h]) => (
          <div key={c} className="hbar" style={{ '--h': catOf(c).h }}>
            <div className="row sp"><span className="row" style={{ gap: '.45rem' }}><Icon name={catOf(c).icon} />{c}</span><b>{h} hrs</b></div>
            <div className="meter"><i style={{ width: `${(h / mx) * 100}%` }} /></div>
          </div>
        ))}
        {!by.length && <Empty icon="chart" title="No hours recorded yet" text="Hours appear here once an organization confirms attendance." />}
      </div>
    </>
  );
}
