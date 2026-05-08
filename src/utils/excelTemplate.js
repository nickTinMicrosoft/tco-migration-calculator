import * as XLSX from 'xlsx';

const COLUMN_WIDTHS = [{ wch: 45 }, { wch: 20 }];

const currentStateSheet = {
  name: 'Current_State_Costs',
  rows: [
    { row: 1, label: 'Current State Cost Inputs', bold: true },
    { row: 2 },
    { row: 3, label: 'ORACLE DATABASE COSTS', bold: true },
    { row: 4, label: 'Oracle Licensing (Annual)', path: 'currentState.oracle.licensing', type: 'number', defaultValue: 250000 },
    { row: 5, label: 'Oracle Infrastructure (Servers/Storage)', path: 'currentState.oracle.infrastructure', type: 'number', defaultValue: 180000 },
    { row: 6, label: 'Oracle Maintenance & Support', path: 'currentState.oracle.maintenanceSupport', type: 'number', defaultValue: 75000 },
    { row: 7, label: 'Oracle DBA Labor (FTEs)', path: 'currentState.oracle.dbaFtes', type: 'number', defaultValue: 3 },
    { row: 8, label: 'Avg DBA Salary per FTE', path: 'currentState.oracle.avgDbaSalary', type: 'number', defaultValue: 125000 },
    { row: 9 },
    { row: 10, label: 'TABLEAU COSTS', bold: true },
    { row: 11, label: 'Tableau Server Licensing (Annual)', path: 'currentState.tableau.serverLicensing', type: 'number', defaultValue: 120000 },
    { row: 12, label: 'Tableau Creator Licenses (#)', path: 'currentState.tableau.creatorLicenses', type: 'number', defaultValue: 25 },
    { row: 13, label: 'Tableau Creator Cost per License', path: 'currentState.tableau.creatorCostPerLicense', type: 'number', defaultValue: 840 },
    { row: 14, label: 'Tableau Explorer Licenses (#)', path: 'currentState.tableau.explorerLicenses', type: 'number', defaultValue: 100 },
    { row: 15, label: 'Tableau Explorer Cost per License', path: 'currentState.tableau.explorerCostPerLicense', type: 'number', defaultValue: 420 },
    { row: 16, label: 'Tableau Infrastructure', path: 'currentState.tableau.infrastructure', type: 'number', defaultValue: 45000 },
    { row: 17 },
    { row: 18, label: 'INFORMATICA COSTS', bold: true },
    { row: 19, label: 'Informatica PowerCenter Licensing', path: 'currentState.informatica.powerCenterLicensing', type: 'number', defaultValue: 150000 },
    { row: 20, label: 'Informatica Cloud/IICS Subscription', path: 'currentState.informatica.cloudSubscription', type: 'number', defaultValue: 80000 },
    { row: 21, label: 'Informatica Infrastructure', path: 'currentState.informatica.infrastructure', type: 'number', defaultValue: 60000 },
    { row: 22, label: 'Informatica Support & Maintenance', path: 'currentState.informatica.supportMaintenance', type: 'number', defaultValue: 45000 },
    { row: 23 },
    { row: 24, label: 'MICROSOFT ACCESS COSTS', bold: true },
    { row: 25, label: 'Access Database Instances (#)', path: 'currentState.msAccess.instances', type: 'number', defaultValue: 12 },
    { row: 26, label: 'Access Server Infrastructure (Annual)', path: 'currentState.msAccess.serverInfrastructure', type: 'number', defaultValue: 25000 },
    { row: 27, label: 'Access Maintenance & Support', path: 'currentState.msAccess.maintenanceSupport', type: 'number', defaultValue: 8000 },
    { row: 28, label: 'Access Developer Labor (FTEs)', path: 'currentState.msAccess.developerFtes', type: 'number', defaultValue: 1 },
    { row: 29, label: 'Avg Access Developer Salary', path: 'currentState.msAccess.avgDeveloperSalary', type: 'number', defaultValue: 95000 },
    { row: 30 },
    { row: 31, label: 'SQL SERVER COSTS', bold: true },
    { row: 32, label: 'SQL Server Licensing (Annual)', path: 'currentState.sqlServer.licensing', type: 'number', defaultValue: 180000 },
    { row: 33, label: 'SQL Server Infrastructure (Servers/Storage)', path: 'currentState.sqlServer.infrastructure', type: 'number', defaultValue: 120000 },
    { row: 34, label: 'SQL Server Maintenance & Support', path: 'currentState.sqlServer.maintenanceSupport', type: 'number', defaultValue: 45000 },
    { row: 35, label: 'SQL Server DBA Labor (FTEs)', path: 'currentState.sqlServer.dbaFtes', type: 'number', defaultValue: 2 },
    { row: 36, label: 'Avg SQL DBA Salary per FTE', path: 'currentState.sqlServer.avgDbaSalary', type: 'number', defaultValue: 115000 },
    { row: 37 },
    { row: 38, label: 'FILE-BASED SYSTEM COSTS', bold: true },
    { row: 39, label: 'File Server Infrastructure (Annual)', path: 'currentState.fileSystems.serverInfrastructure', type: 'number', defaultValue: 35000 },
    { row: 40, label: 'File Storage Capacity (TB)', path: 'currentState.fileSystems.storageCapacityTb', type: 'number', defaultValue: 15 },
    { row: 41, label: 'File Storage Cost per TB (Annual)', path: 'currentState.fileSystems.storageCostPerTb', type: 'number', defaultValue: 800 },
    { row: 42, label: 'File Management Labor (FTEs)', path: 'currentState.fileSystems.adminFtes', type: 'number', defaultValue: 0.5 },
    { row: 43, label: 'Avg File Admin Salary per FTE', path: 'currentState.fileSystems.avgAdminSalary', type: 'number', defaultValue: 85000 },
    { row: 44 },
    { row: 45, label: 'WORKLOAD METADATA', bold: true },
    { row: 46, label: 'Total Data Volume (TB)', path: 'currentState.metadata.totalDataVolumeTb', type: 'number', defaultValue: 50 },
    { row: 47, label: 'Annual Growth Rate (%)', path: 'currentState.metadata.annualGrowthRate', type: 'number', defaultValue: 0.25, toSheet: (value) => value * 100, fromSheet: (value) => value / 100 },
    { row: 48, label: 'Number of Dashboards/Reports', path: 'currentState.metadata.dashboardCount', type: 'number', defaultValue: 350 },
    { row: 49, label: 'Active User Count', path: 'currentState.metadata.activeUsers', type: 'number', defaultValue: 500 },
  ],
};

