// Calculate total current state annual cost
export function calculateCurrentStateCosts(currentState) {
  const costs = {};

  // Oracle
  if (currentState.oracle.enabled) {
    const o = currentState.oracle;
    const laborCost = o.dbaFtes * o.avgDbaSalary;
    costs.oracle = {
      licensing: o.licensing,
      infrastructure: o.infrastructure,
      maintenance: o.maintenanceSupport,
      labor: laborCost,
      total: o.licensing + o.infrastructure + o.maintenanceSupport + laborCost,
    };
  }

  // Tableau
  if (currentState.tableau.enabled) {
    const t = currentState.tableau;
    const licenseCost = t.serverLicensing + (t.creatorLicenses * t.creatorCostPerLicense) + (t.explorerLicenses * t.explorerCostPerLicense);
    costs.tableau = {
      licensing: licenseCost,
      infrastructure: t.infrastructure,
      total: licenseCost + t.infrastructure,
    };
  }

  // Informatica
  if (currentState.informatica.enabled) {
    const i = currentState.informatica;
    costs.informatica = {
      licensing: i.powerCenterLicensing + i.cloudSubscription,
      infrastructure: i.infrastructure,
      maintenance: i.supportMaintenance,
      total: i.powerCenterLicensing + i.cloudSubscription + i.infrastructure + i.supportMaintenance,
    };
  }

  // Microsoft Access
  if (currentState.msAccess.enabled) {
    const a = currentState.msAccess;
    const laborCost = a.developerFtes * a.avgDeveloperSalary;
    costs.msAccess = {
      infrastructure: a.serverInfrastructure,
      maintenance: a.maintenanceSupport,
      labor: laborCost,
      total: a.serverInfrastructure + a.maintenanceSupport + laborCost,
    };
  }

  // SQL Server
  if (currentState.sqlServer.enabled) {
    const s = currentState.sqlServer;
    const laborCost = s.dbaFtes * s.avgDbaSalary;
    costs.sqlServer = {
      licensing: s.licensing,
      infrastructure: s.infrastructure,
      maintenance: s.maintenanceSupport,
      labor: laborCost,
      total: s.licensing + s.infrastructure + s.maintenanceSupport + laborCost,
    };
  }

  // File Systems
  if (currentState.fileSystems.enabled) {
    const f = currentState.fileSystems;
    const storageCost = f.storageCapacityTb * f.storageCostPerTb;
    const laborCost = f.adminFtes * f.avgAdminSalary;
    costs.fileSystems = {
      infrastructure: f.serverInfrastructure + storageCost,
      labor: laborCost,
      total: f.serverInfrastructure + storageCost + laborCost,
    };
  }

  // Grand total
  costs.grandTotal = Object.values(costs).reduce((sum, c) => {
    if (typeof c === 'object' && c.total) return sum + c.total;
    return sum;
  }, 0);

  return costs;
}

// Calculate Azure target annual cost
export function calculateAzureTargetCosts(azureTarget) {
  const f = azureTarget.fabric;
  const fabricComputeAnnual = f.capacityUnits * f.monthlyCostPerCu * 12;
  const fabricStorageAnnual = f.oneLakeStorageTb * f.oneLakeStorageCostPerTbMonth * 12;

  const s = azureTarget.azureSql;
  const sqlComputeAnnual = s.vCores * s.monthlyCostPerVcore * 12;
  const sqlStorageAnnual = s.storageTb * s.storageCostPerTbMonth * 12;

  const p = azureTarget.powerBi;
  const powerBiAnnual = ((p.proLicenses * p.proCostPerUserMonth) + (p.ppuLicenses * p.ppuCostPerUserMonth)) * 12;

  const a = azureTarget.additionalServices;
  const additionalAnnual = a.purview + a.dataFactory + a.monitorLogAnalytics + a.networkEgress;

  const l = azureTarget.labor;
  const laborAnnual = l.engineerFtes * l.avgEngineerSalary;

  return {
    fabric: { compute: fabricComputeAnnual, storage: fabricStorageAnnual, total: fabricComputeAnnual + fabricStorageAnnual },
    azureSql: { compute: sqlComputeAnnual, storage: sqlStorageAnnual, total: sqlComputeAnnual + sqlStorageAnnual },
    powerBi: { total: powerBiAnnual },
    additionalServices: { ...a, total: additionalAnnual },
    labor: { total: laborAnnual },
    grandTotal: fabricComputeAnnual + fabricStorageAnnual + sqlComputeAnnual + sqlStorageAnnual + powerBiAnnual + additionalAnnual + laborAnnual,
  };
}

