import teams from "@/data/teams.json";

export type Team = { id: string; ko: string; aliases: string[] };
export const TEAMS: Team[] = teams;
export const TEAM_BY_ID: Record<string, Team> = Object.fromEntries(TEAMS.map((t) => [t.id, t]));
