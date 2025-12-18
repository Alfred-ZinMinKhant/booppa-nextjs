import { redirect } from 'next/navigation';

export default function BookDemoRedirect() {
  // Keep a dedicated /book-demo URL per request and redirect to the existing demo page
  redirect('/demo');
}
