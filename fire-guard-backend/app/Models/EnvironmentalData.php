<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnvironmentalData extends Model
{
    protected $table = 'environmental_data';

    protected $fillable = [
        'sensor_id',
        'temperature',
        'humidity',
        'smoke_level',
        'aqi',
        'recorded_at'
    ];
}
