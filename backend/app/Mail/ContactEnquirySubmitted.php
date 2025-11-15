<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactEnquirySubmitted extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The enquiry payload.
     *
     * @var array
     */
    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function build(): self
    {
        return $this->subject('Contact Enquiry from www.shamsnaturals.com : ' . $this->payload['name'])
            ->replyTo($this->payload['email'], $this->payload['name'])
            ->view('emails.contact_enquiry');
    }
}

