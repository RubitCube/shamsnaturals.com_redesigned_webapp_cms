@php
    $name = $payload['name'] ?? '-';
    $email = $payload['email'] ?? '-';
    $phone = $payload['phone'] ?? '-';
    $message = $payload['message'] ?? '-';
@endphp

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Enquiry Submission</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f3f3;font-family:Calibri,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f3f3;">
        <tr>
            <td align="center">
                <table width="840" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
                    <tr>
                        <td style="background-color:#417137;height:4px;"></td>
                    </tr>
                    <tr>
                        <td style="padding:20px;">
                            <img src="https://shamsnaturals.com/img/shamsnaturals-logo.jpg" alt="Shams Naturals" style="max-width:220px;height:auto;">
                        </td>
                    </tr>
                </table>

                <table width="840" cellpadding="0" cellspacing="0" style="background-color:#ffffff;margin-top:10px;">
                    <tr>
                        <td style="padding:30px;">
                            <h1 style="color:#417137;font-size:36px;margin:0 0 10px;">Enquiry Submission</h1>
                            <h2 style="color:#417137;font-size:26px;margin:0 0 20px;">Hello {{ $name }}!</h2>
                            <p style="font-size:19px;color:#2d2d2d;line-height:1.4;margin:0;">
                                Thank you for your interest in Shams Naturals. We will review your requirements and get back to you soon.
                            </p>
                        </td>
                    </tr>
                </table>

                <table width="840" cellpadding="0" cellspacing="0" style="background-color:#ffffff;margin-top:10px;border:1px dotted #417137;">
                    <tr>
                        <td style="padding:30px;">
                            <h3 style="color:#417137;font-size:20px;margin:0 0 20px;">Here are your enquiry details</h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:18px;color:#333;">
                                <tr>
                                    <td width="180" style="font-weight:bold;padding:8px 0;">Name</td>
                                    <td>: {{ $name }}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="font-weight:bold;padding:8px 0;">Mobile</td>
                                    <td>: {{ $phone }}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="font-weight:bold;padding:8px 0;">Email</td>
                                    <td>: {{ $email }}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="font-weight:bold;padding:8px 0;vertical-align:top;">Requirements</td>
                                    <td>: {!! nl2br(e($message)) !!}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <table width="840" cellpadding="0" cellspacing="0" style="background-color:#417137;color:#ffffff;margin-top:20px;">
                    <tr>
                        <td style="padding:30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="50%" style="font-size:15px;line-height:1.6;">
                                        <strong>Help Desk</strong><br>
                                        +971 55 190 6177
                                    </td>
                                    <td width="50%" style="font-size:15px;line-height:1.6;">
                                        <strong>Email Support</strong><br>
                                        info@shamsnaturals.com
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table width="840" cellpadding="0" cellspacing="0" style="background-color:#417137;height:4px;">
                    <tr><td></td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

