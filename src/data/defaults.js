const DEFAULT_STATE = {
  customerName: '',

  // Page 1: Current State Costs
  currentState: {
    oracle: {
      enabled: true,
      licensing: 250000,
      infrastructure: 180000,
      maintenanceSupport: 75000,
      dbaFtes: 3,
      avgDbaSalary: 125000,
    },
    tableau: {
      enabled: true,
      serverLicensing: 120000,
      creatorLicenses: 25,
      creatorCostPerLicense: 840,
      explorerLicenses: 100,
      explorerCostPerLicense: 420,
      infrastructure: 45000,
    },
    informatica: {
      enabled: true,
      powerCenterLicensing: 150000,
      cloudSubscription: 80000,
      infrastructure: 60000,
      supportMaintenance: 45000,
    },
    msAccess: {
      enabled: false,
      instances: 12,
      serverInfrastructure: 25000,
      maintenanceSupport: 8000,
      developerFtes: 1,
      avgDeveloperSalary: 95000,
    },
    sqlServer: {
      enabled: false,
      licensing: 180000,
      infrastructure: 120000,
      maintenanceSupport: 45000,
      dbaFtes: 2,
      avgDbaSalary: 115000,
    },
    fileSystems: {
      enabled: false,
      serverInfrastructure: 35000,
      storageCapacityTb: 15,
      storageCostPerTb: 800,
      adminFtes: 0.5,
      avgAdminSalary: 85000,
    },
    metadata: {
      totalDataVolumeTb: 50,
      annualGrowthRate: 0.25,
      dashboardCount: 350,
      activeUsers: 500,
    },
  },

  // Page 2: Workload Characteristics
  workload: {
    ingestion: {
      dailyVolumeGb: 150,
      dataSources: 35,
      batchFrequencyPerDay: 4,
      realtimeStreamingSources: 8,
    },
    queryPerformance: {
      concurrentPeakUsers: 75,
      avgQueriesPerDay: 2500,
      dashboardRefreshHours: 4,
      reportGenSlaSec: 10,
    },
    usage: {
      peakHoursPerDay: 8,
      weekendUsagePercent: 0.3,
      businessCriticalDashboards: 45,
      selfServiceUsers: 150,
    },
    compliance: {
      hipaaRequired: true,
      dataRetentionYears: 7,
      auditLogRetentionYears: 3,
      phiDataSets: 12,
    },
  },

  // Page 3: Azure Target Assumptions
  azureTarget: {
    fabric: {
      skuSelection: 'F64',
      capacityUnits: 64,
      monthlyCostPerCu: 265,
      oneLakeStorageTb: 50,
      oneLakeStorageCostPerTbMonth: 23,
    },
    azureSql: {
      serviceTier: 'Business Critical',
      vCores: 16,
      monthlyCostPerVcore: 1125,
      storageTb: 10,
      storageCostPerTbMonth: 300,
    },
    powerBi: {
      proLicenses: 100,
      proCostPerUserMonth: 10,
      ppuLicenses: 25,
      ppuCostPerUserMonth: 20,
    },
    additionalServices: {
      purview: 18000,
      dataFactory: 12000,
      monitorLogAnalytics: 8000,
      networkEgress: 5000,
    },
    labor: {
      engineerFtes: 2,
      avgEngineerSalary: 135000,
    },
  },

  // Page 5: Migration Cost Assumptions
  migrationCosts: {
    servicesConsulting: 250000,
    migrateAssessmentTools: 15000,
    trainingChangeManagement: 75000,
    contingencyPercent: 0.15,
  },

  // Page 6: Qualitative Benefits
  qualitativeValue: {
    dataUnification: [
      { benefit: 'Single Source of Truth', description: 'OneLake eliminates data silos by providing one unified data lake for all analytics', impact: 'Reduced data duplication, improved data consistency' },
      { benefit: 'Simplified Data Architecture', description: 'No need to move/copy data between systems - all tools access OneLake directly', impact: 'Lower storage costs, reduced ETL complexity' },
      { benefit: 'Cross-Domain Analytics', description: 'Data Engineers, Analysts, and Scientists work from same data platform', impact: 'Faster insights, improved collaboration' },
      { benefit: 'Shortcuts & Data Sharing', description: 'Virtual data references eliminate physical copies across workspaces', impact: '30-50% reduction in storage footprint' },
    ],
    aiReadiness: [
      { benefit: 'Copilot in Fabric', description: 'Natural language queries, auto-generated DAX, AI-assisted data modeling', impact: '40% faster report development, democratized analytics' },
      { benefit: 'Copilot in Power BI', description: 'AI-generated narratives, smart Q&A, automated insights discovery', impact: 'Executive-ready reports in minutes, not hours' },
      { benefit: 'Azure OpenAI Integration', description: 'Native integration with GPT models for custom AI applications', impact: 'Build clinical decision support, patient risk models' },
      { benefit: 'ML Model Lifecycle', description: 'End-to-end MLOps with Fabric Data Science workloads', impact: 'Deploy predictive models 3x faster' },
      { benefit: 'Pre-built Healthcare AI', description: 'Azure Health Bot, Text Analytics for Health (medical NER)', impact: 'Accelerate patient engagement, clinical documentation' },
    ],
    governance: [
      { benefit: 'Unified Data Governance', description: 'Microsoft Purview provides end-to-end data catalog, lineage, and classification', impact: 'Single pane for HIPAA compliance, faster audits' },
      { benefit: 'Automated PHI Discovery', description: 'AI-powered sensitive data detection across all data sources', impact: 'Reduced compliance risk, automated HIPAA controls' },
      { benefit: 'Data Lineage Tracking', description: 'Visual lineage from source to BI report shows data transformations', impact: 'Accelerated regulatory responses, audit trail clarity' },
      { benefit: 'Access Governance', description: 'Centralized access policies, role-based security, audit logs', impact: 'Prevent unauthorized PHI access, streamlined access reviews' },
      { benefit: 'Healthcare Compliance', description: 'Pre-built HIPAA, HITRUST templates and controls', impact: 'Faster compliance certification, reduced audit costs' },
    ],
    innovation: [
      { benefit: 'Time to Insights', description: 'Power BI semantic models deploy in minutes vs days for Tableau extracts', impact: '60% faster dashboard delivery' },
      { benefit: 'Self-Service Analytics', description: 'Power BI enables clinical staff to build own reports with Copilot assistance', impact: 'Reduced backlog, empowered clinicians' },
      { benefit: 'Modern Data Architecture', description: 'Fabric Lakehouse combines data lake flexibility with warehouse performance', impact: 'Support real-time & batch analytics simultaneously' },
      { benefit: 'Cloud Scalability', description: 'Elastic compute scales up during peak usage (month-end reports)', impact: 'Eliminate performance bottlenecks, no hardware upgrades' },
      { benefit: 'Integration Ecosystem', description: 'Native connectors to EMR systems (Epic, Cerner), Azure Health Data Services', impact: 'Faster integration, pre-built healthcare data models' },
    ],
    riskMitigation: [
      { benefit: 'Oracle Licensing Audit', risk: 'Potential multi-million $ true-up in licensing audit', mitigation: 'Predictable consumption-based pricing, no audit exposure' },
      { benefit: 'End of Life', risk: 'Informatica PowerCenter approaching EOL, forced upgrade costs', mitigation: 'Fabric Data Factory modern architecture, continuous updates' },
      { benefit: 'Talent Availability', risk: 'Difficult to hire Oracle DBAs, high turnover', mitigation: 'Azure skills more abundant, cloud-native skillsets' },
      { benefit: 'Disaster Recovery', risk: 'Complex DR setup, expensive standby infrastructure', mitigation: 'Built-in geo-redundancy, 99.99% SLA, automated failover' },
      { benefit: 'Security Vulnerabilities', risk: 'Manual patching, delayed security updates', mitigation: 'Automated patching, Microsoft threat intelligence' },
    ],
  },
};

export default DEFAULT_STATE;
