<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'cliente_id' => ['nullable', 'integer', 'exists:cliente,cliente_id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.idproductos' => ['required', 'integer', 'distinct', 'exists:productos,idproductos'],
            'items.*.cantidad' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $order = DB::transaction(function () use ($data) {
                $total = 0;
                $details = [];
                foreach ($data['items'] as $item) {
                    $product = DB::table('productos')->where('idproductos', $item['idproductos'])->lockForUpdate()->first();
                    if ($product->stock < $item['cantidad']) {
                        abort(422, "Stock insuficiente para el producto {$product->nombre}");
                    }
                    $total += (float) $product->precio * $item['cantidad'];
                    $details[] = [
                        'idproductos' => $product->idproductos,
                        'cantidad' => $item['cantidad'],
                        'precio_unitario' => $product->precio,
                    ];
                    DB::table('productos')->where('idproductos', $product->idproductos)->decrement('stock', $item['cantidad']);
                }
                $now = now();
                $id = DB::table('pedidos')->insertGetId([
                    'cliente_id' => $data['cliente_id'] ?? null,
                    'fecha' => $now,
                    'total' => $total,
                ], 'idpedidos');
                DB::table('detalles_pedido')->insert(array_map(
                    fn (array $detail) => $detail + ['idpedidos' => $id],
                    $details
                ));
                return ['id' => $id, 'fecha' => $now->toDateTimeString(), 'total' => $total];
            });
            return response()->json($order, 201);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Error al crear pedido', ['exception' => $e->getMessage()]);
            return response()->json(['message' => 'No se pudo crear el pedido'], 500);
        }
    }
}
