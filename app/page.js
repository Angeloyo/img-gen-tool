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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Image Generator</h1>
      
      <div className="mb-6">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your image prompt..."
          className="w-full p-3 border rounded-lg text-black"
        />
        <button
          onClick={generateImage}
          className="mt-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Generate
        </button>
      </div>
      
      <div className="grid gap-4">
        {generations.map(gen => (
          <div key={gen.id} className="border rounded-lg p-4">
            <p className="mb-2 font-medium">{gen.prompt}</p>
            {gen.status === 'loading' && (
              <div className="w-64 h-64 bg-gray-200 rounded flex items-center justify-center">
                Loading...
              </div>
            )}
            {gen.status === 'error' && (
              <div className="w-64 h-64 bg-red-100 rounded flex items-center justify-center text-red-600">
                Error: {gen.error}
              </div>
            )}
            {gen.status === 'complete' && (
              <img
                src={`data:image/png;base64,${gen.image}`}
                alt={gen.prompt}
                className="w-64 h-64 object-cover rounded"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
