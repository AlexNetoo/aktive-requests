import { useEffect, useState } from "react";
import { Icon } from "./ui";

type Kind = "plan" | "addon";
type Offer = {
  id: string;
  kind: Kind;
  name: string;
  description: string;
  amount: string;
  currency: string;
  period: string;
  inclusions: string[];
  limit: string | null;
  draft: boolean;
};

const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button className={"toggle" + (on ? " on" : "")} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
    <i />
  </button>
);

function Select({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <div className={"select-wrap " + (className ?? "")}>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <span className="updown">
        <Icon n="select-up.svg" w={4} />
        <Icon n="select-down.svg" w={4} />
      </span>
    </div>
  );
}

function OfferModal({ kind, onClose, onSave }: { kind: Kind; onClose: () => void; onSave: (o: Offer) => void }) {
  const plan = kind === "plan";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [period, setPeriod] = useState("Monthly");
  const [incOn, setIncOn] = useState(true);
  const [inc, setInc] = useState<string[]>([""]);
  const [limOn, setLimOn] = useState(true);
  const [limit, setLimit] = useState("1");
  const [err, setErr] = useState(false);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const save = (draft: boolean) => {
    if (!name.trim() && !draft) return setErr(true);
    onSave({
      id: crypto.randomUUID(),
      kind,
      name: name.trim() || "Untitled " + (plan ? "plan" : "add-on"),
      description,
      amount: amount || "0.00",
      currency,
      period,
      inclusions: incOn ? inc.filter((x) => x.trim()) : [],
      limit: plan && limOn ? limit : null,
      draft,
    });
  };

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={plan ? "Add a plan" : "Create add-on"}>
        <div className="modal-scroll form">
          <div className="modal-top">
            <div>
              <h2>{plan ? "Add a plan" : "Create add-on"}</h2>
              <p className="sub">Lorem ipsum dolor sit amet consectetur.</p>
            </div>
            <span className="more-btn static"><Icon n="dots-white.svg" w={14} h={4} /></span>
            <button className="round-btn close-btn" onClick={onClose} aria-label="Close">
              <Icon n="close.svg" w={10} />
            </button>
          </div>

          <label className="lbl">Name</label>
          <input
            className={"field" + (err && !name.trim() ? " bad" : "")}
            placeholder={plan ? "Starter, Pro..." : "Slack, Weekly Zoom, etc..."}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErr(false);
            }}
          />
          {err && !name.trim() && <p className="err">Give it a name to publish.</p>}

          <div className="lbl-row">
            <label className="lbl">Description</label>
            <span className="small dim">{description.length} / 200</span>
          </div>
          <input className="field" placeholder="Write a short description..." maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="two">
            <div>
              <label className="lbl">Amount</label>
              <div className="amount">
                <span className="cur-sym">$</span>
                <input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
                <Select className="cur" value={currency} onChange={setCurrency} options={["USD", "EUR", "GBP"]} />
              </div>
            </div>
            <div>
              <label className="lbl">Billing period</label>
              <Select value={period} onChange={setPeriod} options={["Monthly", "Quarterly", "Yearly", "One-time"]} />
            </div>
          </div>

          <hr />
          <div className="lbl-row">
            <span className="lbl">Inclusions</span>
            <span className="enabled">Enabled <Toggle on={incOn} onChange={setIncOn} label="Inclusions" /></span>
          </div>
          {incOn && (
            <>
              {inc.map((v, i) => (
                <div className="inc" key={i}>
                  <Icon n="check-circle.svg" w={16} />
                  <input
                    placeholder="Unlimited requests, etc."
                    value={v}
                    onChange={(e) => setInc(inc.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                </div>
              ))}
              <button className="btn-sm add-item" onClick={() => setInc([...inc, ""])}>
                <Icon n="add-plan-sm.svg" w={10} /> Add item
              </button>
            </>
          )}

          {plan && (
            <>
              <hr />
              <div className="lbl-row">
                <span className="lbl">Active requests allowed</span>
                <span className="enabled">Enabled <Toggle on={limOn} onChange={setLimOn} label="Active requests allowed" /></span>
              </div>
              <p className="hint">Limit the number of requests clients can make active at a time.</p>
              {limOn && <input className="field half" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))} />}
            </>
          )}
        </div>
        <div className="modal-bottom">
          <button className="btn-lg" onClick={() => save(true)}>Save as a draft</button>
          <button className="approve-btn" onClick={() => save(false)}>
            <span className="approve-key"><Icon n="approve-arrow.svg" w={18} h={15} /></span>
            <span className="approve-label">Publish</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, empty, cta, items, onAdd, onRemove }: { title: string; empty: string; cta: string; items: Offer[]; onAdd: () => void; onRemove: (id: string) => void }) {
  return (
    <section className="sub-section">
      <div className="a-top">
        <h1>
          {title} <span className="count">{items.length}</span>
        </h1>
        <span className="spacer" />
        <button className="btn-dark" onClick={onAdd}>
          <Icon n="add.svg" w={10} /> {cta}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="empty-card">{empty}</div>
      ) : (
        <div className="offers">
          {items.map((o) => (
            <article className="offer" key={o.id}>
              <div className="offer-head">
                <h3>{o.name}</h3>
                {o.draft && <span className="draft">Draft</span>}
                <button className="x" aria-label={"Delete " + o.name} onClick={() => onRemove(o.id)}>
                  <Icon n="close-sm.svg" w={8} />
                </button>
              </div>
              <p className="offer-price">
                {o.currency === "EUR" ? "€" : o.currency === "GBP" ? "£" : "$"}
                {o.amount} <span>/ {o.period.toLowerCase()}</span>
              </p>
              {o.description && <p className="offer-desc">{o.description}</p>}
              <ul>
                {o.limit && <li><Icon n="check-circle.svg" w={14} /> {o.limit} active request{o.limit === "1" ? "" : "s"} at a time</li>}
                {o.inclusions.map((x, i) => (
                  <li key={i}><Icon n="check-circle.svg" w={14} /> {x}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function Subscriptions() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [modal, setModal] = useState<Kind | null>(null);
  return (
    <div className="agency">
      <Section
        title="Plans"
        empty="No plans yet. Add a plan to start billing clients."
        cta="Add a plan"
        items={offers.filter((o) => o.kind === "plan")}
        onAdd={() => setModal("plan")}
        onRemove={(id) => setOffers((os) => os.filter((o) => o.id !== id))}
      />
      <Section
        title="Add-ons"
        empty="No add-ons yet. Create an add-on to sell extras."
        cta="Create add-on"
        items={offers.filter((o) => o.kind === "addon")}
        onAdd={() => setModal("addon")}
        onRemove={(id) => setOffers((os) => os.filter((o) => o.id !== id))}
      />
      {modal && (
        <OfferModal
          kind={modal}
          onClose={() => setModal(null)}
          onSave={(o) => {
            setOffers((os) => [...os, o]);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
