/**
 * LangChain Tools Index
 * Central export point for all LangChain tools in the application
 */

export {
  eventTools,
  createEventTool,
  getEventsTool,
  getEventByIdTool,
  updateEventTool,
  deleteEventTool,
  assignUsersToEventTool,
  unassignUserFromEventTool,
} from "./event.tools";

export {
  workspaceTools,
  createWorkspaceTool,
  getUserWorkspacesTool,
  getWorkspaceByIdTool,
  updateWorkspaceTool,
  deleteWorkspaceTool,
  addWorkspaceMembersTool,
  removeWorkspaceMemberTool,
  getWorkspaceMembersTool,
} from "./workspace.tools";

export {
  mapboxTools,
  geocodePlaceTool,
  getTravelTimeTool,
  checkLocationProximityTool,
  reverseGeocodeTool,
} from "./mapbox.tools";

// Export all tools combined for easy agent initialization
import { eventTools } from "./event.tools";
import { workspaceTools } from "./workspace.tools";
import { mapboxTools } from "./mapbox.tools";

export const allTools = [...eventTools, ...workspaceTools, ...mapboxTools];
