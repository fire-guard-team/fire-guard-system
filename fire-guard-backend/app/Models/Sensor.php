<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
        protected $primaryKey = 'sensor_id';
    public $timestamps = true;

    protected $fillable = [
        'sector_id',
        'name',
        'type',
        'status',
        'last_seen',
        'battery_level',
        'lat',
        'lng',
    ];

    // ===============================
    // Relationships
    // ===============================
    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class, 'sensor_id');
    }

    public function environmentalData()
    {
        return $this->hasMany(EnvironmentalData::class, 'sensor_id');
    }
}