<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensorType extends Model
{
    protected $table = 'sensor_types';
    protected $primaryKey = 'type_id';
    public $timestamps = false;

    protected $fillable = ['type_name', 'description'];

    public function sensors()
    {
        return $this->hasMany(Sensor::class, 'type_id');
    }
}
