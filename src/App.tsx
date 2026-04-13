import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Palette, Droplet, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeArt, ArtAnalysisResult } from './services/geminiService';

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ArtAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setImageSrc(result);
      
      try {
        // Extract base64 data
        const base64Data = result.split(',')[1];
        const analysis = await analyzeArt(base64Data, file.type);
        setAnalysisResult(analysis);
      } catch (err) {
        console.error(err);
        setError('Failed to analyze the image. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
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
    setImageSrc(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-12 h-screen overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold tracking-tight text-gray-900 mb-3">
              Art Analyzer
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
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-800 font-medium text-lg">Analyzing artwork...</p>
                      <p className="text-gray-500 text-sm mt-2">Extracting colors and identifying medium</p>
                    </div>
                  )}
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

      {/* Sidebar / Results Area */}
      <AnimatePresence>
        {(isAnalyzing || analysisResult) && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full md:w-[400px] lg:w-[480px] h-screen overflow-y-auto glass-panel border-l border-white/40 z-10 flex-shrink-0"
          >
            <div className="p-8">
              <h2 className="text-2xl font-serif font-semibold mb-8 flex items-center gap-3">
                <ImageIcon className="text-blue-500" />
                Analysis Results
              </h2>

              {isAnalyzing ? (
                <div className="space-y-8">
                  {/* Skeleton loaders */}
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-24 bg-gray-200 rounded-xl w-full"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="grid grid-cols-1 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-gray-200 rounded-xl w-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-10">
                  
                  {/* Medium Section */}
                  <section>
                    <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 flex items-center gap-2">
                      <Droplet size={16} />
                      Predicted Medium
                    </h3>
                    <div className="bg-white/60 rounded-2xl p-6 border border-white/50 shadow-sm">
                      <div className="text-xl font-medium text-gray-900 mb-2">
                        {analysisResult.medium}
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {analysisResult.mediumDescription}
                      </p>
                    </div>
                  </section>

                  {/* Color Palette Section */}
                  <section>
                    <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 flex items-center gap-2">
                      <Palette size={16} />
                      Color Palette & Mixing
                    </h3>
                    <div className="space-y-4">
                      {analysisResult.colors.map((color, index) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={index} 
                          className="bg-white/60 rounded-2xl p-4 border border-white/50 shadow-sm flex flex-col gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-16 h-16 rounded-xl shadow-inner border border-black/5 flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div>
                              <div className="font-medium text-gray-900 capitalize">{color.name}</div>
                              <div className="text-xs font-mono text-gray-500 mt-1">{color.hex} • {color.rgb}</div>
                            </div>
                          </div>
                          <div className="bg-gray-50/80 rounded-xl p-3 text-sm text-gray-700 border border-gray-100">
                            <span className="font-medium text-gray-900 mr-2">Mix:</span>
                            {color.mixingGuide}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                </div>
              ) : null}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
