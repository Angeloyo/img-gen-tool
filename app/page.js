'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generations, setGenerations] = useState([]);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    const id = Date.now();
    setGenerations(prev => [...prev, { id, status: 'loading', prompt }]);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setGenerations(prev => prev.map(g => 
          g.id === id ? { ...g, status: 'error', error: data.error } : g
        ));
      } else {
        setGenerations(prev => prev.map(g => 
          g.id === id ? { ...g, status: 'complete', image: data.image } : g
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

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-medium mb-12 tracking-tight">img-gen</h1>
      
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
            <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <p className="text-white text-xs font-mono line-clamp-3">{gen.prompt}</p>
              <button
                onClick={() => removeGeneration(gen.id)}
                className="self-end px-2 py-1 text-xs bg-white text-black hover:bg-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
