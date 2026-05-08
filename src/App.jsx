import { useMemo, useState } from 'react';
import CurrentStateInputs from './components/CurrentStateInputs.jsx';
import WorkloadProfile from './components/WorkloadProfile.jsx';
import AzureTargetConfig from './components/AzureTargetConfig.jsx';
import CostComparison from './components/CostComparison.jsx';
import RoiAnalysis from './components/RoiAnalysis.jsx';
import QualitativeValue from './components/QualitativeValue.jsx';
import ExportBar from './components/ExportBar.jsx';
import DEFAULT_STATE from './data/defaults.js';

const TABS = [
  { id: 'currentEnvironment', label: 'Current Environment', component: CurrentStateInputs },
  { id: 'workloadProfile', label: 'Workload Profile', component: WorkloadProfile },
  { id: 'azureTarget', label: 'Azure Target', component: AzureTargetConfig },
  { id: 'costComparison', label: 'Cost Comparison', component: CostComparison },
  { id: 'roiAnalysis', label: 'ROI Analysis', component: RoiAnalysis },
  { id: 'strategicValue', label: 'Strategic Value', component: QualitativeValue },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [state, setState] = useState(DEFAULT_STATE);

  const updateState = (path, value) => {
    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i += 1) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleImport = (importedState) => {
    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const deepMerge = (target, source) => {
        for (const key of Object.keys(source)) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      };
      deepMerge(next, importedState);
      return next;
    });
  };

  const ActiveComponent = useMemo(
    () => TABS.find((tab) => tab.id === activeTab)?.component ?? CurrentStateInputs,
    [activeTab],
  );

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Azure migration business case</p>
          <h1>TCO Migration Calculator</h1>
          <p>
            Model current-state costs, Azure landing options, and strategic value across a
            six-step assessment.
          </p>
        </div>
      </header>

      <div className="customer-bar card">
        <div className="form-group customer-input-group">
          <label htmlFor="customerName">Customer / Project Name</label>
          <input
            id="customerName"
            className="customer-input"
            type="text"
            value={state.customerName}
            onChange={(event) => updateState('customerName', event.target.value)}
            placeholder="Enter customer or migration initiative"
          />
        </div>
      </div>

      <nav className="page-nav" aria-label="TCO Calculator pages">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-index">0{index + 1}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        <ActiveComponent state={state} onChange={updateState} />
      </main>

      <ExportBar state={state} onImport={handleImport} />

      <footer className="app-footer">
        <p>TCO Migration Calculator | Fluent-inspired starter shell for Azure migration planning.</p>
      </footer>
    </div>
  );
}
