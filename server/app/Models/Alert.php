<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    protected $primaryKey = 'alert_id';
    public $timestamps = false;

    protected $fillable = [
        'event_id',
        'sector_id',
        'sensor_id',
        'alert_source',
        'alert_level',
        'created_at',
        'acknowledged_at',
    ];
}
