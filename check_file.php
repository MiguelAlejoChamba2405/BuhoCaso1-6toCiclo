<?php
if (isset($_POST['checkfile'])) {
    $filename = $_POST['checkfile'];
    $filePath = './descargas/' . $filename;
    if (file_exists($filePath)) {
        echo json_encode(['exists' => true]);
    } else {
        echo json_encode(['exists' => false]);
    }
}
?>
