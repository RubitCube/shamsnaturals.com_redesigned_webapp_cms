<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | This is the default timezone for storing dates in the database.
    | All dates should be stored in UTC and converted when displayed.
    |
    */
    'default' => env('APP_TIMEZONE', 'UTC'),

    /*
    |--------------------------------------------------------------------------
    | Client Timezone
    |--------------------------------------------------------------------------
    |
    | This is the timezone for the client (UAE).
    | Used for displaying dates to end users.
    |
    */
    'client' => env('CLIENT_TIMEZONE', 'Asia/Dubai'),

    /*
    |--------------------------------------------------------------------------
    | Admin Timezone
    |--------------------------------------------------------------------------
    |
    | This is the timezone for admin users (India).
    | Used for displaying dates in the admin panel.
    |
    */
    'admin' => env('ADMIN_TIMEZONE', 'Asia/Kolkata'),
];

