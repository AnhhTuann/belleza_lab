import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Palette, Droplet, RefreshCw, Sparkles, AlertTriangle, Wand2, CheckCircle, Info, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';
import chroma from 'chroma-js';
import { analyzeArt, ArtAnalysisResult, FinalPaletteColor, chatWithBelle, ChatMessage } from './services/geminiService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ArtLoader = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10"
  >
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
        borderRadius: ["30% 70% 70% 30%", "50% 50% 50% 50%", "30% 70% 70% 30%"]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-200 blur-sm"
    />
    <p className="mt-6 font-serif italic text-gray-700 font-medium text-lg">
      Belleza Lab đang cảm thụ bức tranh...
    </p>
  </motion.div>
);

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ArtAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'optimized' | 'belle'>('current');
  const [selectedColor, setSelectedColor] = useState<FinalPaletteColor | null>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'belle' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatting, activeTab]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setActiveTab('current');
    setSelectedColor(null);
    setChatHistory([]);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
        
        try {
          const base64Data = result.split(',')[1];
          setBase64Image(base64Data);
          setMimeType(compressedFile.type);
          
          const analysis = await analyzeArt(base64Data, compressedFile.type, signal);
          setAnalysisResult(analysis);
          if (analysis.suggestions.final_palette.length > 0) {
            setSelectedColor(analysis.suggestions.final_palette[0]);
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.log('Analysis aborted');
          } else {
            console.error(err);
            setError('Failed to analyze the image. Please try again.');
          }
        } finally {
          if (!signal.aborted) {
            setIsAnalyzing(false);
          }
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error("Compression error:", err);
      setError('Failed to process the image.');
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const resetApp = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setImageSrc(null);
    setBase64Image(null);
    setMimeType(null);
    setAnalysisResult(null);
    setError(null);
    setIsAnalyzing(false);
    setActiveTab('current');
    setSelectedColor(null);
    setChatHistory([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTextColor = (hex: string) => {
    try {
      return chroma.contrast(hex, 'white') > 4.5 ? 'text-white' : 'text-gray-900';
    } catch {
      return 'text-gray-900';
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !base64Image || !mimeType || !analysisResult) return;
    
    const userMessage = text.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatting(true);

    try {
      const responseText = await chatWithBelle(
        userMessage,
        chatHistory,
        base64Image,
        mimeType,
        analysisResult
      );
      setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory(prev => [...prev, { role: 'model', text: "Xin lỗi Tuấn, Belle đang gặp chút sự cố kết nối. Bạn thử lại sau nhé!" }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden relative">
      {imageSrc && (
        <div 
          className="absolute inset-0 z-0 opacity-20 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(100px)'
          }}
        />
      )}

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 md:p-12 h-screen overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold tracking-tight text-gray-900 mb-3">
              Belleza Lab
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Upload a painting to extract its color palette, discover mixing formulas, and identify the medium.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!imageSrc ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-2xl aspect-[4/3] md:aspect-[16/9] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                  isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-gray-400 bg-white/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 text-gray-400">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Drag & drop your painting</h3>
                <p className="text-gray-500 text-sm">or click to browse files</p>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl relative group"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white">
                  <img
                    src={imageSrc}
                    alt="Uploaded artwork"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                  <AnimatePresence>
                    {isAnalyzing && <ArtLoader />}
                  </AnimatePresence>
                </div>
                
                {!isAnalyzing && (
                  <button
                    onClick={resetApp}
                    className="mt-6 mx-auto flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-700 font-medium border border-gray-200"
                  >
                    <RefreshCw size={18} />
                    Analyze Another Image
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100"
            >
              {error}
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {(isAnalyzing || analysisResult) && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full md:w-[400px] lg:w-[480px] h-screen overflow-y-auto sidebar-glass z-20 flex-shrink-0 flex flex-col"
          >
            <div className="p-8 flex-1 flex flex-col">
              <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-3">
                <ImageIcon className="text-blue-500" />
                Analysis Results
              </h2>

              {isAnalyzing ? (
                <div className="space-y-8">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200/50 rounded w-1/3 mb-4"></div>
                    <div className="h-24 bg-gray-200/50 rounded-xl w-full"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200/50 rounded w-1/2 mb-4"></div>
                    <div className="grid grid-cols-1 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-gray-200/50 rounded-xl w-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="flex-1 flex flex-col">
                  
                  {/* Tabs */}
                  <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-xl border border-white/50 mb-8 flex-shrink-0">
                    <button
                      onClick={() => setActiveTab('current')}
                      className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'current' 
                          ? 'bg-white shadow-sm text-gray-900' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Current
                    </button>
                    <button
                      onClick={() => setActiveTab('optimized')}
                      className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                        activeTab === 'optimized' 
                          ? 'bg-white shadow-sm text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Wand2 size={14} />
                      Optimized
                    </button>
                    <button
                      onClick={() => setActiveTab('belle')}
                      className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                        activeTab === 'belle' 
                          ? 'bg-white shadow-sm text-yellow-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <MessageCircle size={14} />
                      Ask Belle
                    </button>
                  </div>

                  <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                      {activeTab === 'current' && (
                        <motion.div
                          key="current"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-8 absolute inset-0 overflow-y-auto pb-8"
                        >
                        <section>
                          <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <Droplet size={16} />
                            Predicted Medium
                          </h3>
                          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
                            <div className="text-xl font-medium text-gray-900 mb-2">
                              {analysisResult.medium}
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">
                              {analysisResult.mediumDescription}
                            </p>
                          </div>
                        </section>

                        <section>
                          <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <Palette size={16} />
                            Current Palette
                          </h3>
                          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                            {analysisResult.current_colors.map((color, index) => {
                              const unfitInfo = analysisResult.issue.unfit_colors.find(u => u.hex.toLowerCase() === color.hex.toLowerCase());
                              
                              return (
                                <motion.div 
                                  variants={itemVariants}
                                  key={index} 
                                  className={`bg-white/60 backdrop-blur-md rounded-2xl p-4 border shadow-sm flex flex-col gap-4 transition-all ${
                                    unfitInfo ? 'border-red-200 shadow-red-100/50' : 'border-white/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div 
                                      className="w-16 h-16 rounded-xl shadow-inner border border-black/5 flex-shrink-0"
                                      style={{ backgroundColor: color.hex }}
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium text-gray-900 capitalize">{color.name}</div>
                                        {unfitInfo && <AlertTriangle size={18} className="text-red-500" />}
                                      </div>
                                      <div className="text-xs font-mono text-gray-500 mt-1">{color.hex}</div>
                                    </div>
                                  </div>
                                  
                                  {unfitInfo && (
                                    <div className="bg-red-50/80 rounded-xl p-3 text-sm text-red-700 border border-red-100 flex items-start gap-2">
                                      <Info size={16} className="mt-0.5 flex-shrink-0" />
                                      <span>{unfitInfo.reason}</span>
                                    </div>
                                  )}

                                  <div className="bg-white/50 rounded-xl p-3 text-sm text-gray-700 border border-white/60">
                                    <span className="font-medium text-gray-900 mr-2">Mix:</span>
                                    {color.mixingGuide}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        </section>
                      </motion.div>
                      )}

                      {activeTab === 'optimized' && (
                        <motion.div
                          key="optimized"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-8 absolute inset-0 overflow-y-auto pb-8"
                        >
                        <section>
                          <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <Sparkles size={16} />
                            Harmony Critique
                          </h3>
                          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                              {analysisResult.issue.critique}
                            </p>
                            
                            <div className="mt-4 space-y-3">
                              <div className="text-xs font-bold tracking-wider text-gray-400 uppercase">Suggested Replacements</div>
                              {analysisResult.suggestions.replacement_colors.map((color, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div 
                                    className="w-8 h-8 rounded-full shadow-inner border border-black/5 flex-shrink-0 mt-1"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                      {color.name}
                                      <CheckCircle size={14} className="text-green-500" />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{color.why}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>

                        <section>
                          <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <Palette size={16} />
                            The Perfect Palette
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            {analysisResult.suggestions.final_palette.map((color, index) => {
                              const isSelected = selectedColor?.hex === color.hex;
                              const textColorClass = getTextColor(color.hex);
                              
                              return (
                                <motion.div
                                  key={index}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setSelectedColor(color)}
                                  className={`cursor-pointer rounded-2xl p-4 flex flex-col justify-between aspect-square shadow-sm transition-all border-2 ${
                                    isSelected ? 'border-blue-500 shadow-md' : 'border-transparent'
                                  }`}
                                  style={{ backgroundColor: color.hex }}
                                >
                                  <div className={`text-xs font-bold tracking-wider uppercase opacity-70 ${textColorClass}`}>
                                    {color.role}
                                  </div>
                                  <div>
                                    <div className={`font-medium ${textColorClass}`}>{color.name}</div>
                                    <div className={`text-xs font-mono opacity-80 ${textColorClass}`}>{color.hex}</div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          <AnimatePresence mode="wait">
                            {selectedColor && (
                              <motion.div
                                key={selectedColor.hex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-white shadow-sm"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div 
                                    className="w-6 h-6 rounded-full shadow-inner border border-black/5"
                                    style={{ backgroundColor: selectedColor.hex }}
                                  />
                                  <h4 className="font-medium text-gray-900">Mixing Recipe: {selectedColor.name}</h4>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {selectedColor.mixingGuide}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </section>
                      </motion.div>
                    )}

                    {activeTab === 'belle' && (
                      <motion.div
                        key="belle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/50 flex items-center gap-3 bg-white/50 flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-300 flex items-center justify-center text-white font-serif text-lg shadow-sm">B</div>
                          <div>
                            <h3 className="font-serif text-base font-medium text-gray-900">Belle</h3>
                            <p className="text-xs text-gray-500">Art Muse & Consultant</p>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/80 p-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm border border-white"
                          >
                            <p className="text-sm text-gray-800 leading-relaxed">
                              Chào Tuấn! Mình là Belle, nàng thơ ảo của Belleza Lab. Mình đã xem qua bức tranh và bảng màu. Bạn muốn mình tư vấn thêm về điều gì không?
                            </p>
                          </motion.div>
                          
                          {chatHistory.map((msg, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }} 
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-3 rounded-2xl max-w-[85%] shadow-sm border ${
                                msg.role === 'user' 
                                  ? 'bg-blue-500 text-white rounded-tr-sm self-end ml-auto border-blue-600' 
                                  : 'bg-white/80 text-gray-800 rounded-tl-sm border-white'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.text}
                              </p>
                            </motion.div>
                          ))}
                          
                          {isChatting && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white/80 p-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm border border-white flex gap-1 items-center"
                            >
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </motion.div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-white/50 border-t border-white/50 space-y-3 flex-shrink-0">
                          {chatHistory.length === 0 && (
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => handleSendMessage("Bố cục đã ổn chưa?")} className="text-xs bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 transition-colors shadow-sm">🎨 Bố cục đã ổn chưa?</button>
                              <button onClick={() => handleSendMessage("Gợi ý cách vẽ mây.")} className="text-xs bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 transition-colors shadow-sm">💡 Gợi ý cách vẽ mây.</button>
                              <button onClick={() => handleSendMessage("Hợp với không gian nào?")} className="text-xs bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 transition-colors shadow-sm">🏠 Hợp với không gian nào?</button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                              placeholder="Hỏi Belle về bức tranh..."
                              className="flex-1 bg-white/80 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-400 transition-colors shadow-inner"
                            />
                            <button 
                              onClick={() => handleSendMessage(chatInput)}
                              disabled={!chatInput.trim() || isChatting}
                              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm flex-shrink-0"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
              ) : null}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
