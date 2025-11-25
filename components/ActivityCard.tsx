import React, { useState } from 'react';
import { StravaActivity, AIAnalysisResult } from '../types';
import { analyzeActivityWithGemini } from '../services/geminiService';
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Loader2,
  Heart,
  Zap,
  Trophy,
  TrendingUp,
  Footprints,
  Waves,
  Mountain,
  Bike,
  Activity
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
    } catch (err: any) {
      setErrorAI(err.message || "Could not generate analysis.");
    } finally {
      setLoadingAI(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Run': return '🏃';
      case 'Ride': return '🚴';
      case 'Swim': return '🏊';
      case 'Walk': return '🚶';
      case 'Hike': return '🥾';
      case 'WeightTraining': return '🏋️';
      case 'Yoga': return '🧘';
      default: return '🏅';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'Run': return <Footprints className="w-5 h-5 text-emerald-400" />;
      case 'Ride': return <Bike className="w-5 h-5 text-orange-400" />;
      case 'Swim': return <Waves className="w-5 h-5 text-blue-400" />;
      case 'Hike': return <Mountain className="w-5 h-5 text-amber-400" />;
      case 'Walk': return <Footprints className="w-5 h-5 text-lime-400" />;
      default: return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div 
      className={`bg-slate-800 rounded-xl border border-slate-700 overflow-hidden transition-all duration-300 hover:border-slate-600 ${expanded ? 'ring-2 ring-orange-500/20 shadow-lg' : 'shadow-md'}`}
    >
      {/* Header / Summary */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
             <div className="bg-slate-700/50 p-2.5 rounded-full ring-1 ring-slate-600">
                {getActivityTypeIcon(activity.type)}
             </div>
             <div>
                <h3 className="text-lg font-bold text-slate-100">{activity.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {new Date(activity.start_date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
             </div>
          </div>
          {expanded ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Distance</span>
            <span className="text-xl font-bold text-slate-200">{(activity.distance / 1000).toFixed(2)} <span className="text-sm font-medium text-slate-500">km</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Time</span>
            <span className="text-xl font-bold text-slate-200">{formatDuration(activity.moving_time)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Elevation</span>
            <span className="text-xl font-bold text-slate-200">{activity.total_elevation_gain} <span className="text-sm font-medium text-slate-500">m</span></span>
          </div>
           <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              {activity.type === 'Run' ? 'Avg Pace' : 'Avg Speed'}
            </span>
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
        <div className="border-t border-slate-700 bg-slate-900/30 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Extended Stats */}
            <div className="col-span-1 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Metric Deep Dive</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Heart className="w-4 h-4 text-rose-500" /> <span>Avg HR</span>
                  </div>
                  <span className="font-mono font-medium text-slate-200">{activity.average_heartrate ? Math.round(activity.average_heartrate) : '--'} <span className="text-xs text-slate-500">bpm</span></span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Zap className="w-4 h-4 text-yellow-500" /> <span>Suffer Score</span>
                  </div>
                  <span className="font-mono font-medium text-slate-200">{activity.suffer_score || '--'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Trophy className="w-4 h-4 text-amber-400" /> <span>Achievements</span>
                  </div>
                  <span className="font-mono font-medium text-slate-200">{activity.achievement_count}</span>
                </div>
                 <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-400" /> <span>Max Speed</span>
                  </div>
                  <span className="font-mono font-medium text-slate-200">{(activity.max_speed * 3.6).toFixed(1)} <span className="text-xs text-slate-500">km/h</span></span>
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                {!analysis ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-6 relative z-10">
                     <div className="p-3 bg-slate-800 rounded-full border border-slate-700 shadow-xl">
                       <Sparkles className="w-6 h-6 text-indigo-400" />
                     </div>
                     <div>
                       <h4 className="text-slate-200 font-semibold">Gemini AI Coach</h4>
                       <p className="text-slate-500 text-xs max-w-xs mx-auto mt-2 leading-relaxed">
                         Unlock deep insights, identify hidden strengths, and get personalized advice for this specific activity.
                       </p>
                     </div>
                     {errorAI ? (
                       <div className="text-red-300 text-xs bg-red-900/30 border border-red-500/20 px-4 py-2 rounded-lg max-w-sm">
                         {errorAI}
                       </div>
                     ) : (
                       <button 
                        onClick={handleAnalyze}
                        disabled={loadingAI}
                        className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                         {loadingAI ? 'Analyzing Performance...' : 'Generate Insights'}
                       </button>
                     )}
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-500 relative z-10">
                    <div className="flex items-center gap-2 mb-2 border-b border-slate-700/50 pb-3">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-indigo-100 tracking-wide text-sm uppercase">Coach's Assessment</h4>
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {analysis.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                       <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-3">
                         <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1 mb-2">
                           <TrendingUp className="w-3 h-3" /> Strengths
                         </span>
                         <ul className="space-y-1">
                           {analysis.strengths.map((s, i) => (
                             <li key={i} className="text-slate-300 text-xs pl-2 border-l-2 border-emerald-500/30">{s}</li>
                           ))}
                         </ul>
                       </div>
                       <div className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-3">
                         <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1 mb-2">
                           <Activity className="w-3 h-3" /> Areas to Improve
                         </span>
                         <ul className="space-y-1">
                           {analysis.weaknesses.map((w, i) => (
                             <li key={i} className="text-slate-300 text-xs pl-2 border-l-2 border-amber-500/30">{w}</li>
                           ))}
                         </ul>
                       </div>
                    </div>

                    <div className="bg-indigo-600/10 border border-indigo-500/30 p-3 rounded-lg mt-2 flex gap-3 items-start">
                      <div className="bg-indigo-500/20 p-1.5 rounded-full shrink-0">
                         <Zap className="w-3 h-3 text-indigo-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide block mb-1">Actionable Advice</span>
                        <p className="text-indigo-100 text-sm italic">"{analysis.advice}"</p>
                      </div>
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