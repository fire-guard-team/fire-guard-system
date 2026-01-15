<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WildfireEvent extends Model
{

    protected $primaryKey = 'event_id';

    protected $fillable = [
        'sector_id',
        'detected_at',
        'confirmed_at',
        'closed_at',
        'status',
        'spread_level',
        'notes',
    ];
}
