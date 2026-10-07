import type { Offer } from "./Subscriptions";
import { Icon } from "./ui";

const sym = (c: string) => (c === "EUR" ? "€" : c === "GBP" ? "£" : "$");
const price = (o: Offer) => `${sym(o.currency)}${o.amount}`;

export function ClientSubscription({
  offers,
  planId,
  setPlanId,
  addons,
  setAddons,
  used,
}: {
  offers: Offer[];
  planId: string | null;
  setPlanId: (id: string | null) => void;
  addons: string[];
  setAddons: React.Dispatch<React.SetStateAction<string[]>>;
  used: number;
}) {
  const plans = offers.filter((o) => o.kind === "plan");
  const extras = offers.filter((o) => o.kind === "addon");
  const current = plans.find((p) => p.id === planId) ?? null;
  const mine = extras.filter((e) => addons.includes(e.id));
  const monthly = (current ? Number(current.amount) : 0) + mine.reduce((n, e) => n + Number(e.amount), 0);
  const limit = current?.limit ? Number(current.limit) : null;

  return (
    <div className="agency client-sub">
      <section className="plan-card">
        <div className="plan-card-main">
          <span className="plan-eyebrow">Current plan</span>
          <h2>{current ? current.name : "No plan"}</h2>
          <p className="plan-sub">{current ? current.description : "Choose a plan below to start making requests."}</p>
          {current && (
            <button className="cancel" onClick={() => setPlanId(null)}>
              Cancel plan
            </button>
          )}
        </div>
        <div className="plan-stats">
          <div>
            <span className="sum-label">Next invoice</span>
            <span className="plan-big">
              ${monthly.toLocaleString()}
              <i>/ month</i>
            </span>
          </div>
          <div>
            <span className="sum-label">Active requests</span>
            <span className="plan-big">
              {used}
              <i>{limit ? `/ ${limit}` : "/ none"}</i>
            </span>
            <span className="meter">
              <b style={{ width: limit ? `${Math.min(100, (used / limit) * 100)}%` : "0%" }} />
            </span>
          </div>
        </div>
      </section>

      <div className="a-top">
        <h1>
          Plans <span className="count">{plans.length}</span>
        </h1>
      </div>
      <div className="offers">
        {plans.map((p) => {
          const on = p.id === planId;
          return (
            <article className={"offer" + (on ? " current" : "")} key={p.id}>
              <div className="offer-head">
                <h3>{p.name}</h3>
                {on && <span className="draft">Current</span>}
              </div>
              <p className="offer-price">
                {price(p)} <span>/ {p.period.toLowerCase()}</span>
              </p>
              {p.description && <p className="offer-desc">{p.description}</p>}
              <ul>
                {p.limit && (
                  <li>
                    <Icon n="check-circle.svg" w={14} /> {p.limit} active request{p.limit === "1" ? "" : "s"} at a time
                  </li>
                )}
                {p.inclusions.map((x, i) => (
                  <li key={i}>
                    <Icon n="check-circle.svg" w={14} /> {x}
                  </li>
                ))}
              </ul>
              <button className={on ? "btn-outline" : "btn-dark wide"} disabled={on} onClick={() => setPlanId(p.id)}>
                {on ? "Your plan" : current ? "Switch to " + p.name : "Choose " + p.name}
              </button>
            </article>
          );
        })}
        {plans.length === 0 && <div className="empty-card">Your agency has not published any plans yet.</div>}
      </div>

      <div className="a-top addons-head">
        <h1>
          Add-ons <span className="count">{extras.length}</span>
        </h1>
      </div>
      <div className="offers">
        {extras.map((e) => {
          const on = addons.includes(e.id);
          return (
            <article className={"offer" + (on ? " current" : "")} key={e.id}>
              <div className="offer-head">
                <h3>{e.name}</h3>
                {on && <span className="draft">Added</span>}
              </div>
              <p className="offer-price">
                {price(e)} <span>/ {e.period.toLowerCase()}</span>
              </p>
              {e.description && <p className="offer-desc">{e.description}</p>}
              <button
                className={on ? "btn-outline" : "btn-dark wide"}
                onClick={() => setAddons((a) => (on ? a.filter((x) => x !== e.id) : [...a, e.id]))}
              >
                {on ? "Remove" : "Add to plan"}
              </button>
            </article>
          );
        })}
        {extras.length === 0 && <div className="empty-card">No add-ons available.</div>}
      </div>
    </div>
  );
}
