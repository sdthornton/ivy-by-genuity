import { createIvyInActionScenario } from "../scenarioCommonData";

export default createIvyInActionScenario({
  key: "potentially-risky-users",
  path: "/ivy-in-action/potentially-risky-users",
  query: "Show me a list of potentially risky users.",
  messages: {
    firstPass: "<strong>Here&apos;s the initial risky-user view:</strong> identity access signals are currently highest.",
    initial: "Great prompt. I&apos;ll build a quick <strong>risky-user list using sample data</strong> across your core sources.",
  },
});
