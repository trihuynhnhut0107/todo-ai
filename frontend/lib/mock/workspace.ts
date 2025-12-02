import { Workspace } from "@/types/group";


const sampleColors = [
  "#EF4444", // red
  "#10B981", // green
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#8B5CF6", // purple
];

const sampleIcons = ["briefcase", "rocket", "users", "folder", "calendar"];

const sampleTimezones = [
  "Asia/Ho_Chi_Minh",
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
];

const randomFrom = <T>(arr: T[], idx?: number) =>
  typeof idx === "number"
    ? arr[idx % arr.length]
    : arr[Math.floor(Math.random() * arr.length)];

const idFrom = (prefix = "ws") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

export const createMockWorkspaces = (
  count = 3,
  seedNames?: string[]
): Workspace[] => {
  const now = new Date();
  const workspaces: Workspace[] = [];

  for (let i = 0; i < count; i++) {
    const name =
      seedNames && seedNames[i] ? seedNames[i] : `Workspace ${i + 1}`;
    const createdAt = new Date(
      now.getTime() - (count - i) * 1000 * 60 * 60 * 24
    ).toISOString(); // staggered days
    const updatedAt = new Date(
      now.getTime() - (count - i - 1) * 1000 * 60 * 60 * 12
    ).toISOString();

    workspaces.push({
      id: idFrom("ws"),
      name,
      description: `${name} - a workspace for collaboration and projects.`,
      timezoneCode: randomFrom(sampleTimezones, i),
      color: randomFrom(sampleColors, i),
      icon: randomFrom(sampleIcons, i),
      isArchived: false,
      metadata: {
        createdBy: "system",
        purpose: "testing",
      },
      ownerId: `user_${(i % 5) + 1}`,
      order: i,
      createdAt,
      updatedAt,
      memberCount: Math.floor(Math.random() * 50) + 1,
      eventCount: Math.floor(Math.random() * 200),
    });
  }

  return workspaces;
};

export const mockWorkspaces = createMockWorkspaces(5, [
  "Development",
  "Marketing",
  "Design",
  "Sales",
  "HR",
]);
