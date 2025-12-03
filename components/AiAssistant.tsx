import React, { useState, useRef, useEffect } from 'react';
import { Task, AIChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';

interface AiAssistantProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

// Speech Recognition Type Definition
interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ tasks, isOpen, onClose }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'Hi! I\'m your project assistant. Ask me anything about your tasks, priorities, or team workload.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Call AI Service
      const responseText = await getChatResponse(userMsg.text, tasks, messages);

      const botMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // --- Voice Features ---
  const startListening = () => {
    const { webkitSpeechRecognition } = window as unknown as IWindow;
    if (!webkitSpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  const speakMessage = (text: string) => {
    window.speechSynthesis.cancel(); // Stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // --- Message Actions ---
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRegenerate = async () => {
    // Find last user message
    const lastUserMsgIndex = messages.findLastIndex(m => m.role === 'user');
    if (lastUserMsgIndex === -1) return;

    const lastUserMsg = messages[lastUserMsgIndex];

    // Remove all messages after the last user message
    setMessages(prev => prev.slice(0, lastUserMsgIndex + 1));
    setIsTyping(true);

    // Re-fetch
    const responseText = await getChatResponse(lastUserMsg.text, tasks, messages.slice(0, lastUserMsgIndex));

    const botMsg: AIChatMessage = {
      id: Date.now().toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleEdit = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-80 sm:w-96 h-[550px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-fade-in-up overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">AI Assistant</h3>
            <p className="text-[10px] text-primary-100 opacity-90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-full p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`group flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

            <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ${msg.role === 'user'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                }`}>
                {msg.role === 'user' ? 'YOU' : 'AI'}
              </div>

              {/* Bubble */}
              <div
                className={`px-4 py-2.5 text-sm shadow-sm relative group-hover:shadow-md transition-shadow ${msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none'
                  }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-10 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Copy */}
              <button onClick={() => handleCopy(msg.text)} className="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="Copy">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>

              {/* Speak (Bot only) */}
              {msg.role === 'model' && (
                <button onClick={() => speakMessage(msg.text)} className="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="Read Aloud">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </button>
              )}

              {/* Regenerate (Latest Bot only) */}
              {msg.role === 'model' && idx === messages.length - 1 && (
                <button onClick={handleRegenerate} className="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="Regenerate">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              )}

              {/* Edit (User only) */}
              {msg.role === 'user' && (
                <button onClick={() => handleEdit(msg.text)} className="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="Edit">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              )}

            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">AI</div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 border border-transparent focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">

          {/* Voice Input Button */}
          <button
            onClick={startListening}
            className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-primary-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            title="Voice Input"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask about tasks..."}
            className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none py-2"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
        <div className="text-[10px] text-center text-gray-400 mt-2">
          AI can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;