/**
 * LangSmith Offline Evaluation for Agent Tool Calls
 *
 * This evaluation tests that the agent correctly identifies and calls
 * the expected tools based on user input.
 *
 * Run with: npm run eval
 */

import "reflect-metadata";
import "dotenv/config";
import { Client } from "langsmith";
import { evaluate, EvaluationResult } from "langsmith/evaluation";
import { Run, Example } from "langsmith/schemas";
import { HumanMessage } from "@langchain/core/messages";
import { LangchainService } from "../langchain.service";
import {
  agentEvaluationDataset,
  DATASET_NAME,
  DATASET_DESCRIPTION,
} from "./agent-evaluation.dataset";

// Initialize LangSmith client
const client = new Client();

// Initialize service (will be set up before tests)
let langchainService: LangchainService;

/**
 * Target function that wraps the agent for evaluation
 * This is what LangSmith will call for each example
 */
async function agentTarget(
  inputs: Record<string, any>
): Promise<Record<string, any>> {
  const messages = [new HumanMessage(inputs.input)];
  const result = await langchainService.generateAgentResponse(
    messages,
    inputs.userId
  );
  return {
    response: result.response,
    toolsUsed: result.toolsUsed,
  };
}

/**
 * Custom evaluator: checks if expected tools were called
 * Returns a score of 1.0 if all expected tools are present, 0.0 otherwise
 */
function toolCallEvaluator(args: {
  run: Run;
  example: Example;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  referenceOutputs?: Record<string, any>;
}): EvaluationResult {
  const { outputs, referenceOutputs } = args;

  if (!outputs || !referenceOutputs) {
    return {
      key: "correct_tool_call",
      score: 0,
      comment: "Missing outputs or reference outputs",
    };
  }

  const expectedTools: string[] = referenceOutputs.expectedTools || [];
  const actualTools: string[] = outputs.toolsUsed || [];

  // Check if all expected tools were called
  const allExpectedToolsCalled = expectedTools.every((expected) =>
    actualTools.some(
      (actual) => actual.toLowerCase() === expected.toLowerCase()
    )
  );

  return {
    key: "correct_tool_call",
    score: allExpectedToolsCalled ? 1.0 : 0.0,
    comment: allExpectedToolsCalled
      ? `Correctly called: ${actualTools.join(", ")}`
      : `Expected: [${expectedTools.join(", ")}], Got: [${actualTools.join(
          ", "
        )}]`,
  };
}

/**
 * Secondary evaluator: checks tool call precision
 * Ensures the agent doesn't call unnecessary tools
 */
function toolPrecisionEvaluator(args: {
  run: Run;
  example: Example;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  referenceOutputs?: Record<string, any>;
}): EvaluationResult {
  const { outputs, referenceOutputs } = args;

  if (!outputs || !referenceOutputs) {
    return {
      key: "tool_precision",
      score: 0,
      comment: "Missing outputs or reference outputs",
    };
  }

  const expectedTools: string[] = referenceOutputs.expectedTools || [];
  const actualTools: string[] = outputs.toolsUsed || [];

  if (actualTools.length === 0) {
    return {
      key: "tool_precision",
      score: expectedTools.length === 0 ? 1.0 : 0.0,
      comment:
        expectedTools.length === 0
          ? "No tools expected or called"
          : "Expected tools but none were called",
    };
  }

  // Calculate precision: what fraction of called tools were expected
  const correctCalls = actualTools.filter((actual) =>
    expectedTools.some(
      (expected) => actual.toLowerCase() === expected.toLowerCase()
    )
  ).length;

  const precision = correctCalls / actualTools.length;

  return {
    key: "tool_precision",
    score: precision,
    comment: `${correctCalls}/${actualTools.length} tools were expected`,
  };
}

/**
 * Create or update the evaluation dataset in LangSmith
 */
async function ensureDatasetExists(): Promise<string> {
  // Check if dataset already exists
  const datasets = await client.listDatasets({ datasetName: DATASET_NAME });
  let dataset;

  for await (const ds of datasets) {
    if (ds.name === DATASET_NAME) {
      dataset = ds;
      break;
    }
  }

  if (!dataset) {
    // Create new dataset
    dataset = await client.createDataset(DATASET_NAME, {
      description: DATASET_DESCRIPTION,
    });
    console.log(`Created new dataset: ${DATASET_NAME}`);
  } else {
    console.log(`Using existing dataset: ${DATASET_NAME}`);
  }

  // Create examples in the dataset
  const existingExamples = [];
  for await (const example of client.listExamples({
    datasetId: dataset.id,
  })) {
    existingExamples.push(example);
  }

  // Only add examples if dataset is empty
  if (existingExamples.length === 0) {
    console.log(
      `Adding ${agentEvaluationDataset.length} examples to dataset...`
    );

    for (const example of agentEvaluationDataset) {
      await client.createExample(
        {
          input: example.input,
          userId: "eval-user-001", // Fixed user ID for evaluation
        },
        {
          expectedTools: example.expectedTools,
        },
        {
          datasetId: dataset.id,
          metadata: { description: example.description },
        }
      );
    }
    console.log("Examples added successfully");
  } else {
    console.log(`Dataset already has ${existingExamples.length} examples`);
  }

  return dataset.id;
}

/**
 * Run the evaluation
 */
async function runEvaluation(): Promise<void> {
  console.log("🚀 Starting LangSmith Agent Evaluation");
  console.log("=====================================\n");

  // Validate environment
  if (!process.env.LANGSMITH_API_KEY) {
    throw new Error("LANGSMITH_API_KEY environment variable is required");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  // Initialize the LangChain service
  console.log("Initializing LangchainService...");
  langchainService = new LangchainService();

  // Ensure dataset exists
  console.log("\nSetting up evaluation dataset...");
  await ensureDatasetExists();

  // Run evaluation
  console.log("\n📊 Running evaluation...\n");

  const results = await evaluate(agentTarget, {
    data: DATASET_NAME,
    evaluators: [toolCallEvaluator, toolPrecisionEvaluator],
    experimentPrefix: "agent-tool-calls",
    metadata: {
      model: "gpt-3.5-turbo",
      evaluationType: "tool-call-accuracy",
      timestamp: new Date().toISOString(),
    },
  });

  console.log("\n✅ Evaluation complete!");
  console.log("View results in LangSmith dashboard:");
  console.log(`https://smith.langchain.com/projects`);
}

// Run if executed directly
runEvaluation().catch((error) => {
  console.error("❌ Evaluation failed:", error);
  process.exit(1);
});
