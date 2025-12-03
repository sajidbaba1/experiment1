
import React, { useState } from 'react';
import { AutomationRule, TaskStatus, TaskPriority } from '../types';
import Button from './Button';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: AutomationRule[];
  onAddRule: (rule: AutomationRule) => void;
  onDeleteRule: (id: string) => void;
  onToggleRule: (id: string) => void;
}

const AutomationModal: React.FC<AutomationModalProps> = ({ isOpen, onClose, rules, onAddRule, onDeleteRule, onToggleRule }) => {
  const [name, setName] = useState('');
  const [triggerValue, setTriggerValue] = useState<TaskStatus>(TaskStatus.DONE);
  const [actionType, setActionType] = useState<'SET_PRIORITY' | 'ADD_COMMENT' | 'ASSIGN_USER'>('SET_PRIORITY');
  const [actionValue, setActionValue] = useState(TaskPriority.LOW);

  // Helper for dynamic action input
  const [commentText, setCommentText] = useState('Task completed automatically.');
  const [assigneeName, setAssigneeName] = useState('You');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!name.trim()) return;

    let finalActionValue = actionValue as string;
    if (actionType === 'ADD_COMMENT') finalActionValue = commentText;
    if (actionType === 'ASSIGN_USER') finalActionValue = assigneeName;

    const newRule: AutomationRule = {
      id: Date.now().toString(),
      name,
      triggerType: 'STATUS_CHANGE',
      triggerValue,
      actionType,
      actionValue: finalActionValue,
      isActive: true
    };
    onAddRule(newRule);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Automation Rules
            </h2>
            <p className="text-xs text-gray-500">Automate your workflow with simple If-This-Then-That logic.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* New Rule Form */}
          <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800 rounded-xl p-4 mb-8">
            <h3 className="text-sm font-bold text-primary-800 dark:text-primary-300 mb-3 uppercase tracking-wide">Create New Rule</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Rule Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Archive Done Tasks"
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">IF Status Becomes</label>
                  <select
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(e.target.value as TaskStatus)}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 outline-none"
                  >
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="hidden sm:block mt-5 text-gray-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>

                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">THEN Do This</label>
                  <div className="flex gap-2">
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value as any)}
                      className="w-1/2 mt-1 px-2 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 outline-none"
                    >
                      <option value="SET_PRIORITY">Set Priority</option>
                      <option value="ADD_COMMENT">Add Comment</option>
                      <option value="ASSIGN_USER">Assign User</option>
                    </select>

                    {actionType === 'SET_PRIORITY' && (
                      <select
                        value={actionValue}
                        onChange={(e) => setActionValue(e.target.value as TaskPriority)}
                        className="w-1/2 mt-1 px-2 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 outline-none"
                      >
                        {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    )}
                    {actionType === 'ADD_COMMENT' && (
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-1/2 mt-1 px-2 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 outline-none"
                      />
                    )}
                    {actionType === 'ASSIGN_USER' && (
                      <input
                        type="text"
                        value={assigneeName}
                        onChange={(e) => setAssigneeName(e.target.value)}
                        className="w-1/2 mt-1 px-2 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button onClick={handleAdd} disabled={!name}>Add Rule</Button>
              </div>
            </div>
          </div>

          {/* Existing Rules List */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Active Rules</h3>
            {rules.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No automations configured.</p>
            ) : (
              <div className="space-y-3">
                {rules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rule.isActive ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{rule.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          When <strong>{rule.triggerValue}</strong> → {rule.actionType === 'SET_PRIORITY' ? 'Set Priority' : rule.actionType === 'ADD_COMMENT' ? 'Comment' : 'Assign'} <strong>"{rule.actionValue}"</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleRule(rule.id)}
                        className={`text-xs px-2 py-1 rounded font-medium border ${rule.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                      >
                        {rule.isActive ? 'Active' : 'Paused'}
                      </button>
                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationModal;