// Build the cost comparison model (maps current costs to categories to match Azure categories)
export function buildCostModel(currentStateCosts, azureTargetCosts) {
  // Map current costs into categories matching the spreadsheet
  const currentDb = (currentStateCosts.oracle?.total || 0) + (currentStateCosts.sqlServer?.total || 0) + (currentStateCosts.msAccess?.total || 0);
  const currentBi = currentStateCosts.tableau?.total || 0;
  const currentEtl = currentStateCosts.informatica?.total || 0;
  const currentInfra = (currentStateCosts.fileSystems?.infrastructure || 0);
  const currentLabor = (currentStateCosts.oracle?.labor || 0) + (currentStateCosts.sqlServer?.labor || 0) + (currentStateCosts.msAccess?.labor || 0) + (currentStateCosts.fileSystems?.labor || 0);
  const currentSupport = (currentStateCosts.oracle?.maintenance || 0) + (currentStateCosts.informatica?.maintenance || 0) + (currentStateCosts.sqlServer?.maintenance || 0) + (currentStateCosts.msAccess?.maintenance || 0);

  const azureDb = azureTargetCosts.azureSql.total;
  const azureBi = azureTargetCosts.powerBi.total;
  const azureEtl = azureTargetCosts.additionalServices.dataFactory || 0;
  const azureInfra = azureTargetCosts.fabric.total;
  const azureLabor = azureTargetCosts.labor.total;
  const azureSupport = (azureTargetCosts.additionalServices.purview || 0) + (azureTargetCosts.additionalServices.monitorLogAnalytics || 0) + (azureTargetCosts.additionalServices.networkEgress || 0);

  const categories = [
    { name: 'Database Platform', current: currentDb, azure: azureDb },
    { name: 'BI/Analytics Tools', current: currentBi, azure: azureBi },
    { name: 'Data Integration/ETL', current: currentEtl, azure: azureEtl },
    { name: 'Data Platform (Fabric)', current: currentInfra, azure: azureInfra },
    { name: 'Labor', current: currentLabor, azure: azureLabor },
    { name: 'Support & Maintenance', current: currentSupport, azure: azureSupport },
  ];

  categories.forEach(cat => {
    cat.savings = cat.current - cat.azure;
    cat.savingsPercent = cat.current > 0 ? cat.savings / cat.current : 0;
  });

  const totalCurrent = categories.reduce((s, c) => s + c.current, 0);
  const totalAzure = categories.reduce((s, c) => s + c.azure, 0);

  return {
    categories,
    totalCurrent,
    totalAzure,
    totalSavings: totalCurrent - totalAzure,
    totalSavingsPercent: totalCurrent > 0 ? (totalCurrent - totalAzure) / totalCurrent : 0,
  };
}

// Calculate ROI metrics
export function calculateRoi(costModel, migrationCosts) {
  const baseSubtotal = migrationCosts.servicesConsulting + migrationCosts.migrateAssessmentTools + migrationCosts.trainingChangeManagement;
  const contingency = baseSubtotal * migrationCosts.contingencyPercent;
  const totalMigrationCost = baseSubtotal + contingency;

  const annualSavings = costModel.totalSavings;
  const threeYearSavings = annualSavings * 3;
  const fiveYearSavings = annualSavings * 5;
  const paybackMonths = annualSavings > 0 ? Math.ceil(totalMigrationCost / (annualSavings / 12)) : null;
  const threeYearRoi = totalMigrationCost > 0 ? ((threeYearSavings - totalMigrationCost) / totalMigrationCost) : 0;
  const fiveYearRoi = totalMigrationCost > 0 ? ((fiveYearSavings - totalMigrationCost) / totalMigrationCost) : 0;

  return {
    migrationSubtotal: baseSubtotal,
    contingency,
    totalMigrationCost,
    annualSavings,
    threeYearSavings,
    fiveYearSavings,
    paybackMonths,
    threeYearRoi,
    fiveYearRoi,
    threeYearNetBenefit: threeYearSavings - totalMigrationCost,
    fiveYearNetBenefit: fiveYearSavings - totalMigrationCost,
    costReductionPercent: costModel.totalSavingsPercent,
  };
}

// Format currency
export function formatCurrency(amount) {
  return '$' + Math.round(amount).toLocaleString();
}

// Format percentage
export function formatPercent(decimal) {
  return (decimal * 100).toFixed(1) + '%';
}
