<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    use HasFactory;

    protected $table = 'alert';
    protected $primaryKey = 'alert_id';
    public $timestamps = false;

    protected $fillable = ['event_id', 'sector_id', 'sensor_id', 'alert_source', 'alert_level', 'created_at', 'acknowledged_by', 'acknowledged_at'];
    public function event()
    {
        return $this->belongsTo(WildfireEvent::class, 'event_id');
    }

    public function sensor()
    {
        return $this->belongsTo(Sensor::class, 'sensor_id');
    }
}
