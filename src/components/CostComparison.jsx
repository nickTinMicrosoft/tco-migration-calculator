import {
  buildCostModel,
  calculateAzureTargetCosts,
  calculateCurrentStateCosts,
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

const summaryCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '172px',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
};

const chartTrackStyle = {
  overflow: 'hidden',
  display: 'grid',
  gap: '10px',
  padding: '14px',
  border: '1px solid rgba(0, 120, 212, 0.12)',
  borderRadius: '14px',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
};

const barLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  fontSize: '13px',
  fontWeight: 600,
};

const barTrackStyle = {
  overflow: 'hidden',
  width: '100%',
  height: '10px',
  borderRadius: '999px',
  background: '#e9eef5',
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '14px',
};

function formatDeltaCurrency(amount) {
  if (amount === 0) {
    return formatCurrency(0);
  }

  return `${amount > 0 ? '+' : '-'}${formatCurrency(Math.abs(amount))}`;
}

function formatDeltaPercent(decimal) {
  if (decimal === 0) {
    return formatPercent(0);
  }

  return `${decimal > 0 ? '+' : '-'}${formatPercent(Math.abs(decimal))}`;
}

function getSavingsClass(value) {
  return value >= 0 ? 'savings-positive' : 'savings-negative';
}

function getSavingsColor(value) {
  return value >= 0 ? 'var(--success)' : 'var(--danger)';
}

