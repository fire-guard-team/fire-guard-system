<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnvironmentalData extends Model
{
    use HasFactory;

    protected $table = 'environmental_data';
    protected $primaryKey = 'data_id';
    public $timestamps = true;
    protected $casts = [
        'temperature' => 'float',
        'humidity' => 'float',
        'smoke_level' => 'float',
        'aqi' => 'float',
        'fire_risk_score' => 'float',
        'recorded_at' => 'datetime',
    ];

    protected $fillable = [
        'sensor_id','temperature','humidity','smoke_level','aqi','fire_risk_score','recorded_at','geom'
    ];

    public function sensor(){ return $this->belongsTo(Sensor::class,'sensor_id'); }
}
