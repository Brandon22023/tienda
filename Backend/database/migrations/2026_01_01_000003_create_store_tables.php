<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('cliente')) {
            Schema::create('cliente', function (Blueprint $table) {
                $table->increments('cliente_id');
                $table->string('nombre', 45);
                $table->string('correo', 100)->unique();
                $table->string('telefono', 20)->nullable();
                $table->string('contrasena');
                $table->string('api_token_hash', 64)->nullable()->unique();
            });
        }

        if (! Schema::hasTable('categoria')) {
            Schema::create('categoria', function (Blueprint $table) {
                $table->increments('categoria_id');
                $table->string('categoria', 100)->unique();
            });
        }

        if (! Schema::hasTable('productos')) {
            Schema::create('productos', function (Blueprint $table) {
                $table->increments('idproductos');
                $table->string('codigo_producto', 50)->unique();
                $table->string('nombre', 100);
                $table->text('descripcion')->nullable();
                $table->decimal('precio', 10, 2);
                $table->unsignedInteger('stock')->default(0);
                $table->unsignedInteger('categoria_id');
                $table->text('image_url')->nullable();
                $table->foreign('categoria_id')->references('categoria_id')->on('categoria')->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('pedidos')) {
            Schema::create('pedidos', function (Blueprint $table) {
                $table->increments('idpedidos');
                $table->unsignedInteger('cliente_id')->nullable();
                $table->dateTime('fecha');
                $table->decimal('total', 10, 2);
                $table->foreign('cliente_id')->references('cliente_id')->on('cliente')->nullOnDelete();
            });
        }

        if (! Schema::hasTable('detalles_pedido')) {
            Schema::create('detalles_pedido', function (Blueprint $table) {
                $table->increments('detalles_pedido_id');
                $table->unsignedInteger('idpedidos');
                $table->unsignedInteger('idproductos');
                $table->unsignedInteger('cantidad');
                $table->decimal('precio_unitario', 10, 2);
                $table->foreign('idpedidos')->references('idpedidos')->on('pedidos')->cascadeOnDelete();
                $table->foreign('idproductos')->references('idproductos')->on('productos')->restrictOnDelete();
                $table->unique(['idpedidos', 'idproductos']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('detalles_pedido');
        Schema::dropIfExists('pedidos');
        Schema::dropIfExists('productos');
        Schema::dropIfExists('categoria');
        Schema::dropIfExists('cliente');
    }
};
