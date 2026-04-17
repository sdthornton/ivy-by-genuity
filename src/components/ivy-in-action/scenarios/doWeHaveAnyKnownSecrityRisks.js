import { createIvyInActionScenario } from "../scenarioCommonData";

export default createIvyInActionScenario({
  key: "anything-unusual-going-on",
  path: "/ivy-in-action/anything-unusual-going-on",
  query: "Is anything unusual going on in my data?",
  messages: {
    firstPass: "<strong>Yes.</strong> Identity access currently shows the most significant known risk.",
    initial: "Great question. I&apos;ll run a quick <strong>cross-source scan using sample data</strong> to verify known risk signals.",
  },
});
