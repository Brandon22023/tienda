<?php

use Illuminate\Support\Facades\Route;

Route::get('/inicio', function () {
    return response()->json([
        'mensaje' => [
            'titulo' => 'Bienvenidos a Electrocore',
            'descripcion' => 'todas las ofertas del dia asi que esten atentos y no se lo pierdan,
            vendemos los productos de la mas alta calidad, asi que, que esperan en comprarlo',
        ],

    ]);
});

Route::get('/catalogo', function () {
    return response()->json([
        'productos' => [
            // Memoria RAM (15)
            ['id'=>1,'nombre'=>'HyperX Fury 8GB','precio'=>120,'categoria'=>'Memoria RAM'],
            ['id'=>2,'nombre'=>'Kingston 8GB','precio'=>95,'categoria'=>'Memoria RAM'],
            ['id'=>3,'nombre'=>'Corsair Vengeance 8GB','precio'=>130,'categoria'=>'Memoria RAM'],
            ['id'=>4,'nombre'=>'G.Skill Ripjaws 16GB','precio'=>220,'categoria'=>'Memoria RAM'],
            ['id'=>5,'nombre'=>'Patriot Signature 4GB','precio'=>60,'categoria'=>'Memoria RAM'],
            ['id'=>6,'nombre'=>'Crucial Ballistix 16GB','precio'=>210,'categoria'=>'Memoria RAM'],
            ['id'=>7,'nombre'=>'Samsung DDR4 8GB','precio'=>115,'categoria'=>'Memoria RAM'],
            ['id'=>8,'nombre'=>'TeamGroup T-Force 32GB','precio'=>420,'categoria'=>'Memoria RAM'],
            ['id'=>9,'nombre'=>'ADATA XPG 16GB','precio'=>195,'categoria'=>'Memoria RAM'],
            ['id'=>10,'nombre'=>'Kingston HyperX 32GB','precio'=>430,'categoria'=>'Memoria RAM'],
            ['id'=>11,'nombre'=>'Corsair Dominator 8GB','precio'=>150,'categoria'=>'Memoria RAM'],
            ['id'=>12,'nombre'=>'G.Skill Trident Z 16GB','precio'=>260,'categoria'=>'Memoria RAM'],
            ['id'=>13,'nombre'=>'Crucial 32GB Kit','precio'=>480,'categoria'=>'Memoria RAM'],
            ['id'=>14,'nombre'=>'Patriot Viper 8GB','precio'=>140,'categoria'=>'Memoria RAM'],
            ['id'=>15,'nombre'=>'Samsung DDR5 16GB','precio'=>600,'categoria'=>'Memoria RAM'],

            // Laptops (15)
            ['id'=>16,'nombre'=>'Laptop Ultrabook 13" i5','precio'=>850,'categoria'=>'Laptops'],
            ['id'=>17,'nombre'=>'Gaming Laptop 15" i7 GTX','precio'=>1400,'categoria'=>'Laptops'],
            ['id'=>18,'nombre'=>'Notebook 14" Ryzen 5','precio'=>720,'categoria'=>'Laptops'],
            ['id'=>19,'nombre'=>'Chromebook 11"','precio'=>260,'categoria'=>'Laptops'],
            ['id'=>20,'nombre'=>'Laptop Business i7 16GB','precio'=>1250,'categoria'=>'Laptops'],
            ['id'=>21,'nombre'=>'Laptop 17" Workstation','precio'=>2200,'categoria'=>'Laptops'],
            ['id'=>22,'nombre'=>'Convertible 2-en-1 13"','precio'=>980,'categoria'=>'Laptops'],
            ['id'=>23,'nombre'=>'Laptop Gamer RTX 3060','precio'=>1600,'categoria'=>'Laptops'],
            ['id'=>24,'nombre'=>'Laptop Student 15"','precio'=>450,'categoria'=>'Laptops'],
            ['id'=>25,'nombre'=>'Laptop Liviana 14"','precio'=>690,'categoria'=>'Laptops'],
            ['id'=>26,'nombre'=>'MacBook-like 13" (genérico)','precio'=>1299,'categoria'=>'Laptops'],
            ['id'=>27,'nombre'=>'Laptop Empresarial 14"','precio'=>990,'categoria'=>'Laptops'],
            ['id'=>28,'nombre'=>'Laptop para Diseño 16"','precio'=>1800,'categoria'=>'Laptops'],
            ['id'=>29,'nombre'=>'Gaming Thin 15" RTX','precio'=>1750,'categoria'=>'Laptops'],
            ['id'=>30,'nombre'=>'Laptop Ryzen 7 16GB','precio'=>1150,'categoria'=>'Laptops'],

            // Periféricos (15)
            ['id'=>31,'nombre'=>'Teclado Mecánico RGB','precio'=>250,'categoria'=>'Periféricos'],
            ['id'=>32,'nombre'=>'Mouse Gamer Óptico','precio'=>80,'categoria'=>'Periféricos'],
            ['id'=>33,'nombre'=>'Mousepad XL','precio'=>25,'categoria'=>'Periféricos'],
            ['id'=>34,'nombre'=>'Webcam Full HD','precio'=>140,'categoria'=>'Periféricos'],
            ['id'=>35,'nombre'=>'Micrófono USB','precio'=>160,'categoria'=>'Periféricos'],
            ['id'=>36,'nombre'=>'Base Refrigerante Laptop','precio'=>55,'categoria'=>'Periféricos'],
            ['id'=>37,'nombre'=>'Hub USB 4 puertos','precio'=>35,'categoria'=>'Periféricos'],
            ['id'=>38,'nombre'=>'Soporte para monitor','precio'=>70,'categoria'=>'Periféricos'],
            ['id'=>39,'nombre'=>'Control Wireless','precio'=>120,'categoria'=>'Periféricos'],
            ['id'=>40,'nombre'=>'Alfombrilla ergonómica','precio'=>45,'categoria'=>'Periféricos'],
            ['id'=>41,'nombre'=>'Cámara IP doméstica','precio'=>180,'categoria'=>'Periféricos'],
            ['id'=>42,'nombre'=>'Teclado inalámbrico','precio'=>95,'categoria'=>'Periféricos'],
            ['id'=>43,'nombre'=>'Joystick para simulador','precio'=>350,'categoria'=>'Periféricos'],
            ['id'=>44,'nombre'=>'Dock Thunderbolt','precio'=>220,'categoria'=>'Periféricos'],
            ['id'=>45,'nombre'=>'Base vertical laptop','precio'=>48,'categoria'=>'Periféricos'],

            // Monitores (15)
            ['id'=>46,'nombre'=>'Monitor 24" 1080p 75Hz','precio'=>240,'categoria'=>'Monitores'],
            ['id'=>47,'nombre'=>'Monitor 27" 1440p 144Hz','precio'=>520,'categoria'=>'Monitores'],
            ['id'=>48,'nombre'=>'Monitor 32" 4K','precio'=>980,'categoria'=>'Monitores'],
            ['id'=>49,'nombre'=>'Monitor Curvo 27" 144Hz','precio'=>610,'categoria'=>'Monitores'],
            ['id'=>50,'nombre'=>'Monitor Profesional 24" IPS','precio'=>330,'categoria'=>'Monitores'],
            ['id'=>51,'nombre'=>'Monitor Ultrawide 34"','precio'=>1050,'categoria'=>'Monitores'],
            ['id'=>52,'nombre'=>'Monitor 21.5" LED','precio'=>160,'categoria'=>'Monitores'],
            ['id'=>53,'nombre'=>'Monitor Gaming 240Hz','precio'=>860,'categoria'=>'Monitores'],
            ['id'=>54,'nombre'=>'Monitor 27" 4K HDR','precio'=>1200,'categoria'=>'Monitores'],
            ['id'=>55,'nombre'=>'Monitor 24" VA 144Hz','precio'=>300,'categoria'=>'Monitores'],
            ['id'=>56,'nombre'=>'Monitor Profesional Calibrado','precio'=>720,'categoria'=>'Monitores'],
            ['id'=>57,'nombre'=>'Monitor Portátil 15.6"','precio'=>190,'categoria'=>'Monitores'],
            ['id'=>58,'nombre'=>'Soporte VESA doble','precio'=>130,'categoria'=>'Monitores'],
            ['id'=>59,'nombre'=>'Monitor 27" IPS 60Hz','precio'=>270,'categoria'=>'Monitores'],
            ['id'=>60,'nombre'=>'Monitor 23.8" con altavoces','precio'=>210,'categoria'=>'Monitores'],

            // Almacenamiento (15)
            ['id'=>61,'nombre'=>'SSD NVMe 500GB','precio'=>180,'categoria'=>'Almacenamiento'],
            ['id'=>62,'nombre'=>'SSD SATA 1TB','precio'=>120,'categoria'=>'Almacenamiento'],
            ['id'=>63,'nombre'=>'HDD 2TB 7200RPM','precio'=>95,'categoria'=>'Almacenamiento'],
            ['id'=>64,'nombre'=>'SSD NVMe 1TB','precio'=>320,'categoria'=>'Almacenamiento'],
            ['id'=>65,'nombre'=>'Disco Externo 2TB USB3.0','precio'=>110,'categoria'=>'Almacenamiento'],
            ['id'=>66,'nombre'=>'Pendrive 128GB','precio'=>22,'categoria'=>'Almacenamiento'],
            ['id'=>67,'nombre'=>'SSD M.2 256GB','precio'=>75,'categoria'=>'Almacenamiento'],
            ['id'=>68,'nombre'=>'NAS 4 bahías (genérico)','precio'=>450,'categoria'=>'Almacenamiento'],
            ['id'=>69,'nombre'=>'HDD 4TB','precio'=>160,'categoria'=>'Almacenamiento'],
            ['id'=>70,'nombre'=>'SSD Empresarial 2TB','precio'=>650,'categoria'=>'Almacenamiento'],
            ['id'=>71,'nombre'=>'SSD Portátil 1TB','precio'=>210,'categoria'=>'Almacenamiento'],
            ['id'=>72,'nombre'=>'Tarjeta SD 256GB','precio'=>45,'categoria'=>'Almacenamiento'],
            ['id'=>73,'nombre'=>'Disco Externo 1TB','precio'=>75,'categoria'=>'Almacenamiento'],
            ['id'=>74,'nombre'=>'Enclosure M.2 a USB-C','precio'=>40,'categoria'=>'Almacenamiento'],
            ['id'=>75,'nombre'=>'SSD NVMe 2TB','precio'=>640,'categoria'=>'Almacenamiento'],

            // Audio (15)
            ['id'=>76,'nombre'=>'Auriculares Gaming RGB','precio'=>180,'categoria'=>'Audio'],
            ['id'=>77,'nombre'=>'Auriculares Inalámbricos','precio'=>120,'categoria'=>'Audio'],
            ['id'=>78,'nombre'=>'Parlantes 2.1 Bluetooth','precio'=>95,'categoria'=>'Audio'],
            ['id'=>79,'nombre'=>'Soundbar TV 120W','precio'=>260,'categoria'=>'Audio'],
            ['id'=>80,'nombre'=>'Auriculares In-ear deportivos','precio'=>35,'categoria'=>'Audio'],
            ['id'=>81,'nombre'=>'Micrófono de condensador','precio'=>200,'categoria'=>'Audio'],
            ['id'=>82,'nombre'=>'Interfaz de audio USB','precio'=>320,'categoria'=>'Audio'],
            ['id'=>83,'nombre'=>'Auriculares Over-Ear premium','precio'=>330,'categoria'=>'Audio'],
            ['id'=>84,'nombre'=>'Parlantes portátiles 50W','precio'=>150,'categoria'=>'Audio'],
            ['id'=>85,'nombre'=>'Audífonos inalámbricos ANC','precio'=>270,'categoria'=>'Audio'],
            ['id'=>86,'nombre'=>'Sistema de audio 5.1 (genérico)','precio'=>700,'categoria'=>'Audio'],
            ['id'=>87,'nombre'=>'Micrófono USB para streaming','precio'=>110,'categoria'=>'Audio'],
            ['id'=>88,'nombre'=>'Soporte de micrófono boom','precio'=>30,'categoria'=>'Audio'],
            ['id'=>89,'nombre'=>'Auriculares para DJ','precio'=>210,'categoria'=>'Audio'],
            ['id'=>90,'nombre'=>'Auriculares Gaming inalámbricos','precio'=>240,'categoria'=>'Audio'],

            // Videojuegos (10)
            ['id'=>91,'nombre'=>'Control Inalámbrico Pro','precio'=>85,'categoria'=>'Videojuegos'],
            ['id'=>92,'nombre'=>'Volante para simulador','precio'=>420,'categoria'=>'Videojuegos'],
            ['id'=>93,'nombre'=>'Caja de juegos (bundle genérico)','precio'=>70,'categoria'=>'Videojuegos'],
            ['id'=>94,'nombre'=>'Tarjeta regalo tienda 50','precio'=>50,'categoria'=>'Videojuegos'],
            ['id'=>95,'nombre'=>'Mouse para eSports','precio'=>150,'categoria'=>'Videojuegos'],
            ['id'=>96,'nombre'=>'Auriculares para gaming pro','precio'=>200,'categoria'=>'Videojuegos'],
            ['id'=>97,'nombre'=>'Base refrigerada para consola','precio'=>60,'categoria'=>'Videojuegos'],
            ['id'=>98,'nombre'=>'Alfombra antideslizante para joystick','precio'=>18,'categoria'=>'Videojuegos'],
            ['id'=>99,'nombre'=>'Kit de carga para controles','precio'=>35,'categoria'=>'Videojuegos'],
            ['id'=>100,'nombre'=>'Accesorio VR genérico','precio'=>320,'categoria'=>'Videojuegos'],
        ],
    ]);
});