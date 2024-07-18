import { Info } from "@prisma/client";

export type InfoOmitId = Omit<Info, "id">