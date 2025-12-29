<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesTableSeeder extends Seeder
{
   
    public function run(): void
    {
          DB::table('roles')->insert([
            ['role_name' => 'Admin'],
            ['role_name' => 'Supervisor'],
            ['role_name' => 'Analyst'],
        ]);
    }
}
