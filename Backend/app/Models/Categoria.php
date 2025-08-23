<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    //para hace ruso del eloquent
    protected $table ='categoria';
    protected $primaryKey= 'categoria_id';

    public $timestamps = false; // si en dado caso no tiene no tiene created_at y updated_at
    
    public $fillable =[
        'categoria',
    ];

}
