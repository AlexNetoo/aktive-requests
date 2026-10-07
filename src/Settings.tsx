import { useState } from "react";
import { team } from "./data";
import { A, Icon, Toggle } from "./ui";

export type Prefs = {
  name: string;
  email: string;
  company: string;
  timezone: string;
  notify: Record<string, boolean>;
};

export const defaultPrefs: Prefs = {
  name: "Alex Neto",
  email: "alex.neto@gmail.com",
  company: "Aktive",
  timezone: "Europe/Lisbon",
  notify: { "New comment on a request": true, "Request status changes": true, "Invoices and receipts": true, "Product updates": false },
};

const ZONES = ["Europe/Lisbon", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo"];

export function Settings({ agency, prefs, setPrefs }: { agency: boolean; prefs: Prefs; setPrefs: (p: Prefs) => void }) {
  const [draft, setDraft] = useState<Prefs>(prefs);
  const [saved, setSaved] = useState(false);
  const [members, setMembers] = useState(team);
  const [invite, setInvite] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(prefs);
  const valid = /^\S+@\S+\.\S+$/.test(draft.email) && draft.name.trim().length > 0;
  const set = (patch: Partial<Prefs>) => {
    setSaved(false);
    setDraft({ ...draft, ...patch });
  };

  return (
    <div className="agency settings">
      <div className="a-top first">
        <h1>Settings</h1>
        <span className="spacer" />
        {saved && !dirty && <span className="saved">Saved</span>}
        <button
          className="btn-dark"
          disabled={!dirty || !valid}
          onClick={() => {
            setPrefs(draft);
            setSaved(true);
          }}
        >
          Save changes
        </button>
      </div>

      <section className="set-card">
        <h3>Profile</h3>
        <div className="profile">
          <img className="avatar-lg big" src={A("avatar-user.jpg")} alt="" />
          <div className="set-grid">
            <label>
              Full name
              <input className="in" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
            </label>
            <label>
              Email
              <input className={"in" + (valid ? "" : " bad")} type="email" value={draft.email} onChange={(e) => set({ email: e.target.value })} />
            </label>
            <label>
              {agency ? "Agency name" : "Company"}
              <input className="in" value={draft.company} onChange={(e) => set({ company: e.target.value })} />
            </label>
            <label>
              Time zone
              <select className="in" value={draft.timezone} onChange={(e) => set({ timezone: e.target.value })}>
                {ZONES.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="set-card">
        <h3>Notifications</h3>
        {Object.entries(draft.notify).map(([k, on]) => (
          <div className="set-row" key={k}>
            <span>{k}</span>
            <Toggle on={on} onChange={(v) => set({ notify: { ...draft.notify, [k]: v } })} label={k} />
          </div>
        ))}
      </section>

      {agency && (
        <section className="set-card">
          <h3>Team</h3>
          {members.map((m) => (
            <div className="set-row" key={m.name}>
              <span className="member">
                <img src={m.avatar} width={28} height={28} alt="" /> {m.name}
              </span>
              <button className="x" aria-label={"Remove " + m.name} onClick={() => setMembers(members.filter((x) => x.name !== m.name))}>
                <Icon n="close-sm.svg" w={8} />
              </button>
            </div>
          ))}
          <form
            className="invite"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(invite)) return;
              setMembers([...members, { name: invite, avatar: A("user-adam.png") }]);
              setInvite("");
            }}
          >
            <input className="in" placeholder="Invite by email" value={invite} onChange={(e) => setInvite(e.target.value)} />
            <button className="btn-dark" type="submit">Invite</button>
          </form>
        </section>
      )}
    </div>
  );
}