export default function CostComparison({ state, onChange }) {
  void onChange;

  const currentCosts = calculateCurrentStateCosts(state.currentState);
  const azureCosts = calculateAzureTargetCosts(state.azureTarget);
  const costModel = buildCostModel(currentCosts, azureCosts);
  const savingsClass = getSavingsClass(costModel.totalSavings);
  const maxChartValue = Math.max(
    ...costModel.categories.flatMap((category) => [category.current, category.azure]),
    1,
  );

  const currentBreakdown = Object.entries(CURRENT_PLATFORM_LABELS)
    .filter(([key]) => state.currentState[key]?.enabled)
    .map(([key, label]) => {
      const total = currentCosts[key]?.total ?? 0;

      return {
        label,
        total,
        share: currentCosts.grandTotal > 0 ? total / currentCosts.grandTotal : 0,
      };
    })
    .sort((left, right) => right.total - left.total);

  const azureBreakdown = [
    {
      name: 'Fabric (Compute + Storage)',
      total: azureCosts.fabric.total,
      detail: `${formatCurrency(azureCosts.fabric.compute)} compute + ${formatCurrency(azureCosts.fabric.storage)} storage`,
    },
    {
      name: 'Azure SQL (Compute + Storage)',
      total: azureCosts.azureSql.total,
      detail: `${formatCurrency(azureCosts.azureSql.compute)} compute + ${formatCurrency(azureCosts.azureSql.storage)} storage`,
    },
    {
      name: 'Power BI Licensing',
      total: azureCosts.powerBi.total,
      detail: 'Pro and Premium Per User subscriptions',
    },
    {
      name: 'Additional Services',
      total: azureCosts.additionalServices.total,
      detail: `${formatCurrency(azureCosts.additionalServices.purview)} Purview + ${formatCurrency(azureCosts.additionalServices.dataFactory)} Data Factory + ${formatCurrency(azureCosts.additionalServices.monitorLogAnalytics)} Monitor + ${formatCurrency(azureCosts.additionalServices.networkEgress)} egress`,
    },
    {
      name: 'Labor',
      total: azureCosts.labor.total,
      detail: 'Cloud engineering and platform operations',
    },
  ];

  return (
    <>
      <div className="card">
        <h2>💵 Cost Comparison</h2>
        <p className="subtitle">
          Compare current-state operating costs against the Azure target model and highlight the
          biggest savings opportunities.
        </p>

        <div className="roi-dashboard" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginBottom: '24px' }}>
          <div className="roi-metric" style={summaryCardStyle}>
            <div>
              <h3>Current Annual Cost</h3>
              <p className="roi-metric-label">All enabled source platforms</p>
            </div>
            <div className="roi-metric-value">{formatCurrency(costModel.totalCurrent)}</div>
          </div>

          <div className="roi-metric" style={summaryCardStyle}>
            <div>
              <h3>Azure Annual Cost</h3>
              <p className="roi-metric-label">Steady-state cloud operating model</p>
            </div>
            <div className="roi-metric-value" style={{ color: '#107c10' }}>
              {formatCurrency(costModel.totalAzure)}
            </div>
          </div>

          <div className="roi-metric" style={summaryCardStyle}>
            <div>
              <h3>Annual Savings</h3>
              <p className="roi-metric-label">Net change from current to Azure</p>
            </div>
            <div>
              <div className="roi-metric-value" style={{ color: getSavingsColor(costModel.totalSavings) }}>
                {formatDeltaCurrency(costModel.totalSavings)}
              </div>
              <div className={savingsClass} style={{ fontSize: '14px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {formatDeltaPercent(costModel.totalSavingsPercent)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitleStyle}>
            <div>
              <h3 style={{ marginBottom: '4px', color: 'var(--primary-dark)' }}>Cost Comparison Table</h3>
              <p className="subtitle" style={{ marginBottom: 0 }}>
                Annualized view aligned to the spreadsheet comparison model.
              </p>
            </div>
          </div>

          <table className="comparison-table">
            <thead>
              <tr>
                <th>Cost Category</th>
                <th>Current State</th>
                <th>Azure Target</th>
                <th>Annual Savings</th>
                <th>Savings %</th>
              </tr>
            </thead>
            <tbody>
              {costModel.categories.map((category) => (
                <tr key={category.name}>
                  <td style={{ fontWeight: 600 }}>{category.name}</td>
                  <td>{formatCurrency(category.current)}</td>
                  <td>{formatCurrency(category.azure)}</td>
                  <td className={getSavingsClass(category.savings)}>{formatDeltaCurrency(category.savings)}</td>
                  <td className={getSavingsClass(category.savings)}>{formatDeltaPercent(category.savingsPercent)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, background: '#f4f8fc' }}>
                <td>TOTAL</td>
                <td>{formatCurrency(costModel.totalCurrent)}</td>
                <td>{formatCurrency(costModel.totalAzure)}</td>
                <td className={savingsClass}>{formatDeltaCurrency(costModel.totalSavings)}</td>
                <td className={savingsClass}>{formatDeltaPercent(costModel.totalSavingsPercent)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <div style={sectionTitleStyle}>
            <div>
              <h3 style={{ marginBottom: '4px', color: 'var(--primary-dark)' }}>Category Spend Visual</h3>
              <p className="subtitle" style={{ marginBottom: 0 }}>
                Relative spend by category, scaled to the largest annual value.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span className="badge">Current = Blue</span>
              <span className="badge" style={{ background: '#edf9f0', color: '#107c10' }}>Azure = Green</span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            {costModel.categories.map((category) => (
              <div key={category.name} style={chartTrackStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--primary-dark)' }}>{category.name}</strong>
                  <span className={getSavingsClass(category.savings)}>
                    {formatDeltaCurrency(category.savings)} annual savings
                  </span>
                </div>

                <div>
                  <div style={barLabelStyle}>
                    <span>Current State</span>
                    <span>{formatCurrency(category.current)}</span>
                  </div>
                  <div style={barTrackStyle}>
                    <div
                      style={{
                        width: `${(category.current / maxChartValue) * 100}%`,
                        maxWidth: '100%',
                        height: '100%',
                        borderRadius: 'inherit',
                        background: 'linear-gradient(90deg, #0078d4, #5aa9f4)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={barLabelStyle}>
                    <span>Azure Target</span>
                    <span>{formatCurrency(category.azure)}</span>
                  </div>
                  <div style={barTrackStyle}>
                    <div
                      style={{
                        width: `${(category.azure / maxChartValue) * 100}%`,
                        maxWidth: '100%',
                        height: '100%',
                        borderRadius: 'inherit',
                        background: 'linear-gradient(90deg, #107c10, #54c26b)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="card">
          <div style={sectionTitleStyle}>
            <div>
              <h3 style={{ marginBottom: '4px', color: 'var(--primary-dark)' }}>Current State Breakdown</h3>
              <p className="subtitle" style={{ marginBottom: 0 }}>
                Enabled source platforms contributing to current annual cost.
              </p>
            </div>
          </div>

          <table className="comparison-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Annual Cost</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {currentBreakdown.length > 0 ? (
                currentBreakdown.map((platform) => (
                  <tr key={platform.label}>
                    <td style={{ fontWeight: 600 }}>{platform.label}</td>
                    <td>{formatCurrency(platform.total)}</td>
                    <td>{formatPercent(platform.share)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ color: 'var(--text-light)' }}>
                    No current-state platforms are enabled.
                  </td>
                </tr>
              )}
              <tr style={{ fontWeight: 700, background: '#f4f8fc' }}>
                <td>TOTAL</td>
                <td>{formatCurrency(currentCosts.grandTotal)}</td>
                <td>{formatPercent(currentCosts.grandTotal > 0 ? 1 : 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={sectionTitleStyle}>
            <div>
              <h3 style={{ marginBottom: '4px', color: 'var(--primary-dark)' }}>Azure Target Breakdown</h3>
              <p className="subtitle" style={{ marginBottom: 0 }}>
                Annualized Azure components that make up the target landing zone cost.
              </p>
            </div>
          </div>

          <table className="comparison-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Annual Cost</th>
                <th>Included Detail</th>
              </tr>
            </thead>
            <tbody>
              {azureBreakdown.map((item) => (
                <tr key={item.name}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{formatCurrency(item.total)}</td>
                  <td style={{ color: 'var(--text-light)' }}>{item.detail}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, background: '#f4f8fc' }}>
                <td>TOTAL</td>
                <td>{formatCurrency(azureCosts.grandTotal)}</td>
                <td>Full Azure operating model</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
