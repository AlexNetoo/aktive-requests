import { useEffect, useMemo, useState } from "react";
import { STATUS_COLOR, type AgencyRow } from "./data";
import type { Offer } from "./Subscriptions";
import { Icon } from "./ui";

export type Client = { id: string; name: string; email: string; planId: string | null };

export const seedClients = (rows: AgencyRow[]): Client[] => {
  const names = [...new Set(rows.map((r) => r.client))];
  return names.map((n, i) => ({ id: "c" + i, name: n, email: n.toLowerCase().replace(/\s+/g, "") + "@example.com", planId: i % 2 ? "p2" : "p1" }));
};

function AddClient({ plans, onClose, onSave }: { plans: Offer[]; onClose: () => void; onSave: (c: Omit<Client, "id">) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [tried, setTried] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const okEmail = /^\S+@\S+\.\S+$/.test(email);
  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className="modal short" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add a client">
        <div className="modal-scroll form">
          <div className="modal-top">
            <div>
              <h2>Add a client</h2>
              <p className="sub">They get access to the portal by email.</p>
            </div>
            <button className="round-btn close-btn" onClick={onClose} aria-label="Close">
              <Icon n="close.svg" w={10} />
            </button>
          </div>
          <label className="lbl">Name</label>
          <input className={"field" + (tried && !name.trim() ? " bad" : "")} placeholder="Acme Inc." value={name} onChange={(e) => setName(e.target.value)} />
          <label className="lbl" style={{ marginTop: 22 }}>Contact email</label>
          <input className={"field" + (tried && !okEmail ? " bad" : "")} placeholder="hello@acme.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {tried && (!name.trim() || !okEmail) && <p className="err">Enter a name and a valid email.</p>}
          <label className="lbl" style={{ marginTop: 22 }}>Plan</label>
          <div className="select-wrap">
            <select className="field" value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">No plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="updown"><Icon n="select-up.svg" w={4} /><Icon n="select-down.svg" w={4} /></span>
          </div>
        </div>
        <div className="modal-bottom">
          <button className="btn-lg" onClick={onClose}>Cancel</button>
          <button
            className="approve-btn"
            onClick={() => {
              setTried(true);
              if (name.trim() && okEmail) onSave({ name: name.trim(), email: email.trim(), planId: planId || null });
            }}
          >
            <span className="approve-key"><Icon n="approve-arrow.svg" w={18} h={15} /></span>
            <span className="approve-label">Add client</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function Clients({
  clients,
  setClients,
  rows,
  setRows,
  offers,
}: {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  rows: AgencyRow[];
  setRows: React.Dispatch<React.SetStateAction<AgencyRow[]>>;
  offers: Offer[];
}) {
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const plans = offers.filter((o) => o.kind === "plan" && !o.draft);
  const shown = useMemo(() => clients.filter((c) => (c.name + c.email).toLowerCase().includes(q.trim().toLowerCase())), [clients, q]);

  return (
    <div className="agency">
      <div className="a-top first">
        <h1>
          Clients <span className="count">{clients.length}</span>
        </h1>
        <label className="search">
          <Icon n="search.svg" w={10} />
          <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <span className="spacer" />
        <button className="btn-dark" onClick={() => setAdding(true)}>
          <Icon n="add.svg" w={10} /> Add client
        </button>
      </div>

      <div className="a-head c-head">
        <span>Client</span>
        <span>Contact</span>
        <span>Plan</span>
        <span>Active request</span>
        <span className="r" />
      </div>
      <div className="a-rows">
        {shown.map((c) => {
          const row = rows.find((r) => r.client === c.name && r.request);
          return (
            <div className="a-row c-row" key={c.id}>
              <span className="a-client">{c.name}</span>
              <span className="a-when">{c.email}</span>
              <span className="plan-select">
                <select value={c.planId ?? ""} onChange={(e) => setClients((cs) => cs.map((x) => (x.id === c.id ? { ...x, planId: e.target.value || null } : x)))}>
                  <option value="">No plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </span>
              <span>
                {row?.request ? (
                  <span className="status-pill static" style={{ background: STATUS_COLOR[row.request.status].bg, color: STATUS_COLOR[row.request.status].fg }}>
                    {row.request.status}
                  </span>
                ) : (
                  <span className="none inline">None</span>
                )}
              </span>
              <button
                className="x"
                aria-label={"Remove " + c.name}
                onClick={() => {
                  if (!confirm(`Remove ${c.name}?`)) return;
                  setClients((cs) => cs.filter((x) => x.id !== c.id));
                  setRows((rs) => rs.filter((r) => r.client !== c.name));
                }}
              >
                <Icon n="close-sm.svg" w={8} />
              </button>
            </div>
          );
        })}
        {shown.length === 0 && <div className="empty-card">{q ? `No clients match “${q}”.` : "No clients yet."}</div>}
      </div>

      {adding && (
        <AddClient
          plans={plans}
          onClose={() => setAdding(false)}
          onSave={(c) => {
            setClients((cs) => [...cs, { ...c, id: crypto.randomUUID() }]);
            setRows((rs) => [...rs, { id: crypto.randomUUID(), client: c.name, request: null, activity: "" }]);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}
