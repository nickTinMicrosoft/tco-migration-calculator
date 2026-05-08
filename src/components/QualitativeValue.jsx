const TEXTAREA_STYLE = {
  width: '100%',
  minHeight: '44px',
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  lineHeight: 1.5,
  resize: 'none',
  overflow: 'hidden',
};

const REMOVE_BUTTON_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  border: '1px solid #d0d7de',
  borderRadius: '999px',
  background: '#fff',
  color: '#a4262c',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: 1,
};

const SECTION_CONFIG = [
  {
    category: 'dataUnification',
    icon: '🔗',
    title: 'Data Unification (OneLake/Fabric)',
    subtitle: 'Document how a unified Microsoft data estate improves collaboration and business clarity.',
    columns: [
      { key: 'benefit', label: 'Benefit' },
      { key: 'description', label: 'Description' },
      { key: 'impact', label: 'Business Impact' },
    ],
    template: { benefit: '', description: '', impact: '' },
  },
  {
    category: 'aiReadiness',
    icon: '🤖',
    title: 'AI Readiness (Copilot & Azure AI)',
    subtitle: 'Capture how the future-state platform enables AI-assisted delivery and decision making.',
    columns: [
      { key: 'benefit', label: 'Benefit' },
      { key: 'description', label: 'Description' },
      { key: 'impact', label: 'Business Impact' },
    ],
    template: { benefit: '', description: '', impact: '' },
  },
  {
    category: 'governance',
    icon: '🛡️',
    title: 'Governance & Compliance (Purview)',
    subtitle: 'Highlight governance improvements, policy consistency, and audit-readiness outcomes.',
    columns: [
      { key: 'benefit', label: 'Benefit' },
      { key: 'description', label: 'Description' },
      { key: 'impact', label: 'Business Impact' },
    ],
    template: { benefit: '', description: '', impact: '' },
  },
  {
    category: 'innovation',
    icon: '🚀',
    title: 'Innovation & Business Agility',
    subtitle: 'Show how modernization accelerates experimentation, delivery speed, and stakeholder value.',
    columns: [
      { key: 'benefit', label: 'Benefit' },
      { key: 'description', label: 'Description' },
      { key: 'impact', label: 'Business Impact' },
    ],
    template: { benefit: '', description: '', impact: '' },
  },
  {
    category: 'riskMitigation',
    icon: '⚠️',
    title: 'Risk Mitigation',
    subtitle: 'Compare current-state risk exposure with the mitigation available in Azure and Fabric.',
    columns: [
      { key: 'benefit', label: 'Risk Category' },
      { key: 'risk', label: 'Current State Risk' },
      { key: 'mitigation', label: 'Azure Mitigation' },
    ],
    template: { benefit: '', risk: '', mitigation: '' },
  },
];

const resizeTextarea = (textarea) => {
  if (!textarea) {
    return;
  }

  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

const getTemplate = (category) => SECTION_CONFIG.find((section) => section.category === category)?.template ?? {};

export default function QualitativeValue({ state, onChange }) {
  const qualitativeValue = state.qualitativeValue ?? {};

  const updateItem = (category, index, field, value) => {
    const template = getTemplate(category);
    const items = qualitativeValue[category]?.length ? [...qualitativeValue[category]] : [{ ...template }];
    items[index] = { ...template, ...items[index], [field]: value };
    onChange(`qualitativeValue.${category}`, items);
  };

  const addRow = (category, template) => {
    const items = [...(qualitativeValue[category] ?? []), { ...template }];
    onChange(`qualitativeValue.${category}`, items);
  };

  const removeRow = (category, index) => {
    const items = (qualitativeValue[category] ?? []).filter((_, itemIndex) => itemIndex !== index);
    onChange(`qualitativeValue.${category}`, items);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {SECTION_CONFIG.map(({ category, icon, title, subtitle, columns, template }) => {
        const items = qualitativeValue[category]?.length ? qualitativeValue[category] : [{ ...template }];

        return (
          <section key={category} className="card">
            <h2>{icon} {title}</h2>
            <p className="subtitle">{subtitle}</p>

            <div style={{ overflowX: 'auto' }}>
              <table className="qualitative-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} scope="col">{column.label}</th>
                    ))}
                    <th scope="col" style={{ width: '72px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${category}-${index}`}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          <textarea
                            value={item[column.key] ?? ''}
                            onChange={(event) => {
                              updateItem(category, index, column.key, event.target.value);
                              resizeTextarea(event.target);
                            }}
                            onInput={(event) => resizeTextarea(event.target)}
                            ref={resizeTextarea}
                            rows={1}
                            placeholder={column.label}
                            aria-label={`${title} ${column.label} row ${index + 1}`}
                            style={TEXTAREA_STYLE}
                          />
                        </td>
                      ))}
                      <td style={{ width: '72px', textAlign: 'center', verticalAlign: 'top' }}>
                        {items.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeRow(category, index)}
                            aria-label={`Remove row ${index + 1} from ${title}`}
                            title="Remove row"
                            style={REMOVE_BUTTON_STYLE}
                          >
                            ✕
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => addRow(category, template)}
              >
                Add Row
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
