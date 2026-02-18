import { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import type { EvaluationTemplate, EvaluationField } from '../types';
import { FileText, Plus, Trash2, Edit, Save, Eye, GripVertical, Copy, X, Check } from 'lucide-react';
import HelpIcon from '../components/HelpIcon';

const FIELD_TYPES: { value: EvaluationField['type']; label: string }[] = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'rating', label: 'Rating Scale' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'number', label: 'Number' },
];

const genId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent';

const EvaluationDesigner = () => {
  const { state, updateState, addAuditEvent } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EvaluationTemplate | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [programId, setProgramId] = useState('');
  const [preceptorIdField, setPreceptorIdField] = useState(true);
  const [fields, setFields] = useState<EvaluationField[]>([]);

  // Field editing state
  const [editingField, setEditingField] = useState<EvaluationField | null>(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<EvaluationField['type']>('text');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldMinValue, setFieldMinValue] = useState(1);
  const [fieldMaxValue, setFieldMaxValue] = useState(5);

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isAdmin = currentUser?.role === 'ProgramAdmin' || currentUser?.role === 'Coordinator';

  const templates = useMemo(() => 
    state.evaluationTemplates.filter(t => t.isActive).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [state.evaluationTemplates]
  );

  const resetForm = () => {
    setName('');
    setDescription('');
    setProgramId('');
    setPreceptorIdField(true);
    setFields([]);
    setEditingTemplate(null);
  };

  const resetFieldForm = () => {
    setFieldLabel('');
    setFieldType('text');
    setFieldRequired(false);
    setFieldOptions('');
    setFieldMinValue(1);
    setFieldMaxValue(5);
    setEditingField(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (template: EvaluationTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description || '');
    setProgramId(template.programId);
    setPreceptorIdField(template.preceptorIdentification);
    setFields([...template.fields]);
    setShowModal(true);
  };

  const handleAddField = () => {
    if (!fieldLabel.trim()) return;
    
    const newField: EvaluationField = {
      id: genId('field'),
      type: fieldType,
      label: fieldLabel.trim(),
      required: fieldRequired,
      options: fieldType === 'select' ? fieldOptions.split('\n').filter(o => o.trim()) : undefined,
      minValue: fieldType === 'rating' || fieldType === 'number' ? fieldMinValue : undefined,
      maxValue: fieldType === 'rating' || fieldType === 'number' ? fieldMaxValue : undefined,
    };

    if (editingField) {
      setFields(fields.map(f => f.id === editingField.id ? { ...newField, id: editingField.id } : f));
    } else {
      setFields([...fields, newField]);
    }
    resetFieldForm();
  };

  const startEditField = (field: EvaluationField) => {
    setEditingField(field);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setFieldOptions(field.options?.join('\n') || '');
    setFieldMinValue(field.minValue || 1);
    setFieldMaxValue(field.maxValue || 5);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSaveTemplate = () => {
    if (!name.trim() || !programId || fields.length === 0) {
      alert('Please fill in all required fields and add at least one form field');
      return;
    }

    const now = new Date().toISOString();
    
    if (editingTemplate) {
      // Create new version
      const newTemplate: EvaluationTemplate = {
        ...editingTemplate,
        name: name.trim(),
        description: description.trim() || undefined,
        programId,
        preceptorIdentification: preceptorIdField,
        fields,
        version: editingTemplate.version + 1,
        updatedAt: now,
      };
      
      updateState(prev => ({
        ...prev,
        evaluationTemplates: prev.evaluationTemplates.map(t =>
          t.id === editingTemplate.id ? newTemplate : t
        ),
      }));
      addAuditEvent('update_evaluation_template', 'evaluationTemplate', editingTemplate.id);
    } else {
      const newTemplate: EvaluationTemplate = {
        id: genId('eval-tmpl'),
        programId,
        name: name.trim(),
        description: description.trim() || undefined,
        version: 1,
        fields,
        preceptorIdentification: preceptorIdField,
        createdAt: now,
        updatedAt: now,
        createdBy: state.activeProfileId,
        isActive: true,
      };
      
      updateState(prev => ({
        ...prev,
        evaluationTemplates: [...prev.evaluationTemplates, newTemplate],
      }));
      addAuditEvent('create_evaluation_template', 'evaluationTemplate', newTemplate.id);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDuplicateTemplate = (template: EvaluationTemplate) => {
    const now = new Date().toISOString();
    const newTemplate: EvaluationTemplate = {
      ...template,
      id: genId('eval-tmpl'),
      name: `${template.name} (Copy)`,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: state.activeProfileId,
    };
    
    updateState(prev => ({
      ...prev,
      evaluationTemplates: [...prev.evaluationTemplates, newTemplate],
    }));
    addAuditEvent('duplicate_evaluation_template', 'evaluationTemplate', newTemplate.id);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!confirm('Are you sure you want to deactivate this evaluation template?')) return;
    
    updateState(prev => ({
      ...prev,
      evaluationTemplates: prev.evaluationTemplates.map(t =>
        t.id === templateId ? { ...t, isActive: false, updatedAt: new Date().toISOString() } : t
      ),
    }));
    addAuditEvent('deactivate_evaluation_template', 'evaluationTemplate', templateId);
  };

  const openPreview = (template: EvaluationTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto pb-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mt-8">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
          <p className="text-gray-500">Only Coordinators and Program Admins can design evaluation templates.</p>
        </div>
      </div>
    );
  }

  const programName = (pid: string) => state.programs.find(p => p.id === pid)?.name ?? 'Unknown';

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary-500" /> Evaluation Designer
            <HelpIcon
              title="Evaluation Designer"
              content={
                <div className="space-y-2">
                  <p>Create and manage preceptor evaluation forms for your programs.</p>
                  <p><strong>Versioning:</strong> Each edit creates a new version while preserving history.</p>
                  <p><strong>Field Types:</strong> Short text, long text, rating scales, dropdowns, checkboxes, and numbers.</p>
                  <p><strong>Preview:</strong> See how the form will look before deploying.</p>
                </div>
              }
            />
          </h1>
          <p className="text-gray-600 mt-1">Create and manage preceptor evaluation forms</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-5 rounded-xl shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" /> New Template
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Evaluation Templates</h3>
            <p className="text-gray-500 mb-4">Create your first preceptor evaluation form.</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" /> Create Template
            </button>
          </div>
        ) : (
          templates.map(template => (
            <div key={template.id} className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      v{template.version}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {programName(template.programId)} · {template.fields.length} fields
                  </p>
                  {template.description && (
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openPreview(template)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(template)}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingTemplate ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingTemplate ? 'Edit Evaluation Template' : 'New Evaluation Template'}
              </h2>
              {editingTemplate && (
                <p className="text-sm opacity-90 mt-1">Creating version {editingTemplate.version + 1}</p>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g., Clinical Rotation Evaluation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                  <select
                    value={programId}
                    onChange={e => setProgramId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select program...</option>
                    {state.programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="Brief description of this evaluation form"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preceptorIdField}
                    onChange={e => setPreceptorIdField(e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    Include preceptor identification field
                  </span>
                </label>
              </div>

              {/* Fields Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Form Fields</h3>
                
                {/* Existing Fields */}
                <div className="space-y-2 mb-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-xs text-gray-500">
                          {FIELD_TYPES.find(t => t.value === field.type)?.label}
                          {field.type === 'rating' && ` (${field.minValue}-${field.maxValue})`}
                          {field.type === 'select' && ` (${field.options?.length || 0} options)`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveField(index, 'down')}
                          disabled={index === fields.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => startEditField(field)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeField(field.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add/Edit Field Form */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">
                    {editingField ? 'Edit Field' : 'Add Field'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label *</label>
                      <input
                        type="text"
                        value={fieldLabel}
                        onChange={e => setFieldLabel(e.target.value)}
                        className={inputClass}
                        placeholder="Field label"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                      <select
                        value={fieldType}
                        onChange={e => setFieldType(e.target.value as EvaluationField['type'])}
                        className={inputClass}
                      >
                        {FIELD_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {fieldType === 'select' && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Options (one per line)
                      </label>
                      <textarea
                        value={fieldOptions}
                        onChange={e => setFieldOptions(e.target.value)}
                        className={inputClass}
                        rows={3}
                        placeholder="Excellent&#10;Good&#10;Satisfactory&#10;Needs Improvement"
                      />
                    </div>
                  )}

                  {(fieldType === 'rating' || fieldType === 'number') && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Min Value</label>
                        <input
                          type="number"
                          value={fieldMinValue}
                          onChange={e => setFieldMinValue(parseInt(e.target.value) || 1)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Max Value</label>
                        <input
                          type="number"
                          value={fieldMaxValue}
                          onChange={e => setFieldMaxValue(parseInt(e.target.value) || 5)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fieldRequired}
                        onChange={e => setFieldRequired(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Required field</span>
                    </label>
                    <div className="flex gap-2">
                      {editingField && (
                        <button
                          onClick={resetFieldForm}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleAddField}
                        disabled={!fieldLabel.trim()}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
                      >
                        {editingField ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingField ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!name.trim() || !programId || fields.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  <Save className="w-5 h-5" /> Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Preview
                  </h2>
                  <p className="text-sm opacity-90">{previewTemplate.name}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {previewTemplate.description && (
                <p className="text-gray-600 text-sm">{previewTemplate.description}</p>
              )}

              {previewTemplate.preceptorIdentification && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preceptor Name <span className="text-red-500">*</span>
                  </label>
                  <select className={inputClass} disabled>
                    <option>Select preceptor...</option>
                  </select>
                </div>
              )}

              {previewTemplate.fields.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'text' && (
                    <input type="text" className={inputClass} disabled placeholder="Short text response" />
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea className={inputClass} rows={3} disabled placeholder="Long text response" />
                  )}
                  
                  {field.type === 'rating' && (
                    <div className="flex gap-2">
                      {Array.from({ length: (field.maxValue || 5) - (field.minValue || 1) + 1 }, (_, i) => i + (field.minValue || 1)).map(n => (
                        <button
                          key={n}
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 text-gray-600 font-medium hover:border-primary-500"
                          disabled
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'select' && (
                    <select className={inputClass} disabled>
                      <option value="">Select...</option>
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  
                  {field.type === 'checkbox' && (
                    <label className="flex items-center gap-2 cursor-not-allowed">
                      <input type="checkbox" disabled className="w-5 h-5" />
                      <span className="text-gray-500">Yes</span>
                    </label>
                  )}
                  
                  {field.type === 'number' && (
                    <input
                      type="number"
                      className={inputClass}
                      disabled
                      placeholder={`${field.minValue || 0} - ${field.maxValue || 100}`}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={() => setShowPreview(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors mt-6"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationDesigner;
