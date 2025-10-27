# Chat Service Implementation

## Overview

This document describes the implementation of the Chat Service and its integration with the Chat Controller for handling event creation workflows.

## Architecture

### Service Layer (`chat.service.ts`)

The `ChatService` encapsulates all business logic for managing event creation workflows using LangGraph. This follows the separation of concerns principle where:

- **Service Layer**: Handles all workflow logic, state management, and data processing
- **Controller Layer**: Handles HTTP requests/responses and delegates to services

### Key Components

#### 1. ChatService Class

Located at: `/backend/src/services/chat.service.ts`

**Responsibilities:**

- Manage event creation workflow lifecycle
- Handle thread/session management
- Process workflow interrupts and responses
- Format workflow results into standardized responses

**Public Methods:**

##### `startEventCreation(input: StartEventCreationInput): Promise<ChatEventResponse>`

Initiates a new event creation conversation.

**Parameters:**

- `message`: User's initial message
- `workspaceId`: Target workspace ID
- `userId`: Current user ID
- `simulateConflict`: Optional flag for testing conflict scenarios

**Returns:** Formatted chat response with thread ID, status, and any interrupts

##### `respondToBot(input: RespondToBotInput): Promise<ChatEventResponse>`

Processes user's response to a workflow interrupt (e.g., providing missing information).

**Parameters:**

- `threadId`: Active conversation thread
- `response`: User's response (string or boolean)

**Returns:** Updated chat state with next steps

##### `confirmEvent(input: ConfirmEventInput): Promise<ChatEventResponse>`

Handles final confirmation or cancellation of event creation.

**Parameters:**

- `threadId`: Active conversation thread
- `confirmed`: User's confirmation decision

**Returns:** Final workflow result with created event ID or cancellation status

##### `getChatStatus(threadId: string): Promise<ChatEventResponse | null>`

Retrieves current state of an active conversation (utility method).

**Private Methods:**

- `generateThreadId()`: Creates unique thread identifiers
- `formatWorkflowResponse()`: Standardizes workflow results into consistent response format

#### 2. ChatController Class

Located at: `/backend/src/controllers/chat.controller.ts`

**Changes Made:**

- Removed all workflow logic and state management
- Added `chatService` instance
- Simplified all event-related endpoints to delegate to service methods
- Maintained minimal logic: validation, error handling, and response formatting

**Endpoints:**

1. **POST /api/chat/event/start** - Start event creation

   - Delegates to `chatService.startEventCreation()`
   - Returns thread ID and initial workflow state

2. **POST /api/chat/event/respond** - Respond to workflow prompts

   - Delegates to `chatService.respondToBot()`
   - Returns updated workflow state

3. **POST /api/chat/event/confirm** - Confirm/cancel event
   - Delegates to `chatService.confirmEvent()`
   - Returns final result with event ID or cancellation

## Type Definitions

### WorkflowResult Type

Internal type representing LangGraph workflow results with interrupt support:

```typescript
type WorkflowResult = ChatStateType & {
  __interrupt__?: Array<{
    value: {
      message?: string;
      missingFields?: string[];
      currentData?: unknown;
      eventData?: unknown;
      suggestedResponses?: string[];
      action?: string;
      conflictDetails?: string;
    };
  }>;
};
```

### ChatEventResponse Interface

Standardized response format for all chat operations:

```typescript
interface ChatEventResponse {
  threadId: string;
  status: ChatState["status"];
  message: string | null;
  missingFields?: string[];
  suggestedResponses?: string[];
  eventData?: unknown;
  interrupt?: { type: string; payload: unknown };
}
```

## Workflow Integration

The service integrates with the event creation workflow (`event-creation.workflow.ts`) which handles:

1. **Intent Detection**: Analyzes user input
2. **Information Collection**: Gathers missing event details
3. **Event Confirmation**: Presents summary and requests approval
4. **Conflict Detection**: Checks for scheduling conflicts
5. **Event Creation**: Persists event to database

## Benefits of This Architecture

### 1. Separation of Concerns

- **Controllers**: HTTP layer only (request/response handling)
- **Services**: Business logic and workflow orchestration
- **Workflows**: State machine and AI processing

### 2. Testability

- Service methods can be unit tested independently
- Controllers can be tested with mocked services
- Workflows can be tested in isolation

### 3. Reusability

- Service methods can be called from multiple controllers
- Service logic can be used by other services
- No duplication of workflow management code

### 4. Maintainability

- Clear single responsibility for each layer
- Changes to workflow logic isolated to service
- Easy to add new endpoints or workflow types

### 5. Type Safety

- Strong typing throughout with TypeScript interfaces
- Clear input/output contracts
- Compile-time error detection

## Usage Example

```typescript
// In controller (simplified)
const result = await this.chatService.startEventCreation({
  message: "Create meeting tomorrow at 2pm",
  workspaceId: "workspace-123",
  userId: "user-456",
});

// Service handles all workflow logic internally
// Returns standardized response ready for API
```

## Future Enhancements

1. **Caching**: Add Redis for session state persistence
2. **Analytics**: Track workflow completion rates and bottlenecks
3. **Multi-workflow**: Extend service to support other workflow types
4. **Middleware**: Add rate limiting and request validation
5. **Logging**: Enhanced structured logging for debugging
6. **Error Recovery**: Implement retry logic and graceful degradation

## Testing Strategy

### Unit Tests

- Test each service method independently
- Mock workflow dependencies
- Verify response formatting logic

### Integration Tests

- Test controller → service integration
- Verify workflow state transitions
- Test interrupt handling flows

### E2E Tests

- Full conversation flows from start to completion
- Conflict resolution scenarios
- Error handling and edge cases
