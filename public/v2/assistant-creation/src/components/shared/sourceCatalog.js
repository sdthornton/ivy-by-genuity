import avanonLogo from "../../assets/integrations/avanon.png";
import azureLogo from "../../assets/integrations/azure.png";
import ciscoMerakiLogo from "../../assets/integrations/cisco-meraki.png";
import ciscoUmbrellaLogo from "../../assets/integrations/cisco-umbrella.png";
import dropboxLogo from "../../assets/integrations/dropbox.png";
import entraIdLogo from "../../assets/integrations/entra-id.png";
import googleLogo from "../../assets/integrations/google.png";
import kaseyaSpanningLogo from "../../assets/integrations/kaseya-spanning.png";
import kaseyaVsaLogo from "../../assets/integrations/kaseya-vsa.png";
import knowbe4Logo from "../../assets/integrations/knowbe4.png";
import microsoft365Logo from "../../assets/integrations/microsoft-365.png";
import oktaLogo from "../../assets/integrations/okta.png";
import oneLoginLogo from "../../assets/integrations/one-login.png";
import sharepointLogo from "../../assets/integrations/sharepoint.png";
import slackLogo from "../../assets/integrations/slack.png";
import sophosLogo from "../../assets/integrations/sophos.png";
import pdfLogo from "../../assets/integrations/pdf.png";

export const SOURCE_LOGOS = {
  "Avanon": avanonLogo,
  "Azure": azureLogo,
  "Cisco Meraki": ciscoMerakiLogo,
  "Cisco Umbrella": ciscoUmbrellaLogo,
  "Dropbox": dropboxLogo,
  "EntraID": entraIdLogo,
  "Entra ID": entraIdLogo,
  "Google": googleLogo,
  "Kaseya Spanning": kaseyaSpanningLogo,
  "Kaseya VSA": kaseyaVsaLogo,
  "KnowBe4": knowbe4Logo,
  "Microsoft 365": microsoft365Logo,
  "Okta": oktaLogo,
  "OneLogin": oneLoginLogo,
  "SharePoint": sharepointLogo,
  "Slack": slackLogo,
  "Sophos": sophosLogo,
  "IT Meeting Notes": pdfLogo,
};

export const MOCK_ACTIVE_SOURCES = [
  "Azure",
  "Cisco Meraki",
  "Kaseya VSA",
  "OneLogin",
  "Sophos",
  "Microsoft 365",
  "Slack",
  "SharePoint",
  "IT Meeting Notes",
];

export const MOCK_INACTIVE_SOURCES = [
  "Entra ID",
  "Avanon",
  "Cisco Umbrella",
  "KnowBe4",
  "Kaseya Spanning",
  "Google",
  "Dropbox",
];

export function resolveSourceIcon(sourceLabel) {
  return SOURCE_LOGOS[String(sourceLabel || "").trim()] || null;
}
