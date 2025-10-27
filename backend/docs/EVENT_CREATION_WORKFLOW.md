# Event Creation Workflow with LangGraph

## Overview

This implementation provides an interactive, conversational event creation system using **LangGraph** with human-in-the-loop interrupts. The bot intelligently extracts event information from natural language, handles missing data, and manages conflicts.

## Architecture

### Components

1. **LangchainService** (`src/services/langchain.service.ts`)
   - `detectIntent()`: Detects user intent and extracts partial event data
   - `extractEventData()`: Extracts complete event information with structured output (Zod schema)

2. **Event Creation Workflow** (`src/workflows/event-creation.workflow.ts`)
   - State machine with 5 nodes using LangGraph
   - Human-in-the-loop interrupts for missing info, confirmation, and conflict resolution

3. **Chat Controller** (`src/controllers/chat.controller.ts`)
   - 3 endpoints for interactive conversation management
   - Stateful thread management with `MemorySaver`

4. **Schemas** (`src/schemas/`)
   - `event.schema.ts`: Zod schema for CreateEventDto with validation
   - `chat-state.schema.ts`: Conversation state management schema

## Workflow State Machine

```
START
  ↓
[detectIntent] → Analyzes user input, extracts intent + partial data
  ↓
  ├─→ (failed) → END
  ├─→ (collecting_info) → [collectInfo]
  └─→ (awaiting_confirmation) → [confirmEvent]

[collectInfo] → Asks for missing fields using interrupt()
  ↓
  ├─→ (still missing) → [collectInfo] (loop)
  └─→ (complete) → [confirmEvent]

[confirmEvent] → Shows summary, asks for confirmation
  ↓
  ├─→ (confirmed) → [checkConflicts]
  └─→ (cancelled) → END

[checkConflicts] → Detects time conflicts (placeholder)
  ↓
  ├─→ (conflict detected) → interrupt() for resolution
  │     ├─→ (change time) → [createEvent]
  │     └─→ (cancel) → END
  └─→ (no conflict) → [createEvent]

[createEvent] → Calls EventService to create event
  ↓
END (status: completed/failed/cancelled)
```

## API Endpoints

**Authentication**: All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. POST `/api/chat/event/start`

Start a new event creation conversation.

**Request:**
```json
{
  "message": "Create a meeting tomorrow at 2pm",
  "workspaceId": "workspace-uuid",
  "simulateConflict": false  // Optional: for testing conflict flow
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat session started",
  "data": {
    "threadId": "thread-1234567890-abc123",
    "status": "collecting_info",
    "message": "I need some more information to create this event. Please provide: end date and time",
    "missingFields": ["end"],
    "suggestedResponses": [
      "Tomorrow at 2pm to 3pm",
      "Next Monday 9am for 1 hour"
    ],
    "eventData": {
      "name": "Meeting",
      "start": "2025-10-24T14:00:00"
    },
    "interrupt": {
      "type": "collect_info",
      "payload": { ... }
    }
  }
}
```

### 2. POST `/api/chat/event/respond`

Respond to bot's question with additional information.

**Request:**
```json
{
  "threadId": "thread-1234567890-abc123",
  "response": "Until 3pm"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response processed",
  "data": {
    "threadId": "thread-1234567890-abc123",
    "status": "awaiting_confirmation",
    "message": "📅 Event Summary:\\n• Name: Meeting\\n• Start: 2025-10-24T14:00:00\\n• End: 2025-10-24T15:00:00\\n\\nWould you like to create this event?",
    "suggestedResponses": ["Yes, create it", "No, cancel"],
    "interrupt": {
      "type": "confirm_event",
      "payload": { ... }
    }
  }
}
```

### 3. POST `/api/chat/event/confirm`

Confirm or cancel event creation.

**Request:**
```json
{
  "threadId": "thread-1234567890-abc123",
  "confirmed": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Event creation confirmed",
  "data": {
    "threadId": "thread-1234567890-abc123",
    "status": "completed",
    "message": "✅ Event \\"Meeting\\" created successfully!",
    "eventData": {
      "eventId": "mock-event-id-1234567890"
    },
    "suggestedResponses": [
      "Create another event",
      "View my events"
    ]
  }
}
```

