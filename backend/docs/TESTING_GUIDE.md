# Event Creation Chatbot - Testing Guide

Complete step-by-step testing scenarios using the unified chat endpoint with curl commands and expected responses.

## Prerequisites

```bash
# Set your base URL
export BASE_URL="http://localhost:8000"

# Set your authentication token (REQUIRED - all endpoints require JWT authentication)
export AUTH_TOKEN="your-jwt-token-here"

# Set your workspace ID
export WORKSPACE_ID="your-workspace-uuid-here"
```

**Important**: All chat endpoints require JWT authentication. Make sure you have a valid token before testing.

---

## Unified Chat Endpoint

The system now uses a **single unified endpoint** for all chat operations:

- **New conversations**: `POST /api/chat/message` with `message`, `userName`, `workspaceId`
- **Resume conversations**: `POST /api/chat/message` with `threadId`, `response`
- **Check status**: `POST /api/chat/status` with `threadId`

---

## Test Scenario 1: Complete Information (No Data Collection)

### Step 1: Start with Complete Event Details

```bash
curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "message": "Create a team meeting tomorrow at 2pm until 3pm in Conference Room A",
    "userName": "John Doe",
    "workspaceId": "'"$WORKSPACE_ID"'",
    "simulateConflict": false
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Message processed",
  "data": {
    "threadId": "thread-1234567890-abc123",
    "status": "awaiting_confirmation",
    "message": "📅 Event Summary:\n• Name: Team meeting\n• Start: tomorrow at 2pm\n• End: tomorrow at 3pm\n• Location: Conference Room A\n\nWould you like to create this event?",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "suggestedResponses": ["Yes, create it", "No, cancel", "Let me modify it"],
    "interrupt": {
      "type": "confirm",
      "payload": {
        "message": "📅 Event Summary:...",
        "action": "confirm_event",
        "eventData": {
          "name": "Team meeting",
          "start": "tomorrow at 2pm",
          "end": "tomorrow at 3pm",
          "location": "Conference Room A"
        },
        "suggestedResponses": ["Yes, create it", "No, cancel", "Let me modify it"]
      }
    }
  },
  "timestamp": "2025-10-27T10:30:00.000Z"
}
```

### Step 2: Confirm Event Creation

```bash
# Save the threadId from previous response
export THREAD_ID="thread-1234567890-abc123"

curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "threadId": "'"$THREAD_ID"'",
    "response": "Yes, create it"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Response processed",
  "data": {
    "threadId": "thread-1234567890-abc123",
    "status": "completed",
    "message": "✅ Event \"Team meeting\" created successfully!",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "suggestedResponses": [
      "Create another event",
      "View my events",
      "Update this event"
    ],
    "data": {
      "eventId": "mock-event-id-1234567890"
    }
  },
  "timestamp": "2025-10-27T10:30:15.000Z"
}
```

---

## Test Scenario 2: Missing Information (Interrupt for Data Collection)

### Step 1: Start with Incomplete Information

```bash
curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "message": "Schedule a dentist appointment next Friday",
    "userName": "Jane Smith",
    "workspaceId": "'"$WORKSPACE_ID"'"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Message processed",
  "data": {
    "threadId": "thread-9876543210-xyz789",
    "status": "collecting_info",
    "message": "I need some more information to create this event. Please provide: start date and time, end date and time",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "missingFields": ["start", "end"],
    "suggestedResponses": [
      "Tomorrow at 2pm to 3pm",
      "Next Monday 9am for 1 hour",
      "Friday afternoon"
    ],
    "interrupt": {
      "type": "collect_info",
      "payload": {
        "message": "I need some more information to create this event. Please provide: start date and time, end date and time",
        "missingFields": ["start", "end"],
        "currentData": {
          "name": "Dentist appointment"
        },
        "suggestedResponses": [
          "Tomorrow at 2pm to 3pm",
          "Next Monday 9am for 1 hour",
          "Friday afternoon"
        ]
      }
    }
  },
  "timestamp": "2025-10-27T10:35:00.000Z"
}
```

### Step 2: Provide Missing Time Information

