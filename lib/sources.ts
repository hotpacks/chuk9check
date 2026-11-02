import sources from "@/data/sources.json";

export type Source = { id: string; name: string; color: string; feeds: string[] };
export const SOURCES: Source[] = sources;
export const SOURCE_BY_ID: Record<string, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));
