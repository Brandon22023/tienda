<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductoSeederV2 extends Seeder
{
    public function run(): void
    {
        $categories = DB::table('categoria')->pluck('categoria_id', 'categoria');
        $products = [
            ['MEMORIA RAM DDR5','DE 8GB CON FRECUENCIA DE 3200MHZ LATENCIA CL20',100,10,'Memoria Ram','https://i.postimg.cc/BbHS5BJG/ddr5.jpg','SKU-001'],
            ['MEMORIA RAM DDR5','DE 16GB CON FRECUENCIA DE 3200MHZ LATENCIA CL20',600,2,'Memoria Ram','https://i.postimg.cc/BbHS5BJG/ddr5.jpg','SKU-002'],
            ['MEMORIA RAM DDR5','DE 32GB CON FRECUENCIA DE 3200MHZ LATENCIA CL20',1000,2,'Memoria Ram','https://i.postimg.cc/BbHS5BJG/ddr5.jpg','SKU-003'],
            ['LAPTOP VICTUS','LAPTOP VICTUS 16.1 RYZEN 5 5600H 8GB 512GB SSD',9000,5,'Laptops','https://i.postimg.cc/Y2Fs5Sny/victus.png','SKU-007'],
            ['LAPTOP LENOVO','ThinkPad E16 Gen 2 Core Ultra 5 16GB RAM + 512GB SSD',11000,5,'Laptops','https://i.postimg.cc/Hx18h3Px/LENOVO.jpg','SKU-008'],
            ['TECLA RAZER','Tecla Razer negra para teclado gaming',150,15,'Perifericos','https://i.postimg.cc/zBLw4kb1/tecla.jpg','SKU-010'],
            ['TECLADO','Mini teclado inalambrico Manhattan',300,5,'Perifericos','https://i.postimg.cc/DwpmX3ZD/wlt-mh-180764e.jpg','SKU-013'],
            ['Mouse','Mouse Manhattan optico USB',60,5,'Perifericos','https://i.postimg.cc/8CWJQnp2/mou-mh-e7801a.jpg','SKU-015'],
            ['Monitor','Monitor LED AOC 27 pulgadas 144Hz',1000,5,'Monitores','https://i.postimg.cc/NfXRw4sL/1713312485.png','SKU-016'],
            ['Monitor','Monitor Samsung Odyssey G3 24 pulgadas 180Hz',1600,5,'Monitores','https://i.postimg.cc/Hs09fg4h/1732550702.png','SKU-017'],
            ['SSD','SSD Kingston M.2 NV3 de 2TB',1270,5,'Almacenamiento','https://i.postimg.cc/bNX9dJww/ssd-kn-nv32tm2.jpg','SKU-019'],
            ['SSD','SSD Crucial MX500 250GB',370,5,'Almacenamiento','https://i.postimg.cc/J00vnhrP/ssd-cru-mx50025.jpg','SKU-021'],
            ['AUDIFONOS','Audifonos Logitech H390 USB con microfono',215,5,'Audio','https://i.postimg.cc/G2tnBKzN/au.png','SKU-022'],
            ['AUDIFONOS','Redmi Buds 6 Play Bluetooth azul',110,5,'Audio','https://i.postimg.cc/fbLMXMRf/Redmi-Buds6-Play-Azul1200x1200-1-700x700.jpg','SKU-023'],
        ];

        foreach ($products as [$name, $description, $price, $stock, $category, $image, $sku]) {
            DB::table('productos')->updateOrInsert(
                ['codigo_producto' => $sku],
                ['nombre' => $name, 'descripcion' => $description, 'precio' => $price, 'stock' => $stock,
                 'categoria_id' => $categories[$category], 'image_url' => $image]
            );
        }
    }
}
