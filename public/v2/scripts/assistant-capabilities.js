/* Shared built-in capabilities for assistant details and configuration. */
window.IvyAssistantCapabilities={
      1:[
        ['Sign-In Failures','Find recurring authentication failures and the users and applications affected.','Compare sign-in outcomes, errors, methods, and shared conditions. Establish likely causes only where supporting evidence exists.',['Entra ID','Microsoft 365']],
        ['Conditional Access','Investigate policy restrictions and conditions affecting access.','Compare applicable policies, exclusions, grant controls, and device conditions. Distinguish configured policy from observed enforcement.',['Entra ID']],
        ['MFA Problems','Investigate MFA failures, registration gaps, and authentication requirements.','Compare registration records, available authentication methods, MFA outcomes, and policy requirements. Registration alone does not prove effective enforcement.',['Entra ID']],
        ['Identity & Device Health','Connect access problems with device registration and compliance.','Use supported user/device relationships to compare registration, compliance, and management evidence.',['Entra ID','Intune']],
        ['Access Trends & Emerging Issues','Recognize growing or recurring access problems.','Compare historical failures across users, groups, applications, and device populations.',['Entra ID','Microsoft 365']],
        ['Account & Application Access','Investigate account restrictions and missing entitlements.','Compare account state, assignments, and licensing evidence without assuming that assignment proves effective access.',['Entra ID','Microsoft 365']],
        ['Changes Affecting Access','Examine changes associated with new or recurring access problems.','Compare policy, account, device, and assignment changes. Timing alone does not establish a cause.',['Entra ID','Intune','Microsoft 365']]
      ],
      2:[
        ['Unhealthy & Unreliable Devices','Find recurring failures and unhealthy management states.','Investigate restarts, recurring errors, and reliability evidence; stale reporting alone does not prove a device is unhealthy.',['Intune','Kaseya VSA']],
        ['Device Performance','Investigate sustained performance problems.','Compare supported CPU, memory, storage, and crash evidence. Distinguish temporary load from persistent degradation.',['Kaseya VSA']],
        ['Patch & Update Health','Find failed updates and recurring deployment problems.','Compare update status, failed deployments, outdated operating systems, and restart requirements.',['Intune','Kaseya VSA']],
        ['Compliance & Management','Investigate compliance failures and missing check-ins.','Compare policy applicability, management operations, and evidence freshness. Compliance is not the same as health.',['Intune','Kaseya VSA']],
        ['Health Trends & Emerging Issues','Recognize deteriorating health across device groups.','Compare reliability over time by operating system, model, site, and management platform.',['Intune','Kaseya VSA']],
        ['Changes Affecting Device Health','Examine updates and changes associated with new problems.','Compare deployment, policy, and configuration evidence against affected and unaffected devices.',['Intune','Kaseya VSA']]
      ],
      3:[
        ['Protection Coverage','Investigate potentially missing or ineffective protection.','Match inventory and protection records, validate expected coverage, and separate confirmed gaps from missing source evidence.',['Sophos','Intune']],
        ['Security Agent Health','Find inactive, outdated, or malfunctioning protection agents.','Distinguish installed, reporting, healthy, and effectively protecting states.',['Sophos']],
        ['Threats & Unresolved Security Issues','Investigate active threats and recurring detections.','Compare threat severity, state, affected objects, and available remediation evidence.',['Sophos']],
        ['Encryption & Data Protection','Investigate reported encryption and recovery concerns.','Use actual device state where available; an assigned policy does not establish encryption.',['Intune','Sophos']],
        ['Security Trends & Emerging Issues','Recognize worsening protection and detection patterns.','Compare detections and protection health over time across device groups.',['Sophos','Intune']],
        ['Security Policy & Configuration Changes','Examine changes that may weaken protection.','Investigate policy, exclusion, agent, and configuration changes without assuming causality.',['Sophos','Intune']]
      ],
      4:[
        ['Connectivity & Reliability','Find recurring disconnections and infrastructure instability.','Compare supported availability and connection evidence across affected sites and devices.',['Cisco Meraki']],
        ['Wireless Performance & Congestion','Investigate overloaded access points and degraded experience.','Compare client density with available performance evidence; high client counts alone do not prove congestion.',['Cisco Meraki']],
        ['Infrastructure Health','Investigate access points, switches, and gateways.','Compare operational state and recurring failures using the available infrastructure relationships.',['Cisco Meraki']],
        ['Network Performance','Investigate bandwidth, latency, and packet loss where measured.','Compare supported traffic and performance indicators. High utilization alone does not establish degradation.',['Cisco Meraki']],
        ['Network Trends & Emerging Issues','Recognize growing site-level reliability and capacity problems.','Compare historical performance by site, access point, and supported network population.',['Cisco Meraki','Cisco Umbrella']],
        ['Network Configuration & Policy Changes','Examine changes associated with new network problems.','Compare firmware, infrastructure, configuration, and DNS-policy evidence. A DNS block does not automatically mean an outage.',['Cisco Meraki','Cisco Umbrella']]
      ],
      5:[
        ['Application Access & Entitlements','Investigate missing licenses, permissions, or required access.','Compare account, application, and entitlement evidence; assigned access does not prove effective access.',['Microsoft 365','Entra ID']],
        ['Unused & Underutilized Licenses','Identify possible underuse for review.','Compare available service activity with assignments. Missing usage evidence alone does not prove nonuse.',['Microsoft 365']],
        ['Provisioning & Assignment Issues','Find failed provisioning and inconsistent assignments.','Investigate direct and group assignments, account state, and licensing dependencies.',['Microsoft 365','Entra ID']],
        ['Licensing Inefficiencies & Cost Opportunities','Investigate potential overlap and unnecessary subscriptions.','Confirm business need and contract evidence before estimating savings or recommending changes.',['Microsoft 365','Entra ID']],
        ['Application & Licensing Trends','Recognize usage changes and emerging shortages.','Compare assignments, activity, and available license quantities over time.',['Microsoft 365']],
        ['Changes Affecting Application Access','Examine changes associated with new access problems.','Compare account, group, license, and assignment changes without assuming a causal relationship.',['Microsoft 365','Entra ID']]
      ]
    };
