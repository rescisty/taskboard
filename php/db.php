<?php
/* ==========================================================================
   TaskBoard — db.php
   Shared by every other PHP script:  require __DIR__ . '/db.php';
   Does three things:
     1. Starts the PHP session (so we know who is logged in)
     2. Connects to MySQL using PDO
     3. Gives us small helpers for sending JSON back to the browser
   ========================================================================== */

// Show errors while developing. Remove or set to 0 before the final demo.
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

/* --- XAMPP defaults: user "root", empty password. Change if yours differ. --- */
$DB_HOST = 'localhost';
$DB_NAME = 'taskboard';
$DB_USER = 'root';
$DB_PASS = '';

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // throw errors so we see them
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,         // rows come back as arrays
            PDO::ATTR_EMULATE_PREPARES   => false,                    // real prepared statements
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

/* --- Helpers --------------------------------------------------------------- */

// Send a JSON reply and stop. Every script ends with one of these two.
function json_ok($data = [], $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode(['ok' => true] + $data);
    exit;
}

function json_error($message, $status = 400, $fields = []) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => $message, 'fields' => $fields]);
    exit;
}

// Returns the logged-in user's id, or null. Used for permission checks later.
function current_user_id() {
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}

// Call at the top of any script that needs a logged-in user.
function require_login() {
    if (current_user_id() === null) {
        json_error('You need to log in first.', 401);
    }
}

/* --- Quick test -------------------------------------------------------------
   Open http://localhost/ITS122/php/db.php in your browser.
   If you see "Connected", the connection works. Other scripts that
   require this file print nothing here, so this only runs on direct visits.
   -------------------------------------------------------------------------- */
if (basename($_SERVER['SCRIPT_FILENAME']) === 'db.php') {
    header('Content-Type: text/plain');
    echo "Connected to database: $DB_NAME\n\nTables found:\n";
    foreach ($pdo->query('SHOW TABLES') as $row) {
        echo ' - ' . array_values($row)[0] . "\n";
    }
}
