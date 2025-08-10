import React from 'react';

export type PlatformKey = 'twitter' | 'instagram' | 'youtube';

export type PlatformStatus = {
  phase: 'idle' | 'fetching' | 'summarizing' | 'done' | 'skipped' | 'error';
  fetchedCount?: number;
  summarizedCount?: number;
  error?: string;
};

interface LoadingProgressPanelProps {
  generationStep: string;
  generationProgress: number;
  platformStatus: Record<PlatformKey, PlatformStatus>;
}

const phaseLabel: Record<PlatformStatus['phase'], string> = {
  idle: 'Idle',
  fetching: 'Fetching posts',
  summarizing: 'Summarizing',
  done: 'Done',
  skipped: 'Skipped',
  error: 'Error',
};

export function LoadingProgressPanel({ generationStep, generationProgress, platformStatus }: LoadingProgressPanelProps) {
  const entries: Array<[PlatformKey, PlatformStatus]> = [
    ['twitter', platformStatus.twitter],
    ['instagram', platformStatus.instagram],
    ['youtube', platformStatus.youtube],
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-700">{generationStep || 'Preparing...'}</span>
            <span className="text-xs text-gray-500">{Math.round(generationProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded">
            <div className="h-2 bg-black rounded transition-all" style={{ width: `${Math.max(0, Math.min(100, generationProgress))}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {entries.map(([key, status]) => (
            <div key={key} className="border border-gray-200 rounded p-3">
              <div className="text-sm font-semibold capitalize mb-1">{key}</div>
              <div className="text-xs text-gray-700">{phaseLabel[status.phase]}</div>
              {typeof status.fetchedCount === 'number' && (
                <div className="text-xs text-gray-500">Fetched: {status.fetchedCount}</div>
              )}
              {typeof status.summarizedCount === 'number' && (
                <div className="text-xs text-gray-500">Summarized: {status.summarizedCount}</div>
              )}
              {status.error && (
                <div className="text-xs text-red-600 mt-1">{status.error}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoadingProgressPanel;


