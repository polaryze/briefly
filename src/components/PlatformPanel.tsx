import React, { useState } from 'react';

interface PlatformPanelProps {
  title: string;
  summaries: string[];
  images?: Array<{ url: string; postText?: string; postDate?: string }>;
  defaultOpen?: boolean;
}

export default function PlatformPanel({ title, summaries, images = [], defaultOpen = false }: PlatformPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-gray-50" onClick={() => setOpen(v => !v)}>
        <span className="font-medium text-gray-900">{title}</span>
        <span className="text-xs text-gray-600">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="p-4 space-y-3">
          {summaries.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
              {summaries.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No summaries available.</p>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="w-full aspect-square bg-gray-100 overflow-hidden rounded">
                  <img src={img.url} alt={img.postText || 'image'} loading="lazy" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


