<?php
$upload_dir = './descargas/';

if(isset($_POST['removefile'])) {
    $remove_file = $upload_dir . $_POST['removefile'];
    if( unlink($remove_file) ) {
        echo $_POST['removefile'] . ': eliminado.';
    } else {
        echo $_POST['removefile'] . ': no se puede eliminar.';
    }
    exit;
}

if(isset($_FILES['file']['name'])) {
    //Nombre único seguro a partir de los datos del archivo
    $file_unique_name = sha1_file($_FILES['file']['tmp_name']);
    $file_name = $_FILES['file']['name'];
    
    $destination = $upload_dir . $file_name;
    
    //Guardar archivo en carpeta destino
    if(move_uploaded_file($_FILES['file']['tmp_name'], $destination) === TRUE)
        echo 'El archivo se ha subido correctamente';
    else
        echo 'Error: No se pudo guardar el archivo cargado';
}
