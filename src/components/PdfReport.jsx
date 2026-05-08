import { forwardRef } from 'react';
import {
  calculateCurrentStateCosts,
  calculateAzureTargetCosts,
  buildCostModel,
  calculateRoi,
  formatCurrency,
  formatPercent,
} from '../utils/calculations.js';

const CURRENT_PLATFORM_LABELS = {
  oracle: 'Oracle',
  tableau: 'Tableau',
  informatica: 'Informatica',
  msAccess: 'Microsoft Access',
  sqlServer: 'SQL Server',
  fileSystems: 'File Systems',
};

const STRATEGIC_SECTIONS = [
  {
    key: 'dataUnification',
    title: 'Data Unification',
    columns: [
      { key: 'benefit', label: 'Benefit' },
      { key: 'description', label: 'Description' },
      { key: 'impact', label: 'Impact' },
    ],
  },
  {
    key: 'aiReadiness',
    title: 'AI Readiness',
    columns: [
      { key: 'benefit', label: 'Benefit' },
      { key: 'description', label: 'Description' },
      { key: 'impact', label: 'Impact' },
    ],
  },
  {
    key: 'governance',
    title: 'Governance',
    columns: [
      { key: 'benefit', label: 'Benefit' },
      { key: 'description', label: 'Description' },
      { key: 'impact', label: 'Impact' },
    ],
  },
  {
    key: 'innovation',
    title: 'Innovation',
    columns: [
      { key: 'benefit', label: 'Benefit' },
      { key: 'description', label: 'Description' },
      { key: 'impact', label: 'Impact' },
    ],
  },
  {
    key: 'riskMitigation',
    title: 'Risk Mitigation',
    columns: [
      { key: 'benefit', label: 'Risk Category' },
      { key: 'risk', label: 'Current Risk' },
      { key: 'mitigation', label: 'Azure Mitigation' },
    ],
  },
];

const sectionStyle = {
  marginTop: 28,
};

const pageSectionStyle = {
  ...sectionStyle,
  pageBreakBefore: 'always',
};

const headingStyle = {
  margin: '0 0 16px',
  padding: '10px 14px',
  background: '#0078d4',
  color: '#fff',
  borderRadius: 8,
  fontSize: 20,
};

const subheadingStyle = {
  margin: '18px 0 10px',
  color: '#0f548c',
  fontSize: 16,
};

const headerCellStyle = {
  background: '#0078d4',
  color: '#fff',
  border: '1px solid #c7d8ee',
  padding: '10px 12px',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const cellStyle = {
  border: '1px solid #d6e2f0',
  padding: '10px 12px',
  verticalAlign: 'top',
};

const totalRowStyle = {
  background: '#eaf4ff',
  fontWeight: 700,
};

const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
  marginTop: 18,
};

const summaryCardStyle = {
  border: '1px solid #d6e2f0',
  borderRadius: 8,
  padding: '14px 16px',
  background: '#f8fbff',
};

function formatSignedCurrency(amount) {
  if (amount === 0) {
    return formatCurrency(0);
  }

  return `${amount > 0 ? '+' : '-'}${formatCurrency(Math.abs(amount))}`;
}

function formatSignedPercent(decimal) {
  if (decimal === 0) {
    return formatPercent(0);
  }

  return `${decimal > 0 ? '+' : '-'}${formatPercent(Math.abs(decimal))}`;
}

function getSavingsStyle(value) {
  return {
    color: value >= 0 ? '#107c10' : '#d13438',
    fontWeight: 700,
  };
}

function formatMonths(value) {
  return value == null ? 'N/A' : `${value} months`;
}

function isBlankRow(item, columns) {
  return columns.every(({ key }) => String(item?.[key] ?? '').trim() === '');
}

