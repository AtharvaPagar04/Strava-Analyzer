import { StravaActivity, StravaAthlete } from '../types';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export class StravaService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${STRAVA_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid or expired token');
      }
      throw new Error(`Strava API Error: ${response.statusText}`);
    }

    return response.json();
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
