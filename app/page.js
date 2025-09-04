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
      
      <div className="space-y-8">
        {generations.map(gen => (
          <div key={gen.id} className="border border-gray-200 p-6">
            <p className="mb-6 text-sm font-mono text-gray-600">{gen.prompt}</p>
            {gen.status === 'loading' && (
              <div className="w-72 h-72 border border-gray-200 flex items-center justify-center">
                <span className="text-sm text-gray-500">generating...</span>
              </div>
            )}
            {gen.status === 'error' && (
              <div className="w-72 h-72 border border-red-200 flex items-center justify-center text-red-600">
                <span className="text-sm">error: {gen.error}</span>
              </div>
            )}
            {gen.status === 'complete' && (
              <img
                src={`data:image/png;base64,${gen.image}`}
                alt={gen.prompt}
                className="w-72 h-72 object-cover border border-gray-200"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