```bash
export THREAD_ID="thread-9876543210-xyz789"

curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "threadId": "'"$THREAD_ID"'",
    "response": "At 2pm for 1 hour"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Response processed",
  "data": {
    "threadId": "thread-9876543210-xyz789",
    "status": "awaiting_confirmation",
    "message": "📅 Event Summary:\n• Name: Dentist appointment\n• Start: next Friday at 2pm\n• End: next Friday at 3pm\n\nWould you like to create this event?",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "missingFields": [],
    "suggestedResponses": ["Yes, create it", "No, cancel", "Let me modify it"],
    "interrupt": {
      "type": "confirm",
      "payload": {
        "message": "📅 Event Summary:...",
        "action": "confirm_event",
        "eventData": {
          "name": "Dentist appointment",
          "start": "next Friday at 2pm",
          "end": "next Friday at 3pm"
        },
        "suggestedResponses": ["Yes, create it", "No, cancel", "Let me modify it"]
      }
    }
  },
  "timestamp": "2025-10-27T10:35:10.000Z"
}
```

### Step 3: Confirm Event

```bash
curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "threadId": "'"$THREAD_ID"'",
    "response": true
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Response processed",
  "data": {
    "threadId": "thread-9876543210-xyz789",
    "status": "completed",
    "message": "✅ Event \"Dentist appointment\" created successfully!",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "data": {
      "eventId": "mock-event-id-9876543210"
    }
  },
  "timestamp": "2025-10-27T10:35:20.000Z"
}
```

---

## Test Scenario 3: Conflict Detection (Interrupt for Resolution)

### Step 1: Start with Conflict Simulation Enabled

```bash
curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "message": "Create a project review meeting tomorrow at 2pm to 3pm",
    "userName": "Alex Johnson",
    "workspaceId": "'"$WORKSPACE_ID"'",
    "simulateConflict": true
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Message processed",
  "data": {
    "threadId": "thread-5555555555-conflict",
    "status": "awaiting_confirmation",
    "message": "📅 Event Summary:\n• Name: Project review meeting\n• Start: tomorrow at 2pm\n• End: tomorrow at 3pm\n\nWould you like to create this event?",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "interrupt": {
      "type": "confirm",
      "payload": {
        "message": "📅 Event Summary:...",
        "action": "confirm_event",
        "eventData": {
          "name": "Project review meeting",
          "start": "tomorrow at 2pm",
          "end": "tomorrow at 3pm"
        }
      }
    }
  },
  "timestamp": "2025-10-27T10:40:00.000Z"
}
```

### Step 2: Confirm (This Triggers Conflict Check)

```bash
export THREAD_ID="thread-5555555555-conflict"

curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "threadId": "'"$THREAD_ID"'",
    "response": "Yes"
  }'
```

**Expected Response (Conflict Detected):**

```json
{
  "success": true,
  "message": "Response processed",
  "data": {
    "threadId": "thread-5555555555-conflict",
    "status": "checking_conflicts",
    "message": "⚠️ Time conflict detected! You have another event at this time. What would you like to do?",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "suggestedResponses": [
      "Change time to 3pm",
      "Cancel this event",
      "Create anyway"
    ],
    "interrupt": {
      "type": "conflict_resolution",
      "payload": {
        "message": "⚠️ Time conflict detected! You have another event at this time. What would you like to do?",
        "conflictDetails": "Meeting with John (2pm - 3pm)",
        "suggestedResponses": [
          "Change time to 3pm",
          "Cancel this event",
          "Create anyway"
        ]
      }
    }
  },
  "timestamp": "2025-10-27T10:40:05.000Z"
}
```

### Step 3: Resolve Conflict - Option A: Change Time

```bash
curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "threadId": "'"$THREAD_ID"'",
    "response": "Change time to 3pm"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Response processed",
  "data": {
    "threadId": "thread-5555555555-conflict",
    "status": "completed",
    "message": "✅ Event \"Project review meeting\" created successfully!",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "data": {
      "eventId": "mock-event-id-5555555555"
    }
  },
  "timestamp": "2025-10-27T10:40:15.000Z"
}
```

### Step 3: Resolve Conflict - Option B: Cancel

```bash
curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "threadId": "'"$THREAD_ID"'",
    "response": "Cancel this event"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Response processed",
  "data": {
    "threadId": "thread-5555555555-conflict",
    "status": "cancelled",
    "message": "Event creation cancelled due to conflict.",
    "intent": "create_event",
    "currentWorkflow": "event_creation"
  },
  "timestamp": "2025-10-27T10:40:15.000Z"
}
```

---

## Test Scenario 4: User Cancels During Confirmation

