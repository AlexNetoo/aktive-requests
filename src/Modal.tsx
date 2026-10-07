import { useEffect, useRef, useState } from "react";
import { team, type Member, type Request } from "./data";
import { A, Icon } from "./ui";

export function Modal({
  r,
  onClose,
  onChange,
  onDelete,
  onApprove,
  agency,
  onCopy,
}: {
  r: Request;
  onClose: () => void;
  onChange: (r: Request) => void;
  onDelete: () => void;
  onApprove: () => void;
  agency?: boolean;
  onCopy?: (name: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [menu, setMenu] = useState(false);
  const [copyName, setCopyName] = useState("");
  const [group, setGroup] = useState("My Requests");
  const [editTitle, setEditTitle] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [q, setQ] = useState("");
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
            {agency && editTitle ? (
              <input
                className="title-input"
                autoFocus
                value={r.title}
                onChange={(e) => onChange({ ...r, title: e.target.value })}
                onBlur={() => setEditTitle(false)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && (e.stopPropagation(), setEditTitle(false))}
              />
            ) : (
              <h2 className={agency ? "editable" : ""} onClick={() => agency && setEditTitle(true)}>
                {r.title}
              </h2>
            )}
            {agency && (
              <button className="more-btn" aria-label="More" onClick={() => setMenu((m) => !m)}>
                <Icon n="dots-white.svg" w={14} h={4} />
              </button>
            )}
            <button className="round-btn close-btn" onClick={onClose} aria-label="Close">
              <Icon n="close.svg" w={10} />
            </button>
          </div>
          {agency && menu && (
            <div className="popover copy-pop" onMouseDown={(e) => e.stopPropagation()}>
              <div className="pop-head">
                Copy Request
                <button className="round-btn mini" aria-label="Close" onClick={() => setMenu(false)}>
                  <Icon n="close-md.svg" w={7} />
                </button>
              </div>
              <label>Name</label>
              <input className="field" placeholder="Slack, Weekly Zoom, etc..." value={copyName} onChange={(e) => setCopyName(e.target.value)} />
              <label>Group</label>
              <div className="select-wrap">
                <select className="field" value={group} onChange={(e) => setGroup(e.target.value)}>
                  <option>My Requests</option>
                  <option>Active</option>
                </select>
                <span className="updown"><Icon n="select-up.svg" w={4} /><Icon n="select-down.svg" w={4} /></span>
              </div>
              <div className="pop-actions">
                <button className="link-btn" onClick={() => setMenu(false)}>Cancel</button>
                <button
                  className="btn-lime"
                  onClick={() => {
                    onCopy?.(copyName.trim() || r.title + " (copy)");
                    setCopyName("");
                    setMenu(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
          <div className="modal-tags">
            <span className="tag">
              <Icon n="flash.svg" w={11} h={12} /> {agency ? r.status : "Active Request"}
              <Icon n="arrow-right.svg" w={9} className="caret" />
            </span>
            {r.assignees.map((m) => (
              <span className="tag" key={m.name}>
                <img src={m.avatar} width={14} height={14} alt="" /> {m.name}
                {agency && (
                  <button aria-label={"Unassign " + m.name} onClick={() => onChange({ ...r, assignees: r.assignees.filter((x) => x.name !== m.name) })}>
                    <Icon n="close-sm.svg" w={8} />
                  </button>
                )}
              </span>
            ))}
            {agency && (
              <span className="assign-wrap">
                <button className="tag" onClick={() => setAssignOpen((o) => !o)}>
                  <Icon n="add-sm.svg" w={10} /> Assign to
                </button>
                {assignOpen && (
                  <div className="popover assign-pop" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="assign-search">
                      <Icon n="search-alt.svg" w={12} />
                      <input autoFocus placeholder="Search for team member..." value={q} onChange={(e) => setQ(e.target.value)} />
                    </div>
                    <div className="assign-list">
                      {team.filter((m) => m.name.toLowerCase().includes(q.trim().toLowerCase())).map((m: Member) => {
                        const added = r.assignees.some((x) => x.name === m.name);
                        return (
                          <div className="assign-row" key={m.name}>
                            <span className="avatar-xs"><img src={m.avatar} width={22} height={22} alt="" /></span>
                            <span>{m.name}</span>
                            <button
                              className="add-chip"
                              disabled={added}
                              onClick={() => {
                                onChange({ ...r, assignees: [...r.assignees, m] });
                                setAssignOpen(false);
                                setQ("");
                              }}
                            >
                              {added ? "Added" : <><Icon n="add-sm.svg" w={8} /> Add</>}
                            </button>
                          </div>
                        );
                      })}
                      {team.filter((m) => m.name.toLowerCase().includes(q.trim().toLowerCase())).length === 0 && (
                        <div className="no-users">No users found...</div>
                      )}
                    </div>
                  </div>
                )}
              </span>
            )}
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
          {agency ? (
            <button className="btn-lg" onClick={onClose}>
              <Icon n="board.svg" w={16} /> Go to board
            </button>
          ) : (
            <button className="btn-lg" onClick={onDelete}>
              <Icon n="bin-delete.svg" w={12} /> Delete request
            </button>
          )}
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
