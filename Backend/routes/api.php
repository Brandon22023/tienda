<?php

use Illuminate\Support\Facades\Route;

Route::get('/inicio', function () {
    return response()->json([
        'mensaje' => [
            'titulo' => 'Bienvenidos a Electrocore',
            'descripcion' => 'aqui se mostraran todas las ofertas del dia asi que esten
            atentos  y no se lo pierdan',
        ]
    ]);
});