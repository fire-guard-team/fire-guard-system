import type { FC } from "react";

interface RiskData {
  sector_id: string;
  name: string;
  status: string;
  risk_score: number;
  readings: number;
  last_updated: string;
}

interface RiskDistributionSectionProps {
  riskData: RiskData[];
  loading?: boolean;
}

const getRiskColor = (score: number) => {
  if (score >= 70) return 'bg-red-500';      // Fire
  if (score >= 40) return 'bg-yellow-400';   // Warning
  if (score >= 20) return 'bg-orange-400';   // Caution
  return 'bg-green-500';                     // Safe
};

const getRiskLabel = (score: number) => {
  if (score >= 70) return 'Fire Risk';
  if (score >= 40) return 'High Risk';
  if (score >= 20) return 'Medium Risk';
  return 'Low Risk';
};

const RiskDistributionSection: FC<RiskDistributionSectionProps> = ({
  riskData = [],
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm h-full">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Sector Risk Distribution
        </h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg px-5 py-4 shadow-sm h-full">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Sector Risk Distribution
      </h2>

      {riskData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No risk data available</p>
          <p className="text-sm mt-1">Please start the simulation to display risk data</p>
        </div>
      ) : (
        <div className="space-y-4">
          {riskData.slice(0, 5).map((sector) => (
            <div key={sector.sector_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${getRiskColor(sector.risk_score)}`} />
                <div>
                  <p className="font-medium text-gray-900">{sector.name}</p>
                  <p className="text-sm text-gray-600">
                    {sector.readings} readings • {sector.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{sector.risk_score.toFixed(1)}</p>
                <p className="text-xs text-gray-500">{getRiskLabel(sector.risk_score)}</p>
              </div>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Risk Legend:</span>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span>Safe (0-19)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                  <span>Caution (20-39)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span>Warning (40-69)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span>Fire (70+)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDistributionSection;
