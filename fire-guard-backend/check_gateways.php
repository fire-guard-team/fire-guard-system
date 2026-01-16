<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Checking existing gateways:" . PHP_EOL;
$gateways = DB::table('gateways')->get();
echo "Total gateways: " . $gateways->count() . PHP_EOL;
foreach($gateways as $gateway) {
    echo "Gateway " . $gateway->gateway_id . ": " . $gateway->name . " (" . $gateway->status . ")" . PHP_EOL;
}