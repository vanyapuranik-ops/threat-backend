import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Image as ImageIcon, AlignLeft, ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000'; // Assume backend runs on 5000

function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // States for inputs
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState(['']);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handlePredictText = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/predict-text`, { text: textInput });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      alert("Error predicting text.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredictConversation = async () => {
    const validMessages = messages.filter(m => m.trim() !== '');
    if (validMessages.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/predict-conversation`, { messages: validMessages });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      alert("Error predicting conversation.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredictImage = async () => {
    if (!imageFile) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      const res = await axios.post(`${API_BASE}/predict-image`, formData);
      setResult(res.data);
    } catch (e) {
      console.error(e);
      alert("Error predicting image.");
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = (index, value) => {
    const newMsgs = [...messages];
    newMsgs[index] = value;
    setMessages(newMsgs);
  };

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const getThreatColor = (category) => {
    switch (category) {
      case 'Non-Threat': return 'text-safe bg-safe/10 border-safe/20';
      case 'Harassment': return 'text-harassment bg-harassment/10 border-harassment/20';
      case 'Violent Threat': return 'text-violent bg-violent/10 border-violent/20';
      case 'Rape Threat': return 'text-rape bg-rape/10 border-rape/20';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getThreatIcon = (category) => {
    switch (category) {
      case 'Non-Threat': return <ShieldCheck className="w-8 h-8 text-safe" />;
      case 'Harassment': return <AlertTriangle className="w-8 h-8 text-harassment" />;
      case 'Violent Threat': return <ShieldAlert className="w-8 h-8 text-violent" />;
      case 'Rape Threat': return <AlertOctagon className="w-8 h-8 text-rape" />;
      default: return null;
    }
  };

  return (
    <div className="bg-gradient-animated min-h-screen p-6 md:p-12 flex flex-col items-center">
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center gap-3">
          <ShieldAlert className="text-primary w-10 h-10" />
          ShieldAI
        </h1>
        <p className="text-gray-400 text-lg">Next-generation cyber threat detection.</p>
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Input Panel */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6 md:p-8"
        >
          <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-2xl">
            {[
              { id: 'text', icon: AlignLeft, label: 'Text' },
              { id: 'conv', icon: MessageSquare, label: 'Chat' },
              { id: 'image', icon: ImageIcon, label: 'Image' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setResult(null); }}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[250px] flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'text' && (
                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-4">
                  <textarea 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text to analyze..."
                    className="w-full flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                  <button 
                    onClick={handlePredictText}
                    disabled={loading || !textInput.trim()}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Analyze Text'}
                  </button>
                </motion.div>
              )}

              {activeTab === 'conv' && (
                <motion.div key="conv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-4">
                  <div className="flex-1 max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {messages.map((msg, idx) => (
                      <div key={idx} className="flex gap-2 relative group">
                        <textarea
                          value={msg}
                          onChange={(e) => updateMessage(idx, e.target.value)}
                          placeholder={`Message ${idx + 1}`}
                          rows={2}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                        />
                        {messages.length > 1 && (
                          <button 
                            onClick={() => setMessages(messages.filter((_, i) => i !== idx))}
                            className="absolute -right-2 top-2 bg-red-500/20 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => setMessages([...messages, ''])}
                      className="text-primary text-sm font-medium hover:underline px-2"
                    >
                      + Add Message
                    </button>
                  </div>
                  <button 
                    onClick={handlePredictConversation}
                    disabled={loading || !messages.some(m => m.trim() !== '')}
                    className="w-full bg-primary py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Analyze Conversation'}
                  </button>
                </motion.div>
              )}

              {activeTab === 'image' && (
                <motion.div key="image" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-4">
                  <div className="flex-1 relative rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors bg-black/20 flex items-center justify-center overflow-hidden group cursor-pointer">
                    <input type="file" accept="image/*" onChange={onImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-contain p-2" alt="Preview"/>
                    ) : (
                      <div className="text-center text-gray-500 group-hover:text-primary transition-colors">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">Click or drag image to upload...</p>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handlePredictImage}
                    disabled={loading || !imageFile}
                    className="w-full bg-primary py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Extract & Analyze'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 md:p-8 h-full flex flex-col"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white/80">
            Analysis Results
          </h2>

          <div className="flex-1 flex flex-col justify-center items-center text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-primary">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="animate-pulse">Processing context...</p>
              </div>
            ) : result ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="w-full flex flex-col items-center"
              >
                <div className={`p-5 rounded-3xl border mb-6 inline-flex flex-col items-center gap-3 ${getThreatColor(result.stage_2_category)}`}>
                  {getThreatIcon(result.stage_2_category)}
                  <div className="text-2xl font-bold tracking-tight">
                    {result.stage_2_category}
                  </div>
                </div>

                <div className="w-full bg-black/30 rounded-2xl p-5 mb-4 border border-white/5 text-left">
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">Confidence Score</div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-sm">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="w-full bg-black/30 rounded-2xl p-5 border border-white/5 text-left text-sm text-gray-300">
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">Detailed Report</div>
                  <p>{result.explanation}</p>
                </div>
              </motion.div>
            ) : (
              <div className="text-gray-500 flex flex-col items-center gap-4">
                <ShieldCheck className="w-16 h-16 opacity-20" />
                <p>Submit an input to see the analysis...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}

export default App;
