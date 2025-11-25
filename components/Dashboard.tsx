import React, { useEffect, useState, useCallback } from 'react';
import { StravaService } from '../services/stravaService';
import { StravaActivity, StravaAthlete } from '../types';
import ActivityCard from './ActivityCard';
import Charts from './Charts';
import { LogOut, User, Map, Activity as ActivityIcon, RefreshCw, AlertCircle } from 'lucide-react';

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stravaService = new StravaService(token);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [athleteData, activitiesData] = await Promise.all([
        stravaService.getAthlete(),
        stravaService.getActivities(1, 30) // Get last 30 activities
      ]);
      setAthlete(athleteData);
      setActivities(activitiesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      if (err.message.includes('Unauthorized')) {
        onLogout(); // Force logout if token is bad
      }
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !athlete) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <p>Syncing with Strava...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-100 mb-2">Connection Error</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button 
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Calculate some aggregate stats
  const totalDistance = activities.reduce((acc, curr) => acc + curr.distance, 0);
  const totalElevation = activities.reduce((acc, curr) => acc + curr.total_elevation_gain, 0);
  const totalTime = activities.reduce((acc, curr) => acc + curr.moving_time, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <ActivityIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">StravaLens <span className="text-indigo-400">AI</span></span>
            </div>
            
            <div className="flex items-center gap-4">
               {athlete && (
                 <div className="hidden sm:flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                   <img 
                    src={athlete.profile_medium !== 'avatar/athlete/medium.png' ? athlete.profile_medium : 'https://picsum.photos/40/40'} 
                    alt={athlete.username} 
                    className="w-6 h-6 rounded-full ring-2 ring-slate-600"
                   />
                   <span className="text-sm font-medium text-slate-300">{athlete.firstname} {athlete.lastname}</span>
                 </div>
               )}
               <button 
                 onClick={onLogout}
                 className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                 title="Logout"
               >
                 <LogOut className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-r from-orange-500 to-indigo-500">
                <img 
                  src={athlete?.profile !== 'avatar/athlete/large.png' ? athlete?.profile : 'https://picsum.photos/100/100'} 
                  className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                  alt="Profile"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{athlete?.firstname} {athlete?.lastname}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-1">
                  <Map className="w-3 h-3" /> {athlete?.city}, {athlete?.country}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Dist</div>
                <div className="text-lg font-bold text-orange-400">{(totalDistance / 1000).toFixed(0)}<span className="text-xs text-slate-600">km</span></div>
              </div>
              <div className="bg-slate-950/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Elevation</div>
                <div className="text-lg font-bold text-emerald-400">{(totalElevation).toFixed(0)}<span className="text-xs text-slate-600">m</span></div>
              </div>
              <div className="bg-slate-950/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Activities</div>
                <div className="text-lg font-bold text-indigo-400">{activities.length}</div>
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Recent Performance</h3>
            <Charts activities={activities} />
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-orange-500" />
            Recent Activities
          </h3>
          <div className="space-y-4">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
            {activities.length === 0 && (
              <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
                <p className="text-slate-500">No recent activities found.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
