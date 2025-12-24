// एक common types file बनाएं, जैसे types/index.ts या interfaces/log.interface.ts

export interface LogEntry {
  id: string;
  status: "Sent" | "Failed" | "Error" | "Pending" | "Processing"; // Add all possible statuses
  // अन्य properties जो log में होते हैं
  timestamp?: Date;
  recipient?: string;
  error?: string;
  campaignId?: string;
  jobId?: string;
}

// type alias
export type LogStatus = "Sent" | "Failed" | "Error" | "Pending" | "Processing";

export interface LogEntry {
  id: string;
  status: LogStatus;
  // ... other properties
}