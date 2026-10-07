export const A = (n: string) => `/assets/${n}`;
export const Icon = ({ n, w, h, className }: { n: string; w: number; h?: number; className?: string }) => (
  <img src={A(n)} width={w} height={h ?? w} alt="" className={className} draggable={false} />
);
