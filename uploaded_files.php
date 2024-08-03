<?php
$upload_dir = './descargas/';
$files = array_diff(scandir($upload_dir), array('.', '..'));
$file_list = [];

foreach ($files as $file) {
    $file_path = $upload_dir . $file;
    $file_info = [
        'name' => $file,
        'size' => filesize($file_path),
        'type' => mime_content_type($file_path)
    ];
    $file_list[] = $file_info;
}

header('Content-Type: application/json');
echo json_encode($file_list);
?>