export default forwardRef(function PdfReport({ state }, ref) {
  const currentCosts = calculateCurrentStateCosts(state.currentState);
  const azureCosts = calculateAzureTargetCosts(state.azureTarget);
  const costModel = buildCostModel(currentCosts, azureCosts);
  const roi = calculateRoi(costModel, state.migrationCosts);
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentRows = Object.entries(CURRENT_PLATFORM_LABELS)
    .filter(([key]) => state.currentState[key]?.enabled)
    .map(([key, label]) => ({ label, subtotal: currentCosts[key]?.total ?? 0 }));

  const azureTargetRows = [
    {
      name: 'Fabric',
      configuration: [
        `SKU: ${state.azureTarget.fabric.skuSelection}`,
        `${state.azureTarget.fabric.capacityUnits} CU`,
        `${state.azureTarget.fabric.oneLakeStorageTb} TB storage`,
      ],
      annualCost: azureCosts.fabric.total,
    },
    {
      name: 'Azure SQL',
      configuration: [
        `Tier: ${state.azureTarget.azureSql.serviceTier}`,
        `${state.azureTarget.azureSql.vCores} vCores`,
        `${state.azureTarget.azureSql.storageTb} TB storage`,
      ],
      annualCost: azureCosts.azureSql.total,
    },
    {
      name: 'Power BI licensing',
      configuration: [
        `${state.azureTarget.powerBi.proLicenses} Pro licenses`,
        `${state.azureTarget.powerBi.ppuLicenses} Premium Per User licenses`,
      ],
      annualCost: azureCosts.powerBi.total,
    },
    {
      name: 'Additional services',
      configuration: [
        `Purview: ${formatCurrency(state.azureTarget.additionalServices.purview)}`,
        `Data Factory: ${formatCurrency(state.azureTarget.additionalServices.dataFactory)}`,
        `Monitor/Log Analytics: ${formatCurrency(state.azureTarget.additionalServices.monitorLogAnalytics)}`,
        `Network egress: ${formatCurrency(state.azureTarget.additionalServices.networkEgress)}`,
      ],
      annualCost: azureCosts.additionalServices.total,
    },
    {
      name: 'Labor',
      configuration: [
        `${state.azureTarget.labor.engineerFtes} FTE`,
        `Avg salary: ${formatCurrency(state.azureTarget.labor.avgEngineerSalary)}`,
      ],
      annualCost: azureCosts.labor.total,
    },
  ];

  const executiveSummary = [
    { label: 'Current Annual Cost', value: formatCurrency(costModel.totalCurrent) },
    { label: 'Azure Annual Cost', value: formatCurrency(costModel.totalAzure) },
    { label: 'Annual Savings', value: formatSignedCurrency(roi.annualSavings), highlight: roi.annualSavings },
    { label: 'Savings %', value: formatSignedPercent(costModel.totalSavingsPercent), highlight: costModel.totalSavingsPercent },
    { label: 'Payback Period', value: formatMonths(roi.paybackMonths) },
    { label: '3-Year ROI', value: formatPercent(roi.threeYearRoi), highlight: roi.threeYearRoi },
    { label: '5-Year Net Benefit', value: formatSignedCurrency(roi.fiveYearNetBenefit), highlight: roi.fiveYearNetBenefit },
  ];

  const migrationBreakdown = [
    { label: 'Migration services & consulting', value: state.migrationCosts.servicesConsulting },
    { label: 'Azure Migrate & assessment tools', value: state.migrationCosts.migrateAssessmentTools },
    { label: 'Training & change management', value: state.migrationCosts.trainingChangeManagement },
    { label: 'Contingency', value: roi.contingency },
  ];

  const financialMetrics = [
    { label: 'Annual savings', value: formatSignedCurrency(roi.annualSavings), highlight: roi.annualSavings },
    { label: '3-year savings', value: formatSignedCurrency(roi.threeYearSavings), highlight: roi.threeYearSavings },
    { label: '5-year savings', value: formatSignedCurrency(roi.fiveYearSavings), highlight: roi.fiveYearSavings },
    { label: 'Payback period', value: formatMonths(roi.paybackMonths) },
    { label: '3-year ROI', value: formatPercent(roi.threeYearRoi), highlight: roi.threeYearRoi },
    { label: '5-year ROI', value: formatPercent(roi.fiveYearRoi), highlight: roi.fiveYearRoi },
    { label: '3-year net benefit', value: formatSignedCurrency(roi.threeYearNetBenefit), highlight: roi.threeYearNetBenefit },
    { label: '5-year net benefit', value: formatSignedCurrency(roi.fiveYearNetBenefit), highlight: roi.fiveYearNetBenefit },
  ];

  return (
    <div
      ref={ref}
      className="pdf-report"
      style={{
        width: '210mm',
        boxSizing: 'border-box',
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: 12,
        lineHeight: 1.5,
        color: '#111',
      }}
    >
      <section
        style={{
          minHeight: '257mm',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '24mm 12mm',
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
          border: '1px solid #d6e2f0',
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: '#0078d4', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Microsoft TCO Calculator
          </div>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.2, color: '#0f548c' }}>TCO Migration Assessment Report</h1>
        </div>
        <div style={{ display: 'grid', gap: 12, fontSize: 15 }}>
          <div><strong>Customer:</strong> {state.customerName?.trim() || 'Not provided'}</div>
          <div><strong>Generated:</strong> {generatedDate}</div>
        </div>
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '2px solid #d6e2f0', color: '#5f6b7a', fontSize: 14 }}>
          Confidential — Prepared by Microsoft
        </div>
      </section>

      <section style={pageSectionStyle}>
        <h2 style={headingStyle}>Executive Summary</h2>
        <div style={summaryGridStyle}>
          {executiveSummary.map((item) => (
            <div key={item.label} style={summaryCardStyle}>
              <div style={{ color: '#5f6b7a', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, ...(item.highlight == null ? {} : getSavingsStyle(item.highlight)) }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={pageSectionStyle}>
        <h2 style={headingStyle}>Current State Costs</h2>
        <table>
          <thead>
            <tr>
              <th style={headerCellStyle}>Platform</th>
              <th style={headerCellStyle}>Annual Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? currentRows.map((row, index) => (
              <tr key={row.label} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fbff' }}>
                <td style={cellStyle}>{row.label}</td>
                <td style={cellStyle}>{formatCurrency(row.subtotal)}</td>
              </tr>
            )) : (
              <tr>
                <td style={cellStyle} colSpan="2">No current-state platforms are enabled.</td>
              </tr>
            )}
            <tr style={totalRowStyle}>
              <td style={cellStyle}>Grand Total</td>
              <td style={cellStyle}>{formatCurrency(currentCosts.grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={pageSectionStyle}>
        <h2 style={headingStyle}>Azure Target Configuration</h2>
        <table>
          <thead>
            <tr>
              <th style={headerCellStyle}>Component</th>
              <th style={headerCellStyle}>Configuration</th>
              <th style={headerCellStyle}>Annual Cost</th>
            </tr>
          </thead>
          <tbody>
            {azureTargetRows.map((row, index) => (
              <tr key={row.name} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fbff' }}>
                <td style={cellStyle}>{row.name}</td>
                <td style={cellStyle}>
                  {row.configuration.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </td>
                <td style={cellStyle}>{formatCurrency(row.annualCost)}</td>
              </tr>
            ))}
            <tr style={totalRowStyle}>
              <td style={cellStyle} colSpan="2">Grand Total</td>
              <td style={cellStyle}>{formatCurrency(azureCosts.grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={pageSectionStyle}>
        <h2 style={headingStyle}>Cost Comparison</h2>
        <table>
          <thead>
            <tr>
              <th style={headerCellStyle}>Cost Category</th>
              <th style={headerCellStyle}>Current State</th>
              <th style={headerCellStyle}>Azure Target</th>
              <th style={headerCellStyle}>Annual Savings</th>
              <th style={headerCellStyle}>Savings %</th>
            </tr>
          </thead>
          <tbody>
            {costModel.categories.map((category, index) => (
              <tr key={category.name} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fbff' }}>
                <td style={cellStyle}>{category.name}</td>
                <td style={cellStyle}>{formatCurrency(category.current)}</td>
                <td style={cellStyle}>{formatCurrency(category.azure)}</td>
                <td style={{ ...cellStyle, ...getSavingsStyle(category.savings) }}>{formatSignedCurrency(category.savings)}</td>
                <td style={{ ...cellStyle, ...getSavingsStyle(category.savings) }}>{formatSignedPercent(category.savingsPercent)}</td>
              </tr>
            ))}
            <tr style={totalRowStyle}>
              <td style={cellStyle}>Total</td>
              <td style={cellStyle}>{formatCurrency(costModel.totalCurrent)}</td>
              <td style={cellStyle}>{formatCurrency(costModel.totalAzure)}</td>
              <td style={{ ...cellStyle, ...getSavingsStyle(costModel.totalSavings) }}>{formatSignedCurrency(costModel.totalSavings)}</td>
              <td style={{ ...cellStyle, ...getSavingsStyle(costModel.totalSavings) }}>{formatSignedPercent(costModel.totalSavingsPercent)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={pageSectionStyle}>
        <h2 style={headingStyle}>ROI Analysis</h2>
        <h3 style={subheadingStyle}>Migration Cost Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th style={headerCellStyle}>Cost Item</th>
              <th style={headerCellStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {migrationBreakdown.map((item, index) => (
              <tr key={item.label} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fbff' }}>
                <td style={cellStyle}>{item.label}</td>
                <td style={cellStyle}>{formatCurrency(item.value)}</td>
              </tr>
            ))}
            <tr style={totalRowStyle}>
              <td style={cellStyle}>Total Migration Cost</td>
              <td style={cellStyle}>{formatCurrency(roi.totalMigrationCost)}</td>
            </tr>
          </tbody>
        </table>

        <h3 style={subheadingStyle}>Financial Metrics</h3>
        <table>
          <thead>
            <tr>
              <th style={headerCellStyle}>Metric</th>
              <th style={headerCellStyle}>Value</th>
            </tr>
          </thead>
          <tbody>
            {financialMetrics.map((item, index) => (
              <tr key={item.label} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fbff' }}>
                <td style={cellStyle}>{item.label}</td>
                <td style={{ ...cellStyle, ...(item.highlight == null ? {} : getSavingsStyle(item.highlight)) }}>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={pageSectionStyle}>
        <h2 style={headingStyle}>Strategic Value</h2>
        {STRATEGIC_SECTIONS.map((section) => {
          const rows = (state.qualitativeValue?.[section.key] ?? []).filter((item) => !isBlankRow(item, section.columns));

          return (
            <div key={section.key} style={{ marginBottom: 24 }}>
              <h3 style={subheadingStyle}>{section.title}</h3>
              <table>
                <thead>
                  <tr>
                    {section.columns.map((column) => (
                      <th key={column.key} style={headerCellStyle}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 ? rows.map((row, index) => (
                    <tr key={`${section.key}-${index}`} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fbff' }}>
                      {section.columns.map((column) => (
                        <td key={column.key} style={cellStyle}>{row[column.key] || '—'}</td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td style={cellStyle} colSpan={section.columns.length}>No strategic value inputs provided for this category.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </section>

      <section style={pageSectionStyle}>
        <h2 style={headingStyle}>Disclaimer</h2>
        <p style={{ margin: 0 }}>
          This assessment provides directional estimates based on user-supplied inputs, list pricing assumptions,
          and modeled operating patterns. Actual Microsoft licensing, Azure consumption, migration effort, savings,
          and business outcomes may vary based on architecture decisions, negotiated pricing, implementation scope,
          usage patterns, regional availability, and organizational readiness. Validate all results through detailed
          solution design, technical discovery, and commercial review before making investment decisions.
        </p>
      </section>
    </div>
  );
});
