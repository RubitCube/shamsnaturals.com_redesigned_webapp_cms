<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\ContactEnquirySubmitted;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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
                'message' => 'We could not verify the reCAPTCHA. Please try again.',
            ], 422);
        }

        $contact = Contact::create($request->only([
            'name',
            'email',
            'phone',
            'subject',
            'message',
        ]));

        $mailPayload = [
            'name' => $request->input('name', '-'),
            'email' => $request->input('email', '-'),
            'phone' => $request->input('phone', '-'),
            'message' => $request->input('message', '-'),
        ];

        try {
            Mail::to(env('MAIL_CONTACT_TO', 'info@shamsbags.com'))
                ->cc($request->email)
                ->send(new ContactEnquirySubmitted($mailPayload));
        } catch (\Throwable $th) {
            Log::error('Contact enquiry email failed', ['error' => $th->getMessage()]);

            return response()->json([
                'message' => 'We received your enquiry but email delivery failed. Please try again later.',
                'contact' => $contact,
            ], 500);
        }

        return response()->json([
            'message' => 'Contact form submitted successfully',
            'contact' => $contact,
        ], 201);
    }
}

