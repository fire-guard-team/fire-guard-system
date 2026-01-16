<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectArea extends Model
{
    protected $fillable = [
        'name',
        'boundary',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}

