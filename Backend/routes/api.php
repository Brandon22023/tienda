<?php

use Illuminate\Support\Facades\Route;
use App\Models\Producto;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\RegisterController;
Route::get('/inicio', function () {
    $productos = DB::select("
        select 
            p.idproductos,
            p.codigo_producto,
            p.nombre,
            p.descripcion,
            p.precio,
            p.stock,
            c.categoria as categoria,
            p.image_url
        from productos p
        join categoria c on c.categoria_id = p.categoria_id
        order by p.precio asc
        limit 10;
    ");
    return response()->json([
        'mensaje' => [
            'titulo' => 'Articulos que te pueden interesar'
        ],
        'productos' => $productos,
        

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
Route::post('/pedidos', function(Request $request) {
    $data = $request->validate([
        'cliente_id' => 'nullable|integer',
        'total' => 'required|numeric'
    ]);

    try {
        Log::info('API /pedidos payload', $data);
        $now = Carbon::now()->toDateTimeString();
        $id = DB::table('pedidos')->insertGetId([
            'cliente_id' => $data['cliente_id'] ?? null,
            'fecha'      => $now,
            'total'      => $data['total']
        ], 'idpedidos');
         Log::info("Pedido creado id={$id} cliente_id=".($data['cliente_id'] ?? 'NULL'));
        return response()->json([
            'id'    => $id,
            'fecha' => $now
        ], 201);
    } catch (\Exception $e) {
        Log::error('Error al insertar pedido: '.$e->getMessage());
        return response()->json(['message' => 'Error al crear pedido', 'error' => $e->getMessage()], 500);
    }
});

Route::post('/pedidos/{id}/detalles', function(Request $request, $id) {
    $data = $request->validate([
        'items' => 'required|array',
        'items.*.idproductos' => 'required|integer',
        'items.*.cantidad' => 'required|integer',
        'items.*.precio_unitario' => 'required|numeric',
    ]);

    try {
        $rows = [];
        foreach ($data['items'] as $it) {
            $rows[] = [
                'idpedidos' => (int)$id,
                'idproductos' => (int)$it['idproductos'],
                'cantidad' => (int)$it['cantidad'],
                'precio_unitario' => $it['precio_unitario']
            ];
        }
        if (!empty($rows)) {
            DB::table('detalles_pedido')->insert($rows);
        }
        return response()->json(['inserted' => count($rows)], 201);
    } catch (\Exception $e) {
        Log::error('Error al insertar detalles_pedido: '.$e->getMessage());
        return response()->json(['message' => 'Error al insertar detalles', 'error' => $e->getMessage()], 500);
    }
});