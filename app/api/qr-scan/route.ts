import { NextRequest, NextResponse } from 'next/server';
// import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import qrcode from 'qrcode';
import crypto from 'crypto';

// const sesClient = new SESClient({ region: 'ap-southeast-1' });
// const FROM_EMAIL = 'no-reply@booppa.io';
// const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@booppa.io';

export async function POST(request: NextRequest) {
  try {
    const { website_url, company_name = 'Valued Customer', email } = await request.json();

    if (!website_url || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock AI scan results (replace with real AI later)
    const scanResults = {
      riskScore: Math.floor(Math.random() * 40) + 60,
      issues: [
        'Cookie banner non-PDPA compliant detected',
        'Missing consent records logging',
        'Third-party trackers without explicit consent',
      ],
      recommendation: 'Immediate fix recommended to avoid PDPC enforcement.',
    };

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();

    // Draw the checkout message at the very top
    let y = height - 40;
    page.drawText('Fix all issues instantly for SGD 69 (one-time)', { x: 50, y, size: 16, font: bold, color: rgb(0, 0.7, 0) });
    page.drawText(`-> https://booppa.io/sme?prefill_email=${encodeURIComponent(email)}`, { x: 50, y: y - 20, size: 14, font, color: rgb(0, 0.7, 0) });

    // Now continue with the rest of the content below
    y -= 60;
    page.drawText('Your Free PDPA Compliance Scan', { x: 50, y, size: 24, font: bold, color: rgb(0, 0.5, 0) });
    y -= 50;
    page.drawText(`Company: ${company_name}`, { x: 50, y, size: 14, font });
    page.drawText(`Website: ${website_url}`, { x: 50, y: y - 20, size: 14, font });

    y -= 80;
    page.drawText(`Risk Score: ${scanResults.riskScore}/100`, { x: 50, y, size: 18, font: bold, color: scanResults.riskScore > 80 ? rgb(0.8, 0, 0) : rgb(1, 0.5, 0) });

    y -= 40;
    page.drawText('Key Issues Found:', { x: 50, y, size: 16, font: bold });
    scanResults.issues.forEach((issue, i) => {
      y -= 25;
      page.drawText(`• ${issue}`, { x: 70, y, size: 12, font });
    });

    y -= 40;
    page.drawText(scanResults.recommendation, { x: 50, y, size: 14, font });

    // Mock Polygon tx (replace with real anchoring later)
    const mockTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const polygonUrl = `https://polygonscan.com/tx/${mockTxHash}`;

    const qrDataUrl = await qrcode.toDataURL(polygonUrl);
    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    page.drawImage(qrImage, { x: width - 200, y: 100, width: 150, height: 150 });
    page.drawText('Scan to verify on-chain proof on Polygon', { x: width - 220, y: 80, size: 10, font });

    const pdfBytes = await pdfDoc.save();


    // For local testing: return PDF as file download
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Booppa-PDPA-Scan.pdf"',
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
