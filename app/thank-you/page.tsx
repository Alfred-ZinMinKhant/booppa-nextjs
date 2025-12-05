import VerifyPayment from '@/components/VerifyPayment';

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-booppa-blue mb-4">
          Thank you!
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
          Your payment has been received. We are verifying the transaction details...
        </p>
        {searchParams.session_id && (
          <VerifyPayment sessionId={searchParams.session_id} />
        )}
      </div>
    </main>
  );
}