**Response (Conflict Detected):**
```json
{
  "success": true,
  "message": "Event creation confirmed",
  "data": {
    "threadId": "thread-1234567890-abc123",
    "status": "checking_conflicts",
    "message": "⚠️ Time conflict detected! You have another event at this time. What would you like to do?",
    "suggestedResponses": [
      "Change time to 3pm",
      "Cancel this event",
      "Create anyway"
    ],
    "interrupt": {
      "type": "conflict_resolution",
      "payload": {
        "conflictDetails": "Meeting with John (2pm - 3pm)"
      }
    }
  }
}
```

## Usage Example

```typescript
// 1. Start conversation
const startResponse = await fetch('/api/chat/event/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Create a meeting tomorrow at 2pm",
    workspaceId: "workspace-123"
  })
});

const { data } = await startResponse.json();
const threadId = data.threadId;

// 2. If missing info, respond with details
if (data.status === 'collecting_info') {
  const respondResponse = await fetch('/api/chat/event/respond', {
    method: 'POST',
    body: JSON.stringify({
      threadId,
      response: "Until 3pm in Room A"
    })
  });
}

// 3. Confirm event creation
const confirmResponse = await fetch('/api/chat/event/confirm', {
  method: 'POST',
  body: JSON.stringify({
    threadId,
    confirmed: true
  })
});

const result = await confirmResponse.json();
console.log(result.data.message); // "✅ Event created successfully!"
```

## State Management

### Thread Lifecycle

1. **Session Start**: `/event/start` creates a new thread with unique `threadId`
2. **In-Memory Persistence**: `MemorySaver` maintains state during interrupts
3. **Session End**: Memory cleared after reaching `END` node (completed/failed/cancelled)

### State Schema

```typescript
{
  messages: [{ role, content, timestamp }],
  intent: "create_event" | "update_event" | ...,
  extractedEventData: Partial<CreateEventInput>,
  missingFields: string[],
  status: "detecting_intent" | "collecting_info" | ...,
  responseMessage: string | null,
  suggestedResponses: string[],
  createdEventId: string | null,
  error: string | null,
  hasConflict: boolean,
  userId: string,
  workspaceId: string
}
```

## Testing Conflict Detection

To test the conflict resolution flow:

```json
POST /api/chat/event/start
{
  "message": "Meeting tomorrow at 2pm",
  "workspaceId": "workspace-123",
  "simulateConflict": true  // ← Enable conflict simulation
}
```

This will trigger the conflict interrupt after confirmation.

## Required Fields

Based on `Event` entity and `CreateEventDto`:

**Required:**
- `name` (string)
- `start` (ISO 8601 datetime)
- `end` (ISO 8601 datetime)
- `workspaceId` (UUID - from auth context)

**Optional:**
- `description`
- `location`
- `color` (hex code)
- `isAllDay` (boolean)
- `recurrenceRule` (iCal RRULE format)
- `tags` (string array)
- `assigneeIds` (string array)

## Error Handling

### Intent Detection Failure
- **Status**: `failed`
- **Message**: "I'm not sure what you're asking for. Could you please rephrase?"
- **Suggested Responses**: Example prompts

### Missing Data Loop
- **Status**: `collecting_info`
- **Behavior**: Loops until all required fields are provided
- **Message**: Lists missing fields

### Event Creation Failure
- **Status**: `failed`
- **Message**: "❌ Failed to create event. Please try again."
- **Error**: Detailed error message in `data.error`

## Next Steps

1. **Integrate with EventService**: Replace mock event creation with actual service call
2. **Implement Real Conflict Detection**: Query existing events for time overlaps
3. **Add Update/Delete Intents**: Extend workflow for other event operations
4. **Enhanced NLP**: Improve intent detection and entity extraction
5. **Multi-turn Conversations**: Support complex back-and-forth dialogues

## Implementation Notes

- **Zod Schema Validation**: Ensures type-safe structured output from LLM
- **LangGraph Interrupts**: Enable human-in-the-loop for missing data and confirmations
- **Stateful Threads**: Each conversation maintains state across multiple API calls
- **Conflict Placeholder**: Boolean flag for testing, ready for real implementation
