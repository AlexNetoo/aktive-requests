import { useEffect, useRef, useState } from "react";
import { initialActive, initialRequests, type Request } from "./data";

const A = (n: string) => `/assets/${n}`;
const Icon = ({ n, w, h, className }: { n: string; w: number; h?: number; className?: string }) => (
  <img src={A(n)} width={w} height={h ?? w} alt="" className={className} draggable={false} />
);

function Nav({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  return (
    <header className="nav">
      <div className="logo">
        <span className="logo-mark">
          <Icon n="logo-arrow.svg" w={28} h={21} />
        </span>
        <span className="logo-text">Aktive</span>
      </div>
      <nav className="nav-links">
        {["Requests", "Subscription", "Settings"].map((t) => (
          <button key={t} className={"nav-link" + (tab === t ? " is-active" : "")} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      <div className="nav-right">
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

function Modal({
  r,
  onClose,
  onChange,
  onDelete,
  onApprove,
}: {
  r: Request;
  onClose: () => void;
  onChange: (r: Request) => void;
  onDelete: () => void;
  onApprove: () => void;
}) {
  const [comment, setComment] = useState("");
  const [drag, setDrag] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      when: "Just now",
      src: f.type.startsWith("image/") ? URL.createObjectURL(f) : A("thumb-dashboard.png"),
    }));
    onChange({ ...r, attachments: [...r.attachments, ...added] });
  };

  const submit = () => {
    const text = comment.trim();
    if (!text) return;
    onChange({
      ...r,
      comments: [...r.comments, { id: crypto.randomUUID(), author: "You", avatar: A("avatar-user.jpg"), when: "Just now", text }],
    });
    setComment("");
  };

  const filled = r.description.trim() || r.attachments.length > 0;

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={r.title}>
        <div className="modal-scroll">
          <div className="modal-top">
            <h2>{r.title}</h2>
            <button className="round-btn close-btn" onClick={onClose} aria-label="Close">
              <Icon n="close.svg" w={10} />
            </button>
          </div>
          <div className="modal-tags">
            <span className="tag">
              <Icon n="flash.svg" w={11} h={12} /> Active Request
              <Icon n="arrow-right.svg" w={9} className="caret" />
            </span>
            <span className="tag">
              <img src={r.assignee.avatar} width={14} height={14} alt="" /> {r.assignee.name}
            </span>
          </div>

          {r.description || filled ? <h3 className="overview">Overview</h3> : null}
          <textarea
            className="desc"
            value={r.description}
            placeholder="Type ‘/’ for commands or start typing"
            onChange={(e) => onChange({ ...r, description: e.target.value })}
            rows={r.description ? 6 : 4}
          />
          <hr />

          <div className="section-head">
            <h3>Attachments</h3>
            <button className="btn-sm" onClick={() => file.current?.click()}>
              <Icon n="add.svg" w={10} /> Add
            </button>
            <input ref={file} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
          </div>
          {r.attachments.length === 0 && (
            <div
              className={"drop" + (drag ? " is-over" : "")}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                addFiles(e.dataTransfer.files);
              }}
            >
              Drop a file here to attach to this request.
            </div>
          )}
          {r.attachments.map((a) => (
            <div className="attachment" key={a.id}>
              <div className="thumb">
                <img src={a.src} alt="" />
              </div>
              <div>
                <div className="att-name">{a.name}</div>
                <div className="small dim">{a.when}</div>
                <div className="actions">
                  <button
                    onClick={() => {
                      const n = prompt("Rename attachment", a.name);
                      if (n) onChange({ ...r, attachments: r.attachments.map((x) => (x.id === a.id ? { ...x, name: n } : x)) });
                    }}
                  >
                    <Icon n="pencil.svg" w={12} /> Edit
                  </button>
                  <button onClick={() => onChange({ ...r, attachments: r.attachments.filter((x) => x.id !== a.id) })}>
                    <Icon n="bin.svg" w={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          <hr />

          <h3>Activity</h3>
          <div className="comment-input">
            <img className="avatar-sm" src={A("avatar-user.jpg")} alt="" />
            <input
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          {r.comments.map((c) => (
            <div className="comment" key={c.id}>
              <img className="avatar-sm" src={c.avatar} alt="" />
              <div className="comment-body">
                <div>
                  {c.author} <span className="small dim">{c.when}</span>
                </div>
                <p>{c.text}</p>
                <div className="actions">
                  <Icon n="emoji.svg" w={12} className="dim-img" />
                  <button onClick={() => setComment(`@${c.author} `)}>
                    <Icon n="reply.svg" w={12} /> Reply
                  </button>
                  <button onClick={() => onChange({ ...r, comments: r.comments.filter((x) => x.id !== c.id) })}>
                    <Icon n="bin.svg" w={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {r.activity.map((a) => (
            <div className="comment" key={a.id}>
              <img className="avatar-sm" src={a.avatar} alt="" />
              <div className="comment-body">
                <div>
                  {a.author} <span className="dim">{a.text}</span>{" "}
                  {a.tag && (
                    <span className="dim">
                      <Icon n="flash.svg" w={9} h={10} className="inline" /> {a.tag}
                    </span>
                  )}
                </div>
                <div className="small dim">{a.when}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="modal-bottom">
          <button className="btn-lg" onClick={onDelete}>
            <Icon n="bin-delete.svg" w={12} /> Delete request
          </button>
          <button className="approve-btn" onClick={onApprove}>
            <span className="approve-key">
              <Icon n="approve-arrow.svg" w={18} h={15} />
            </span>
            <span className="approve-label">Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Requests");
  const [grid, setGrid] = useState(false);
  const [active, setActive] = useState<Request | null>(initialActive);
  const [list, setList] = useState<Request[]>(initialRequests);
  const [openId, setOpenId] = useState<string | null>(null);

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
      <Nav tab={tab} setTab={setTab} />
      <main className="stage">
        {tab !== "Requests" ? (
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
      {open && (
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
