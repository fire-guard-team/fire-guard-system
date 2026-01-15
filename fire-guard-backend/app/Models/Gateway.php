<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gateway extends Model
{
    protected $primaryKey = 'gateway_id';

    protected $fillable = [
        'name',
        'status',
        'latitude',
        'longitude',
        'last_seen',
    ];
}
