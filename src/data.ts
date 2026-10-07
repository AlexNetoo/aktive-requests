export type Attachment = { id: string; name: string; when: string; src: string };
export type Comment = { id: string; author: string; avatar: string; when: string; text: string };
export type Activity = { id: string; author: string; avatar: string; when: string; text: string; tag?: string };
export type Status = "Not started" | "In progress" | "Revisions needed" | "Ready to deliver" | "Awaiting feedback" | "Blocked";
export const STATUSES: Status[] = ["Not started", "In progress", "Revisions needed", "Ready to deliver", "Awaiting feedback", "Blocked"];
export const STATUS_COLOR: Record<Status, { bg: string; fg: string }> = {
  "Not started": { bg: "#a108ff", fg: "#fff" },
  "In progress": { bg: "#089eff", fg: "#fff" },
  "Revisions needed": { bg: "#daff07", fg: "#000" },
  "Ready to deliver": { bg: "#08d3be", fg: "#fff" },
  "Awaiting feedback": { bg: "#fa8e0f", fg: "#fff" },
  Blocked: { bg: "#f40779", fg: "#fff" },
};
export type Member = { name: string; avatar: string };
export const team: Member[] = [
  { name: "Justin Greet", avatar: "/assets/user-justin.png" },
  { name: "Adam Laral", avatar: "/assets/user-adam.png" },
  { name: "Haylen Stones", avatar: "/assets/user-haylen.png" },
  { name: "Amy Williams", avatar: "/assets/user-amy.png" },
  { name: "Sarah Hubbord", avatar: "/assets/user-sarah.png" },
];
export type Request = {
  id: string;
  title: string;
  updated: string;
  status: Status;
  description: string;
  attachments: Attachment[];
  comments: Comment[];
  activity: Activity[];
  assignees: Member[];
};

const assignee: Member = { name: "Izzie Taylor", avatar: "/assets/face-izzie.png" };
const justin = "/assets/face-justin2.png";

export const initialActive: Request = {
  id: "active-1",
  title: "New Logo Concept For Newsletter",
  updated: "Jan 12, 2024 at 9:30am",
  status: "In progress",
  assignees: [assignee],
  description:
    'We are launching a new newsletter titled "Insights Index," an online publication dedicated to uncovering and sharing stories from the forefront of education entrepreneurship and current events in the education sector. This newsletter aims to be at the intersection of innovation, culture-forward editorial content, and human-centric narratives.',
  attachments: [
    { id: "a1", name: "dashboard.png", when: "Yesterday at 9:54pm", src: "/assets/thumb-dashboard.png" },
  ],
  comments: [
    {
      id: "c1",
      author: "Justin Greet",
      avatar: justin,
      when: "Yesterday at 9:54pm",
      text: "I invited you to our Figma. Please follow the steps in “To create a new Figma design” at the bottom and name this Figma file",
    },
    { id: "c3", author: "Izzie Taylor", avatar: assignee.avatar, when: "Yesterday at 10:12pm", text: "Thanks, I accepted the invite and renamed the file." },
    { id: "c4", author: "Justin Greet", avatar: justin, when: "Yesterday at 10:20pm", text: "Great. Share the first concepts when they are ready." },
  ],
  activity: [
    { id: "act1", author: "Justin Greet", avatar: justin, when: "Yesterday at 9:54pm", text: "made this card", tag: "Active" },
  ],
};

const landing = (id: string): Request => ({
  id,
  title: "Landing Page Design",
  updated: "Jan 12, 2024 at 9:30am",
  status: "Not started",
  assignees: [assignee],
  description: "",
  attachments: [{ id: id + "-att", name: "dashboard.png", when: "Yesterday at 9:54pm", src: "/assets/thumb-dashboard.png" }],
  comments: ["c1", "c2", "c3"].map((c) => ({
    id: id + c,
    author: "Justin Greet",
    avatar: justin,
    when: "Yesterday at 9:54pm",
    text: "Please share the first round of layouts when you have them.",
  })),
  activity: [
    { id: id + "-act", author: "Justin Greet", avatar: justin, when: "Yesterday at 9:54pm", text: "made this card", tag: "Active" },
  ],
});

export const initialRequests: Request[] = ["r1", "r2", "r3", "r4"].map(landing);

export type AgencyRow = { id: string; client: string; request: Request | null; activity: string };
const agencyReq = (id: string, status: Status): Request => ({ ...landing(id), title: "Landing Page", status });
export const initialAgency: AgencyRow[] = [
  { id: "g1", client: "Laravel", request: agencyReq("g1", "Not started"), activity: "Today at 9:30am" },
  { id: "g2", client: "Animus Digital", request: agencyReq("g2", "Revisions needed"), activity: "Today at 9:30am" },
  { id: "g3", client: "Solene", request: agencyReq("g3", "In progress"), activity: "Today at 9:30am" },
  { id: "g4", client: "Aktive", request: agencyReq("g4", "Ready to deliver"), activity: "Today at 9:30am" },
  { id: "g5", client: "Mason", request: agencyReq("g5", "Awaiting feedback"), activity: "Today at 9:30am" },
  { id: "g6", client: "Discord", request: agencyReq("g6", "Blocked"), activity: "Today at 9:30am" },
  { id: "g7", client: "Discord", request: null, activity: "" },
];
