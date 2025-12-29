<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'full_name'      => 'System Admin',
                'username'       => 'admin',
                'email'          => 'admin@fireguard.com',
                'phone'          => '0999999999',
                'password_hash'  => Hash::make('admin123'), 
                'role_id'        => 1, 
                'avatar'         => null,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
        ]);
    }
}
