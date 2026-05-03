<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Tests\TestCase;

class ApiFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::disableForeignKeyConstraints();
        foreach ([
            'detalles_pedido',
            'pedidos',
            'productos',
            'categoria',
            'cliente',
        ] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::enableForeignKeyConstraints();

        Schema::create('cliente', function (Blueprint $table) {
            $table->increments('cliente_id');
            $table->string('nombre', 45);
            $table->string('correo', 100)->unique();
            $table->string('telefono', 20)->nullable();
            $table->text('contrasena');
        });

        Schema::create('categoria', function (Blueprint $table) {
            $table->increments('categoria_id');
            $table->string('categoria', 100);
        });

        Schema::create('productos', function (Blueprint $table) {
            $table->increments('idproductos');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 10, 2);
            $table->integer('stock');
            $table->integer('categoria_id');
            $table->text('image_url')->nullable();
            $table->string('codigo_producto', 50)->nullable();
        });

        Schema::create('pedidos', function (Blueprint $table) {
            $table->increments('idpedidos');
            $table->integer('cliente_id')->nullable();
            $table->dateTime('fecha');
            $table->decimal('total', 10, 2);
        });

        Schema::create('detalles_pedido', function (Blueprint $table) {
            $table->increments('detalles_pedido_id');
            $table->integer('idpedidos');
            $table->integer('idproductos');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
        });
    }

    public function test_login_success(): void
    {
        DB::table('cliente')->insert([
            'nombre' => 'Juan Perez',
            'correo' => 'juan@example.com',
            'telefono' => '1234567890',
            'contrasena' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'correo' => 'juan@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Autenticado',
                'correo' => 'juan@example.com',
            ])
            ->assertJsonPath('cliente_id', 1);
    }

    public function test_login_fail(): void
    {
        DB::table('cliente')->insert([
            'nombre' => 'Juan Perez',
            'correo' => 'juan@example.com',
            'telefono' => '1234567890',
            'contrasena' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'correo' => 'juan@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Credenciales inválidas',
            ]);
    }

    public function test_get_productos(): void
    {
        DB::table('categoria')->insert([
            'categoria_id' => 1,
            'categoria' => 'Laptops',
        ]);

        DB::table('productos')->insert([
            'nombre' => 'Laptop Demo',
            'descripcion' => 'Producto de prueba',
            'precio' => 1234.50,
            'stock' => 4,
            'categoria_id' => 1,
            'image_url' => 'https://example.com/laptop.jpg',
            'codigo_producto' => 'SKU-001',
        ]);

        $response = $this->getJson('/api/catalogo');

        $response->assertOk()
            ->assertJsonCount(1, 'productos')
            ->assertJsonPath('productos.0.nombre', 'Laptop Demo')
            ->assertJsonPath('productos.0.categoria', 'Laptops');
    }

    public function test_add_carrito(): void
    {
        DB::table('categoria')->insert([
            'categoria_id' => 1,
            'categoria' => 'Laptops',
        ]);

        DB::table('productos')->insert([
            'idproductos' => 1,
            'nombre' => 'Laptop Demo',
            'descripcion' => 'Producto de prueba',
            'precio' => 1234.50,
            'stock' => 4,
            'categoria_id' => 1,
            'image_url' => 'https://example.com/laptop.jpg',
            'codigo_producto' => 'SKU-001',
        ]);

        $pedidoId = DB::table('pedidos')->insertGetId([
            'cliente_id' => null,
            'fecha' => now()->toDateTimeString(),
            'total' => 1234.50,
        ], 'idpedidos');

        $response = $this->postJson("/api/pedidos/{$pedidoId}/detalles", [
            'items' => [
                [
                    'idproductos' => 1,
                    'cantidad' => 2,
                    'precio_unitario' => 1234.50,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJson([
                'inserted' => 1,
            ]);

        $this->assertDatabaseHas('detalles_pedido', [
            'idpedidos' => $pedidoId,
            'idproductos' => 1,
            'cantidad' => 2,
        ]);
    }

    public function test_total_carrito(): void
    {
        $response = $this->postJson('/api/pedidos', [
            'cliente_id' => null,
            'total' => 2469.00,
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'id',
                'fecha',
            ]);

        $this->assertDatabaseHas('pedidos', [
            'total' => 2469.00,
        ]);
    }

    public function test_crear_pedido(): void
    {
        $response = $this->postJson('/api/pedidos', [
            'cliente_id' => 1,
            'total' => 1500.00,
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'id',
                'fecha',
            ]);

        $this->assertDatabaseHas('pedidos', [
            'cliente_id' => 1,
            'total' => 1500.00,
        ]);
    }
}