export const A = (n: string) => `/assets/${n}`;
export const Icon = ({ n, w, h, className }: { n: string; w: number; h?: number; className?: string }) => (
  <img src={A(n)} width={w} height={h ?? w} alt="" className={className} draggable={false} />
);

export const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button className={"toggle" + (on ? " on" : "")} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
    <i />
  </button>
);
