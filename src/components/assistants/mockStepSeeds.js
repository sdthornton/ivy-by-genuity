import { START_STATE_KEYS } from "./stepDefinitions";
import sharepointLogo from "../../assets/sharepoint.png";

export const BASE_FLOW_STEPS = [
  {
    id: 2,
    stateKey: "2",
    type: "lookup",
    title: "SP GetAudit Data",
    builderTitle: "Get SP Audit Data",
    sources: [{ label: "SharePoint", icon: sharepointLogo }],
    comments: [
      { author: "You", body: "Confirm this should run every weekday morning.", stamp: "Feb 26, 9:05 AM" },
    ],
    detailsCollapsed: false,
    connections: [3],
    x: 0,
    y: 84,
  },
  {
    id: 3,
    stateKey: "3",
    type: "code",
    title: "Prune Audit Data",
    rowKeys: ["Operation", "Target", "Code"],
    comments: [
      { author: "You", body: "Delete anything older than one week.", stamp: "Feb 26, 9:06 AM" },
    ],
    ivySays: "This code step removes SharePoint audit rows older than seven days.",
    detailsCollapsed: false,
    connections: [4],
    x: 0,
    y: 168,
  },
  {
    id: 4,
    stateKey: "4",
    type: "message",
    title: "Email Audit List",
    rowKeys: ["Message", "Destination", "Recipients/Channel"],
    comments: [
      { author: "You", body: "Use this as the final delivery step.", stamp: "Feb 26, 9:07 AM" },
    ],
    ivySays: "This message step sends the summarized audit result to your configured recipients.",
    detailsCollapsed: false,
    connections: [],
    x: 0,
    y: 252,
  },
];

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
