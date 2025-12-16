import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { AppDataSource } from "../data-source";
import { EvaluationService } from "./evaluation.service";
import { PromptService } from "./prompt.service";
import { Session } from "../entities/session.entity";
import { PromptType } from "../entities/ai-prompt.entity";
import { LangchainService } from "./langchain.service";

// Lazy-initialized Redis connection and Queue
let redisConnection: Redis | null = null;
let evaluationQueue: Queue | null = null;

/**
 * Get or create the Redis connection lazily
 */
function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        maxRetriesPerRequest: null,
      }
    );
  }
  return redisConnection;
}

/**
 * Get or create the evaluation queue lazily
 */
function getEvaluationQueue(): Queue {
  if (!evaluationQueue) {
    evaluationQueue = new Queue("ai-evaluation", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 100,
        attempts: 1,
      },
    });
  }
  return evaluationQueue;
}

/**
 * Schedule the batch evaluation job
 * @param intervalMs - Interval in milliseconds (default: 1 hour)
 */
export async function scheduleBatchEvaluation(
  intervalMs: number = 60 * 60 * 1000
): Promise<void> {
  const queue = getEvaluationQueue();

  // Add a repeatable job
  await queue.add(
    "evaluate-batch",
    {},
    {
      repeat: {
        every: intervalMs,
      },
      jobId: "batch-evaluation-job", // Unique ID to prevent duplicates
    }
  );

  console.log(`Scheduled batch evaluation every ${intervalMs}ms`);
}

/**
 * Initialize the evaluation worker
 */
export function initializeEvaluationWorker(): Worker {
  const langchainService = new LangchainService();
  const promptService = new PromptService();
  const evaluationService = new EvaluationService(
    langchainService,
    promptService
  );
  const sessionRepository = AppDataSource.getRepository(Session);

  const worker = new Worker(
    "ai-evaluation",
    async (job: Job) => {
      console.log("Processing batch evaluation job...");

      try {
        // 1. Get the latest system prompt
        const latestPrompt = await promptService.getLatestPrompt(
          PromptType.SYSTEM
        );

        if (!latestPrompt) {
          console.log("No system prompt found. Skipping evaluation.");
          return;
        }

        // 2. Find ALL sessions that used this specific prompt version
        // Evaluate all conversations conducted with the current prompt to determine
        // if THIS prompt version is effective
        const allSessionsWithPrompt = await sessionRepository.find({
          where: {
            promptId: latestPrompt.id,
          },
          relations: ["messages"],
          order: {
            updatedAt: "DESC",
          },
        });

        if (allSessionsWithPrompt.length === 0) {
          console.log("No sessions found using current prompt.");
          return;
        }

        console.log(`Evaluating ${allSessionsWithPrompt.length} sessions using current prompt...`);

        // 3. Trigger batch evaluation
        await evaluationService.evaluateBatch(allSessionsWithPrompt, latestPrompt);

        console.log("Batch evaluation completed.");
      } catch (error) {
        console.error("Error in batch evaluation job:", error);
        throw error;
      }
    },
    { connection: getRedisConnection() }
  );

  worker.on("completed", (job) => {
    console.log(`Evaluation job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Evaluation job ${job?.id} failed:`, error);
  });

  console.log("Evaluation worker initialized");

  return worker;
}
