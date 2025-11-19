import { SenderType } from "../enums/role.enum";

export type IntentDetectionResult = {
  intent: string;
  confidence: number;
};
