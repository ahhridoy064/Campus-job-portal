<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$attempts = [
    ['host' => 'localhost', 'user' => 'root', 'pass' => '', 'db' => 'mysql'],
    ['host' => 'localhost', 'user' => 'root', 'pass' => 'root', 'db' => 'mysql'],
    ['host' => '127.0.0.1', 'user' => 'root', 'pass' => '', 'db' => 'mysql'],
    ['host' => '127.0.0.1', 'user' => 'root', 'pass' => 'root', 'db' => 'mysql'],
];

foreach ($attempts as $i => $config) {
    echo "\n=== Attempt " . ($i + 1) . " ===\n";
    echo "Host: {$config['host']}, User: {$config['user']}, Password: " . ($config['pass'] ? "***" : "NONE") . "\n";
    
    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['db']}";
        $pdo = new PDO($dsn, $config['user'], $config['pass']);
        echo "✅ SUCCESS!\n";
        
        // Show databases
        $dbs = $pdo->query("SHOW DATABASES")->fetchAll();
        echo "Available databases:\n";
        foreach ($dbs as $db) {
            echo "  - " . $db[0] . "\n";
        }
        exit;
    } catch (PDOException $e) {
        echo "❌ FAILED: " . $e->getMessage() . "\n";
    }
}

echo "\n⚠️  All connection attempts failed!\n";
