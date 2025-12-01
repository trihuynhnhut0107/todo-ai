# LangChain Tools for Event Management

This directory contains LangChain tools that wrap the EventService methods, enabling AI agents to interact with the event management system.

## Available Tools

### 1. `create_event`
Creates a new event in a workspace with specified details.

**Use Cases:**
- Scheduling meetings
- Creating tasks with deadlines
- Adding calendar events
- Setting up recurring events

**Required Parameters:**
- `userId`: The user creating the event
- `name`: Event title
- `start`: Start date/time (ISO format)
- `end`: End date/time (ISO format)
- `workspaceId`: Target workspace

**Optional Parameters:**
- `description`: Detailed event description
- `location`: Meeting location or URL
- `assigneeIds`: Array of user IDs to assign
- `tags`: Categorization tags
- `color`: UI color code
- `isAllDay`: All-day event flag
- `recurrenceRule`: iCalendar RRULE format
- `status`: Event status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
- `metadata`: Additional key-value data

### 2. `get_events`
Retrieves events with optional filtering.

**Use Cases:**
- Finding upcoming events
- Checking schedules
- Listing tasks by status
- Viewing events for a specific user

**Parameters:**
- `userId`: The user requesting events (required)
- `workspaceId`: Filter by workspace (optional)
- `startDate`: Events starting from date (optional)
- `endDate`: Events ending before date (optional)
- `status`: Filter by status (optional)
- `assigneeId`: Events assigned to user (optional)

### 3. `get_event_by_id`
Retrieves detailed information about a specific event.

**Use Cases:**
- Getting full event details
- Checking specific event information
- Verifying event status

**Parameters:**
- `userId`: The user requesting the event
- `eventId`: The event to retrieve

### 4. `update_event`
Updates an existing event's properties.

**Use Cases:**
- Rescheduling events
- Updating event status
- Modifying event details
- Changing assignments

**Parameters:**
- `userId`: The user updating the event (required)
- `eventId`: The event to update (required)
- All event fields are optional (only provided fields will be updated)

**Permissions:**
- Only event creator or workspace owner can update

### 5. `delete_event`
Permanently deletes an event.

**Use Cases:**
- Canceling and removing events
- Cleaning up old tasks
- Removing incorrect entries

**Parameters:**
- `userId`: The user deleting the event
- `eventId`: The event to delete

**Permissions:**
- Only event creator or workspace owner can delete
- Action is permanent and cannot be undone

### 6. `assign_users_to_event`
Assigns one or more users to an event.

**Use Cases:**
- Adding meeting participants
- Assigning team members to tasks
- Notifying users about events

**Parameters:**
- `userId`: The user performing the assignment
- `eventId`: The event to assign users to
- `userIds`: Array of user IDs to assign

**Permissions:**
- Only event creator or workspace owner can assign

### 7. `unassign_user_from_event`
Removes a user from an event's assignees.

**Use Cases:**
- Removing participants from meetings
- Unassigning team members from tasks
- Managing event attendees

**Parameters:**
- `userId`: The user performing the unassignment
- `eventId`: The event to unassign from
- `userIdToRemove`: The user ID to remove

**Permissions:**
- Only event creator or workspace owner can unassign

## Usage Example

### Basic Agent Setup

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { allTools } from "./tools";

// Initialize the LLM
const llm = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0,
});

// Create the prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant that manages events and schedules."],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

// Create the agent
const agent = await createToolCallingAgent({
  llm,
  tools: allTools,
  prompt,
});

// Create the executor
const agentExecutor = new AgentExecutor({
  agent,
  tools: allTools,
});

// Use the agent
const result = await agentExecutor.invoke({
  input: "Create a team meeting tomorrow at 2pm for 1 hour in workspace ws_123",
});

console.log(result.output);
```

### Using Individual Tools

```typescript
import { createEventTool, getEventsTool } from "./tools";

// Create an agent with specific tools only
const agent = await createToolCallingAgent({
  llm,
  tools: [createEventTool, getEventsTool],
  prompt,
});
```

### Example Conversations

**Example 1: Creating an Event**
```
Human: Schedule a team standup for tomorrow at 9am, 30 minutes long, in workspace abc123

Agent: *uses create_event tool*
{
  userId: "user_123",
  name: "Team Standup",
  start: "2024-11-28T09:00:00Z",
  end: "2024-11-28T09:30:00Z",
  workspaceId: "abc123"
}

Response: I've scheduled a team standup for tomorrow at 9am. The 30-minute meeting has been created in your workspace.
```

**Example 2: Finding Events**
```
Human: What meetings do I have this week?

Agent: *uses get_events tool*
{
  userId: "user_123",
  startDate: "2024-11-27T00:00:00Z",
  endDate: "2024-12-03T23:59:59Z"
}

Response: You have 5 meetings this week:
1. Team Standup - Tomorrow at 9am
2. Project Review - Wednesday at 2pm
...
```

**Example 3: Updating an Event**
```
Human: Reschedule the team standup to 10am instead

Agent: *uses get_events tool to find the event*
Agent: *uses update_event tool*
{
  userId: "user_123",
  eventId: "evt_456",
  start: "2024-11-28T10:00:00Z",
  end: "2024-11-28T10:30:00Z"
}

Response: I've rescheduled the team standup to 10am tomorrow.
```

**Example 4: Managing Assignees**
```
Human: Add Sarah and John to the project review meeting

Agent: *uses get_events tool to find "Project Review"*
Agent: *uses assign_users_to_event tool*
{
  userId: "user_123",
  eventId: "evt_789",
  userIds: ["user_sarah", "user_john"]
}

Response: I've added Sarah and John to the Project Review meeting.
```

## Response Format

All tools return JSON responses with the following structure:

**Success Response:**
```json
{
  "success": true,
  "event": { /* event object */ },
  "message": "Descriptive success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Error Handling

The tools handle common errors:
- **Access denied**: User doesn't have permission
- **Not found**: Event or user doesn't exist
- **Validation errors**: Invalid dates, missing required fields
- **Business logic errors**: End time before start time, etc.

All errors are returned as JSON with descriptive messages suitable for the agent to communicate to users.

## Best Practices

1. **Date Formatting**: Always use ISO 8601 format for dates (e.g., "2024-11-27T14:30:00Z")

2. **Error Recovery**: Tools return structured errors - agents should handle them gracefully

3. **User Context**: Always provide the correct `userId` for permission checks

4. **Workspace Context**: Keep track of the workspace context in conversation

5. **Natural Language**: Tools support natural language queries - the LLM will extract parameters

6. **Batch Operations**: For multiple events, call tools sequentially rather than in parallel

## Integration with Chat Service

These tools are designed to work with the existing chat service for event creation:

```typescript
// In chat controller/service
import { allTools } from "./tools";

// Initialize agent with tools
const agent = createAgent(llm, allTools);

// Process user message
const response = await agent.invoke({
  input: userMessage,
  chat_history: conversationHistory,
});
```

## Testing

```typescript
import { createEventTool } from "./tools/event.tools";

// Test event creation
const result = await createEventTool.invoke({
  userId: "test_user",
  name: "Test Event",
  start: "2024-11-28T10:00:00Z",
  end: "2024-11-28T11:00:00Z",
  workspaceId: "test_workspace",
});

console.log(JSON.parse(result));
```

## Security Notes

- All tools enforce user permissions through the EventService
- Only workspace owners and event creators can modify events
- User access is verified on every operation
- Sensitive data is not exposed in tool descriptions
