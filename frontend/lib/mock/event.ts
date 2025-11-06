import { Assignee, Event } from "@/types/event";
import { getColorFromString } from "../utils";

// Utility: Add hours to a date and return ISO string
const addHours = (date: Date, hours: number) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();

// Random utility helpers
const randomFrom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const idFrom = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

// === Data Pools ===
const tagPool = [
  "team",
  "project",
  "meeting",
  "review",
  "lunch",
  "health",
  "personal",
];
const locationPool = [
  "Meeting Room A",
  "Conference Room B",
  "Cafe Central",
  "City Clinic",
  "Online (Zoom)",
];
const colorPool = ["#EF4444", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"];
const eventNames = [
  "Weekly Sync",
  "Doctor Appointment",
  "Project Review",
  "Lunch Meeting",
  "Client Call",
  "Workshop",
  "Brainstorm Session",
  "Code Review",
  "Team Standup",
];
const descriptionPool = [
  "Important discussion regarding project status",
  "Personal appointment with a doctor",
  "Collaborative planning session",
  "Casual catch-up with a colleague",
  "Client feedback meeting",
];

// === Mock Assignees ===
const assigneePool: Assignee[] = [
  { id: "u1", name: "LÊ VĂN A", email: "a@example.com" },
  { id: "u2", name: "NGUYỄN VĂN B", email: "b@example.com" },
  { id: "u3", name: "TRẦN THỊ C", email: "c@example.com" },
  { id: "u4", name: "SARAH SMITH", email: "sarah@example.com" },
  { id: "u5", name: "LÊ VĂN D", email: "d@example.com" },
  { id: "u6", name: "NGUYỄN VĂN E", email: "e@example.com" },
];

// === Workspace Pools ===
const workspaceColors = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"];
const workspaceIcons = ["briefcase", "rocket", "users", "folder", "calendar"];
const workspaceTimezones = [
  "Asia/Ho_Chi_Minh",
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
];

// === MOCK EVENT GENERATOR ===
export const createMockEvents = (count = randomInt(10, 15)): Event[] => {
  const now = new Date();
  const events: Event[] = [];

  for (let i = 0; i < count; i++) {
    const baseDate = new Date(now.getTime() + i * 1000 * 60 * 60 * 6);
    const start = addHours(baseDate, 0);
    const end = addHours(baseDate, randomInt(6, 10));

    // Random tags (1–3)
    const tags = Array.from({ length: randomInt(1, 3) }, () =>
      randomFrom(tagPool)
    );

    // Random assignees (1–3)
    const assignees = Array.from({ length: randomInt(1, 3) }, () =>
      randomFrom(assigneePool)
    );
    const name = randomFrom(eventNames);
    events.push({
      id: idFrom("ev"),
      name,
      description: randomFrom(descriptionPool),
      start,
      end,
      status: "confirmed",
      location: randomFrom(locationPool),
      color: getColorFromString(name),
      isAllDay: Math.random() < 0.2,
      recurrenceRule: "",
      tags,
      metadata: {
        note: "Auto-generated mock event",
        priority: Math.random() < 0.5 ? "high" : "normal",
      },
      workspaceId: `workspace_${randomInt(1, 3)}`,
      createdById: randomFrom(assigneePool).id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      assignees,
    });
  }

  return events;
};

export const mockEvents = createMockEvents();
