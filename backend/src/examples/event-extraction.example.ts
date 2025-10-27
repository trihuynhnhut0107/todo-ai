/**
 * Example usage of the LangchainService with structured output
 * Demonstrates how to extract event information from natural language
 */

import { LangchainService } from "../services/langchain.service";
import { CreateEventInput } from "../schemas/event.schema";

async function runExamples() {
  const langchainService = new LangchainService();

  // Example 1: Simple meeting
  console.log("\n=== Example 1: Simple Meeting ===");
  const example1 = await langchainService.extractEventData(
    "I have a meeting at 6am tomorrow"
  );
  console.log(JSON.stringify(example1, null, 2));
  // Expected output:
  // {
  //   "name": "Meeting",
  //   "start": "2025-10-24T06:00:00",
  //   "end": "2025-10-24T07:00:00"
  // }

  // Example 2: Detailed appointment
  console.log("\n=== Example 2: Detailed Appointment ===");
  const example2 = await langchainService.extractEventData(
    "Dentist appointment next Friday at 2pm for teeth cleaning"
  );
  console.log(JSON.stringify(example2, null, 2));
  // Expected output:
  // {
  //   "name": "Dentist appointment",
  //   "description": "Teeth cleaning",
  //   "start": "2025-10-25T14:00:00",
  //   "end": "2025-10-25T15:00:00",
  //   "tags": ["health"]
  // }

  // Example 3: Recurring event
  console.log("\n=== Example 3: Recurring Event ===");
  const example3 = await langchainService.extractEventData(
    "Team standup every weekday at 9am in conference room A"
  );
  console.log(JSON.stringify(example3, null, 2));
  // Expected output:
  // {
  //   "name": "Team standup",
  //   "start": "2025-10-24T09:00:00",
  //   "end": "2025-10-24T09:15:00",
  //   "location": "Conference room A",
  //   "recurrenceRule": "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR",
  //   "tags": ["work", "meeting"]
  // }

  // Example 4: All-day event
  console.log("\n=== Example 4: All-day Event ===");
  const example4 = await langchainService.extractEventData(
    "Family vacation in Hawaii from Dec 20 to Dec 27"
  );
  console.log(JSON.stringify(example4, null, 2));
  // Expected output:
  // {
  //   "name": "Family vacation in Hawaii",
  //   "start": "2025-12-20T00:00:00",
  //   "end": "2025-12-27T23:59:59",
  //   "location": "Hawaii",
  //   "isAllDay": true,
  //   "tags": ["personal", "vacation"]
  // }

  // Example 5: Event with assignees
  console.log("\n=== Example 5: Event with Assignees ===");
  const example5 = await langchainService.extractEventData(
    "Birthday party for Sarah at 7pm Saturday at my place, invite John and Mike"
  );
  console.log(JSON.stringify(example5, null, 2));
  // Expected output:
  // {
  //   "name": "Birthday party for Sarah",
  //   "start": "2025-10-26T19:00:00",
  //   "end": "2025-10-26T22:00:00",
  //   "location": "My place",
  //   "tags": ["personal", "celebration"],
  //   "assigneeIds": ["John", "Mike"]
  // }
}

// Type-safe usage example
async function typeSafeExample() {
  const langchainService = new LangchainService();

  // TypeScript knows the exact shape of the returned data
  const eventData: CreateEventInput = await langchainService.extractEventData(
    "Project kickoff meeting tomorrow at 10am"
  );

  // Type-safe property access
  console.log(`Event: ${eventData.name}`);
  console.log(`Starts: ${eventData.start}`);
  console.log(`Ends: ${eventData.end}`);

  // Optional properties are properly typed
  if (eventData.location) {
    console.log(`Location: ${eventData.location}`);
  }

  if (eventData.tags && eventData.tags.length > 0) {
    console.log(`Tags: ${eventData.tags.join(", ")}`);
  }
}

// Uncomment to run examples
// runExamples().catch(console.error);
// typeSafeExample().catch(console.error);

export { runExamples, typeSafeExample };
