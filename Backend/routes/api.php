<?php

use Illuminate\Support\Facades\Route;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\RegisterController;
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
        c.categoria as categoria, 
        p.image_url 
        from productos p
        join categoria c
        on c.categoria_id = p.categoria_id
        order by p.idproductos asc;
    ");
    return response()->json([
        'productos' => $productos,
    ]);
});


// Precio: mayor a menor
Route::get('/catalogo/mayor', function (Request $request) {
    $productos = DB::select("
        select 
            p.idproductos, 
            p.nombre, 
            p.descripcion, 
            p.precio, 
            p.stock, 
            c.categoria as categoria, 
            p.image_url 
        from productos p
        join categoria c
        on c.categoria_id = p.categoria_id
        order by p.precio desc;
    ");
    return response()->json(['productos' => $productos]);
});

// Precio: menor a mayor
Route::get('/catalogo/menor', function (Request $request) {
    $productos = DB::select("
        select 
            p.idproductos, 
            p.nombre, 
            p.descripcion, 
            p.precio, 
            p.stock, 
            c.categoria as categoria, 
            p.image_url 
        from productos p
        join categoria c
        on c.categoria_id = p.categoria_id
        order by p.precio asc;
    ");
    return response()->json(['productos' => $productos]);
});

Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\LoginController::class, 'login']);
