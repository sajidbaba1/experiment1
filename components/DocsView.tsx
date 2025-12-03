
import React, { useState } from 'react';
import { ProjectDoc } from '../types';
import Button from './Button';

interface DocsViewProps {
  docs: ProjectDoc[];
  onSaveDoc: (doc: ProjectDoc) => void;
  onDeleteDoc: (id: string) => void;
}

const DocsView: React.FC<DocsViewProps> = ({ docs, onSaveDoc, onDeleteDoc }) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(docs.length > 0 ? docs[0].id : null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const selectedDoc = docs.find(d => d.id === selectedDocId);

  const handleSelect = (doc: ProjectDoc) => {
    setSelectedDocId(doc.id);
    setIsEditing(false);
    setEditTitle(doc.title);
    setEditContent(doc.content);
  };

  const handleCreateNew = () => {
    const newDoc: ProjectDoc = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      content: '# New Document\nStart typing...',
      updatedAt: Date.now()
    };
    onSaveDoc(newDoc);
    handleSelect(newDoc);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedDocId) {
       onSaveDoc({
         id: selectedDocId,
         title: editTitle,
         content: editContent,
         updatedAt: Date.now()
       });
       setIsEditing(false);
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-800">
       {/* Sidebar */}
       <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
             <h2 className="font-bold text-gray-700 dark:text-white">Documents</h2>
             <button onClick={handleCreateNew} className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {docs.map(doc => (
               <button
                 key={doc.id}
                 onClick={() => handleSelect(doc)}
                 className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${selectedDocId === doc.id ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
               >
                 <svg className="w-4 h-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 <span className="truncate">{doc.title}</span>
               </button>
             ))}
             {docs.length === 0 && (
                <div className="text-center p-4 text-xs text-gray-400">No documents yet.</div>
             )}
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 flex flex-col min-w-0">
          {selectedDoc ? (
            <>
              {/* Toolbar */}
              <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-gray-800">
                 {isEditing ? (
                   <input 
                     type="text" 
                     value={editTitle}
                     onChange={(e) => setEditTitle(e.target.value)}
                     className="text-lg font-bold bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white w-full"
                   />
                 ) : (
                   <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selectedDoc.title}</h1>
                 )}
                 
                 <div className="flex space-x-2 shrink-0 ml-4">
                   {isEditing ? (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => handleSelect(selectedDoc)}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
                      </>
                   ) : (
                      <>
                        <button onClick={() => onDeleteDoc(selectedDoc.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <Button variant="secondary" size="sm" onClick={() => { setEditTitle(selectedDoc.title); setEditContent(selectedDoc.content); setIsEditing(true); }}>Edit</Button>
                      </>
                   )}
                 </div>
              </div>
              
              {/* Editor / Viewer */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                 {isEditing ? (
                   <textarea
                     value={editContent}
                     onChange={(e) => setEditContent(e.target.value)}
                     className="w-full h-full resize-none border-none outline-none text-gray-800 dark:text-gray-200 bg-transparent font-mono text-sm leading-relaxed"
                     placeholder="Write using Markdown..."
                   />
                 ) : (
                   <div className="prose dark:prose-invert max-w-none">
                      {selectedDoc.content.split('\n').map((line, i) => {
                         // Extremely basic markdown rendering for demo
                         if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mb-4">{line.replace('# ', '')}</h1>;
                         if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mb-3 mt-4">{line.replace('## ', '')}</h2>;
                         if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                         return <p key={i} className="mb-2 min-h-[1rem]">{line}</p>;
                      })}
                   </div>
                 )}
              </div>
              <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                 Last updated: {new Date(selectedDoc.updatedAt).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               <p>Select a document or create a new one</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default DocsView;
