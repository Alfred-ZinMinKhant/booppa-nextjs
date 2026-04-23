import { NextResponse } from 'next/server';

// Minimal one-page PDF (Hello World) as base64
const pdfBase64 =
	'JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDYgMCBSPj4+Pi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNSAwIFI+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggMzQ+PgpzdHJlYW0KSGVsbG8sIFNhbXBsZSBSZXBvcnQhCgpzdGFydHhyZWYKMTUyCiUlRU9G';

export async function GET() {
	const pdf = Buffer.from(pdfBase64, 'base64');
	return new NextResponse(pdf, {
		status: 200,
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': 'attachment; filename="booppa-sample-report.pdf"',
		},
	});
}
