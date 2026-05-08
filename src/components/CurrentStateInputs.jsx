import { useMemo, useState } from 'react';

const fmt = (n) => '$' + Math.round(n).toLocaleString();

const sectionHeaderBaseStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  width: '100%',
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flex: 1,
  minWidth: 0,
};

const headerTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const helperRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 16,
};

const helperPillStyle = {
  padding: '10px 12px',
  border: '1px solid rgba(0, 120, 212, 0.12)',
  borderRadius: 12,
  background: '#f8fbff',
  minWidth: 180,
};

function readNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function updateNumber(path, value, onChange) {
  onChange(path, value === '' ? 0 : Number(value));
}

function CurrencyInput({ id, label, value, onValueChange }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6b7280',
            fontWeight: 600,
          }}
        >
          $
        </span>
        <input
          id={id}
          type="number"
          min="0"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          style={{ paddingLeft: 28 }}
        />
      </div>
    </div>
  );
}

function NumberInput({ id, label, value, onValueChange, min = '0', step = '1' }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </div>
  );
}

function SectionCard({
  sectionKey,
  icon,
  title,
  enabled,
  subtotal,
  expanded,
  onToggleEnabled,
  onToggleExpanded,
  children,
}) {
  const collapsed = !enabled || !expanded;

  return (
    <section className={`section-card ${collapsed ? 'is-collapsed' : ''}`}>
      <div
        className="section-header"
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={() => enabled && onToggleExpanded()}
        onKeyDown={(event) => {
          if (!enabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggleExpanded();
          }
        }}
        style={enabled ? undefined : { opacity: 0.6, background: '#f3f4f6' }}
      >
        <div style={sectionHeaderBaseStyle}>
          <div style={sectionTitleStyle}>
            <input
              id={`${sectionKey}-enabled`}
              className="section-toggle"
              type="checkbox"
              checked={enabled}
              onChange={(event) => onToggleEnabled(event.target.checked)}
              onClick={(event) => event.stopPropagation()}
              aria-label={`Enable ${title}`}
            />
            <span style={{ fontSize: 24 }} aria-hidden="true">
              {icon}
            </span>
            <div style={headerTextStyle}>
              <h3>{title}</h3>
              <span style={{ color: '#6b7280', fontSize: 13 }}>
                {enabled ? 'Included in current-state cost baseline' : 'Excluded from baseline'}
              </span>
            </div>
          </div>
          <div style={{ paddingRight: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {fmt(subtotal)}
          </div>
        </div>
      </div>
      {!collapsed && <div style={{ padding: '20px' }}>{children}</div>}
    </section>
  );
}

export default function CurrentStateInputs({ state, onChange }) {
  const currentState = state.currentState;
  const [expandedSections, setExpandedSections] = useState(() => ({
    oracle: currentState.oracle.enabled,
    tableau: currentState.tableau.enabled,
    informatica: currentState.informatica.enabled,
    msAccess: currentState.msAccess.enabled,
    sqlServer: currentState.sqlServer.enabled,
    fileSystems: currentState.fileSystems.enabled,
  }));

  const totals = useMemo(() => {
    const oracleLabor = readNumber(currentState.oracle.dbaFtes) * readNumber(currentState.oracle.avgDbaSalary);
    const oracleTotal = currentState.oracle.enabled
      ? readNumber(currentState.oracle.licensing)
        + readNumber(currentState.oracle.infrastructure)
        + readNumber(currentState.oracle.maintenanceSupport)
        + oracleLabor
      : 0;

    const tableauLicenseTotal = readNumber(currentState.tableau.serverLicensing)
      + readNumber(currentState.tableau.creatorLicenses) * readNumber(currentState.tableau.creatorCostPerLicense)
      + readNumber(currentState.tableau.explorerLicenses) * readNumber(currentState.tableau.explorerCostPerLicense);
    const tableauTotal = currentState.tableau.enabled
      ? tableauLicenseTotal + readNumber(currentState.tableau.infrastructure)
      : 0;

    const informaticaTotal = currentState.informatica.enabled
      ? readNumber(currentState.informatica.powerCenterLicensing)
        + readNumber(currentState.informatica.cloudSubscription)
        + readNumber(currentState.informatica.infrastructure)
        + readNumber(currentState.informatica.supportMaintenance)
      : 0;

    const msAccessLabor = readNumber(currentState.msAccess.developerFtes)
      * readNumber(currentState.msAccess.avgDeveloperSalary);
    const msAccessTotal = currentState.msAccess.enabled
      ? readNumber(currentState.msAccess.serverInfrastructure)
        + readNumber(currentState.msAccess.maintenanceSupport)
        + msAccessLabor
      : 0;

    const sqlServerLabor = readNumber(currentState.sqlServer.dbaFtes)
      * readNumber(currentState.sqlServer.avgDbaSalary);
    const sqlServerTotal = currentState.sqlServer.enabled
      ? readNumber(currentState.sqlServer.licensing)
        + readNumber(currentState.sqlServer.infrastructure)
        + readNumber(currentState.sqlServer.maintenanceSupport)
        + sqlServerLabor
      : 0;

    const fileSystemsStorage = readNumber(currentState.fileSystems.storageCapacityTb)
      * readNumber(currentState.fileSystems.storageCostPerTb);
    const fileSystemsLabor = readNumber(currentState.fileSystems.adminFtes)
      * readNumber(currentState.fileSystems.avgAdminSalary);
    const fileSystemsTotal = currentState.fileSystems.enabled
      ? readNumber(currentState.fileSystems.serverInfrastructure) + fileSystemsStorage + fileSystemsLabor
      : 0;

    return {
      oracleLabor,
      oracleTotal,
      tableauLicenseTotal,
      tableauTotal,
      informaticaTotal,
      msAccessLabor,
      msAccessTotal,
      sqlServerLabor,
      sqlServerTotal,
      fileSystemsStorage,
      fileSystemsLabor,
      fileSystemsTotal,
      grandTotal:
        oracleTotal
        + tableauTotal
        + informaticaTotal
        + msAccessTotal
        + sqlServerTotal
        + fileSystemsTotal,
    };
  }, [currentState]);

  const setEnabled = (sectionKey, enabled) => {
    onChange(`currentState.${sectionKey}.enabled`, enabled);
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: enabled ? true : false }));
  };

  const toggleExpanded = (sectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  return (
    <div className="card">
      <h2>📋 Current Environment</h2>
      <p className="subtitle">
        Capture the current annual run-rate for databases, BI, integration, and file-based workloads.
      </p>

      <div style={{ display: 'grid', gap: 16 }}>
        <SectionCard
          sectionKey="oracle"
          icon="🛢️"
          title="Oracle Database"
          enabled={currentState.oracle.enabled}
          subtotal={totals.oracleTotal}
          expanded={expandedSections.oracle}
          onToggleEnabled={(checked) => setEnabled('oracle', checked)}
          onToggleExpanded={() => toggleExpanded('oracle')}
        >
          <div className="form-row cols-3">
            <CurrencyInput
              id="oracle-licensing"
              label="Licensing"
              value={currentState.oracle.licensing}
              onValueChange={(value) => updateNumber('currentState.oracle.licensing', value, onChange)}
            />
            <CurrencyInput
              id="oracle-infrastructure"
              label="Infrastructure"
              value={currentState.oracle.infrastructure}
              onValueChange={(value) => updateNumber('currentState.oracle.infrastructure', value, onChange)}
            />
            <CurrencyInput
              id="oracle-maintenance"
              label="Maintenance / Support"
              value={currentState.oracle.maintenanceSupport}
              onValueChange={(value) => updateNumber('currentState.oracle.maintenanceSupport', value, onChange)}
            />
          </div>
          <div className="form-row">
            <NumberInput
              id="oracle-dba-ftes"
              label="DBA FTEs"
              value={currentState.oracle.dbaFtes}
              step="0.1"
              onValueChange={(value) => updateNumber('currentState.oracle.dbaFtes', value, onChange)}
            />
            <CurrencyInput
              id="oracle-dba-salary"
              label="Avg DBA Salary"
              value={currentState.oracle.avgDbaSalary}
              onValueChange={(value) => updateNumber('currentState.oracle.avgDbaSalary', value, onChange)}
            />
          </div>
          <div style={helperRowStyle}>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Calculated labor cost</div>
              <strong>{fmt(totals.oracleLabor)}</strong>
            </div>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Section total</div>
              <strong>{fmt(totals.oracleTotal)}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          sectionKey="tableau"
          icon="📊"
          title="Tableau"
          enabled={currentState.tableau.enabled}
          subtotal={totals.tableauTotal}
          expanded={expandedSections.tableau}
          onToggleEnabled={(checked) => setEnabled('tableau', checked)}
          onToggleExpanded={() => toggleExpanded('tableau')}
        >
          <div className="form-row">
            <CurrencyInput
              id="tableau-server-licensing"
              label="Server Licensing"
              value={currentState.tableau.serverLicensing}
              onValueChange={(value) => updateNumber('currentState.tableau.serverLicensing', value, onChange)}
            />
            <CurrencyInput
              id="tableau-infrastructure"
              label="Infrastructure"
              value={currentState.tableau.infrastructure}
              onValueChange={(value) => updateNumber('currentState.tableau.infrastructure', value, onChange)}
            />
          </div>
          <div className="form-row cols-3">
            <NumberInput
              id="tableau-creator-licenses"
              label="Creator Licenses"
              value={currentState.tableau.creatorLicenses}
              onValueChange={(value) => updateNumber('currentState.tableau.creatorLicenses', value, onChange)}
            />
            <CurrencyInput
              id="tableau-creator-cost"
              label="Creator Cost / License"
              value={currentState.tableau.creatorCostPerLicense}
              onValueChange={(value) => updateNumber('currentState.tableau.creatorCostPerLicense', value, onChange)}
            />
            <div className="form-group">
              <label>Creator Spend</label>
              <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8f9fa', minHeight: 48 }}>
                {fmt(readNumber(currentState.tableau.creatorLicenses) * readNumber(currentState.tableau.creatorCostPerLicense))}
              </div>
            </div>
          </div>
          <div className="form-row cols-3">
            <NumberInput
              id="tableau-explorer-licenses"
              label="Explorer Licenses"
              value={currentState.tableau.explorerLicenses}
              onValueChange={(value) => updateNumber('currentState.tableau.explorerLicenses', value, onChange)}
            />
            <CurrencyInput
              id="tableau-explorer-cost"
              label="Explorer Cost / License"
              value={currentState.tableau.explorerCostPerLicense}
              onValueChange={(value) => updateNumber('currentState.tableau.explorerCostPerLicense', value, onChange)}
            />
            <div className="form-group">
              <label>Explorer Spend</label>
              <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8f9fa', minHeight: 48 }}>
                {fmt(readNumber(currentState.tableau.explorerLicenses) * readNumber(currentState.tableau.explorerCostPerLicense))}
              </div>
            </div>
          </div>
          <div style={helperRowStyle}>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Calculated total license cost</div>
              <strong>{fmt(totals.tableauLicenseTotal)}</strong>
            </div>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Section total</div>
              <strong>{fmt(totals.tableauTotal)}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          sectionKey="informatica"
          icon="🔄"
          title="Informatica"
          enabled={currentState.informatica.enabled}
          subtotal={totals.informaticaTotal}
          expanded={expandedSections.informatica}
          onToggleEnabled={(checked) => setEnabled('informatica', checked)}
          onToggleExpanded={() => toggleExpanded('informatica')}
        >
          <div className="form-row cols-3">
            <CurrencyInput
              id="informatica-powercenter"
              label="PowerCenter Licensing"
              value={currentState.informatica.powerCenterLicensing}
              onValueChange={(value) => updateNumber('currentState.informatica.powerCenterLicensing', value, onChange)}
            />
            <CurrencyInput
              id="informatica-cloud"
              label="Cloud / IICS Subscription"
              value={currentState.informatica.cloudSubscription}
              onValueChange={(value) => updateNumber('currentState.informatica.cloudSubscription', value, onChange)}
            />
            <CurrencyInput
              id="informatica-infrastructure"
              label="Infrastructure"
              value={currentState.informatica.infrastructure}
              onValueChange={(value) => updateNumber('currentState.informatica.infrastructure', value, onChange)}
            />
          </div>
          <div className="form-row">
            <CurrencyInput
              id="informatica-support"
              label="Support & Maintenance"
              value={currentState.informatica.supportMaintenance}
              onValueChange={(value) => updateNumber('currentState.informatica.supportMaintenance', value, onChange)}
            />
          </div>
          <div style={helperRowStyle}>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Section total</div>
              <strong>{fmt(totals.informaticaTotal)}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          sectionKey="msAccess"
          icon="🗃️"
          title="MS Access"
          enabled={currentState.msAccess.enabled}
          subtotal={totals.msAccessTotal}
          expanded={expandedSections.msAccess}
          onToggleEnabled={(checked) => setEnabled('msAccess', checked)}
          onToggleExpanded={() => toggleExpanded('msAccess')}
        >
          <div className="form-row cols-3">
            <NumberInput
              id="msaccess-instances"
              label="Database Instances"
              value={currentState.msAccess.instances}
              onValueChange={(value) => updateNumber('currentState.msAccess.instances', value, onChange)}
            />
            <CurrencyInput
              id="msaccess-infrastructure"
              label="Server Infrastructure"
              value={currentState.msAccess.serverInfrastructure}
              onValueChange={(value) => updateNumber('currentState.msAccess.serverInfrastructure', value, onChange)}
            />
            <CurrencyInput
              id="msaccess-maintenance"
              label="Maintenance / Support"
              value={currentState.msAccess.maintenanceSupport}
              onValueChange={(value) => updateNumber('currentState.msAccess.maintenanceSupport', value, onChange)}
            />
          </div>
          <div className="form-row">
            <NumberInput
              id="msaccess-developer-ftes"
              label="Developer FTEs"
              value={currentState.msAccess.developerFtes}
              step="0.1"
              onValueChange={(value) => updateNumber('currentState.msAccess.developerFtes', value, onChange)}
            />
            <CurrencyInput
              id="msaccess-developer-salary"
              label="Avg Developer Salary"
              value={currentState.msAccess.avgDeveloperSalary}
              onValueChange={(value) => updateNumber('currentState.msAccess.avgDeveloperSalary', value, onChange)}
            />
          </div>
          <div style={helperRowStyle}>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Calculated labor cost</div>
              <strong>{fmt(totals.msAccessLabor)}</strong>
            </div>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Section total</div>
              <strong>{fmt(totals.msAccessTotal)}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          sectionKey="sqlServer"
          icon="🧮"
          title="SQL Server"
          enabled={currentState.sqlServer.enabled}
          subtotal={totals.sqlServerTotal}
          expanded={expandedSections.sqlServer}
          onToggleEnabled={(checked) => setEnabled('sqlServer', checked)}
          onToggleExpanded={() => toggleExpanded('sqlServer')}
        >
          <div className="form-row cols-3">
            <CurrencyInput
              id="sqlserver-licensing"
              label="Licensing"
              value={currentState.sqlServer.licensing}
              onValueChange={(value) => updateNumber('currentState.sqlServer.licensing', value, onChange)}
            />
            <CurrencyInput
              id="sqlserver-infrastructure"
              label="Infrastructure"
              value={currentState.sqlServer.infrastructure}
              onValueChange={(value) => updateNumber('currentState.sqlServer.infrastructure', value, onChange)}
            />
            <CurrencyInput
              id="sqlserver-maintenance"
              label="Maintenance / Support"
              value={currentState.sqlServer.maintenanceSupport}
              onValueChange={(value) => updateNumber('currentState.sqlServer.maintenanceSupport', value, onChange)}
            />
          </div>
          <div className="form-row">
            <NumberInput
              id="sqlserver-dba-ftes"
              label="DBA FTEs"
              value={currentState.sqlServer.dbaFtes}
              step="0.1"
              onValueChange={(value) => updateNumber('currentState.sqlServer.dbaFtes', value, onChange)}
            />
            <CurrencyInput
              id="sqlserver-dba-salary"
              label="Avg DBA Salary"
              value={currentState.sqlServer.avgDbaSalary}
              onValueChange={(value) => updateNumber('currentState.sqlServer.avgDbaSalary', value, onChange)}
            />
          </div>
          <div style={helperRowStyle}>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Calculated labor cost</div>
              <strong>{fmt(totals.sqlServerLabor)}</strong>
            </div>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Section total</div>
              <strong>{fmt(totals.sqlServerTotal)}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          sectionKey="fileSystems"
          icon="📁"
          title="File Systems"
          enabled={currentState.fileSystems.enabled}
          subtotal={totals.fileSystemsTotal}
          expanded={expandedSections.fileSystems}
          onToggleEnabled={(checked) => setEnabled('fileSystems', checked)}
          onToggleExpanded={() => toggleExpanded('fileSystems')}
        >
          <div className="form-row cols-3">
            <CurrencyInput
              id="filesystems-infrastructure"
              label="Server Infrastructure"
              value={currentState.fileSystems.serverInfrastructure}
              onValueChange={(value) => updateNumber('currentState.fileSystems.serverInfrastructure', value, onChange)}
            />
            <NumberInput
              id="filesystems-storage-capacity"
              label="Storage Capacity (TB)"
              value={currentState.fileSystems.storageCapacityTb}
              step="0.1"
              onValueChange={(value) => updateNumber('currentState.fileSystems.storageCapacityTb', value, onChange)}
            />
            <CurrencyInput
              id="filesystems-storage-cost"
              label="Cost per TB"
              value={currentState.fileSystems.storageCostPerTb}
              onValueChange={(value) => updateNumber('currentState.fileSystems.storageCostPerTb', value, onChange)}
            />
          </div>
          <div className="form-row">
            <NumberInput
              id="filesystems-admin-ftes"
              label="Admin FTEs"
              value={currentState.fileSystems.adminFtes}
              step="0.1"
              onValueChange={(value) => updateNumber('currentState.fileSystems.adminFtes', value, onChange)}
            />
            <CurrencyInput
              id="filesystems-admin-salary"
              label="Avg Admin Salary"
              value={currentState.fileSystems.avgAdminSalary}
              onValueChange={(value) => updateNumber('currentState.fileSystems.avgAdminSalary', value, onChange)}
            />
          </div>
          <div style={helperRowStyle}>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Calculated storage cost</div>
              <strong>{fmt(totals.fileSystemsStorage)}</strong>
            </div>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Calculated labor cost</div>
              <strong>{fmt(totals.fileSystemsLabor)}</strong>
            </div>
            <div style={helperPillStyle}>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Section total</div>
              <strong>{fmt(totals.fileSystemsTotal)}</strong>
            </div>
          </div>
        </SectionCard>

        <section className="section-card">
          <div
            style={{
              padding: '18px 20px',
              background: 'linear-gradient(180deg, #fcfcfb, #f7f7f6)',
              borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }} aria-hidden="true">
                🧾
              </span>
              <div>
                <h3 style={{ fontSize: 16 }}>Environment Metadata</h3>
                <span style={{ color: '#6b7280', fontSize: 13 }}>
                  Context that helps scale the migration business case.
                </span>
              </div>
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <div className="form-row cols-3">
              <NumberInput
                id="metadata-data-volume"
                label="Total Data Volume (TB)"
                value={currentState.metadata.totalDataVolumeTb}
                step="0.1"
                onValueChange={(value) => updateNumber('currentState.metadata.totalDataVolumeTb', value, onChange)}
              />
              <div className="form-group">
                <label htmlFor="metadata-growth-rate">Annual Growth Rate (%)</label>
                <input
                  id="metadata-growth-rate"
                  type="number"
                  min="0"
                  step="0.1"
                  value={readNumber(currentState.metadata.annualGrowthRate) * 100}
                  onChange={(event) => onChange('currentState.metadata.annualGrowthRate', Number(event.target.value) / 100)}
                />
              </div>
              <NumberInput
                id="metadata-dashboard-count"
                label="Dashboard Count"
                value={currentState.metadata.dashboardCount}
                onValueChange={(value) => updateNumber('currentState.metadata.dashboardCount', value, onChange)}
              />
            </div>
            <div className="form-row">
              <NumberInput
                id="metadata-active-users"
                label="Active Users"
                value={currentState.metadata.activeUsers}
                onValueChange={(value) => updateNumber('currentState.metadata.activeUsers', value, onChange)}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="cost-summary-bar" style={{ marginTop: 20, marginBottom: 0 }}>
        <span>Current annual cost across enabled platforms</span>
        <strong>{fmt(totals.grandTotal)}</strong>
      </div>
    </div>
  );
}
