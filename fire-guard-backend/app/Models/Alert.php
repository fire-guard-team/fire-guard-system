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
        'alert_level',      // Low | Medium | High | Critical
        'alert_type',       // Smoke Detection | High Temperature ...
        'meta',             // trigger conditions (json)
        'created_at',
        'acknowledged_at',
        'acknowledged_by',
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    protected $appends = ['status'];

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function sensor()
    {
        return $this->belongsTo(Sensor::class, 'sensor_id');
    }

    public function event()
    {
        return $this->belongsTo(WildfireEvent::class, 'event_id');
    }

    public function acknowledgedBy()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    /* ================= Helpers ================= */
    public function getStatusAttribute()
    {
        return $this->acknowledged_at ? 'Acknowledged' : 'Active';
    }
}
