import { useState, useEffect } from 'react';
import {
  Scale,
  Zap,
  Target,
  Hammer,
  ClipboardCheck,
  BookOpen,
  ChevronDown,
  Trash2,
  Settings,
} from 'lucide-react';
import type { PresetConfig, SavedMidtermConfig } from '../types/midterm';
import { PRESETS, PRESET_METADATA } from '../data/midtermPresets';
import { loadCustomConfigs, deleteCustomConfig } from '../lib/midtermStorage';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale,
  Zap,
  Target,
  Hammer,
  ClipboardCheck,
  BookOpen,
};

interface MidtermSelectorProps {
  onSelectPreset: (preset: PresetConfig) => void;
  onCustomize: (basePreset: PresetConfig) => void;
  onLoadSaved: (config: SavedMidtermConfig) => void;
}

export function MidtermSelector({
  onSelectPreset,
  onCustomize,
  onLoadSaved,
}: MidtermSelectorProps) {
  const [savedConfigs, setSavedConfigs] = useState<SavedMidtermConfig[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setSavedConfigs(loadCustomConfigs());
  }, []);

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomConfig(id);
    setSavedConfigs(loadCustomConfigs());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-semibold text-ink-black text-2xl">
            Practice Midterms
          </h2>
          <p className="font-sans text-pencil-gray text-sm mt-1">
            Choose a preset or customize your own
          </p>
        </div>

        {/* Load Saved Dropdown */}
        {savedConfigs.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="flex items-center gap-2 font-condensed text-sm text-blueprint-navy hover:text-ink-black transition-colors"
            >
              <Settings className="w-4 h-4" />
              Load Saved
              <ChevronDown className={`w-4 h-4 transition-transform ${showSaved ? 'rotate-180' : ''}`} />
            </button>

            {showSaved && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-paper-cream border border-pencil-gray/20 shadow-lg z-10">
                {savedConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-paper-aged cursor-pointer border-b border-pencil-gray/10 last:border-0"
                    onClick={() => {
                      onLoadSaved(config);
                      setShowSaved(false);
                    }}
                  >
                    <div>
                      <p className="font-sans text-sm text-ink-black">{config.name}</p>
                      <p className="font-mono text-xs text-pencil-gray">
                        {config.questionCount} Q • {config.creditCost} credits
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSaved(config.id, e)}
                      className="p-1 text-pencil-gray hover:text-stamp-red transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(PRESETS).map((preset) => {
          const Icon = ICON_MAP[preset.icon] || Scale;
          const metadata = PRESET_METADATA[preset.id];

          return (
            <div
              key={preset.id}
              className="index-card p-5 hover:shadow-md transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${preset.color} flex items-center justify-center text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-sm font-bold text-blueprint-navy">
                  {preset.creditCost} credits
                </span>
              </div>

              {/* Content */}
              <h3 className="font-serif font-semibold text-ink-black text-lg mb-1">
                {preset.name}
              </h3>
              <p className="font-sans text-pencil-gray text-sm mb-3">
                {metadata?.shortDescription || preset.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs font-mono text-pencil-gray mb-4">
                <span>{preset.questionCount} questions</span>
                <span>•</span>
                <span>{preset.targetDuration} min</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectPreset(preset)}
                  className="flex-1 btn-blueprint text-xs py-2"
                >
                  Start
                </button>
                <button
                  onClick={() => onCustomize(preset)}
                  className="px-3 py-2 border border-blueprint-navy text-blueprint-navy hover:bg-blueprint-navy hover:text-paper-cream transition-colors"
                  title="Customize"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
