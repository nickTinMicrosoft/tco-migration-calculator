import { useRef, useState } from 'react';
import { generateTemplate, importTemplate } from '../utils/excelTemplate.js';

const STORAGE_KEY = 'tco_assessments';

const feedbackStyle = {
  marginTop: '12px',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '14px',
  whiteSpace: 'pre-line',
};

const getSavedAssessments = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAssessments = (assessments) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
  }
};

export default function ExportBar({ state, onImport }) {
  const fileInputRef = useRef(null);
  const [feedback, setFeedback] = useState(null);
  const [savedAssessments, setSavedAssessments] = useState(() => getSavedAssessments());
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [showLoadPanel, setShowLoadPanel] = useState(false);

  const handleDownload = () => {
    generateTemplate(state);
    setFeedback({ type: 'success', text: 'Excel template downloaded.' });
  };

  const handleSaveAssessment = () => {
    const nextAssessment = {
      id: Date.now(),
      name: state.customerName || 'Untitled',
      date: new Date().toISOString(),
      state,
    };

    const nextSavedAssessments = [nextAssessment, ...getSavedAssessments()];
    saveAssessments(nextSavedAssessments);
    setSavedAssessments(nextSavedAssessments);
    setSelectedAssessmentId(String(nextAssessment.id));
    setShowLoadPanel(true);
    setFeedback({
      type: 'success',
      text: `Saved assessment "${nextAssessment.name}".`,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleLoadAssessment = () => {
    const selectedAssessment = savedAssessments.find(
      (assessment) => String(assessment.id) === selectedAssessmentId,
    );

    if (!selectedAssessment) {
      setFeedback({ type: 'warning', text: 'Select a saved assessment to load.' });
      return;
    }

    onImport(selectedAssessment.state);
    setFeedback({
      type: 'success',
      text: `Loaded assessment "${selectedAssessment.name}" from ${new Date(selectedAssessment.date).toLocaleString()}.`,
    });
  };

  const handleDeleteAssessment = () => {
    if (!selectedAssessmentId) {
      setFeedback({ type: 'warning', text: 'Select a saved assessment to delete.' });
      return;
    }

    const assessmentToDelete = savedAssessments.find(
      (assessment) => String(assessment.id) === selectedAssessmentId,
    );
    const nextSavedAssessments = savedAssessments.filter(
      (assessment) => String(assessment.id) !== selectedAssessmentId,
    );

    saveAssessments(nextSavedAssessments);
    setSavedAssessments(nextSavedAssessments);
    setSelectedAssessmentId(nextSavedAssessments[0] ? String(nextSavedAssessments[0].id) : '');
    setFeedback({
      type: 'success',
      text: assessmentToDelete
        ? `Deleted assessment "${assessmentToDelete.name}".`
        : 'Deleted saved assessment.',
    });
  };

  const handleClearAssessments = () => {
    saveAssessments([]);
    setSavedAssessments([]);
    setSelectedAssessmentId('');
    setFeedback({ type: 'success', text: 'Cleared all saved assessments.' });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const result = await importTemplate(file);
      onImport(result.state);

      const warningText = result.warnings.length
        ? `Imported template with warnings:\n${result.warnings.join('\n')}`
        : `Imported ${file.name} successfully.`;

      setFeedback({
        type: result.warnings.length ? 'warning' : 'success',
        text: warningText,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: `Import failed: ${error instanceof Error ? error.message : 'Unable to read workbook.'}`,
      });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="export-bar card">
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3>Export &amp; Share</h3>
        <p>Download the Excel template, import completed inputs, save assessments locally, or wait for the PDF summary option.</p>
        {feedback ? (
          <div
            style={{
              ...feedbackStyle,
              background:
                feedback.type === 'error'
                  ? 'rgba(209, 52, 56, 0.08)'
                  : feedback.type === 'warning'
                    ? 'rgba(255, 185, 0, 0.14)'
                    : 'rgba(16, 124, 16, 0.08)',
              border:
                feedback.type === 'error'
                  ? '1px solid rgba(209, 52, 56, 0.2)'
                  : feedback.type === 'warning'
                    ? '1px solid rgba(255, 185, 0, 0.24)'
                    : '1px solid rgba(16, 124, 16, 0.18)',
              color:
                feedback.type === 'error'
                  ? 'var(--danger)'
                  : feedback.type === 'warning'
                    ? '#8a6500'
                    : 'var(--success)',
            }}
          >
            {feedback.text}
          </div>
        ) : null}
      </div>
      <div className="export-actions">
        <button type="button" className="btn-download" onClick={handleDownload}>
          Download Template
        </button>
        <button type="button" className="btn-download" onClick={handleImportClick}>
          Import Template
        </button>
        <button type="button" className="btn-download" onClick={handleSaveAssessment}>
          Save Assessment
        </button>
        <button
          type="button"
          className="btn-download"
          onClick={() => setShowLoadPanel((current) => !current)}
        >
          {showLoadPanel ? 'Hide Saved Assessments' : 'Load Assessment'}
        </button>
        <button type="button" className="btn-export" disabled title="Coming soon">
          PDF Export (Coming soon)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      {showLoadPanel ? (
        <div className="saved-assessment-panel">
          <label className="saved-assessment-label" htmlFor="savedAssessmentSelect">
            Saved Assessments
          </label>
          <div className="saved-assessment-controls">
            <select
              id="savedAssessmentSelect"
              className="saved-assessment-select"
              value={selectedAssessmentId}
              onChange={(event) => setSelectedAssessmentId(event.target.value)}
            >
              <option value="">Select an assessment</option>
              {savedAssessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.name} · {new Date(assessment.date).toLocaleString()}
                </option>
              ))}
            </select>
            <button type="button" className="btn-primary" onClick={handleLoadAssessment}>
              Load
            </button>
            <button type="button" className="btn-secondary" onClick={handleDeleteAssessment}>
              Delete
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearAssessments}
              disabled={!savedAssessments.length}
            >
              Clear All
            </button>
          </div>
          {!savedAssessments.length ? <p>No saved assessments yet.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
