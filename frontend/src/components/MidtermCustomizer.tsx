import { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import type { PresetConfig, MidtermWeightingConfig } from '../types/midterm';
import { saveCustomConfig } from '../lib/midtermStorage';

interface MidtermCustomizerProps {
  basePreset: PresetConfig;
  onSave: (config: MidtermWeightingConfig) => void;
  onCancel: () => void;
}

export function MidtermCustomizer({ basePreset, onSave, onCancel }: MidtermCustomizerProps) {
  const [config, setConfig] = useState<MidtermWeightingConfig>({
    ...basePreset,
    id: crypto.randomUUID(),
  });
  const [configName, setConfigName] = useState(`${basePreset.name} (Custom)`);
  const [saveToStorage, setSaveToStorage] = useState(false);

  const updateWeight = (key: keyof typeof config.weights, value: number) => {
    setConfig(prev => ({
      ...prev,
      weights: { ...prev.weights, [key]: value },
    }));
  };

  const updateDifficulty = (key: keyof typeof config.difficultyDistribution, value: number) => {
    setConfig(prev => ({
      ...prev,
      difficultyDistribution: { ...prev.difficultyDistribution, [key]: value },
    }));
  };

  const handleSave = () => {
    const finalConfig = { ...config, name: configName };
    if (saveToStorage) {
      saveCustomConfig(finalConfig);
    }
    onSave(finalConfig);
  };

  const handleReset = () => {
    setConfig({
      ...basePreset,
      id: crypto.randomUUID(),
    });
    setConfigName(`${basePreset.name} (Custom)`);
  };

  const weightLabels: Record<keyof typeof config.weights, string> = {
    recency: 'Recent Exams (2024-2025)',
    repetition: 'Cross-Year Patterns',
    coverage: 'Section Coverage',
    difficulty: 'Difficulty Matching',
  };

  const weightDescriptions: Record<keyof typeof config.weights, string> = {
    recency: 'Prioritize questions from recent exams',
    repetition: 'Reward questions that appear in multiple years',
    coverage: 'Ensure all sections are represented',
    difficulty: 'Match your target difficulty level',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="index-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pencil-gray/10">
          <div>
            <h2 className="font-serif font-semibold text-ink-black text-xl">
              Customize Midterm
            </h2>
            <p className="font-sans text-pencil-gray text-sm">
              Starting from: {basePreset.name}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-pencil-gray hover:text-ink-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Weight Sliders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-condensed text-sm uppercase tracking-widest text-pencil-gray">
                Weight Factors
              </h3>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-pencil-gray hover:text-blueprint-navy transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {(Object.keys(config.weights) as Array<keyof typeof config.weights>).map((key) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-sans text-sm text-ink-black">
                      {weightLabels[key]}
                    </label>
                    <span className="font-mono text-sm text-blueprint-navy">
                      {config.weights[key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.weights[key]}
                    onChange={(e) => updateWeight(key, parseInt(e.target.value))}
                    className="w-full h-2 bg-pencil-gray/20 rounded-lg appearance-none cursor-pointer accent-blueprint-navy"
                  />
                  <p className="font-sans text-xs text-pencil-gray mt-1">
                    {weightDescriptions[key]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div>
            <h3 className="font-condensed text-sm uppercase tracking-widest text-pencil-gray mb-4">
              Difficulty Mix
            </h3>

            <div className="space-y-4">
              {(Object.keys(config.difficultyDistribution) as Array<keyof typeof config.difficultyDistribution>).map((key) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-sans text-sm text-ink-black capitalize">
                      {key}
                    </label>
                    <span className="font-mono text-sm text-blueprint-navy">
                      {config.difficultyDistribution[key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.difficultyDistribution[key]}
                    onChange={(e) => updateDifficulty(key, parseInt(e.target.value))}
                    className="w-full h-2 bg-pencil-gray/20 rounded-lg appearance-none cursor-pointer accent-blueprint-navy"
                  />
                </div>
              ))}
            </div>

            {/* Visual bar */}
            <div className="flex h-2 mt-4 rounded overflow-hidden">
              <div
                className="bg-green-400"
                style={{ width: `${config.difficultyDistribution.easy}%` }}
              />
              <div
                className="bg-yellow-400"
                style={{ width: `${config.difficultyDistribution.medium}%` }}
              />
              <div
                className="bg-red-400"
                style={{ width: `${config.difficultyDistribution.hard}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-pencil-gray mt-1">
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
            </div>
          </div>

          {/* Question Count & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-condensed text-sm uppercase tracking-widest text-pencil-gray block mb-2">
                Questions
              </label>
              <select
                value={config.questionCount}
                onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                className="w-full bg-paper-cream border border-pencil-gray/30 rounded px-3 py-2 font-sans text-sm"
              >
                {[5, 6, 7, 8, 10, 12, 15].map(n => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-condensed text-sm uppercase tracking-widest text-pencil-gray block mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="30"
                max="180"
                step="5"
                value={config.targetDuration}
                onChange={(e) => setConfig(prev => ({ ...prev, targetDuration: parseInt(e.target.value) }))}
                className="w-full bg-paper-cream border border-pencil-gray/30 rounded px-3 py-2 font-sans text-sm"
              />
            </div>
          </div>

          {/* Config Name */}
          <div>
            <label className="font-condensed text-sm uppercase tracking-widest text-pencil-gray block mb-2">
              Configuration Name
            </label>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="My Custom Config"
              className="w-full bg-paper-cream border border-pencil-gray/30 rounded px-3 py-2 font-sans text-sm"
            />
          </div>

          {/* Save checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={saveToStorage}
              onChange={(e) => setSaveToStorage(e.target.checked)}
              className="w-4 h-4 accent-blueprint-navy"
            />
            <span className="font-sans text-sm text-pencil-gray">
              Save for future use
            </span>
          </label>

          {/* Preview */}
          <div className="bg-paper-aged p-4 rounded">
            <h4 className="font-condensed text-xs uppercase tracking-widest text-pencil-gray mb-3">
              Preview
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-mono text-2xl font-bold text-blueprint-navy">
                  {config.questionCount}
                </p>
                <p className="font-sans text-xs text-pencil-gray">Questions</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-blueprint-navy">
                  {config.targetDuration}
                </p>
                <p className="font-sans text-xs text-pencil-gray">Minutes</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-blueprint-navy">
                  {config.creditCost}
                </p>
                <p className="font-sans text-xs text-pencil-gray">Credits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-pencil-gray/10">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-blueprint flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save & Generate
          </button>
        </div>
      </div>
    </div>
  );
}
