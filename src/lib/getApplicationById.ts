import type { Application } from "@/types/application";
import { applications } from "@/data/applications";

export function getApplicationById(id: string): Application | undefined {
  return applications.find((app) => app.id === id);
}
