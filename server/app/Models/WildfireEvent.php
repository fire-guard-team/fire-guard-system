<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WildfireEvent extends Model
{
    use HasFactory;

    protected $table = 'wildfire_event';
    protected $primaryKey = 'event_id';
    public $timestamps = false;
    protected $fillable = ['sector_id', 'detected_at', 'confirmed_at', 'closed_at', 'created_by', 'closed_by', 'status', 'spread_level', 'notes', 'created_at'];

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }
}
