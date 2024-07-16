import { Topic } from "@prisma/client";

export type TopicAndSubtopics = Topic & { subtopics: Topic[] };
export interface QuizCount {
    topicId: number;
    _count: {
      topicId: number
    };
  }