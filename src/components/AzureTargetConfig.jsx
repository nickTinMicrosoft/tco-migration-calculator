import { FABRIC_SKUS, AZURE_SQL_TIERS } from '../data/fabricSkus.js';

const fmt = (n) => '$' + Math.round(n || 0).toLocaleString();

const sectionStyle = {
  marginBottom: '20px',
  padding: '20px',
  border: '1px solid rgba(0, 120, 212, 0.14)',
  borderRadius: '16px',
  background: 'linear-gradient(180deg, #ffffff, #f8fbff)',
};

const summaryStyle = {
  marginTop: '6px',
  padding: '14px 16px',
  borderRadius: '12px',
  background: 'rgba(0, 120, 212, 0.06)',
  border: '1px solid rgba(0, 120, 212, 0.12)',
};

const totalStyle = {
  marginTop: '14px',
  fontWeight: 700,
  color: '#0f548c',
};

function NumberInput({ id, value, onChange, step = '1' }) {
  return <input id={id} type="number" min="0" step={step} value={value} onChange={onChange} />;
}

function SummaryLine({ label, value, strong = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '8px', fontWeight: strong ? 700 : 500 }}>
      <span>{label}</span>
      <span>{fmt(value)}</span>
    </div>
  );
}

export default function AzureTargetConfig({ state, onChange }) {
  const fabric = state.azureTarget.fabric;
  const azureSql = state.azureTarget.azureSql;
  const powerBi = state.azureTarget.powerBi;
  const additionalServices = state.azureTarget.additionalServices;
  const labor = state.azureTarget.labor;

  const fabricComputeAnnual = fabric.capacityUnits * fabric.monthlyCostPerCu * 12;
  const fabricStorageAnnual = fabric.oneLakeStorageTb * fabric.oneLakeStorageCostPerTbMonth * 12;
  const fabricTotal = fabricComputeAnnual + fabricStorageAnnual;

  const sqlComputeAnnual = azureSql.vCores * azureSql.monthlyCostPerVcore * 12;
  const sqlStorageAnnual = azureSql.storageTb * azureSql.storageCostPerTbMonth * 12;
  const sqlTotal = sqlComputeAnnual + sqlStorageAnnual;

  const powerBiAnnual = ((powerBi.proLicenses * powerBi.proCostPerUserMonth) + (powerBi.ppuLicenses * powerBi.ppuCostPerUserMonth)) * 12;
  const additionalTotal = additionalServices.purview + additionalServices.dataFactory + additionalServices.monitorLogAnalytics + additionalServices.networkEgress;
  const laborTotal = labor.engineerFtes * labor.avgEngineerSalary;
  const grandTotal = fabricTotal + sqlTotal + powerBiAnnual + additionalTotal + laborTotal;

  const handleNumberChange = (path) => (event) => onChange(path, Number(event.target.value) || 0);

  const handleFabricSkuChange = (event) => {
    const sku = FABRIC_SKUS.find((item) => item.name === event.target.value);
    if (!sku) {
      return;
    }

    onChange('azureTarget.fabric.skuSelection', sku.name);
    onChange('azureTarget.fabric.capacityUnits', sku.cu);
    onChange('azureTarget.fabric.monthlyCostPerCu', sku.monthlyCost / sku.cu);
  };

  const handleSqlTierChange = (event) => {
    const tier = AZURE_SQL_TIERS.find((item) => item.name === event.target.value);
    if (!tier) {
      return;
    }

    onChange('azureTarget.azureSql.serviceTier', tier.name);
    onChange('azureTarget.azureSql.monthlyCostPerVcore', tier.monthlyCostPerVcore);
  };

  return (
    <div className="card">
      <h2>☁️ Azure Target</h2>
      <p className="subtitle">Model Microsoft Fabric, Azure SQL, Power BI, supporting services, and labor for your annual Azure target state.</p>

      <section style={sectionStyle}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '4px', color: '#0f548c' }}>🔷 Microsoft Fabric</h3>
          <p style={{ margin: 0, color: '#5f6b7a', fontSize: '14px' }}>Select the Fabric capacity and storage assumptions for the future-state analytics platform.</p>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fabricSkuSelection">Fabric SKU Selection</label>
            <select id="fabricSkuSelection" value={fabric.skuSelection} onChange={handleFabricSkuChange}>
              {FABRIC_SKUS.map((sku) => (
                <option key={sku.name} value={sku.name}>
                  {sku.name} ({sku.cu} CU)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fabricCapacityUnits">Capacity Units</label>
            <NumberInput id="fabricCapacityUnits" value={fabric.capacityUnits} onChange={handleNumberChange('azureTarget.fabric.capacityUnits')} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fabricMonthlyCostPerCu">Monthly Cost per CU</label>
            <NumberInput id="fabricMonthlyCostPerCu" value={fabric.monthlyCostPerCu} onChange={handleNumberChange('azureTarget.fabric.monthlyCostPerCu')} step="0.01" />
          </div>
          <div className="form-group">
            <label htmlFor="oneLakeStorageTb">OneLake Storage (TB)</label>
            <NumberInput id="oneLakeStorageTb" value={fabric.oneLakeStorageTb} onChange={handleNumberChange('azureTarget.fabric.oneLakeStorageTb')} step="0.1" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="oneLakeStorageCostPerTbMonth">OneLake Storage Cost per TB/month</label>
            <NumberInput id="oneLakeStorageCostPerTbMonth" value={fabric.oneLakeStorageCostPerTbMonth} onChange={handleNumberChange('azureTarget.fabric.oneLakeStorageCostPerTbMonth')} step="0.01" />
          </div>
        </div>
        <div style={summaryStyle}>
          <SummaryLine label="Fabric Annual Compute Cost" value={fabricComputeAnnual} />
          <SummaryLine label="OneLake Annual Storage Cost" value={fabricStorageAnnual} />
          <div style={totalStyle}>Section Total: {fmt(fabricTotal)}</div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '4px', color: '#0f548c' }}>🗄️ Azure SQL Database</h3>
          <p style={{ margin: 0, color: '#5f6b7a', fontSize: '14px' }}>Estimate database compute and storage using the right Azure SQL service tier.</p>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="azureSqlServiceTier">Service Tier</label>
            <select id="azureSqlServiceTier" value={azureSql.serviceTier} onChange={handleSqlTierChange}>
              {AZURE_SQL_TIERS.map((tier) => (
                <option key={tier.name} value={tier.name}>
                  {tier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="azureSqlVCores">vCores</label>
            <NumberInput id="azureSqlVCores" value={azureSql.vCores} onChange={handleNumberChange('azureTarget.azureSql.vCores')} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="azureSqlMonthlyCostPerVcore">Monthly Cost per vCore</label>
            <NumberInput id="azureSqlMonthlyCostPerVcore" value={azureSql.monthlyCostPerVcore} onChange={handleNumberChange('azureTarget.azureSql.monthlyCostPerVcore')} step="0.01" />
          </div>
          <div className="form-group">
            <label htmlFor="azureSqlStorageTb">Storage (TB)</label>
            <NumberInput id="azureSqlStorageTb" value={azureSql.storageTb} onChange={handleNumberChange('azureTarget.azureSql.storageTb')} step="0.1" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="azureSqlStorageCostPerTbMonth">Storage Cost per TB/month</label>
            <NumberInput id="azureSqlStorageCostPerTbMonth" value={azureSql.storageCostPerTbMonth} onChange={handleNumberChange('azureTarget.azureSql.storageCostPerTbMonth')} step="0.01" />
          </div>
        </div>
        <div style={summaryStyle}>
          <SummaryLine label="SQL Annual Compute Cost" value={sqlComputeAnnual} />
          <SummaryLine label="SQL Annual Storage Cost" value={sqlStorageAnnual} />
          <div style={totalStyle}>Section Total: {fmt(sqlTotal)}</div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '4px', color: '#0f548c' }}>📊 Power BI Licensing</h3>
          <p style={{ margin: 0, color: '#5f6b7a', fontSize: '14px' }}>Capture Pro and Premium Per User licensing needed to support the analytics estate.</p>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="powerBiProLicenses">Pro Licenses (#)</label>
            <NumberInput id="powerBiProLicenses" value={powerBi.proLicenses} onChange={handleNumberChange('azureTarget.powerBi.proLicenses')} />
          </div>
          <div className="form-group">
            <label htmlFor="powerBiProCost">Pro Cost per User/month</label>
            <NumberInput id="powerBiProCost" value={powerBi.proCostPerUserMonth} onChange={handleNumberChange('azureTarget.powerBi.proCostPerUserMonth')} step="0.01" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="powerBiPpuLicenses">Premium Per User Licenses (#)</label>
            <NumberInput id="powerBiPpuLicenses" value={powerBi.ppuLicenses} onChange={handleNumberChange('azureTarget.powerBi.ppuLicenses')} />
          </div>
          <div className="form-group">
            <label htmlFor="powerBiPpuCost">PPU Cost per User/month</label>
            <NumberInput id="powerBiPpuCost" value={powerBi.ppuCostPerUserMonth} onChange={handleNumberChange('azureTarget.powerBi.ppuCostPerUserMonth')} step="0.01" />
          </div>
        </div>
        <div style={summaryStyle}>
          <SummaryLine label="Power BI Annual Cost" value={powerBiAnnual} strong />
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '4px', color: '#0f548c' }}>☁️ Additional Azure Services</h3>
          <p style={{ margin: 0, color: '#5f6b7a', fontSize: '14px' }}>Add annualized governance, integration, observability, and bandwidth costs.</p>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="azurePurview">Azure Purview (Governance)</label>
            <NumberInput id="azurePurview" value={additionalServices.purview} onChange={handleNumberChange('azureTarget.additionalServices.purview')} step="0.01" />
          </div>
          <div className="form-group">
            <label htmlFor="azureDataFactory">Azure Data Factory (Migration/ETL)</label>
            <NumberInput id="azureDataFactory" value={additionalServices.dataFactory} onChange={handleNumberChange('azureTarget.additionalServices.dataFactory')} step="0.01" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="azureMonitorLogAnalytics">Azure Monitor &amp; Log Analytics</label>
            <NumberInput id="azureMonitorLogAnalytics" value={additionalServices.monitorLogAnalytics} onChange={handleNumberChange('azureTarget.additionalServices.monitorLogAnalytics')} step="0.01" />
          </div>
          <div className="form-group">
            <label htmlFor="azureNetworkEgress">Network Egress &amp; Bandwidth</label>
            <NumberInput id="azureNetworkEgress" value={additionalServices.networkEgress} onChange={handleNumberChange('azureTarget.additionalServices.networkEgress')} step="0.01" />
          </div>
        </div>
        <div style={summaryStyle}>
          <SummaryLine label="Additional Services Subtotal" value={additionalTotal} strong />
        </div>
      </section>

      <section style={{ ...sectionStyle, marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ marginBottom: '4px', color: '#0f548c' }}>👥 Azure Labor Costs</h3>
          <p style={{ margin: 0, color: '#5f6b7a', fontSize: '14px' }}>Estimate the staffing needed to operate and optimize the Azure analytics platform.</p>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="azureEngineerFtes">Azure Engineers (FTEs)</label>
            <NumberInput id="azureEngineerFtes" value={labor.engineerFtes} onChange={handleNumberChange('azureTarget.labor.engineerFtes')} step="0.1" />
          </div>
          <div className="form-group">
            <label htmlFor="azureEngineerSalary">Avg Azure Engineer Salary</label>
            <NumberInput id="azureEngineerSalary" value={labor.avgEngineerSalary} onChange={handleNumberChange('azureTarget.labor.avgEngineerSalary')} step="0.01" />
          </div>
        </div>
        <div style={summaryStyle}>
          <SummaryLine label="Total Labor" value={laborTotal} strong />
        </div>
      </section>

      <div className="cost-summary-bar">
        <span>Total Azure Annual Cost</span>
        <strong>{fmt(grandTotal)}</strong>
      </div>
    </div>
  );
}
