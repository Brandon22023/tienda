<?php

use Illuminate\Support\Facades\Route;
use App\Models\Producto;
use Illuminate\Support\Facades\DB;
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
    $productos = DB::select("
        select 
        p.idproductos, 
        p.nombre, 
        p.descripcion, 
        p.precio, 
        p.stock, 
        c.categoria as categoria, p.image_url from productos p
        join categoria c
        on c.categoria_id = p.categoria_id;
    ");
    return response()->json([
        'productos' => $productos,
    ]);
});