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
        $nombres = ["Laptop", "Monitores", "Memoria Ram", "Periferico", "Almacenamiento", "Audio"];
        //Categoria::truncate();//aqui se iniciara para añadir el coso para las categorias usaremos eloquent
        if (empty(Categoria::all())) {
                foreach ($nombres as $nombre) {
                    Categoria::Create([
                        'categoria' => $nombre
                    ]);
                }
        } else {

            foreach ($nombres as $nombre) {
                Categoria::firstOrCreate([
                    'categoria' => $nombre
                ]);
            }
        }
        
    }
}
