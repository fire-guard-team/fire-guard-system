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
        $humidity = $data['humidity'] ?? 100;
        $smoke = $data['smoke_level'] ?? 0;

        $score =
            ($temperature * 0.4) +
            ((100 - $humidity) * 0.3) +
            ($smoke * 10 * 0.3);

        if ($score >= 80) {
            return [
                'risk_score' => round($score, 2),
                'decision' => 'fire',
            ];
        }

        if ($score >= 60) {
            return [
                'risk_score' => round($score, 2),
                'decision' => 'warning',
            ];
        }

        return [
            'risk_score' => round($score, 2),
            'decision' => 'normal',
        ];
    }
}
