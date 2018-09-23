<?php
//include_once "/data/stellardbhost.php";
//include_once __DIR__ ."/data/stellardbhost.php";
return [
    'settings' => [
        'displayErrorDetails' => true, // set to false in production
        'addContentLengthHeader' => false, // Allow the web server to send the content-length header

        // Renderer settings
        'renderer' => [
            'template_path' => __DIR__ . '/../templates/',
        ],

        // Monolog settings
        'logger' => [
            'name' => 'slim-app',
            'path' => __DIR__ . '/../logs/app.log',
            'level' => \Monolog\Logger::DEBUG,
        ],
	// Database connection settings
        "db" => [
            "host" => 'localhost',
            "dbname" => "stellarhse_common",
            "user" => 'root',
            "pass" => ''
        ]
    ]
];
