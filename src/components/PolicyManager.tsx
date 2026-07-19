import React, { useState } from "react";
import { PolicyTemplate, PolicyClause } from "../types";
import { 
  ShieldCheck, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  BookOpen, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PolicyManagerProps {
  policies: PolicyTemplate[];
  selectedPolicyId: string;
  onSelectPolicy: (id: string) => void;
  onUpdatePolicies: (updated: PolicyTemplate[]) => void;
}

export default function PolicyManager({
  policies,
  selectedPolicyId,
  onSelectPolicy,
  onUpdatePolicies,
}: PolicyManagerProps) {
  const [isEditingLibrary, setIsEditingLibrary] = useState(false);
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);

  // Clause form states
  const [editName, setEditName] = useState("");
  const [editStandardText, setEditStandardText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRisk, setEditRisk] = useState<"Low" | "Medium" | "High">("Medium");

  // New Clause states
  const [isAddingNewClause, setIsAddingNewClause] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStandardText, setNewStandardText] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newRisk, setNewRisk] = useState<"Low" | "Medium" | "High">("Medium");

  const currentPolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  const handleStartEditClause = (clause: PolicyClause) => {
    setEditingClauseId(clause.id);
    setEditName(clause.name);
    setEditStandardText(clause.standardText);
    setEditDescription(clause.description);
    setEditRisk(clause.riskIfMissing);
  };

  const handleSaveClause = (clauseId: string) => {
    if (!editName.trim() || !editStandardText.trim()) return;

    const updatedPolicies = policies.map((p) => {
      if (p.id === selectedPolicyId) {
        return {
          ...p,
          clauses: p.clauses.map((c) => {
            if (c.id === clauseId) {
              return {
                ...c,
                name: editName,
                standardText: editStandardText,
                description: editDescription,
                riskIfMissing: editRisk,
              };
            }
            return c;
          }),
        };
      }
      return p;
    });

    onUpdatePolicies(updatedPolicies);
    setEditingClauseId(null);
  };

  const handleDeleteClause = (clauseId: string) => {
    if (confirm("Are you sure you want to delete this standard rule from the policy?")) {
      const updatedPolicies = policies.map((p) => {
        if (p.id === selectedPolicyId) {
          return {
            ...p,
            clauses: p.clauses.filter((c) => c.id !== clauseId),
          };
        }
        return p;
      });
      onUpdatePolicies(updatedPolicies);
    }
  };

  const handleAddNewClause = () => {
    if (!newName.trim() || !newStandardText.trim()) return;

    const newClause: PolicyClause = {
      id: "custom_" + Date.now(),
      name: newName,
      standardText: newStandardText,
      description: newDescription,
      riskIfMissing: newRisk,
    };

    const updatedPolicies = policies.map((p) => {
      if (p.id === selectedPolicyId) {
        return {
          ...p,
          clauses: [...p.clauses, newClause],
        };
      }
      return p;
    });

    onUpdatePolicies(updatedPolicies);
    setIsAddingNewClause(false);
    setNewName("");
    setNewStandardText("");
    setNewDescription("");
    setNewRisk("Medium");
  };

  const toggleExpand = (id: string) => {
    setExpandedClauseId(expandedClauseId === id ? null : id);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-slate-100">Standard Policy Library</h2>
        </div>
        <button
          onClick={() => setIsEditingLibrary(!isEditingLibrary)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
            isEditingLibrary
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
          }`}
          title="Configure/Modify audit standards"
        >
          <Settings className="h-3.5 w-3.5" />
          {isEditingLibrary ? "Done Settings" : "Configure Rules"}
        </button>
      </div>

      {/* Policy Selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Choose Gold Standard Policy Set:
        </label>
        <select
          value={selectedPolicyId}
          onChange={(e) => onSelectPolicy(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {policies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-slate-400 italic">
          {currentPolicy.description}
        </p>
      </div>

      <div className="border-t border-slate-700/60 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
            Active Rules ({currentPolicy.clauses.length})
          </span>
          {isEditingLibrary && !isAddingNewClause && (
            <button
              onClick={() => setIsAddingNewClause(true)}
              className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2.5 py-1 rounded hover:bg-emerald-500 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Rule
            </button>
          )}
        </div>

        {/* Add New Clause Inline Form */}
        <AnimatePresence>
          {isAddingNewClause && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-slate-900 rounded-lg border border-emerald-500/30 space-y-3"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  New Custom Validation Rule
                </h4>
                <button
                  onClick={() => setIsAddingNewClause(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Intellectual Property Ownership"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="What should the auditor look for, and why?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Gold Standard Rule Text
                </label>
                <textarea
                  rows={3}
                  placeholder="Standard wording or required compliance statement..."
                  value={newStandardText}
                  onChange={(e) => setNewStandardText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Risk If Deficient
                  </label>
                  <select
                    value={newRisk}
                    onChange={(e: any) => setNewRisk(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
                <button
                  onClick={handleAddNewClause}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-1.5 rounded transition"
                >
                  Save Standard Rule
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List of Active Rules */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {currentPolicy.clauses.map((clause) => {
            const isEditing = editingClauseId === clause.id;
            const isExpanded = expandedClauseId === clause.id;

            return (
              <div
                key={clause.id}
                className={`bg-slate-900 rounded-lg border transition ${
                  isExpanded ? "border-slate-600" : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between p-3">
                  <div
                    onClick={() => !isEditing && toggleExpand(clause.id)}
                    className="flex-1 cursor-pointer pr-4"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        {clause.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          clause.riskIfMissing === "High"
                            ? "bg-rose-500/15 text-rose-300 border border-rose-500/25"
                            : clause.riskIfMissing === "Medium"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                            : "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                        }`}
                      >
                        {clause.riskIfMissing}
                      </span>
                    </div>
                    {!isExpanded && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-[280px]">
                        {clause.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isEditingLibrary && (
                      <>
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveClause(clause.id)}
                              className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingClauseId(null)}
                              className="p-1 hover:bg-rose-500/20 text-rose-400 rounded"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEditClause(clause)}
                              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClause(clause.id)}
                              className="p-1 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {!isEditing && (
                      <button
                        onClick={() => toggleExpand(clause.id)}
                        className="p-1 hover:bg-slate-800 text-slate-400 rounded"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded & Edit details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800 px-3 pb-3 pt-2 bg-slate-900/40 text-xs text-slate-300 space-y-2.5 overflow-hidden"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                              Name
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-slate-100 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                              Gold Standard Text
                            </label>
                            <textarea
                              rows={3}
                              value={editStandardText}
                              onChange={(e) => setEditStandardText(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                              Default Risk
                            </label>
                            <select
                              value={editRisk}
                              onChange={(e: any) => setEditRisk(e.target.value)}
                              className="bg-slate-800 border border-slate-700 rounded p-1 text-xs text-slate-100"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="font-semibold text-slate-400 block mb-0.5 uppercase text-[9px]">
                              Rule Description:
                            </span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              {clause.description}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-400 block mb-0.5 uppercase text-[9px]">
                              Gold Standard / Mandatory wording:
                            </span>
                            <p className="bg-slate-950 p-2 rounded text-slate-300 font-mono text-[10px] leading-normal border border-slate-800 whitespace-pre-wrap select-all">
                              {clause.standardText}
                            </p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
