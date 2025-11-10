<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
            'recaptcha_token' => 'required|string',
        ]);

        // Verify reCAPTCHA
        $recaptchaSecret = config('services.recaptcha.secret');
        $recaptchaResponse = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $recaptchaSecret,
            'response' => $request->recaptcha_token,
        ]);

        $recaptchaData = $recaptchaResponse->json();

        if (!$recaptchaData['success']) {
            return response()->json([
                'message' => 'reCAPTCHA verification failed',
            ], 422);
        }

        $contact = Contact::create($request->only([
            'name',
            'email',
            'phone',
            'subject',
            'message',
        ]));

        return response()->json([
            'message' => 'Contact form submitted successfully',
            'contact' => $contact,
        ], 201);
    }
}