const workloadSheet = {
  name: 'Workload_Characteristics',
  rows: [
    { row: 1, label: 'Workload Characteristics', bold: true },
    { row: 2 },
    { row: 3, label: 'DATA INGESTION PATTERNS', bold: true },
    { row: 4, label: 'Daily Data Ingestion Volume (GB)', path: 'workload.ingestion.dailyVolumeGb', type: 'number', defaultValue: 150 },
    { row: 5, label: 'Number of Data Sources', path: 'workload.ingestion.dataSources', type: 'number', defaultValue: 35 },
    { row: 6, label: 'Batch Frequency (per day)', path: 'workload.ingestion.batchFrequencyPerDay', type: 'number', defaultValue: 4 },
    { row: 7, label: 'Real-time Streaming Sources', path: 'workload.ingestion.realtimeStreamingSources', type: 'number', defaultValue: 8 },
    { row: 8 },
    { row: 9, label: 'QUERY & PERFORMANCE REQUIREMENTS', bold: true },
    { row: 10, label: 'Concurrent Query Users (Peak)', path: 'workload.queryPerformance.concurrentPeakUsers', type: 'number', defaultValue: 75 },
    { row: 11, label: 'Average Queries per Day', path: 'workload.queryPerformance.avgQueriesPerDay', type: 'number', defaultValue: 2500 },
    { row: 12, label: 'Dashboard Refresh Frequency (hours)', path: 'workload.queryPerformance.dashboardRefreshHours', type: 'number', defaultValue: 4 },
    { row: 13, label: 'Report Generation Time SLA (seconds)', path: 'workload.queryPerformance.reportGenSlaSec', type: 'number', defaultValue: 10 },
    { row: 14 },
    { row: 15, label: 'USAGE PATTERNS', bold: true },
    { row: 16, label: 'Peak Usage Hours per Day', path: 'workload.usage.peakHoursPerDay', type: 'number', defaultValue: 8 },
    { row: 17, label: 'Weekend Usage (% of weekday)', path: 'workload.usage.weekendUsagePercent', type: 'number', defaultValue: 0.3, toSheet: (value) => value * 100, fromSheet: (value) => value / 100 },
    { row: 18, label: 'Business Critical Dashboards', path: 'workload.usage.businessCriticalDashboards', type: 'number', defaultValue: 45 },
    { row: 19, label: 'Self-Service Analytics Users', path: 'workload.usage.selfServiceUsers', type: 'number', defaultValue: 150 },
    { row: 20 },
    { row: 21, label: 'COMPLIANCE & GOVERNANCE', bold: true },
    { row: 22, label: 'HIPAA Compliance Required', path: 'workload.compliance.hipaaRequired', type: 'boolean', defaultValue: true },
    { row: 23, label: 'Data Retention Period (years)', path: 'workload.compliance.dataRetentionYears', type: 'number', defaultValue: 7 },
    { row: 24, label: 'Audit Log Retention (years)', path: 'workload.compliance.auditLogRetentionYears', type: 'number', defaultValue: 3 },
    { row: 25, label: 'PHI Data Sets', path: 'workload.compliance.phiDataSets', type: 'number', defaultValue: 12 },
  ],
};

