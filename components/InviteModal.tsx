import React, { useState } from 'react';
import { api } from '../services/api';
import Button from './Button';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!email) return;
        setIsSending(true);
        setMessage(null);
        try {
            await api.inviteMember(email);
            setMessage({ text: 'Invitation sent successfully!', type: 'success' });
            setEmail('');
            setTimeout(onClose, 2000);
        } catch (error: any) {
            const errorMsg = error.message || 'Failed to send invitation.';
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                📧
                            </span>
                            Invite Member
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button variant="primary" onClick={handleSend} disabled={isSending || !email}>
                                {isSending ? 'Sending...' : 'Send Invite'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
