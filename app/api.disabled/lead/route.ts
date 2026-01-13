import { NextRequest, NextResponse } from 'next/server';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ 
  region: 'ap-southeast-1',
});

export async function POST(req: NextRequest) {
  try {
    const { name, company, email, interest } = await req.json();

    if (!name || !company || !email || !interest) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sendEmailCommand = new SendEmailCommand({
      Source: "no-reply@booppa.io",
      Destination: {
        ToAddresses: [email],
        BccAddresses: ["sales@booppa.io"],
      },
      Message: {
        Subject: {
          Data: `Your BOOPPA Report - ${company}`,
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body>
                  <h2>Thank you for your interest, ${name}!</h2>
                  <p>We received your request for a personalized compliance report for <b>${company}</b>.</p>
                  <p>Your primary interest: <b>${interest}</b></p>
                  <p>Our team will generate your report within 24 hours.</p>
                  <p>Best Regards,<br/>The BOOPPA Team</p>
                </body>
              </html>
            `,
          },
        },
      },
    });

    await sesClient.send(sendEmailCommand);

    return NextResponse.json({ 
      success: true, 
      message: 'Lead captured and email sent.' 
    });

  } catch (error) {
    console.error('Lead Capture Error:', error);
    return NextResponse.json({ error: 'Failed to process lead' }, { status: 500 });
  }
}

