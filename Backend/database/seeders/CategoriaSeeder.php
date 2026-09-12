<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Laptops', 'Monitores', 'Memoria Ram', 'Perifericos', 'Almacenamiento', 'Audio'] as $name) {
            DB::table('categoria')->updateOrInsert(['categoria' => $name], ['categoria' => $name]);
        }
    }
}
