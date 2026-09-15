<?php

namespace Tests\E2E;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StoreFlowTest extends TestCase
{
    use RefreshDatabase;

    private function createProduct(string $sku = 'SKU-E2E-001', float $price = 100, int $stock = 5): int
    {
        $category = DB::table('categoria')->where('categoria', 'Laptops')->value('categoria_id');
        if (!$category) {
            $category = DB::table('categoria')->insertGetId(['categoria' => 'Laptops'], 'categoria_id');
        }

        return DB::table('productos')->insertGetId([
            'codigo_producto' => $sku,
            'nombre' => 'Producto E2E',
            'descripcion' => 'Producto para pruebas integrales',
            'precio' => $price,
            'stock' => $stock,
            'categoria_id' => $category,
            'image_url' => 'https://example.com/producto.jpg',
        ], 'idproductos');
    }

    private function createCustomer(string $email = 'cliente@example.com'): int
    {
        return DB::table('cliente')->insertGetId([
            'nombre' => 'Cliente E2E',
            'correo' => $email,
            'telefono' => '55555555',
            'contrasena' => Hash::make('password123'),
        ], 'cliente_id');
    }

    public function test_complete_customer_purchase_flow(): void
    {
        $register = $this->postJson('/api/register', [
            'nombre' => 'Ana Integracion',
            'correo' => 'ana@example.com',
            'telefono' => '55555555',
            'password' => 'password123',
        ]);
        $register->assertCreated()->assertJsonPath('cliente_id', 1);

        $login = $this->postJson('/api/login', [
            'correo' => 'ana@example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonPath('nombre', 'Ana Integracion');
        $token = $login->json('token');

        $product = $this->createProduct(price: 250, stock: 4);
        $this->getJson('/api/inicio')->assertOk()->assertJsonStructure(['mensaje', 'productos']);
        $this->getJson('/api/catalogo')->assertOk()->assertJsonPath('productos.0.idproductos', $product);

        $order = $this->withToken($token)->postJson('/api/pedidos', [
            'cliente_id' => 1,
            'items' => [['idproductos' => $product, 'cantidad' => 2]],
            'total' => 0,
        ]);

        $order->assertCreated()
            ->assertJsonPath('total', 500)
            ->assertJsonStructure(['id', 'fecha', 'total']);
        $this->assertDatabaseHas('pedidos', ['cliente_id' => 1, 'total' => 500]);
        $this->assertDatabaseHas('detalles_pedido', [
            'idpedidos' => $order->json('id'),
            'idproductos' => $product,
            'cantidad' => 2,
            'precio_unitario' => 250,
        ]);
        $this->assertDatabaseHas('productos', ['idproductos' => $product, 'stock' => 2]);
    }

    public function test_guest_can_purchase_without_customer_id(): void
    {
        $product = $this->createProduct(price: 75, stock: 2);

        $this->postJson('/api/pedidos', [
            'cliente_id' => null,
            'items' => [['idproductos' => $product, 'cantidad' => 1]],
        ])->assertCreated()->assertJsonPath('total', 75);

        $this->assertDatabaseHas('pedidos', ['cliente_id' => null, 'total' => 75]);
    }

    public function test_guest_cannot_assign_an_order_to_another_customer(): void
    {
        $product = $this->createProduct();
        $this->createCustomer('owner@example.com');

        $this->postJson('/api/pedidos', [
            'cliente_id' => 1,
            'items' => [['idproductos' => $product, 'cantidad' => 1]],
        ])->assertUnauthorized();
    }

    public function test_authenticated_customer_can_read_own_order_history(): void
    {
        $customer = $this->createCustomer('history@example.com');
        $product = $this->createProduct(price: 75, stock: 2);
        $login = $this->postJson('/api/login', [
            'correo' => 'history@example.com',
            'password' => 'password123',
        ])->assertOk();
        $token = $login->json('token');

        $order = $this->withToken($token)->postJson('/api/pedidos', [
            'items' => [['idproductos' => $product, 'cantidad' => 1]],
        ])->assertCreated();

        $this->withToken($token)->getJson('/api/mis-pedidos')
            ->assertOk()
            ->assertJsonPath('pedidos.0.id', $order->json('id'))
            ->assertJsonPath('pedidos.0.items.0.precio_unitario', 75);
        $this->assertDatabaseHas('pedidos', ['idpedidos' => $order->json('id'), 'cliente_id' => $customer]);
    }

    public function test_order_detail_returns_server_prices_for_invoice(): void
    {
        $product = $this->createProduct(price: 99.5, stock: 2);
        $order = $this->postJson('/api/pedidos', [
            'items' => [['idproductos' => $product, 'cantidad' => 2]],
        ])->assertCreated();

        $this->getJson('/api/pedidos/'.$order->json('id'))
            ->assertOk()
            ->assertJsonPath('items.0.precio_unitario', 99.5)
            ->assertJsonPath('items.0.subtotal', 199);
    }

    public function test_login_is_rate_limited_after_repeated_failures(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/login', [
                'correo' => 'rate-limit@example.com',
                'password' => 'incorrecta',
            ])->assertUnauthorized();
        }

