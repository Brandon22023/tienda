<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    //para hace ruso del eloquent
    
    protected $primaryKey= 'idproductos';
    protected $table ='productos';
    

    public $timestamps = false; // si en dado caso no tiene no tiene created_at y updated_at
    
    //aqui se definen las columnas de la tabla 
    public $fillable =[
        'nombre',
        'descripcion',
        'precio',
        'stock',
        'categoria_id',
        'image_url',
    ];
}
