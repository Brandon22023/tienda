<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductoSeeder extends Seeder
{

    public function run(): void
    {
        DB::statement("INSERT INTO 
                        productos(nombre, descripcion, precio, stock, categoria_id, image_url) 
                      VALUES 
                      ('MEMORIA RAM DDR5',
                      'DE 8GB CON FRECUENCIA DE 3200MHZ LATENCIA CL20',
                      100,
                      10,
                      3,
                      'https://i.postimg.cc/BbHS5BJG/ddr5.jpg'),
                      ('MEMORIA RAM DDR5',
                      'DE 16GB CON FRECUENCIA DE 3200MHZ LATENCIA CL20',
                      600,
                      2,
                      3,
                      'https://i.postimg.cc/BbHS5BJG/ddr5.jpg'),
                      ('MEMORIA RAM DDR5',
                      'DE 32GB CON FRECUENCIA DE 3200MHZ LATENCIA CL20',
                      1000,
                      2,
                      3,
                      'https://i.postimg.cc/BbHS5BJG/ddr5.jpg'),
                      ('MEMORIA RAM DDR4',
                      'DE 8GB CON FRECUENCIA DE 3200MHZ  Tipo SODIMM LATENCIA CL20',
                      250,
                      2,
                      3,
                      'https://i.postimg.cc/3wYvkWCR/DDR4.png'),
                      ('MEMORIA RAM DDR4',
                      'DE 16GB CON FRECUENCIA DE 3200MHZ  Tipo SODIMM LATENCIA CL20',
                      500,
                      2,
                      3,
                      'https://i.postimg.cc/3wYvkWCR/DDR4.png'),
                      ('MEMORIA RAM DDR4',
                      'DE 32GB CON FRECUENCIA DE 3200MHZ  Tipo SODIMM LATENCIA CL20',
                      900,
                      2,
                      3,
                      'https://i.postimg.cc/3wYvkWCR/DDR4.png')
                      ", );
                     

    }
}
