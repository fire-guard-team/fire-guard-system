<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGatewayTelemetryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'gateway_id' => ['required', 'integer', 'exists:gateways,gateway_id'],
            'received_at' => ['required', 'date'],

            'network_quality' => ['nullable', 'string'],

            'sensors' => ['required', 'array', 'min:1'],

            'sensors.*.sensor_id' => ['required', 'integer'],
            'sensors.*.timestamp' => ['required', 'date'],

            'sensors.*.environment.temperature' => ['nullable', 'numeric'],
            'sensors.*.environment.humidity' => ['nullable', 'numeric'],
            'sensors.*.environment.smoke' => ['nullable', 'numeric'],
            // 🔥🔥🔥 الأهم 🔥🔥🔥
            'sensors.*.location.lat' => 'required|numeric',
            'sensors.*.location.lng' => 'required|numeric',
            
            'failed_nodes' => ['nullable', 'array'],
            'failed_nodes.*' => ['integer'],
        ];
    }
}
