import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-paper-cream flex items-center justify-center px-8">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-serif font-semibold text-ink-black text-3xl mb-3">
          Payment Successful
        </h1>
        <p className="font-sans text-pencil-gray mb-8">
          Your plan is active. You can start studying right away.
        </p>
        <Link to="/dashboard" className="btn-blueprint">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
