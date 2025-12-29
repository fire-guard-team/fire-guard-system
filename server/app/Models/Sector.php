<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sector extends Model
{
    protected $table = 'sectors';
    protected $primaryKey = 'sector_id';
    public $timestamps = true;

    protected $fillable = [
        'sector_name', 'center_lat', 'center_lng', 'cluster_id', 'status'
    ];

    public function sensors()
    {
        return $this->hasMany(Sensor::class, 'sector_id');
    }

    public function gateways()
    {
        return $this->hasMany(Gateway::class, 'sector_id');
    }
}
