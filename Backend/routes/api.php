<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

$catalogProducts = function (string $order): array
{
    $allowed = ['p.idproductos asc', 'p.precio asc', 'p.precio desc'];
    abort_unless(in_array($order, $allowed, true), 400);

    return DB::table('productos as p')
        ->join('categoria as c', 'c.categoria_id', '=', 'p.categoria_id')
        ->select('p.idproductos', 'p.nombre', 'p.descripcion', 'p.precio', 'p.stock', 'c.categoria', 'p.image_url')
        ->orderByRaw($order)
        ->get()
        ->all();
};

Route::get('/inicio', function () use ($catalogProducts) {
    return response()->json([
        'mensaje' => ['titulo' => 'Articulos que te pueden interesar'],
        'productos' => array_slice($catalogProducts('p.precio asc'), 0, 10),
    ]);
});

Route::get('/catalogo', fn () => response()->json(['productos' => $catalogProducts('p.idproductos asc')])) ;
Route::get('/catalogo/mayor', fn () => response()->json(['productos' => $catalogProducts('p.precio desc')])) ;
Route::get('/catalogo/menor', fn () => response()->json(['productos' => $catalogProducts('p.precio asc')])) ;

Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/pedidos', [OrderController::class, 'store']);
