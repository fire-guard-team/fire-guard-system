<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTelemetryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // لاحقًا يمكن ربطه بـ token خاص بالحساسات
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
            'sensor_id' => ['required', 'integer', 'exists:sensors,sensor_id'],
            'timestamp' => ['required', 'date'],

            'environment.temperature' => ['nullable', 'numeric'],
            'environment.humidity'    => ['nullable', 'numeric'],
            'environment.smoke'       => ['nullable', 'numeric'],

            'air_quality.aqi' => ['nullable', 'numeric'],

            'device.battery' => ['nullable', 'integer', 'min:0', 'max:100'],
            'device.signal_strength' => ['nullable', 'integer'],

            'location.lat' => 'required|numeric',
            'location.lng' => 'required|numeric',
        ];
    }

    public function messages(): array
    {
        return [
            'sensor_id.required' => 'Sensor ID is required',
            'sensor_id.exists'   => 'Sensor not registered in the system',
        ];
    }
}