        $this->postJson('/api/login', [
            'correo' => 'rate-limit@example.com',
            'password' => 'incorrecta',
        ])->assertStatus(429);
    }

    public function test_registration_rejects_missing_fields(): void
    {
        $this->postJson('/api/register', [])->assertStatus(422)
            ->assertJsonValidationErrors(['nombre', 'correo', 'password']);
    }

    public function test_registration_rejects_invalid_email_and_short_password(): void
    {
        $this->postJson('/api/register', [
            'nombre' => 'Cliente',
            'correo' => 'correo-invalido',
            'password' => '123',
        ])->assertStatus(422)->assertJsonValidationErrors(['correo', 'password']);
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        $this->createCustomer('duplicado@example.com');

        $this->postJson('/api/register', [
            'nombre' => 'Otro Cliente',
            'correo' => 'duplicado@example.com',
            'password' => 'password123',
        ])->assertStatus(422)->assertJsonValidationErrors(['correo']);
    }

    public function test_login_rejects_wrong_password_and_unknown_user(): void
    {
        $this->createCustomer();

        $this->postJson('/api/login', [
            'correo' => 'cliente@example.com',
            'password' => 'incorrecta',
        ])->assertUnauthorized();

        $this->postJson('/api/login', [
            'correo' => 'noexiste@example.com',
            'password' => 'password123',
        ])->assertUnauthorized();
    }

    public function test_login_validates_required_and_email_fields(): void
    {
        $this->postJson('/api/login', [])->assertStatus(422)
            ->assertJsonValidationErrors(['correo', 'password']);
    }

    public function test_catalog_sorting_endpoints_return_success(): void
    {
        $this->createProduct('SKU-E2E-CHEAP', 50);
        $this->createProduct('SKU-E2E-EXPENSIVE', 500);

        $this->getJson('/api/catalogo')->assertOk()->assertJsonCount(2, 'productos');
        $this->getJson('/api/catalogo/menor')->assertOk()->assertJsonPath('productos.0.precio', 50);
        $this->getJson('/api/catalogo/mayor')->assertOk()->assertJsonPath('productos.0.precio', 500);
    }

    public function test_order_requires_at_least_one_item(): void
    {
        $this->postJson('/api/pedidos', ['items' => []])->assertStatus(422)
            ->assertJsonValidationErrors(['items']);
        $this->assertDatabaseCount('pedidos', 0);
    }

    public function test_order_rejects_unknown_customer(): void
    {
        $product = $this->createProduct();

        $this->postJson('/api/pedidos', [
            'cliente_id' => 999,
            'items' => [['idproductos' => $product, 'cantidad' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors(['cliente_id']);
    }

    public function test_order_rejects_unknown_product(): void
    {
        $this->postJson('/api/pedidos', [
            'items' => [['idproductos' => 999, 'cantidad' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors(['items.0.idproductos']);
        $this->assertDatabaseCount('pedidos', 0);
    }

    public function test_order_rejects_zero_negative_and_duplicate_quantities(): void
    {
        $product = $this->createProduct();

        $this->postJson('/api/pedidos', [
            'items' => [['idproductos' => $product, 'cantidad' => 0]],
        ])->assertStatus(422)->assertJsonValidationErrors(['items.0.cantidad']);

        $this->postJson('/api/pedidos', [
            'items' => [['idproductos' => $product, 'cantidad' => -1]],
        ])->assertStatus(422)->assertJsonValidationErrors(['items.0.cantidad']);

        $this->postJson('/api/pedidos', [
            'items' => [
                ['idproductos' => $product, 'cantidad' => 1],
                ['idproductos' => $product, 'cantidad' => 1],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['items.1.idproductos']);
    }

    public function test_order_rejects_insufficient_stock_without_creating_order(): void
    {
        $product = $this->createProduct(price: 100, stock: 1);

        $this->postJson('/api/pedidos', [
            'items' => [['idproductos' => $product, 'cantidad' => 2]],
        ])->assertStatus(422);

        $this->assertDatabaseCount('pedidos', 0);
        $this->assertDatabaseHas('productos', ['idproductos' => $product, 'stock' => 1]);
    }

    public function test_transaction_rolls_back_stock_and_order_when_one_item_fails(): void
    {
        $available = $this->createProduct('SKU-E2E-AVAILABLE', 100, 5);
        $limited = $this->createProduct('SKU-E2E-LIMITED', 200, 1);

        $this->postJson('/api/pedidos', [
            'items' => [
                ['idproductos' => $available, 'cantidad' => 2],
                ['idproductos' => $limited, 'cantidad' => 2],
            ],
        ])->assertStatus(422);

        $this->assertDatabaseCount('pedidos', 0);
        $this->assertDatabaseHas('productos', ['idproductos' => $available, 'stock' => 5]);
        $this->assertDatabaseHas('productos', ['idproductos' => $limited, 'stock' => 1]);
    }

    public function test_server_ignores_client_prices_and_total(): void
    {
        $product = $this->createProduct(price: 999, stock: 2);

        $response = $this->postJson('/api/pedidos', [
            'items' => [[
                'idproductos' => $product,
                'cantidad' => 1,
                'precio_unitario' => 0,
            ]],
            'total' => 0,
        ]);

        $response->assertCreated()->assertJsonPath('total', 999);
        $this->assertDatabaseHas('detalles_pedido', ['precio_unitario' => 999]);
    }

    public function test_old_unprotected_details_endpoint_is_not_available(): void
    {
        $this->postJson('/api/pedidos/1/detalles', ['items' => []])->assertNotFound();
    }
}
