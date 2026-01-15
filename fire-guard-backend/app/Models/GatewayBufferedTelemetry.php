<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GatewayBufferedTelemetry extends Model
{
    protected $table = 'gateway_buffered_telemetry';

    protected $fillable = [
        'gateway_id',
        'payload',
        'received_at',
        'processed',
    ];

    protected $casts = [
        'payload' => 'array',
        'received_at' => 'datetime',
        'processed' => 'boolean',
    ];
}