### Step 1: Start Event Creation

```bash
curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "message": "Birthday party on Saturday at 7pm",
    "userName": "Sarah Wilson",
    "workspaceId": "'"$WORKSPACE_ID"'"
  }'
```

### Step 2: Provide Missing End Time

```bash
export THREAD_ID="<threadId-from-response>"

curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "threadId": "'"$THREAD_ID"'",
    "response": "Until 10pm"
  }'
```

### Step 3: Cancel During Confirmation

```bash
curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "threadId": "'"$THREAD_ID"'",
    "response": "No, cancel"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Response processed",
  "data": {
    "threadId": "<threadId>",
    "status": "cancelled",
    "message": "Event creation cancelled.",
    "intent": "create_event",
    "currentWorkflow": "event_creation"
  },
  "timestamp": "2025-10-27T10:45:00.000Z"
}
```

---

## Test Scenario 5: Complex Event with All Fields

### Complete Event with Tags, Location, Description

```bash
curl -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "message": "Create a quarterly business review meeting next Monday from 9am to 11am in the main boardroom. This is for Q4 planning. Invite Sarah and Michael. Tag it as urgent and important.",
    "userName": "CEO",
    "workspaceId": "'"$WORKSPACE_ID"'"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Message processed",
  "data": {
    "threadId": "thread-complex-event",
    "status": "awaiting_confirmation",
    "message": "📅 Event Summary:\n• Name: Quarterly business review meeting\n• Start: next Monday at 9am\n• End: next Monday at 11am\n• Description: Q4 planning\n• Location: Main boardroom\n• Tags: urgent, important\n\nWould you like to create this event?",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "interrupt": {
      "type": "confirm",
      "payload": {
        "message": "📅 Event Summary:...",
        "action": "confirm_event",
        "eventData": {
          "name": "Quarterly business review meeting",
          "description": "Q4 planning",
          "start": "next Monday at 9am",
          "end": "next Monday at 11am",
          "location": "Main boardroom",
          "tags": ["urgent", "important"],
          "assigneeIds": ["Sarah", "Michael"]
        }
      }
    }
  },
  "timestamp": "2025-10-27T10:50:00.000Z"
}
```

---

## Test Scenario 6: Check Conversation Status

### Get Current Status of a Conversation

```bash
curl -X POST "$BASE_URL/api/chat/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "threadId": "thread-1234567890-abc123"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Status retrieved successfully",
  "data": {
    "threadId": "thread-1234567890-abc123",
    "status": "awaiting_confirmation",
    "message": "📅 Event Summary:\n• Name: Team meeting\n• Start: tomorrow at 2pm\n• End: tomorrow at 3pm\n\nWould you like to create this event?",
    "intent": "create_event",
    "currentWorkflow": "event_creation",
    "interrupt": {
      "type": "confirm",
      "payload": {
        "message": "📅 Event Summary:...",
        "action": "confirm_event",
        "eventData": {...}
      }
    }
  },
  "timestamp": "2025-10-27T10:52:00.000Z"
}
```

---

## Quick Test Script

Save this as `test-chatbot.sh`:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:8000"
AUTH_TOKEN="your-jwt-token"
WORKSPACE_ID="your-workspace-id"

# Test 1: Complete Event
echo "========================================="
echo "Test 1: Complete Event Creation"
echo "========================================="
RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"message\": \"Create a team meeting tomorrow at 2pm until 3pm\",
    \"userName\": \"Test User\",
    \"workspaceId\": \"$WORKSPACE_ID\"
  }")

echo "$RESPONSE" | jq '.'

THREAD_ID=$(echo "$RESPONSE" | jq -r '.data.threadId')
echo "Thread ID: $THREAD_ID"

# Confirm
echo -e "\nConfirming event..."
curl -s -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"threadId\": \"$THREAD_ID\",
    \"response\": true
  }" | jq '.'

echo -e "\n✅ Test 1 Complete\n"

# Test 2: Missing Information
echo "========================================="
echo "Test 2: Missing Information"
echo "========================================="
RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"message\": \"Schedule a dentist appointment\",
    \"userName\": \"Test User\",
    \"workspaceId\": \"$WORKSPACE_ID\"
  }")

echo "$RESPONSE" | jq '.'

THREAD_ID=$(echo "$RESPONSE" | jq -r '.data.threadId')

