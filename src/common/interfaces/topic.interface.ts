import { Topic } from "@prisma/client";

export type TopicAndTopics = Topic & { topics: Topic[] };
export interface QuizCount {
    topicId: number;
    _count: {
      topicId: number
    };
  }