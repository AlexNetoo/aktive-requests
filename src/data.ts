export type Attachment = { id: string; name: string; when: string; src: string };
export type Comment = { id: string; author: string; avatar: string; when: string; text: string };
export type Activity = { id: string; author: string; avatar: string; when: string; text: string; tag?: string };
export type Request = {
  id: string;
  title: string;
  updated: string;
  status: "Not started" | "In progress";
  description: string;
  attachments: Attachment[];
  comments: Comment[];
  activity: Activity[];
  assignee: { name: string; avatar: string };
};

const assignee = { name: "Izzie Taylor", avatar: "/assets/face-izzie.png" };
const justin = "/assets/face-justin2.png";

export const initialActive: Request = {
  id: "active-1",
  title: "New Logo Concept For Newsletter",
  updated: "Jan 12, 2024 at 9:30am",
  status: "In progress",
  assignee,
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
  assignee,
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
