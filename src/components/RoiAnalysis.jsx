import {
  calculateCurrentStateCosts,
  calculateAzureTargetCosts,
  buildCostModel,
  calculateRoi,
  formatCurrency,
  formatPercent,
} from '../utils/calculations.js';

const metricGridStyle = {
  display: 'grid',
  gap: 20,
};

const timelineRowStyle = {
  display: 'grid',
  gridTemplateColumns: '84px minmax(0, 1fr) 140px',
  alignItems: 'center',
  gap: 12,
  marginTop: 12,
};

const cardTitleStyle = {
  marginBottom: 4,
  color: '#0f548c',
};

function clampCurrency(value) {
  return Math.max(0, Number(value) || 0);
}

function formatMonths(value) {
  return value == null ? 'N/A' : `${value} months`;
}

function getValueClass(value) {
  return value >= 0 ? 'savings-positive' : 'savings-negative';
}

export default function RoiAnalysis({ state, onChange }) {
  const migrationCosts = state.migrationCosts;
  const currentStateCosts = calculateCurrentStateCosts(state.currentState);
  const azureTargetCosts = calculateAzureTargetCosts(state.azureTarget);
  const costModel = buildCostModel(currentStateCosts, azureTargetCosts);
  const roi = calculateRoi(costModel, migrationCosts);

  const summaryRows = [
    { label: 'Current Annual Cost', value: costModel.totalCurrent, type: 'currency' },
    { label: 'Azure Annual Cost', value: costModel.totalAzure, type: 'currency' },
    { label: 'Cost Reduction %', value: roi.costReductionPercent, type: 'percent' },
    { label: 'Break-Even Point', value: roi.paybackMonths, type: 'months' },
    { label: '3-Year Net Benefit', value: roi.threeYearNetBenefit, type: 'currency' },
    { label: '5-Year Net Benefit', value: roi.fiveYearNetBenefit, type: 'currency' },
  ];

  const yearlyTimeline = Array.from({ length: 5 }, (_, index) => {
    const year = index + 1;
    const cumulativeSavings = roi.annualSavings * year;
    const netPosition = cumulativeSavings - roi.totalMigrationCost;
    return {
      year,
      cumulativeSavings,
      netPosition,
      progressPercent: Math.min(100, roi.fiveYearSavings > 0 ? (cumulativeSavings / roi.fiveYearSavings) * 100 : 0),
    };
  });

  const comparisonMax = Math.max(roi.totalMigrationCost, roi.fiveYearSavings, 1);
  const migrationWidth = Math.min(100, (roi.totalMigrationCost / comparisonMax) * 100);
  const savingsWidth = Math.min(100, (roi.fiveYearSavings / comparisonMax) * 100);
  const breakEvenPercent = roi.paybackMonths == null ? null : Math.min(100, (roi.paybackMonths / 60) * 100);

  const handleCurrencyChange = (path) => (event) => {
    onChange(path, clampCurrency(event.target.value));
  };

  const handleContingencyChange = (event) => {
    onChange('migrationCosts.contingencyPercent', Math.max(0, Number(event.target.value) || 0) / 100);
  };

  return (
    <div style={metricGridStyle}>
      <section className="card">
        <h2>📈 ROI Analysis</h2>
        <p className="subtitle">
          Adjust migration investment assumptions and review savings, payback, and long-term return.
        </p>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="servicesConsulting">Migration Services &amp; Consulting</label>
            <input
              id="servicesConsulting"
              type="number"
              min="0"
              step="1000"
              value={migrationCosts.servicesConsulting}
              onChange={handleCurrencyChange('migrationCosts.servicesConsulting')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="migrateAssessmentTools">Azure Migrate &amp; Assessment Tools</label>
            <input
              id="migrateAssessmentTools"
              type="number"
              min="0"
              step="500"
              value={migrationCosts.migrateAssessmentTools}
              onChange={handleCurrencyChange('migrationCosts.migrateAssessmentTools')}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="trainingChangeManagement">Training &amp; Change Management</label>
            <input
              id="trainingChangeManagement"
              type="number"
              min="0"
              step="1000"
              value={migrationCosts.trainingChangeManagement}
              onChange={handleCurrencyChange('migrationCosts.trainingChangeManagement')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contingencyPercent">Contingency (%)</label>
            <input
              id="contingencyPercent"
              type="number"
              min="0"
              step="1"
              value={Math.round((migrationCosts.contingencyPercent || 0) * 100)}
              onChange={handleContingencyChange}
            />
          </div>
        </div>

        <div className="cost-summary-bar" style={{ marginTop: 8, marginBottom: 0 }}>
          <span>Migration Subtotal: <strong>{formatCurrency(roi.migrationSubtotal)}</strong></span>
          <span>Contingency: <strong>{formatCurrency(roi.contingency)}</strong></span>
          <span>Total Migration Cost: <strong>{formatCurrency(roi.totalMigrationCost)}</strong></span>
        </div>
      </section>

      <section className="card">
        <h3 style={cardTitleStyle}>Financial Analysis Dashboard</h3>
        <p className="subtitle">Modeled savings and return metrics based on the current and Azure target operating cost profiles.</p>
        <div className="roi-dashboard">
          <div className="roi-metric">
            <div className={`roi-metric-value ${getValueClass(roi.annualSavings)}`}>{formatCurrency(roi.annualSavings)}</div>
            <div className="roi-metric-label">Annual Savings</div>
          </div>
          <div className="roi-metric">
            <div className={`roi-metric-value ${getValueClass(roi.threeYearSavings)}`}>{formatCurrency(roi.threeYearSavings)}</div>
            <div className="roi-metric-label">3-Year Total Savings</div>
          </div>
          <div className="roi-metric">
            <div className={`roi-metric-value ${getValueClass(roi.fiveYearSavings)}`}>{formatCurrency(roi.fiveYearSavings)}</div>
            <div className="roi-metric-label">5-Year Total Savings</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">{roi.paybackMonths == null ? 'N/A' : roi.paybackMonths}</div>
            <div className="roi-metric-label">Payback Period (Months)</div>
          </div>
          <div className="roi-metric">
            <div className={`roi-metric-value ${getValueClass(roi.threeYearRoi)}`}>{formatPercent(roi.threeYearRoi)}</div>
            <div className="roi-metric-label">3-Year ROI</div>
          </div>
          <div className="roi-metric">
            <div className={`roi-metric-value ${getValueClass(roi.fiveYearRoi)}`}>{formatPercent(roi.fiveYearRoi)}</div>
            <div className="roi-metric-label">5-Year ROI</div>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 style={cardTitleStyle}>Key Metrics Summary</h3>
        <p className="subtitle">Executive view of the financial baseline, steady-state target, and net business case.</p>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((row) => {
              const displayValue = row.type === 'currency'
                ? formatCurrency(row.value)
                : row.type === 'percent'
                  ? formatPercent(row.value)
                  : formatMonths(row.value);
              const className = row.type === 'months'
                ? (row.value == null ? '' : getValueClass(costModel.totalSavings))
                : getValueClass(row.value);

              return (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className={className}>{displayValue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3 style={cardTitleStyle}>Payback Timeline Visualization</h3>
        <p className="subtitle">Compare the upfront migration investment with cumulative savings across a five-year horizon.</p>

        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, fontSize: 13, color: '#605e5c' }}>
              <span>Migration investment: <strong className="savings-negative">{formatCurrency(roi.totalMigrationCost)}</strong></span>
              <span>5-year cumulative savings: <strong className="savings-positive">{formatCurrency(roi.fiveYearSavings)}</strong></span>
            </div>
            <div className="progress-bar" style={{ position: 'relative', height: 18, background: '#f3f2f1' }}>
              <span style={{ width: `${migrationWidth}%`, background: 'linear-gradient(90deg, #d13438, #ff8085)', opacity: 0.9 }} />
              <span style={{ width: `${savingsWidth}%`, background: 'linear-gradient(90deg, #107c10, #54d15d)', marginTop: -18, opacity: 0.85 }} />
              {breakEvenPercent != null && (
                <span
                  title={`Break-even at ${roi.paybackMonths} months`}
                  style={{
                    position: 'absolute',
                    left: `calc(${breakEvenPercent}% - 2px)`,
                    top: -4,
                    width: 4,
                    height: 26,
                    background: '#323130',
                    borderRadius: 999,
                  }}
                />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: '#605e5c', fontSize: 13 }}>
              <span>Year 1</span>
              <span>Year 2</span>
              <span>Year 3</span>
              <span>Year 4</span>
              <span>Year 5</span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 4 }}>
            {yearlyTimeline.map((item) => (
              <div key={item.year} style={timelineRowStyle}>
                <strong>{`Year ${item.year}`}</strong>
                <div className="progress-bar" style={{ height: 14 }}>
                  <span style={{ width: `${item.progressPercent}%`, background: 'linear-gradient(90deg, #107c10, #73d87d)' }} />
                </div>
                <span className={getValueClass(item.netPosition)} style={{ textAlign: 'right' }}>
                  {formatCurrency(item.netPosition)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
