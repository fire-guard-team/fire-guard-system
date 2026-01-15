<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GatewayHeartbeat extends Model
{
    protected $fillable = [
        'gateway_id',
        'received_sensors',
        'failed_sensors',
        'network_quality',
        'received_at',
    ];
}
