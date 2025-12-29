<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gateway extends Model
{
    protected $table = 'gateways';
    protected $primaryKey = 'gateway_id';
    public $timestamps = true;

    protected $fillable = [
        'name', 'device_id', 'sector_id',
        'latitude', 'longitude', 'last_online', 'status'
    ];

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }
}
