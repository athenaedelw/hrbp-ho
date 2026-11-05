import React, { useState, useEffect } from 'react';
import { EntityConfig, DEFAULT_ENTITIES } from '../types/dashboard';
import {
  Building2,
  X,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  AlertCircle,
  Palette,
} from 'lucide-react';

interface ManageEntitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEntities: EntityConfig[];
  onSaveEntities: (updatedEntities: EntityConfig[], nameMigrations: Record<string, string>) => void;
}

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#4f46e5', // Indigo
  '#0d9488', // Teal
  '#dc2626', // Red
  '#475569', // Slate
  '#ca8a04', // Yellow
];

export const ManageEntitiesModal: React.FC<ManageEntitiesModalProps> = ({
  isOpen,
  onClose,
  currentEntities,
  onSaveEntities,
}) => {
  const [entities, setEntities] = useState<EntityConfig[]>(() =>
    JSON.parse(JSON.stringify(currentEntities && currentEntities.length > 0 ? currentEntities : DEFAULT_ENTITIES))
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEntities(JSON.parse(JSON.stringify(currentEntities && currentEntities.length > 0 ? currentEntities : DEFAULT_ENTITIES)));
      setError(null);
    }
  }, [isOpen, currentEntities]);

  if (!isOpen) return null;

  const handleFieldChange = (index: number, field: keyof EntityConfig, value: string) => {
    setError(null);
    setEntities((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddEntity = () => {
    setError(null);
    const newId = `ENT_${Date.now().toString().slice(-4)}`;
    const randomColor = PRESET_COLORS[entities.length % PRESET_COLORS.length];
    const newEntity: EntityConfig = {
      id: newId,
      name: `NEW${entities.length + 1}`,
      fullName: `PT Entity Name ${entities.length + 1}`,
      color: randomColor,
    };
    setEntities((prev) => [...prev, newEntity]);
  };

  const handleDeleteEntity = (index: number) => {
    if (entities.length <= 1) {
      setError('You must keep at least one active entity in the system.');
      return;
    }
    setError(null);
    setEntities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetToDefault = () => {
    if (confirm('Reset entities to the default 7 template entities?')) {
      setEntities(JSON.parse(JSON.stringify(DEFAULT_ENTITIES)));
      setError(null);
    }
  };

  const handleSave = () => {
    // Validation: codes cannot be empty
    for (let i = 0; i < entities.length; i++) {
      const code = entities[i].name?.trim();
      if (!code) {
        setError(`Entity #${i + 1} code / abbreviation cannot be empty.`);
        return;
      }
    }

    // Validation: unique codes
    const namesSet = new Set<string>();
    for (const ent of entities) {
      const upper = ent.name.trim().toUpperCase();
      if (namesSet.has(upper)) {
        setError(`Entity code "${ent.name}" is duplicated. Each entity must have a unique code.`);
        return;
      }
      namesSet.add(upper);
    }

    // Format entity names (trimmed)
    const formattedEntities: EntityConfig[] = entities.map((ent) => ({
      ...ent,
      name: ent.name.trim().toUpperCase(),
      fullName: ent.fullName.trim() || ent.name.trim().toUpperCase(),
    }));

    // Build migration map (old name -> new name)
    const nameMigrations: Record<string, string> = {};
    currentEntities.forEach((oldEnt) => {
      const matched = formattedEntities.find((e) => e.id === oldEnt.id);
      if (matched && matched.name !== oldEnt.name) {
        nameMigrations[oldEnt.name] = matched.name;
      }
    });

    onSaveEntities(formattedEntities, nameMigrations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-slate-900">
      <div className="bg-white border-2 border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Edit Head Office Entities</h3>
              <p className="text-xs font-medium text-slate-500">
                Rename, add, or configure corporate entity codes and company names
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-xs text-slate-600 font-medium bg-blue-50/60 p-3 rounded-xl border border-blue-200">
            <strong>Note:</strong> Renaming an entity code will automatically update all existing data, headcount numbers, charts, and report tables across every month and year.
          </div>

          {/* Entities Table */}
          <div className="overflow-x-auto border-2 border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-36">Entity Code</th>
                  <th className="py-2.5 px-3">Full Legal Company Name</th>
                  <th className="py-2.5 px-3 w-28 text-center">Color</th>
                  <th className="py-2.5 px-2 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {entities.map((ent, idx) => (
                  <tr key={ent.id || idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={ent.name}
                        onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                        placeholder="e.g. KNC"
                        className="w-full bg-white border-2 border-slate-300 focus:border-blue-500 rounded-lg px-2.5 py-1.5 font-black text-slate-900 uppercase"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={ent.fullName}
                        onChange={(e) => handleFieldChange(idx, 'fullName', e.target.value)}
                        placeholder="e.g. PT Kaltim Nusantara Coal"
                        className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-2.5 py-1.5 font-bold text-slate-800"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="color"
                          value={ent.color || '#2563eb'}
                          onChange={(e) => handleFieldChange(idx, 'color', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                          title="Pick custom color"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block border border-slate-400"
                          style={{ backgroundColor: ent.color }}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleDeleteEntity(idx)}
                        disabled={entities.length <= 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                        title="Delete entity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Entity Button */}
          <button
            onClick={handleAddEntity}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-800 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Corporate Entity</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default 7 Entities</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
