'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { useToast } from './ui/Toast';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatbotWidget() {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hello! I am your GramVikas helper. You can ask me questions in English, Hindi, or Marathi.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakEnabled, setIsSpeakEnabled] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Sync initial welcome message when language changes
  useEffect(() => {
    const welcome = {
      en: 'Hello! I am your GramVikas helper. Ask me about schemes, certificates, or weather!',
      hi: 'नमस्ते! मैं आपका ग्रामविकास सहायक हूँ। मुझसे योजनाओं, प्रमाणपत्रों या मौसम के बारे में पूछें!',
      mr: 'नमस्कार! मी आपला ग्रामविकास मदतनीस आहे. मला योजना, प्रमाणपत्रे किंवा हवामानाबद्दल विचारा!'
    };
    setMessages([{ sender: 'bot', text: welcome[language] }]);
  }, [language]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          showToast('Speech recognition failed. Try speaking louder.', 'error');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            // Auto trigger send
            handleSend(transcript);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  // Text to Speech
  const speakText = (text: string) => {
    if (!isSpeakEnabled || typeof window === 'undefined') return;

    // Stop current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition is not supported in this browser. Please use Google Chrome.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Configure language dynamically
      recognitionRef.current.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: language
        })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Server error');

      const botReply = json.reply;
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
      
      // Speak bot reply if enabled
      speakText(botReply);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I failed to connect. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window Panel */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[380px] h-[500px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h5 className="font-extrabold text-sm tracking-wide">GramVikas AI Assistant</h5>
                <span className="text-[10px] text-emerald-200 font-semibold block uppercase">Language: {language.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* TTS Read Aloud Toggle */}
              <button
                onClick={() => {
                  const val = !isSpeakEnabled;
                  setIsSpeakEnabled(val);
                  if (!val && typeof window !== 'undefined') window.speechSynthesis.cancel();
                  showToast(val ? 'Text-to-Speech Voice Enabled' : 'Text-to-Speech Voice Muted', 'info');
                }}
                title={isSpeakEnabled ? 'Mute Voice' : 'Enable Voice Output'}
                className={`p-1.5 rounded-lg transition ${
                  isSpeakEnabled ? 'bg-white/20 text-white' : 'text-emerald-300 hover:bg-white/10'
                }`}
              >
                {isSpeakEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                }}
                className="text-white hover:bg-white/10 p-1.5 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Language Selector Selector */}
          <div className="bg-stone-50 dark:bg-stone-950 border-b border-stone-150 dark:border-stone-850 px-4 py-2 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Select Language</span>
            <div className="flex gap-1.5">
              {(['en', 'hi', 'mr'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition uppercase ${
                    language === lang
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'HI' : 'MR'}
                </button>
              ))}
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50 dark:bg-stone-950/10">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-100 border border-stone-100 dark:border-stone-800/40 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-stone-850 border border-stone-100 dark:border-stone-800/40 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend('');
            }}
            className="p-3 border-t border-stone-150 dark:border-stone-850 bg-white dark:bg-stone-900 flex items-center gap-2 shrink-0"
          >
            {/* Mic voice assist button */}
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-stone-100 dark:bg-stone-850 text-stone-500 dark:text-stone-300 hover:bg-stone-200'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Speak your query'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'mr' ? 'प्रश्न विचारा...' : language === 'hi' ? 'प्रश्न पूछें...' : 'Ask assistant...'}
              className="flex-1 px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium dark:text-stone-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-xl transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen && typeof window !== 'undefined') window.speechSynthesis.cancel();
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-stone-800 text-white rotate-90'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
