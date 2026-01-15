<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AIAnalysisLog extends Model
{
    protected $table = 'ai_analysis_logs';
    protected $primaryKey = 'analysis_id';
    public $timestamps = false;

    protected $fillable = [
        'sensor_id',
        'sector_id',
        'algorithm_name',
        'input_data',
        'risk_score',
        'decision',
        'created_at'
    ];

    protected $casts = [
        'input_data' => 'array',
        'risk_score' => 'float',
    ];
}
