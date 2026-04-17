import whatShouldIBeWorriedAboutRightNow from "./whatShouldIBeWorriedAboutRightNow";
import doWeHaveAnyKnownSecrityRisks from "./doWeHaveAnyKnownSecrityRisks";
import showMeAListOfPotentiallyRiskyUsers from "./showMeAListOfPotentiallyRiskyUsers";

export const ivyInActionScenarioList = [
  whatShouldIBeWorriedAboutRightNow,
  doWeHaveAnyKnownSecrityRisks,
  showMeAListOfPotentiallyRiskyUsers,
];

export const ivyInActionScenarioByKey = Object.fromEntries(
  ivyInActionScenarioList.map((scenario) => [scenario.key, scenario])
);

export const ivyInActionDefaultScenario = ivyInActionScenarioList[0];
