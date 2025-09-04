'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generations, setGenerations] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('auto');
  const [background, setBackground] = useState('opaque');

  useEffect(() => {
    const savedKey = localStorage.getItem('openai-api-key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    if (!apiKey.trim()) {
      alert('Please set your OpenAI API key in settings');
      setShowSettings(true);
      return;
    }
    
    const id = Date.now();
    setGenerations(prev => [...prev, { id, status: 'loading', prompt }]);
    
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ 
          model: "gpt-image-1",
          prompt,
          size,
          quality,
          background
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setGenerations(prev => prev.map(g => 
          g.id === id ? { ...g, status: 'error', error: data.error } : g
        ));
      } else {
        setGenerations(prev => prev.map(g => 
          g.id === id ? { ...g, status: 'complete', image: data.data[0].b64_json } : g
        ));
      }
    } catch (error) {
      setGenerations(prev => prev.map(g => 
        g.id === id ? { ...g, status: 'error', error: error.message } : g
      ));
    }
  };

  const removeGeneration = (id) => {
    setGenerations(prev => prev.filter(g => g.id !== id));
  };

  const downloadImage = (image, prompt) => {
    const link = document.createElement('a');
    link.download = `${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = `data:image/png;base64,${image}`;
    link.click();
  };

  const saveApiKey = () => {
    localStorage.setItem('openai-api-key', apiKey);
    setShowSettings(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem('openai-api-key');
    setApiKey('');
  };

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-medium tracking-tight">img-gen</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-100 transition-colors"
        >
          settings
        </button>
      </div>
      
      <div className="mb-16">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="describe what you want to generate..."
          className="w-full p-4 border border-gray-300 text-black text-sm font-mono bg-white"
        />
        <button
          onClick={generateImage}
          className="mt-4 px-8 py-3 border border-black bg-white text-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
        >
          generate
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {generations.map(gen => (
          <div key={gen.id} className="relative group aspect-square">
            {gen.status === 'loading' && (
              <div className="w-full h-full border border-gray-200 flex items-center justify-center">
                <span className="text-sm text-gray-500">generating...</span>
              </div>
            )}
            {gen.status === 'error' && (
              <div className="w-full h-full border border-red-200 flex items-center justify-center text-red-600">
                <span className="text-sm">error</span>
              </div>
            )}
            {gen.status === 'complete' && (
              <img
                src={`data:image/png;base64,${gen.image}`}
                alt={gen.prompt}
                className="w-full h-full object-cover border border-gray-200"
              />
            )}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <p className="text-white text-xs font-mono line-clamp-3">{gen.prompt}</p>
              <div className="flex gap-2 self-end">
                {gen.status === 'complete' && (
                  <button
                    onClick={() => downloadImage(gen.image, gen.prompt)}
                    className="px-2 py-1 text-xs bg-white text-black hover:bg-gray-200 transition-colors"
                  >
                    ↓
                  </button>
                )}
                <button
                  onClick={() => removeGeneration(gen.id)}
                  className="px-2 py-1 text-xs bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-16 border border-gray-300 max-w-2xl w-full">
            <h2 className="text-xl font-medium mb-6">settings</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-mono mb-2">Model</label>
              <select className="w-full p-3 border border-gray-300 text-black text-sm font-mono bg-white">
                <option value="gpt-image-1">gpt-image-1</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-mono mb-2">Size</label>
              <select 
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full p-3 border border-gray-300 text-black text-sm font-mono bg-white"
              >
                <option value="1024x1024">1024x1024 (square)</option>
                <option value="1024x1536">1024x1536 (portrait)</option>
                <option value="1536x1024">1536x1024 (landscape)</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-mono mb-2">Quality</label>
              <select 
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full p-3 border border-gray-300 text-black text-sm font-mono bg-white"
              >
                <option value="auto">auto</option>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-mono mb-2">Background</label>
              <select 
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full p-3 border border-gray-300 text-black text-sm font-mono bg-white"
              >
                <option value="opaque">opaque</option>
                <option value="transparent">transparent</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-mono mb-2">OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-3 border border-gray-300 text-black text-sm font-mono bg-white"
              />
            </div>
            
            <div className="mb-6 text-xs text-gray-600 font-mono leading-relaxed">
              <p>• Your API key is stored only in your browser</p>
              <p>• It never leaves your device or gets sent to our servers</p>
              <p>• We use it directly to make requests to OpenAI on your behalf</p>
              <p>• Clear your browser data to remove it completely</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={saveApiKey}
                className="px-6 py-2 border border-black bg-white text-black text-sm hover:bg-black hover:text-white transition-colors"
              >
                save
              </button>
              <button
                onClick={clearApiKey}
                className="px-6 py-2 border border-gray-300 bg-white text-black text-sm hover:bg-gray-100 transition-colors"
              >
                clear
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 border border-gray-300 bg-white text-black text-sm hover:bg-gray-100 transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
