<?php

namespace App\DTOs;

use Carbon\Carbon;

class TelemetryDTO
{
    public int $sensorId;
    public ?int $sectorId = null;

    public Carbon $timestamp;

    public ?float $temperature;
    public ?float $humidity;
    public ?float $smoke;
    public ?float $aqi;

    public ?int $battery;
    public ?int $signalStrength;

    public ?float $lat;
    public ?float $lng;
    public function __construct() {}
    public static function fromArray(array $data): self
    {
        $dto = new self();

        $dto->sensorId = (int) $data['sensor_id'];
        $dto->sectorId = $data['sector_id'] ?? null;
        $dto->timestamp = Carbon::parse($data['timestamp']);

        $dto->temperature = $data['environment']['temperature'] ?? null;
        $dto->humidity    = $data['environment']['humidity'] ?? null;
        $dto->smoke       = $data['environment']['smoke'] ?? null;

        $dto->aqi = $data['air_quality']['aqi'] ?? null;

        $dto->battery = $data['device']['battery'] ?? null;
        $dto->signalStrength = $data['device']['signal_strength'] ?? null;

        $dto->lat = $data['location']['lat'] ?? null;
        $dto->lng = $data['location']['lng'] ?? null;

        return $dto;
    }
}
