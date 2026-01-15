<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sector extends Model
{
    protected $primaryKey = 'sector_id';

    protected $fillable = [
        'project_area_id',
        'name',
        'status',
        'boundary',
    ];
}
