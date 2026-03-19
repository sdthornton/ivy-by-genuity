import { START_STATE_KEYS } from "./stepDefinitions";

export const START_VARIANT_BASE = {
  start: {
    stateKey: START_STATE_KEYS.start,
    type: "start",
    comments: [],
  },
  schedule: {
    stateKey: START_STATE_KEYS.schedule,
    type: "schedule",
    comments: [
      { author: "You", body: "Keep this at 9:00 am local time.", stamp: "Feb 26, 8:59 AM" },
    ],
  },
  trigger: {
    stateKey: START_STATE_KEYS.trigger,
    type: "trigger",
    comments: [],
  },
};
