import React, { useState } from 'react';
import { StravaActivity, AIAnalysisResult } from '../types';
import { analyzeActivityWithGemini } from '../services/geminiService';
import { 
  MapPin, 
  Timer, 
  TrendingUp, 
  Heart, 
  Trophy, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Loader2
} from 'lucide-react';

interface ActivityCardProps {
  activity: StravaActivity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const [expanded, setExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (analysis) return; // Already analyzed
    
    setLoadingAI(true);
    setErrorAI(null);
    try {
      const result = await analyzeActivityWithGemini(activity);
      setAnalysis(result);
    } catch (err) {
      setErrorAI("Could not generate analysis. Check API Key quota.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div 
      className={`bg-slate-800 rounded-xl border border-slate-700 overflow-hidden transition-all duration-300 hover:border-slate-600 ${expanded ? 'ring-2 ring-orange-500/20' : ''}`}
    >
      {/* Header / Summary */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
             <div className="bg-slate-700 p-2 rounded-full">
                {activity.type === 'Run' ? '🏃' : activity.type === 'Ride' ? '🚴' : '🏅'}
             </div>
             <div>
                <h3 className="text-lg font-semibold text-slate-100">{activity.name}</h3>
                <p className="text-xs text-slate-400">
                  {new Date(activity.start_date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
             </div>
          </div>
          {expanded ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs uppercase font-medium tracking-wider">Distance</span>
            <span className="text-xl font-bold text-slate-200">{(activity.distance / 1000).toFixed(2)} <span className="text-sm font-normal text-slate-500">km</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs uppercase font-medium tracking-wider">Time</span>
            <span className="text-xl font-bold text-slate-200">{formatDuration(activity.moving_time)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs uppercase font-medium tracking-wider">Elevation</span>
            <span className="text-xl font-bold text-slate-200">{activity.total_elevation_gain} <span className="text-sm font-normal text-slate-500">m</span></span>
          </div>
           <div className="flex flex-col">
            <span className="text-slate-500 text-xs uppercase font-medium tracking-wider">Avg Pace/Speed</span>
            <span className="text-xl font-bold text-slate-200">
              {activity.type === 'Run' 
                ? `${Math.floor((1000 / activity.average_speed) / 60)}:${Math.floor((1000 / activity.average_speed) % 60).toString().padStart(2, '0')} /km`
                : `${(activity.average_speed * 3.6).toFixed(1)} km/h`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-700 bg-slate-800/50 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Extended Stats */}
            <div className="col-span-1 space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase">Metric Deep Dive</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Heart className="w-4 h-4 text-rose-500" /> <span>Avg HR</span>
                  </div>
                  <span className="font-mono">{activity.average_heartrate ? Math.round(activity.average_heartrate) : '--'} bpm</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Zap className="w-4 h-4 text-yellow-500" /> <span>Suffer Score</span>
                  </div>
                  <span className="font-mono">{activity.suffer_score || '--'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Trophy className="w-4 h-4 text-amber-400" /> <span>Achievements</span>
                  </div>
                  <span className="font-mono">{activity.achievement_count}</span>
                </div>
                 <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-300">
                    <TrendingUp className="w-4 h-4 text-blue-400" /> <span>Max Speed</span>
                  </div>
                  <span className="font-mono">{(activity.max_speed * 3.6).toFixed(1)} km/h</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="h-full bg-slate-900 rounded-xl p-5 border border-slate-700/50 relative overflow-hidden">
                {!analysis ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                     <Sparkles className="w-12 h-12 text-slate-600" />
                     <div>
                       <h4 className="text-slate-200 font-medium">Gemini Coach Analysis</h4>
                       <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                         Get deep insights, strengths, and actionable advice for this activity using AI.
                       </p>
                     </div>
                     {errorAI ? (
                       <div className="text-red-400 text-sm bg-red-900/20 px-3 py-1 rounded-full">{errorAI}</div>
                     ) : (
                       <button 
                        onClick={handleAnalyze}
                        disabled={loadingAI}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                         {loadingAI ? 'Analyzing...' : 'Generate Insights'}
                       </button>
                     )}
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-indigo-500/20 p-1.5 rounded-md">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      </div>
                      <h4 className="font-semibold text-indigo-100">Coach's Assessment</h4>
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed border-b border-slate-800 pb-3">
                      {analysis.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Strengths</span>
                         <ul className="list-disc list-inside mt-1 text-slate-400 text-sm">
                           {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                         </ul>
                       </div>
                       <div>
                         <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Areas to Watch</span>
                         <ul className="list-disc list-inside mt-1 text-slate-400 text-sm">
                           {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                         </ul>
                       </div>
                    </div>

                    <div className="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-lg mt-2">
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide block mb-1">Pro Tip</span>
                      <p className="text-indigo-100 text-sm italic">"{analysis.advice}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
