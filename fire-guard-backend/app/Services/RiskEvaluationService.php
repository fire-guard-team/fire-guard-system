<?php

namespace App\Services;

class RiskEvaluationService
{
    /**
     * Calculate fire risk score (0 - 100)
     */
    public function evaluate(array $data): array
    {
        $temperature = $data['temperature'] ?? 0;
        $humidity    = $data['humidity'] ?? 50;
        $smoke       = $data['smoke_level'] ?? 0;

        // Weights (قابلة للتعديل لاحقًا)
        $tempScore  = min($temperature * 1.5, 60); // max 60
        $smokeScore = min($smoke * 10, 30);        // max 30
        $humPenalty = min((100 - $humidity) * 0.1, 10); // max 10

        $riskScore = $tempScore + $smokeScore + $humPenalty;
        $riskScore = min(round($riskScore, 2), 100);

        return [
            'risk_score' => $riskScore,
            'decision' => $this->decisionFromScore($riskScore),
        ];
    }

    protected function decisionFromScore(float $score): string
    {
        if ($score >= 75) return 'fire';
        if ($score >= 50) return 'warning';
        return 'normal';
    }
}