const azureTargetSheet = {
  name: 'Azure_Target_Assumptions',
  rows: [
    { row: 1, label: 'Azure Target Architecture Assumptions', bold: true },
    { row: 2 },
    { row: 3, label: 'MICROSOFT FABRIC', bold: true },
    { row: 4, label: 'Fabric SKU Selection', path: 'azureTarget.fabric.skuSelection', type: 'string', defaultValue: 'F64' },
    { row: 5, label: 'Fabric Capacity Units (CU)', path: 'azureTarget.fabric.capacityUnits', type: 'number', defaultValue: 64 },
    { row: 6, label: 'Fabric Monthly Cost per CU', path: 'azureTarget.fabric.monthlyCostPerCu', type: 'number', defaultValue: 265 },
    { row: 7, label: 'OneLake Storage (TB)', path: 'azureTarget.fabric.oneLakeStorageTb', type: 'number', defaultValue: 50 },
    { row: 8, label: 'OneLake Storage Cost per TB/month', path: 'azureTarget.fabric.oneLakeStorageCostPerTbMonth', type: 'number', defaultValue: 23 },
    { row: 9 },
    { row: 10, label: 'AZURE SQL DATABASE', bold: true },
    { row: 11, label: 'SQL Service Tier', path: 'azureTarget.azureSql.serviceTier', type: 'string', defaultValue: 'Business Critical' },
    { row: 12, label: 'vCores', path: 'azureTarget.azureSql.vCores', type: 'number', defaultValue: 16 },
    { row: 13, label: 'SQL Monthly Cost per vCore', path: 'azureTarget.azureSql.monthlyCostPerVcore', type: 'number', defaultValue: 1125 },
    { row: 14, label: 'SQL Storage (TB)', path: 'azureTarget.azureSql.storageTb', type: 'number', defaultValue: 10 },
    { row: 15, label: 'SQL Storage Cost per TB/month', path: 'azureTarget.azureSql.storageCostPerTbMonth', type: 'number', defaultValue: 300 },
    { row: 16 },
    { row: 17, label: 'POWER BI LICENSING', bold: true },
    { row: 18, label: 'Power BI Pro Licenses', path: 'azureTarget.powerBi.proLicenses', type: 'number', defaultValue: 100 },
    { row: 19, label: 'Power BI Pro Cost per User/month', path: 'azureTarget.powerBi.proCostPerUserMonth', type: 'number', defaultValue: 10 },
    { row: 20, label: 'Power BI Premium per User Licenses', path: 'azureTarget.powerBi.ppuLicenses', type: 'number', defaultValue: 25 },
    { row: 21, label: 'Power BI PPU Cost per User/month', path: 'azureTarget.powerBi.ppuCostPerUserMonth', type: 'number', defaultValue: 20 },
    { row: 22 },
    { row: 23, label: 'ADDITIONAL AZURE SERVICES', bold: true },
    { row: 24, label: 'Azure Purview (Governance)', path: 'azureTarget.additionalServices.purview', type: 'number', defaultValue: 18000 },
    { row: 25, label: 'Azure Data Factory (Migration/ETL)', path: 'azureTarget.additionalServices.dataFactory', type: 'number', defaultValue: 12000 },
    { row: 26, label: 'Azure Monitor & Log Analytics', path: 'azureTarget.additionalServices.monitorLogAnalytics', type: 'number', defaultValue: 8000 },
    { row: 27, label: 'Network Egress & Bandwidth', path: 'azureTarget.additionalServices.networkEgress', type: 'number', defaultValue: 5000 },
    { row: 28 },
    { row: 29, label: 'AZURE LABOR COSTS', bold: true },
    { row: 30, label: 'Azure Engineers (FTEs)', path: 'azureTarget.labor.engineerFtes', type: 'number', defaultValue: 2 },
    { row: 31, label: 'Avg Azure Engineer Salary', path: 'azureTarget.labor.avgEngineerSalary', type: 'number', defaultValue: 135000 },
  ],
};

