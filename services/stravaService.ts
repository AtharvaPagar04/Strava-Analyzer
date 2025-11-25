import { StravaActivity, StravaAthlete } from '../types';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export class StravaService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${STRAVA_API_BASE}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or expired token');
        }
        if (response.status === 429) {
          throw new Error('Strava Rate Limit Exceeded. Please try again in 15 minutes.');
        }
        throw new Error(`Strava API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      // Re-throw handled errors, wrap network errors
      if (error.message.includes('Unauthorized') || error.message.includes('Rate Limit')) {
        throw error;
      }
      throw new Error(error.message || 'Network request failed');
    }
  }

  async getAthlete(): Promise<StravaAthlete> {
    return this.request<StravaAthlete>('/athlete');
  }

  async getActivities(page = 1, perPage = 30): Promise<StravaActivity[]> {
    return this.request<StravaActivity[]>(`/athlete/activities?page=${page}&per_page=${perPage}`);
  }

  async getActivity(id: number): Promise<StravaActivity> {
    return this.request<StravaActivity>(`/activities/${id}`);
  }
}