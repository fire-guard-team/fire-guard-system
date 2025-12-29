<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSensorRequest extends FormRequest
{
    public function authorize()
    {
        return true; 
    }

    public function rules()
    {
        return [
            'sensor_name'   => 'nullable|string|max:255',
            'device_id'     => 'required|string|unique:sensors,device_id',
            'type_id'       => 'required|integer|exists:sensor_types,type_id',
            'sector_id'     => 'required|integer|exists:sectors,sector_id',
            'latitude'      => 'nullable|numeric',
            'longitude'     => 'nullable|numeric',
            'battery_level' => 'nullable|integer|min:0|max:100',
            'status'        => 'nullable|string',
        ];
    }
}
