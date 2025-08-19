<?php

use Illuminate\Support\Facades\Route;

Route::get('/inicio', function () {
    return response()->json([
        'mensaje' => [
            'titulo' => 'Bienvenido a tu tienda en línea (desde Laravel)',
            'descripcion' => 'Contenido servido por la API Laravel.',
        ],
        'productos' => [
            ['id'=>1,'nombre'=>'Teclado','precio'=>250],
            ['id'=>2,'nombre'=>'Mouse','precio'=>180],
            ['id'=>3,'nombre'=>'Monitor','precio'=>3200],
        ]
    ]);
});