<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiFlowTest extends TestCase
{
    use RefreshDatabase;

    private function product(int $stock = 4): int
    {
        $category = DB::table('categoria')->insertGetId(['categoria' => 'Laptops'], 'categoria_id');
        return DB::table('productos')->insertGetId([
            'codigo_producto' => 'SKU-TEST', 'nombre' => 'Laptop Demo',
            'descripcion' => 'Producto de prueba', 'precio' => 1234.50,
            'stock' => $stock, 'categoria_id' => $category,
            'image_url' => 'https://example.com/laptop.jpg',
        ], 'idproductos');
    }

    public function test_login_success(): void
    {
        DB::table('cliente')->insert([
            'nombre' => 'Juan Perez', 'correo' => 'juan@example.com',
            'telefono' => '1234567890', 'contrasena' => Hash::make('password123'),
        ]);
        $this->postJson('/api/login', ['correo' => 'juan@example.com', 'password' => 'password123'])
            ->assertOk()->assertJsonPath('cliente_id', 1);
    }

    public function test_catalogo_returns_products(): void
    {
        $this->product();
        $this->getJson('/api/catalogo')->assertOk()
            ->assertJsonPath('productos.0.nombre', 'Laptop Demo');
    }

    public function test_order_uses_server_price_and_reduces_stock(): void
    {
        $product = $this->product();
        $response = $this->postJson('/api/pedidos', [
            'items' => [['idproductos' => $product, 'cantidad' => 2, 'precio_unitario' => 1]],
        ]);
        $response->assertCreated()->assertJsonPath('total', 2469);
        $this->assertDatabaseHas('productos', ['idproductos' => $product, 'stock' => 2]);
        $this->assertDatabaseHas('detalles_pedido', ['idproductos' => $product, 'cantidad' => 2, 'precio_unitario' => 1234.50]);
    }

    public function test_order_rejects_insufficient_stock(): void
    {
        $product = $this->product(1);
        $this->postJson('/api/pedidos', ['items' => [['idproductos' => $product, 'cantidad' => 2]]])
            ->assertStatus(422);
        $this->assertDatabaseCount('pedidos', 0);
    }
}
