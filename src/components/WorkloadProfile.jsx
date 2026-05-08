const sectionGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '20px',
};

const cardBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const checkboxRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minHeight: '44px',
};

const checkboxStyle = {
  width: 'auto',
  margin: 0,
  transform: 'scale(1.15)',
};

const sectionTitleStyle = {
  marginBottom: '6px',
};

const percentLabelStyle = {
  marginLeft: 'auto',
  color: 'var(--primary)',
  fontSize: '13px',
  fontWeight: 700,
};

function NumberField({ id, label, value, path, onChange, step, min = 0, suffix }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>
        <span>{label}</span>
        {suffix ? <span style={percentLabelStyle}>{suffix}</span> : null}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(path, Number(event.target.value))}
      />
    </div>
  );
}

function CheckboxField({ id, label, checked, path, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div style={checkboxRowStyle}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          style={checkboxStyle}
          onChange={(event) => onChange(path, event.target.checked)}
        />
        <span>{checked ? 'Enabled' : 'Not required'}</span>
      </div>
    </div>
  );
}

export default function WorkloadProfile({ state, onChange }) {
  const { workload } = state;
  const weekendUsageDisplay = `${Math.round(workload.usage.weekendUsagePercent * 100)}%`;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>📈 Workload Profile</h2>
        <p className="subtitle">
          Define ingestion, query demand, usage peaks, and compliance needs for the target
          analytics estate.
        </p>
      </div>

      <div style={sectionGridStyle}>
        <section className="card" style={cardBodyStyle}>
          <div>
            <h2 style={sectionTitleStyle}>📥 Data Ingestion Patterns</h2>
            <p className="subtitle">Measure source diversity, volume, and refresh cadence.</p>
          </div>
          <div className="form-row">
            <NumberField
              id="dailyVolumeGb"
              label="Daily Data Ingestion Volume (GB)"
              value={workload.ingestion.dailyVolumeGb}
              path="workload.ingestion.dailyVolumeGb"
              onChange={onChange}
            />
            <NumberField
              id="dataSources"
              label="Number of Data Sources"
              value={workload.ingestion.dataSources}
              path="workload.ingestion.dataSources"
              onChange={onChange}
            />
          </div>
          <div className="form-row">
            <NumberField
              id="batchFrequencyPerDay"
              label="Batch Frequency (per day)"
              value={workload.ingestion.batchFrequencyPerDay}
              path="workload.ingestion.batchFrequencyPerDay"
              onChange={onChange}
            />
            <NumberField
              id="realtimeStreamingSources"
              label="Real-time Streaming Sources"
              value={workload.ingestion.realtimeStreamingSources}
              path="workload.ingestion.realtimeStreamingSources"
              onChange={onChange}
            />
          </div>
        </section>

        <section className="card" style={cardBodyStyle}>
          <div>
            <h2 style={sectionTitleStyle}>⚡ Query &amp; Performance Requirements</h2>
            <p className="subtitle">Capture peak concurrency and response-time expectations.</p>
          </div>
          <div className="form-row">
            <NumberField
              id="concurrentPeakUsers"
              label="Concurrent Query Users (Peak)"
              value={workload.queryPerformance.concurrentPeakUsers}
              path="workload.queryPerformance.concurrentPeakUsers"
              onChange={onChange}
            />
            <NumberField
              id="avgQueriesPerDay"
              label="Average Queries per Day"
              value={workload.queryPerformance.avgQueriesPerDay}
              path="workload.queryPerformance.avgQueriesPerDay"
              onChange={onChange}
            />
          </div>
          <div className="form-row">
            <NumberField
              id="dashboardRefreshHours"
              label="Dashboard Refresh Frequency (hours)"
              value={workload.queryPerformance.dashboardRefreshHours}
              path="workload.queryPerformance.dashboardRefreshHours"
              onChange={onChange}
            />
            <NumberField
              id="reportGenSlaSec"
              label="Report Generation Time SLA (seconds)"
              value={workload.queryPerformance.reportGenSlaSec}
              path="workload.queryPerformance.reportGenSlaSec"
              onChange={onChange}
            />
          </div>
        </section>

        <section className="card" style={cardBodyStyle}>
          <div>
            <h2 style={sectionTitleStyle}>📊 Usage Patterns</h2>
            <p className="subtitle">Model user concentration, self-service demand, and business peaks.</p>
          </div>
          <div className="form-row">
            <NumberField
              id="peakHoursPerDay"
              label="Peak Usage Hours per Day"
              value={workload.usage.peakHoursPerDay}
              path="workload.usage.peakHoursPerDay"
              onChange={onChange}
            />
            <NumberField
              id="weekendUsagePercent"
              label="Weekend Usage (% of weekday)"
              value={workload.usage.weekendUsagePercent}
              path="workload.usage.weekendUsagePercent"
              onChange={onChange}
              step={0.05}
              suffix={weekendUsageDisplay}
            />
          </div>
          <div className="form-row">
            <NumberField
              id="businessCriticalDashboards"
              label="Business Critical Dashboards"
              value={workload.usage.businessCriticalDashboards}
              path="workload.usage.businessCriticalDashboards"
              onChange={onChange}
            />
            <NumberField
              id="selfServiceUsers"
              label="Self-Service Analytics Users"
              value={workload.usage.selfServiceUsers}
              path="workload.usage.selfServiceUsers"
              onChange={onChange}
            />
          </div>
        </section>

        <section className="card" style={cardBodyStyle}>
          <div>
            <h2 style={sectionTitleStyle}>🔒 Compliance &amp; Governance</h2>
            <p className="subtitle">Account for regulated workloads, retention, and auditing scope.</p>
          </div>
          <div className="form-row">
            <CheckboxField
              id="hipaaRequired"
              label="HIPAA Compliance Required"
              checked={workload.compliance.hipaaRequired}
              path="workload.compliance.hipaaRequired"
              onChange={onChange}
            />
            <NumberField
              id="dataRetentionYears"
              label="Data Retention Period (years)"
              value={workload.compliance.dataRetentionYears}
              path="workload.compliance.dataRetentionYears"
              onChange={onChange}
            />
          </div>
          <div className="form-row">
            <NumberField
              id="auditLogRetentionYears"
              label="Audit Log Retention (years)"
              value={workload.compliance.auditLogRetentionYears}
              path="workload.compliance.auditLogRetentionYears"
              onChange={onChange}
            />
            <NumberField
              id="phiDataSets"
              label="PHI Data Sets"
              value={workload.compliance.phiDataSets}
              path="workload.compliance.phiDataSets"
              onChange={onChange}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
