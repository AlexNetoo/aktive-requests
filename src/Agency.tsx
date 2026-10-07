import { useMemo, useState } from "react";
import { initialAgency, STATUSES, STATUS_COLOR, type AgencyRow, type Request, type Status } from "./data";
import { Modal } from "./Modal";
import { Icon } from "./ui";

type Sort = "Status" | "Client" | "Last activity";

function StatusPill({ status, onChange }: { status: Status; onChange: (s: Status) => void }) {
  const [open, setOpen] = useState(false);
  const c = STATUS_COLOR[status];
  return (
    <span className="pill-wrap" onClick={(e) => e.stopPropagation()}>
      <button className="status-pill" style={{ background: c.bg, color: c.fg }} onClick={() => setOpen((o) => !o)} aria-haspopup="listbox">
        {status}
        <Icon n="chevron-status.svg" w={8} h={9} className={"chev" + (c.fg === "#000" ? " dark" : "")} />
      </button>
      {open && (
        <>
          <div className="scrim" onClick={() => setOpen(false)} />
          <div className="menu" role="listbox">
            {STATUSES.map((s) => (
              <button
                key={s}
                role="option"
                aria-selected={s === status}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
              >
                <i style={{ background: STATUS_COLOR[s].bg }} /> {s}
              </button>
            ))}
          </div>
        </>
      )}
    </span>
  );
}

export function AgencyRequests() {
  const [rows, setRows] = useState<AgencyRow[]>(initialAgency);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("Status");
  const [sortOpen, setSortOpen] = useState(false);
  const [grid, setGrid] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
    rows.forEach((r) => r.request && c[r.request.status]++);
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const f = rows.filter((r) => r.client.toLowerCase().includes(q.trim().toLowerCase()));
    const key = (r: AgencyRow) => (r.request ? STATUSES.indexOf(r.request.status) : 99);
    return [...f].sort((a, b) =>
      sort === "Client" ? a.client.localeCompare(b.client) : sort === "Status" ? key(a) - key(b) : b.activity.localeCompare(a.activity),
    );
  }, [rows, q, sort]);

  const openRow = rows.find((r) => r.id === openId);
  const setReq = (id: string, f: (r: Request) => Request) =>
    setRows((rs) => rs.map((r) => (r.id === id && r.request ? { ...r, request: f(r.request) } : r)));

  return (
    <div className="agency">
      <div className="summary">
        {STATUSES.map((s) => (
          <div className="sum-item" key={s}>
            <div className="sum-top">
              <span className="dot-ring" style={{ ["--c" as string]: STATUS_COLOR[s].bg }} />
              <span className="sum-n">{counts[s]}</span>
            </div>
            <div className="sum-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="a-top">
        <h1>
          Active requests <span className="count">{rows.filter((r) => r.request).length}</span>
        </h1>
        <label className="search">
          <Icon n="search.svg" w={10} />
          <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <span className="spacer" />
        <button className={"sq" + (grid ? " on" : "")} aria-label="Grid" onClick={() => setGrid(true)}>
          <span className="g grey" />
        </button>
        <button className={"sq" + (!grid ? " on" : "")} aria-label="List" onClick={() => setGrid(false)}>
          <Icon n="list-icon-grey.svg" w={13} h={8} />
        </button>
        <span className="pill-wrap">
          <button className="sort" onClick={() => setSortOpen((o) => !o)}>
            Sort by: {sort} <Icon n="chevron-dark.svg" w={8} h={9} className="chev grey" />
          </button>
          {sortOpen && (
            <>
              <div className="scrim" onClick={() => setSortOpen(false)} />
              <div className="menu right">
                {(["Status", "Client", "Last activity"] as Sort[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSort(s);
                      setSortOpen(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </span>
      </div>

      {!grid && (
        <div className="a-head">
          <span>Client</span>
          <span>Active Request</span>
          <span>Assigned</span>
          <span>Last activity</span>
          <span className="r">Status</span>
        </div>
      )}
      <div className={grid ? "a-rows is-grid" : "a-rows"}>
        {visible.map((r) => (
          <div className={"a-row" + (grid ? " card" : "")} key={r.id}>
            <span className="a-client">{r.client}</span>
            {r.request ? (
              <>
                <button className="req-chip" onClick={() => setOpenId(r.id)}>
                  {r.request.title.length > 18 ? r.request.title.slice(0, 15) + "…" : r.request.title}
                  <Icon n="ext-link.svg" w={10} className="ext" />
                </button>
                <span className="a-avatar">
                  {r.request.assignees[0] ? <img src={r.request.assignees[0].avatar} width={28} height={28} alt={r.request.assignees[0].name} /> : null}
                </span>
                <span className="a-when">{r.activity}</span>
                <span className="a-counts">
                  <span className="chip"><Icon n="paperclip.svg" w={12} />{r.request.attachments.length}</span>
                  <span className="chip"><Icon n="chat.svg" w={10} />{r.request.comments.length}</span>
                </span>
                <StatusPill status={r.request.status} onChange={(s) => setReq(r.id, (x) => ({ ...x, status: s }))} />
              </>
            ) : (
              <span className="none">No active request</span>
            )}
          </div>
        ))}
        {visible.length === 0 && <p className="dim empty-note">No clients match “{q}”.</p>}
      </div>

      {openRow?.request && (
        <Modal
          agency
          r={openRow.request}
          onClose={() => setOpenId(null)}
          onChange={(r) => setReq(openRow.id, () => r)}
          onDelete={() => setOpenId(null)}
          onApprove={() => {
            setReq(openRow.id, (x) => ({ ...x, status: "Ready to deliver" }));
            setOpenId(null);
          }}
          onCopy={(name) =>
            setRows((rs) => {
              const i = rs.findIndex((x) => x.id === openRow.id);
              const copy: AgencyRow = {
                id: crypto.randomUUID(),
                client: openRow.client,
                activity: "Just now",
                request: { ...openRow.request!, id: crypto.randomUUID(), title: name },
              };
              return [...rs.slice(0, i + 1), copy, ...rs.slice(i + 1)];
            })
          }
        />
      )}
    </div>
  );
}
