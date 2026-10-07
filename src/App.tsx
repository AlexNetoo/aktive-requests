import { useState } from "react";
import { initialActive, initialAgency, initialRequests, type AgencyRow, type Request } from "./data";
import { Settings, defaultPrefs, type Prefs } from "./Settings";
import { Clients, seedClients, type Client } from "./Clients";
import { Modal } from "./Modal";
import { A, Icon } from "./ui";
import { AgencyRequests } from "./Agency";
import { Subscriptions, seedOffers, type Offer } from "./Subscriptions";
import { ClientSubscription } from "./ClientSubscription";

const TABS = {
  Client: ["Requests", "Subscription", "Settings"],
  Agency: ["Requests", "Clients", "Subscriptions", "Settings"],
} as const;
type Role = keyof typeof TABS;

function Nav({ tab, setTab, role, setRole }: { tab: string; setTab: (t: string) => void; role: Role; setRole: (r: Role) => void }) {
  return (
    <header className="nav">
      <div className="logo">
        <span className="logo-mark">
          <Icon n="logo-arrow.svg" w={28} h={21} />
        </span>
        <span className="logo-text">Aktive</span>
      </div>
      <nav className="nav-links">
        {TABS[role].map((t) => (
          <button key={t} className={"nav-link" + (tab === t ? " is-active" : "")} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      <div className="nav-right">
        <div className="role-switch" role="group" aria-label="View as">
          {(["Client", "Agency"] as Role[]).map((r) => (
            <button key={r} className={role === r ? "on" : ""} onClick={() => setRole(r)}>
              {r}
            </button>
          ))}
        </div>
        <button className="bell" aria-label="Notifications">
          <Icon n="bell.svg" w={12} />
        </button>
        <img className="avatar-lg" src={A("avatar-user.jpg")} alt="You" />
      </div>
    </header>
  );
}

function Counts({ r, dark }: { r: Request; dark?: boolean }) {
  return (
    <>
      <span className={dark ? "chip chip-dark" : "chip"}>
        <Icon n={dark ? "paperclip-dark.svg" : "paperclip.svg"} w={12} />
        {r.attachments.length}
      </span>
      <span className={dark ? "chip chip-dark" : "chip"}>
        <Icon n={dark ? "chat-dark.svg" : "chat.svg"} w={10} />
        {r.comments.length}
      </span>
    </>
  );
}

function RequestRow({ r, grid, onOpen, onActivate }: { r: Request; grid: boolean; onOpen: () => void; onActivate: () => void }) {
  return (
    <div className={"row" + (grid ? " row-grid" : "")} onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <button
        className="make-active"
        title="Make active"
        aria-label="Make active"
        onClick={(e) => {
          e.stopPropagation();
          onActivate();
        }}
      >
        <Icon n="make-active.svg" w={34} />
      </button>
      <div className="row-title">
        <div className="row-name">{r.title}</div>
        <div className="row-date">{r.updated}</div>
      </div>
      <div className="row-meta">
        <Counts r={r} />
      </div>
      <span className="status">{r.status}</span>
      <Icon n="menu-dots.svg" w={12} h={3.25} className="row-menu" />
    </div>
  );
}

function ActivePanel({ r, onOpen, onApprove }: { r: Request | null; onOpen: () => void; onApprove: () => void }) {
  return (
    <aside className="active-panel">
      <div className="active-head">
        <span className="active-icon">
          <Icon n="flash.svg" w={16.4} h={18} />
        </span>
        <span className="active-title">Active</span>
        <span className="upgrade">
          Upgrade <i className="dot" /> Upgrade
        </span>
        <span className="limit">{r ? 1 : 0} / 1</span>
      </div>
      {r ? (
        <div className="active-card-wrap">
          <img className="crosshair" src={A("grid.svg")} alt="" draggable={false} />
          <div className="active-card" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
            <span className="progress-chip">
              <Icon n="cursor-select.svg" w={12} /> In progress
            </span>
            <button
              className="round-btn approve-round"
              aria-label="Approve"
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
            >
              <Icon n="check.svg" w={10} />
            </button>
            <div className="active-card-title">
              {r.title.replace("Concept ", "Concept\n").split("\n").map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
            <div className="active-card-foot">
              <span className="round-btn avatar-ring">
                <img src={A("face-justin.png")} width={28} height={28} alt="" />
              </span>
              <span className="spacer" />
              <Counts r={r} dark />
            </div>
            <div className="last-activity">
              <Icon n="clock.svg" w={10} /> Last activity: {r.updated}
            </div>
          </div>
        </div>
      ) : (
        <p className="active-empty">No active request. Use the bolt on a request to make it active.</p>
      )}
      <span className="round-btn help" aria-hidden>
        <Icon n="question.svg" w={20} />
      </span>
    </aside>
  );
}

export default function App() {
  const [role, setRoleState] = useState<Role>("Client");
  const [tab, setTab] = useState("Requests");
  const setRole = (r: Role) => {
    setRoleState(r);
    setTab("Requests");
    setOpenId(null);
  };
  const [grid, setGrid] = useState(false);
  const [active, setActive] = useState<Request | null>(initialActive);
  const [list, setList] = useState<Request[]>(initialRequests);
  const [openId, setOpenId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>(seedOffers);
  const [rows, setRows] = useState<AgencyRow[]>(initialAgency);
  const [clients, setClients] = useState<Client[]>(() => seedClients(initialAgency));
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [planId, setPlanId] = useState<string | null>("p1");
  const [addons, setAddons] = useState<string[]>([]);

  const open = openId ? (active?.id === openId ? active : list.find((r) => r.id === openId)) ?? null : null;

  const update = (r: Request) => {
    if (active?.id === r.id) setActive(r);
    else setList((l) => l.map((x) => (x.id === r.id ? r : x)));
  };
  const remove = (id: string) => {
    if (active?.id === id) setActive(null);
    setList((l) => l.filter((x) => x.id !== id));
    setOpenId(null);
  };
  const makeActive = (r: Request) => {
    setList((l) => {
      const rest = l.filter((x) => x.id !== r.id);
      return active ? [{ ...active, status: "Not started" }, ...rest] : rest;
    });
    setActive({ ...r, status: "In progress" });
  };

  const total = list.length + (active ? 1 : 0);
  void total;

  return (
    <div className="page">
      <Nav tab={tab} setTab={setTab} role={role} setRole={setRole} />
      <main className="stage">
        {role === "Agency" && tab === "Requests" ? (
          <AgencyRequests rows={rows} setRows={setRows} />
        ) : role === "Agency" && tab === "Clients" ? (
          <Clients clients={clients} setClients={setClients} rows={rows} setRows={setRows} offers={offers} />
        ) : tab === "Settings" ? (
          <Settings agency={role === "Agency"} prefs={prefs} setPrefs={setPrefs} />
        ) : role === "Agency" && tab === "Subscriptions" ? (
          <Subscriptions offers={offers} setOffers={setOffers} />
        ) : role === "Client" && tab === "Subscription" ? (
          <ClientSubscription
            offers={offers.filter((o) => !o.draft)}
            planId={planId}
            setPlanId={setPlanId}
            addons={addons}
            setAddons={setAddons}
            used={active ? 1 : 0}
          />
        ) : tab !== "Requests" ? (
          <div className="placeholder">{tab} is not part of this design.</div>
        ) : (
          <div className="stage-inner">
            <section className="requests">
              <div className="req-top">
                <h1>
                  My requests <span className="count">{list.length}</span>
                </h1>
                <div className="layout-toggle">
                  <button className={"sq" + (grid ? " on" : "")} aria-label="Grid" onClick={() => setGrid(true)}>
                    <span className="g" />
                  </button>
                  <button className={"sq" + (!grid ? " on" : "")} aria-label="List" onClick={() => setGrid(false)}>
                    <Icon n="list-icon.svg" w={13} />
                  </button>
                </div>
              </div>
              <div className={grid ? "rows is-grid" : "rows"}>
                {list.map((r) => (
                  <RequestRow key={r.id} r={r} grid={grid} onOpen={() => setOpenId(r.id)} onActivate={() => makeActive(r)} />
                ))}
                {list.length === 0 && <p className="dim">No requests.</p>}
              </div>
            </section>
            <ActivePanel
              r={active}
              onOpen={() => active && setOpenId(active.id)}
              onApprove={() => setActive(null)}
            />
          </div>
        )}
      </main>
      {open && role === "Client" && (
        <Modal
          r={open}
          onClose={() => setOpenId(null)}
          onChange={update}
          onDelete={() => remove(open.id)}
          onApprove={() => {
            if (active?.id === open.id) setActive(null);
            else setList((l) => l.filter((x) => x.id !== open.id));
            setOpenId(null);
          }}
        />
      )}
    </div>
  );
}