const SHEETS = [currentStateSheet, workloadSheet, azureTargetSheet];

function getValueByPath(source, path, fallbackValue) {
  const value = path.split('.').reduce((acc, key) => acc?.[key], source);
  return value ?? fallbackValue;
}

function setValueByPath(target, path, value) {
  const keys = path.split('.');
  let cursor = target;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }

    if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) {
      cursor[key] = {};
    }

    cursor = cursor[key];
  });
}

function makeCell(value, bold = false) {
  const cell = {
    v: value,
    t: typeof value === 'number' ? 'n' : 's',
  };

  if (bold) {
    cell.s = { font: { bold: true } };
  }

  return cell;
}

function buildSheet(definition, state) {
  const worksheet = {};

  definition.rows.forEach((row) => {
    if (row.label) {
      worksheet[`A${row.row}`] = makeCell(row.label, row.bold);
    }

    if (!row.path) {
      return;
    }

    const value = getValueByPath(state, row.path, row.defaultValue);
    const displayValue = row.toSheet
      ? row.toSheet(value)
      : row.type === 'boolean'
        ? (value ? 'Yes' : 'No')
        : value;

    if (displayValue !== undefined && displayValue !== null && displayValue !== '') {
      worksheet[`B${row.row}`] = makeCell(displayValue);
    }
  });

  worksheet['!ref'] = `A1:B${definition.rows[definition.rows.length - 1].row}`;
  worksheet['!cols'] = COLUMN_WIDTHS;

  return worksheet;
}

function sanitizeFilenamePart(value) {
  return String(value || 'Customer')
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'Customer';
}

function parseNumber(rawValue) {
  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return rawValue;
  }

  if (typeof rawValue === 'string') {
    const normalized = rawValue.replace(/,/g, '').trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseBoolean(rawValue) {
  if (typeof rawValue === 'boolean') {
    return rawValue;
  }

  if (typeof rawValue === 'string') {
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === 'yes' || normalized === 'true') {
      return true;
    }
    if (normalized === 'no' || normalized === 'false') {
      return false;
    }
  }

  return null;
}

export function generateTemplate(state) {
  const workbook = XLSX.utils.book_new();

  SHEETS.forEach((sheetDefinition) => {
    const worksheet = buildSheet(sheetDefinition, state);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetDefinition.name);
  });

  const customerName = sanitizeFilenamePart(state?.customerName);
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `TCO_Template_${customerName}_${date}.xlsx`);
}

export async function importTemplate(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'array' });
        const parsedState = {};
        const warnings = [];

        SHEETS.forEach((sheetDefinition) => {
          const worksheet = workbook.Sheets[sheetDefinition.name];

          if (!worksheet) {
            warnings.push(`Sheet "${sheetDefinition.name}" was not found and was skipped.`);
            return;
          }

          sheetDefinition.rows
            .filter((row) => row.path)
            .forEach((row) => {
              const cellAddress = `B${row.row}`;
              const rawValue = worksheet[cellAddress]?.v;

              if (rawValue === undefined || rawValue === null || rawValue === '') {
                return;
              }

              if (row.type === 'number') {
                const parsedValue = parseNumber(rawValue);

                if (parsedValue === null) {
                  warnings.push(`${sheetDefinition.name}!${cellAddress} (${row.label}) is not numeric and was skipped.`);
                  return;
                }

                setValueByPath(parsedState, row.path, row.fromSheet ? row.fromSheet(parsedValue) : parsedValue);
                return;
              }

              if (row.type === 'boolean') {
                const parsedValue = parseBoolean(rawValue);

                if (parsedValue === null) {
                  warnings.push(`${sheetDefinition.name}!${cellAddress} (${row.label}) must be Yes or No and was skipped.`);
                  return;
                }

                setValueByPath(parsedState, row.path, parsedValue);
                return;
              }

              const textValue = String(rawValue).trim();
              if (!textValue) {
                return;
              }

              setValueByPath(parsedState, row.path, textValue);
            });
        });

        resolve({ state: parsedState, warnings });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
