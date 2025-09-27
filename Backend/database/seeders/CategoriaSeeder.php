<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $nombres = ["Laptops", "Monitores", "Memoria Ram", "Periféricos", "Almacenamiento", "Audio"];
        
        foreach ($nombres as $nombre) {
            // Buscar por la columna 'categoria' para que no se repitan
            if (! Categoria::where('categoria', $nombre)->exists()) {
                Categoria::create(['categoria' => $nombre]);
            }
        }
        
    }
}
