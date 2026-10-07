import { Topic } from "@prisma/client";

export type TopicAndTopics = Topic & { topics: Topic[] };
export interface QuizCount {
    topicId: number | null;
    _count: {
      topicId: number
    };
    availableCount: number;
  }
