<?php

namespace App\Http\Controllers;

use App\Support\CustomerToken;
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

        $customerId = CustomerToken::customerId($request);
        if (($data['cliente_id'] ?? null) !== null && $customerId === null) {
            return response()->json([
                'message' => 'Inicia sesión para asociar el pedido a una cuenta.',
            ], 401);
        }

        try {
            $order = DB::transaction(function () use ($data, $customerId) {
                $total = 0;
                $details = [];

                foreach ($data['items'] as $item) {
                    $product = DB::table('productos')
                        ->where('idproductos', $item['idproductos'])
                        ->lockForUpdate()
                        ->first();

                    if ($product->stock < $item['cantidad']) {
                        abort(422, "Stock insuficiente para el producto {$product->nombre}");
                    }

                    $total += (float) $product->precio * $item['cantidad'];
                    $details[] = [
                        'idproductos' => $product->idproductos,
                        'cantidad' => $item['cantidad'],
                        'precio_unitario' => $product->precio,
                    ];
                    DB::table('productos')
                        ->where('idproductos', $product->idproductos)
                        ->decrement('stock', $item['cantidad']);
                }

                $now = now();
                $id = DB::table('pedidos')->insertGetId([
                    'cliente_id' => $customerId,
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

    public function show(int $id)
    {
        $order = DB::table('pedidos')->where('idpedidos', $id)->first();
        if (! $order) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        return response()->json($this->payload($order));
    }

    public function mine(Request $request)
    {
        $customerId = CustomerToken::customerId($request);
        if ($customerId === null) {
            return response()->json(['message' => 'Autenticación requerida'], 401);
        }

        $orders = DB::table('pedidos')
            ->where('cliente_id', $customerId)
            ->orderByDesc('fecha')
            ->get()
            ->map(fn ($order) => $this->payload($order))
            ->values();

        return response()->json(['pedidos' => $orders]);
    }

    private function payload(object $order): array
    {
        $items = DB::table('detalles_pedido as d')
            ->join('productos as p', 'p.idproductos', '=', 'd.idproductos')
            ->where('d.idpedidos', $order->idpedidos)
            ->select('d.idproductos', 'p.nombre', 'p.image_url', 'd.cantidad', 'd.precio_unitario')
            ->get()
            ->map(fn ($item) => [
                'idproductos' => (int) $item->idproductos,
                'nombre' => $item->nombre,
                'image_url' => $item->image_url,
                'cantidad' => (int) $item->cantidad,
                'precio_unitario' => (float) $item->precio_unitario,
                'subtotal' => round((float) $item->precio_unitario * (int) $item->cantidad, 2),
            ])
            ->values()
            ->all();

        return [
            'id' => (int) $order->idpedidos,
            'fecha' => $order->fecha,
            'total' => (float) $order->total,
            'items' => $items,
        ];
    }
}
