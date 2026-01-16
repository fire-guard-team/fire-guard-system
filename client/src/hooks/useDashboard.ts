import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../utils/api';

interface DashboardStats {
  active_sectors: number;
  total_alerts: number;
  fire_risk_index: number;
  system_status: string;
  sector_breakdown: {
    fire: number;
    warning: number;
    safe: number;
  };
  alert_breakdown: {
    active: number;
    critical: number;
  };
}

interface LiveSensorData {
  id: string;
  type: string;
  value: string;
  status: 'normal' | 'elevated' | 'critical';
  timestamp: string;
  sector: string;
}

interface RecentAlert {
  id: number;
  title: string;
  level: 'High' | 'Medium' | 'Low';
  date: string;
  description: string;
  sector: string;
  acknowledged: boolean;
}

interface RiskDistribution {
  sector_id: string;
  name: string;
  status: string;
  risk_score: number;
  readings: number;
  last_updated: string;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveSensorData, setLiveSensorData] = useState<LiveSensorData[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.getDashboardStats();
      setStats(response);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }, []);

  const fetchLiveSensorData = useCallback(async () => {
    try {
      const response = await apiService.getDashboardLiveSensorData();
      setLiveSensorData(response.data || []);
    } catch (err) {
      console.error('Error fetching live sensor data:', err);
      setLiveSensorData([]);
    }
  }, []);

  const fetchRecentAlerts = useCallback(async () => {
    try {
      const response = await apiService.getDashboardRecentAlerts();
      setRecentAlerts(response.data || []);
    } catch (err) {
      console.error('Error fetching recent alerts:', err);
      setRecentAlerts([]);
    }
  }, []);

  const fetchRiskDistribution = useCallback(async () => {
    try {
      const response = await apiService.getDashboardRiskDistribution();
      setRiskDistribution(response.data || []);
    } catch (err) {
      console.error('Error fetching risk distribution:', err);
      setRiskDistribution([]);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchStats(),
        fetchLiveSensorData(),
        fetchRecentAlerts(),
        fetchRiskDistribution(),
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchLiveSensorData, fetchRecentAlerts, fetchRiskDistribution]);

  useEffect(() => {
    fetchAllData();

    const interval = setInterval(fetchAllData, 30000);

    return () => clearInterval(interval);
  }, [fetchAllData]);

  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    stats,
    liveSensorData,
    recentAlerts,
    riskDistribution,
    loading,
    error,
    refreshData,
    fetchStats,
    fetchLiveSensorData,
    fetchRecentAlerts,
    fetchRiskDistribution,
  };
};