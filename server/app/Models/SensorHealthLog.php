<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensorHealthLog extends Model
{
    protected $table = 'sensor_health_log';
    protected $primaryKey = 'log_id';
    public $timestamps = false;

    protected $fillable = [
        'sensor_id', 'battery_level', 'voltage',
        'signal_strength', 'error_code', 'logged_at'
    ];

    public function sensor()
    {
        return $this->belongsTo(Sensor::class, 'sensor_id');
    }
}
