<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    protected $table = 'sensors';
    protected $primaryKey = 'sensor_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'sensor_name','device_id','type_id','sector_id',
        'latitude','longitude','battery_level','status',
        'last_heartbeat','installation_date'
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'battery_level' => 'integer',
        'last_heartbeat' => 'datetime',
    ];

    public function type(){ return $this->belongsTo(SensorType::class,'type_id'); }
    public function sector(){ return $this->belongsTo(Sector::class,'sector_id'); }
    public function environmentalData(){ return $this->hasMany(EnvironmentalData::class,'sensor_id'); }
    public function healthLogs(){ return $this->hasMany(SensorHealthLog::class,'sensor_id'); }
}
