import { AGGRESSIVE_BEHAVIOR } from "./aggressive-behavior.js";
import { CAUTIOUS_BEHAVIOR } from "./cautious-behavior.js";
import { COLLECTOR_BEHAVIOR } from "./collector-behavior.js";
import { OPPORTUNIST_BEHAVIOR } from "./opportunist-behavior.js";

export const BOT_PROFILES = Object.freeze([
  COLLECTOR_BEHAVIOR,
  CAUTIOUS_BEHAVIOR,
  AGGRESSIVE_BEHAVIOR,
  OPPORTUNIST_BEHAVIOR,
]);
