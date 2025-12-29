<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIAnalysisLog extends Model
{
    use HasFactory;

    protected $table = 'ai_analysis_log';
    protected $primaryKey = 'analysis_id';
    public $timestamps = false;

    protected $casts = [
        'input_data' => 'array',
        'risk_result' => 'float',
    ];

    protected $fillable = ['sensor_id','sector_id','algorithm_name','input_data','risk_result','decision','created_at'];

    public function sensor(){ return $this->belongsTo(Sensor::class,'sensor_id'); }
    public function sector(){ return $this->belongsTo(Sector::class,'sector_id'); }
}
