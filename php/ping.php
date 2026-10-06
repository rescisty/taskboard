<?php
/* ==========================================================================
   TaskBoard — php/ping.php   (setup check only — delete before submission)
   Open http://localhost/ITS122/php/ping.php to list every table, its columns,
   and how the tables are linked. Uses the $pdo connection from db.php.
   ========================================================================== */
require_once __DIR__ . '/db.php';

header('Content-Type: text/plain; charset=utf-8');

$version = $pdo->query('SELECT VERSION()')->fetchColumn();
echo "CONNECTED\n";
echo "Server  : MySQL/MariaDB $version\n";
echo "Database: $DB_NAME  (user $DB_USER@$DB_HOST)\n\n";

$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
echo 'Tables found: ' . count($tables) . "\n";
echo str_repeat('-', 70) . "\n";

foreach ($tables as $table) {
    // table names come from MySQL itself, so backticks are safe here
    $rows = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
    echo "\n$table  ($rows rows)\n";

    foreach ($pdo->query("SHOW COLUMNS FROM `$table`") as $col) {
        $notes = [];
        if ($col['Key'] === 'PRI')   $notes[] = 'PRIMARY KEY';
        if ($col['Key'] === 'UNI')   $notes[] = 'unique';
        if ($col['Key'] === 'MUL')   $notes[] = 'index/foreign key';
        if ($col['Extra'] !== '')    $notes[] = $col['Extra'];
        if ($col['Null'] === 'NO' && $col['Key'] !== 'PRI' && $col['Default'] === null) $notes[] = 'required';
        if ($col['Default'] !== null) $notes[] = 'default ' . $col['Default'];
        echo '    ' . str_pad($col['Field'], 22) . str_pad($col['Type'], 38) . implode(', ', $notes) . "\n";
    }
}

echo "\n" . str_repeat('-', 70) . "\n";
echo "Relationships (foreign keys)\n";

$fk = $pdo->prepare(
    'SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, COLUMN_NAME'
);
$fk->execute([$DB_NAME]);
$links = $fk->fetchAll();

if (!$links) {
    echo "    (none found - the tables aren't linked by foreign keys yet)\n";
}
foreach ($links as $l) {
    echo '    ' . $l['TABLE_NAME'] . '.' . $l['COLUMN_NAME'] . '  ->  ' . $l['REFERENCED_TABLE_NAME'] . '.' . $l['REFERENCED_COLUMN_NAME'] . "\n";
}