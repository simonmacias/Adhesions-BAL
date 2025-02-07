<?php
header('Content-Type: application/json');

try {
    if (!isset($_FILES['data'])) {
        throw new Exception('Aucun fichier reçu');
    }

    $uploadedFile = $_FILES['data'];
    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Erreur lors du téléchargement du fichier');
    }

    // Créer une copie de sauvegarde du fichier existant s'il existe
    if (file_exists('adherents_data.json')) {
        $backup_name = 'backup/adherents_data_' . date('Y-m-d_H-i-s') . '.json';
        if (!is_dir('backup')) {
            mkdir('backup', 0777, true);
        }
        copy('adherents_data.json', $backup_name);
    }

    // Sauvegarder le nouveau fichier
    if (!move_uploaded_file($uploadedFile['tmp_name'], 'adherents_data.json')) {
        throw new Exception('Erreur lors de la sauvegarde du fichier');
    }

    echo json_encode(['success' => true, 'message' => 'Données sauvegardées avec succès']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 