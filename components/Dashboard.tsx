import React, { useEffect, useState, useCallback } from 'react';
import { StravaService } from '../services/stravaService';
import { StravaActivity, StravaAthlete } from '../types';
import ActivityCard from './ActivityCard';
import Charts from './Charts';
import { LogOut, Map, Activity as ActivityIcon, RefreshCw, AlertCircle, LayoutDashboard } from 'lucide-react';

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const stravaService = new StravaService(token);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError('');
    try {
      const [athleteData, activitiesData] = await Promise.all([
        stravaService.getAthlete(),
        stravaService.getActivities(1, 30) // Get last 30 activities
      ]);
      setAthlete(athleteData);
      setActivities(activitiesData);
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch data';
      setError(msg);
      if (msg.includes('Unauthorized')) {
        // Optional: Auto logout on 401, or let user read error
        // onLogout(); 
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading && !athlete) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
          <RefreshCw className="w-12 h-12 text-orange-500 animate-spin relative z-10" />
        </div>
        <p className="mt-6 font-medium tracking-wide">Syncing with Strava...</p>
      </div>
    );
  }

  if (error && !athlete) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-red-950/30 border border-red-500/30 p-8 rounded-2xl max-w-md text-center shadow-2xl backdrop-blur-sm">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-red-100 mb-2">Connection Issue</h2>
          <p className="text-red-300 mb-8 leading-relaxed">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={onLogout}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 font-medium"
            >
              Back to Login
            </button>
            <button 
              onClick={() => fetchData(false)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-red-500/25"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate some aggregate stats
  const totalDistance = activities.reduce((acc, curr) => acc + curr.distance, 0);
  const totalElevation = activities.reduce((acc, curr) => acc + curr.total_elevation_gain, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30">
      
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 supports-[backdrop-filter]:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg shadow-lg shadow-orange-500/20">
                <ActivityIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">StravaLens <span className="text-indigo-400">AI</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

               {athlete && (
                 <div className="hidden sm:flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                   <img 
                    src={athlete.profile_medium !== 'avatar/athlete/medium.png' ? athlete.profile_medium : 'https://ui-avatars.com/api/?name=' + athlete.firstname + '+' + athlete.lastname + '&background=random'} 
                    alt={athlete.username} 
                    className="w-6 h-6 rounded-full ring-2 ring-slate-700"
                   />
                   <span className="text-sm font-medium text-slate-300">{athlete.firstname} {athlete.lastname}</span>
                 </div>
               )}
               <div className="h-6 w-px bg-slate-800 mx-1"></div>
               <button 
                 onClick={onLogout}
                 className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-sm font-medium"
                 title="Logout"
               >
                 <LogOut className="w-4 h-4" />
                 <span className="hidden md:inline">Logout</span>
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
           <div className="mb-6 bg-red-900/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
             <AlertCircle className="w-5 h-5 text-red-500" />
             <p>{error}</p>
           </div>
        )}

        {/* Welcome & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-1 border border-slate-700/60 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="h-full bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-18 h-18 rounded-full p-1 bg-gradient-to-r from-orange-500 to-indigo-500 shadow-lg shadow-orange-500/20">
                    <img 
                    src={athlete?.profile !== 'avatar/athlete/large.png' ? athlete?.profile : 'https://ui-avatars.com/api/?name=' + athlete?.firstname + '+' + athlete?.lastname + '&background=random&size=128'} 
                    className="w-16 h-16 rounded-full object-cover border-4 border-slate-900"
                    alt="Profile"
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{athlete?.firstname} {athlete?.lastname}</h2>
                    <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                    <Map className="w-3.5 h-3.5" /> {athlete?.city}, {athlete?.country}
                    </p>
                </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total Dist</div>
                    <div className="text-lg font-bold text-orange-400">{(totalDistance / 1000).toFixed(0)}<span className="text-xs text-slate-600 font-normal ml-0.5">km</span></div>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Elevation</div>
                    <div className="text-lg font-bold text-emerald-400">{(totalElevation).toFixed(0)}<span className="text-xs text-slate-600 font-normal ml-0.5">m</span></div>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Activities</div>
                    <div className="text-lg font-bold text-indigo-400">{activities.length}</div>
                </div>
                </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl p-6 border border-slate-700/60 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                 <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Recent Performance
               </h3>
               <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded-md border border-slate-700">Last 7 Sessions</span>
            </div>
            <Charts activities={activities} />
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700">
                 <ActivityIcon className="w-5 h-5 text-orange-500" />
            </div>
            Recent Activities
          </h3>
          <div className="space-y-4">
            {activities.length > 0 ? (
                activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
                ))
            ) : (
              <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-4">
                    <ActivityIcon className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium">No recent activities found.</p>
                <p className="text-slate-600 text-sm mt-2">Go record something on Strava!</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;