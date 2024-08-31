import { Topic, User } from "@prisma/client";

export type UserNotSensitive = Omit<User, "role" | "subscription_id" | "password">;