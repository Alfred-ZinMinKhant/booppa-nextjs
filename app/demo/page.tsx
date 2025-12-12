export default function DemoPage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/booppa-demo/30min';
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Book a Live Demo</h1>
        <p className="text-gray-400 text-center mb-8">Select a time slot below to schedule a live walkthrough with our team. We look forward to showing you how BOOPPA can help your business!</p>
        <div className="calendly-inline-widget" style={{ minWidth: '320px', height: '700px' }}>
          <iframe
            src={calendlyUrl}
            width="100%"
            height="700"
            frameBorder="0"
            title="Book a Demo"
            style={{ border: 0 }}
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </main>
  );
}