# Provide missing info
echo -e "\nProviding missing information..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"threadId\": \"$THREAD_ID\",
    \"response\": \"Next Friday at 2pm for 1 hour\"
  }")

echo "$RESPONSE" | jq '.'

# Confirm
echo -e "\nConfirming event..."
curl -s -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"threadId\": \"$THREAD_ID\",
    \"response\": \"Yes, create it\"
  }" | jq '.'

echo -e "\n✅ Test 2 Complete\n"

# Test 3: Conflict Detection
echo "========================================="
echo "Test 3: Conflict Detection"
echo "========================================="
RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"message\": \"Create a meeting tomorrow at 2pm to 3pm\",
    \"userName\": \"Test User\",
    \"workspaceId\": \"$WORKSPACE_ID\",
    \"simulateConflict\": true
  }")

echo "$RESPONSE" | jq '.'

THREAD_ID=$(echo "$RESPONSE" | jq -r '.data.threadId')

# Confirm to trigger conflict
echo -e "\nConfirming (will trigger conflict)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"threadId\": \"$THREAD_ID\",
    \"response\": true
  }")

echo "$RESPONSE" | jq '.'

# Resolve conflict
echo -e "\nResolving conflict..."
curl -s -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"threadId\": \"$THREAD_ID\",
    \"response\": \"Create anyway\"
  }" | jq '.'

echo -e "\n✅ Test 3 Complete\n"
```

Make it executable and run:

```bash
chmod +x test-chatbot.sh
./test-chatbot.sh
```

---

## Expected Interrupt Flow Summary

| Scenario          | Interrupts                      | API Calls                            |
| ----------------- | ------------------------------- | ------------------------------------ |
| Complete info     | 1 (confirmation)                | message → message (confirm)          |
| Missing info      | 2 (collect info + confirm)      | message → message (data) → message (confirm) |
| Conflict detected | 3 (collect + confirm + resolve) | message → message (data) → message (confirm) → message (resolve) |
| User cancels      | 1 (confirmation declined)       | message → message (cancel)           |

---

## API Endpoint Summary

### Unified Chat Endpoint

**POST /api/chat/message**

**For New Conversations:**
```json
{
  "message": "Create a meeting tomorrow at 2pm",
  "userName": "John Doe",
  "workspaceId": "workspace-123",
  "simulateConflict": false  // optional
}
```

**For Resuming Conversations:**
```json
{
  "threadId": "thread-1234567890-abc123",
  "response": "Yes, create it"  // can be string or boolean
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Message processed" | "Response processed",
  "data": {
    "threadId": "string",
    "status": "detecting_intent" | "collecting_info" | "awaiting_confirmation" | "checking_conflicts" | "creating_event" | "completed" | "failed" | "cancelled",
    "message": "string | null",
    "intent": "create_event" | "update_event" | "delete_event" | "query_events" | "unknown",
    "currentWorkflow": "event_creation" | "common_reply" | "general" | null,
    "interrupt": {
      "type": "collect_info" | "confirm" | "conflict_resolution",
      "payload": {}
    },
    "missingFields": ["string"],
    "suggestedResponses": ["string"],
    "data": {},
    "error": "string"
  },
  "timestamp": "ISO-8601 string"
}
```

### Status Check Endpoint

**POST /api/chat/status**

```json
{
  "threadId": "thread-1234567890-abc123"
}
```

---

## Troubleshooting

### No Response from Server

```bash
# Check if server is running
curl -s "$BASE_URL/health" || echo "Server not responding"
```

### Authentication Issues

```bash
# Verify token format
echo "Authorization: Bearer $AUTH_TOKEN"

# Test with verbose output
curl -v -X POST "$BASE_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"message": "test", "userName": "test", "workspaceId": "test"}'
```

### Thread ID Not Found

```bash
# Use status endpoint to check if thread exists
curl -X POST "$BASE_URL/api/chat/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"threadId": "'"$THREAD_ID"'"}'
```

### View Full Error Details

```bash
# Add verbose flag
curl -v -X POST "$BASE_URL/api/chat/message" ...
```

---

## Next Steps

1. ✅ Test each scenario in order
2. ✅ Verify interrupt payloads match expected format
3. ✅ Test conflict simulation toggle
4. ✅ Validate thread persistence across requests
5. 🔲 Integrate real EventService for database persistence
6. 🔲 Add more workflows (common reply, task creation)
7. 🔲 Implement real conflict detection with database queries
