import { createIvyInActionScenario } from "../scenarioCommonData";

export default createIvyInActionScenario({
  key: "what-needs-my-attention",
  path: "/ivy-in-action/what-needs-my-attention",
  query: "What needs my attention right now?",
  messages: {
    firstPass: "<strong>Highest immediate risk:</strong> identity access is the biggest concern right now.",
  },
});
