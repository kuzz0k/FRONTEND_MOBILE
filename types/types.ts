import { authSchema } from "@/constants/consts";
import { z } from "zod";

export type AuthType = z.infer<typeof authSchema>