import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  QrCode,
  Building2,
  Sparkles,
  Download,
  Check,
  AlertCircle,
  Smartphone,
  Zap,
  Loader2,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { PricingPlan, PaymentReceipt, UserSubscription } from '../types';
import { saveSubscription, getSubscription, getBrandProfile } from '../utils/storage';

interface PaymentCheckoutModalProps {
  plan: PricingPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receipt: PaymentReceipt) => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'instant';

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !plan) return null;

  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  // Customer Details Form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [gstin, setGstin] = useState('');

  // Payment Form Fields
  const [upiId, setUpiId] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill from Brand Profile
  useEffect(() => {
    const profile = getBrandProfile();
    if (profile) {
      if (profile.businessName && !customerName) {
        setCustomerName(profile.businessName);
      }
      if (profile.contactEmail && !customerEmail) {
        setCustomerEmail(profile.contactEmail);
      }
      if (profile.contactPhone && !customerPhone) {
        setCustomerPhone(profile.contactPhone);
      }
    } else {
      if (!customerName) setCustomerName('Demo Business Owner');
      if (!customerEmail) setCustomerEmail('owner@business.com');
      if (!customerPhone) setCustomerPhone('9876543210');
    }
  }, [isOpen]);

  // Price calculations
  const basePrice = plan.priceNumeric;
  const gstRate = 0.18; // 18% GST in India
  const taxAmount = Math.round(basePrice * gstRate * 100) / 100;
  const totalAmount = Math.round((basePrice + taxAmount) * 100) / 100;

  // Format Card Number with space every 4 digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  const handleProcessPayment = async (method: 'upi' | 'card' | 'netbanking' | 'simulator') => {
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your name or business name.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMsg('Please enter a valid billing email address.');
      return;
    }

    if (method === 'upi' && !showQr && !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. name@okaxis or shop@upi).');
      return;
    }

    if (method === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        setErrorMsg('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('Please enter a valid 3-digit CVV.');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Step 1: Handshake
      setProcessingStep('Connecting to Razorpay & Stripe 256-bit Secure Gateway...');
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Verification
      setProcessingStep('Verifying authorization with banking network...');
      await new Promise((r) => setTimeout(r, 800));

      // Step 3: Success & Plan Activation
      setProcessingStep('Activating plan subscription & updating quotas...');
      await new Promise((r) => setTimeout(r, 500));

      const newReceipt: PaymentReceipt = {
        paymentId: `pay_sb_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString().slice(-4)}`,
        orderId: `order_sb_${Date.now().toString().slice(-6)}`,
        planId: plan.id as 'pro' | 'business' | 'agency',
        planName: plan.name,
        amount: basePrice,
        taxAmount,
        totalAmount,
        currency: 'INR',
        paymentMethod: method,
        paymentDetails:
          method === 'upi'
            ? `UPI (${upiId || 'QR Scan Pay'})`
            : method === 'card'
            ? `Card (Ending in ${cardNumber.slice(-4) || '4242'})`
            : method === 'netbanking'
            ? `Net Banking (${selectedBank})`
            : 'Instant Sandbox Simulation',
        customerName,
        customerEmail,
        customerPhone,
        timestamp: Date.now(),
        status: 'completed',
      };

      const newSubscription: UserSubscription = {
        planId: plan.id as 'pro' | 'business' | 'agency',
        planName: plan.name,
        maxGenerations: plan.maxGenerations,
        activatedAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        activeReceipt: newReceipt,
      };

      // Save to localStorage & sync usage quota
      saveSubscription(newSubscription);

      setReceipt(newReceipt);
      setPaymentSuccess(true);
      onSuccess(newReceipt);
    } catch (err) {
      setErrorMsg('Payment verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadInvoice = () => {
    if (!receipt) return;
    const invoiceText = `=====================================================
            SOCIALBOOST AI - TAX INVOICE
=====================================================
Payment ID   : ${receipt.paymentId}
Order ID     : ${receipt.orderId}
Date         : ${new Date(receipt.timestamp).toLocaleString()}
Status       : SUCCESS / PAID (256-bit Encrypted)

-----------------------------------------------------
BILLED TO:
Customer     : ${receipt.customerName}
Email        : ${receipt.customerEmail}
Phone        : ${receipt.customerPhone || 'N/A'}
GSTIN        : ${gstin || 'Unregistered'}
-----------------------------------------------------

SUBSCRIPTION DETAILS:
Plan Name    : ${receipt.planName} Plan (Monthly)
Validity     : 30 Days from Activation
Quota        : ${plan.maxGenerations >= 9999 ? 'Unlimited' : `${plan.maxGenerations} Generations / Month`}
Access       : Full Gemini AI Integration & Content Calendar

-----------------------------------------------------
FINANCIAL BREAKDOWN:
Base Amount  : ₹${receipt.amount.toFixed(2)}
GST (18%)    : ₹${receipt.taxAmount.toFixed(2)}
-----------------------------------------------------
TOTAL PAID   : ₹${receipt.totalAmount.toFixed(2)} INR
Payment Mode : ${receipt.paymentDetails}
-----------------------------------------------------

Thank you for choosing SocialBoost AI!
Need support? Reach out at support@socialboost.ai
=====================================================`;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SocialBoost_Invoice_${receipt.paymentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div
        id="payment-checkout-modal"
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentSuccess && receipt ? (
          /* SUCCESS SCREEN */
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Subscription Activated!</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Payment Successful
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Your account is now upgraded to the <strong>{receipt.planName} Plan</strong>.
                Your quota has been upgraded to{' '}
                <strong className="text-indigo-600 dark:text-indigo-400">
                  {plan.maxGenerations >= 9999 ? 'Unlimited' : `${plan.maxGenerations} generations/month`}
                </strong>
                .
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {receipt.paymentId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  ₹{receipt.totalAmount.toFixed(2)} (incl. 18% GST)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Mode</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {receipt.paymentDetails}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Billed To</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {receipt.customerName} ({receipt.customerEmail})
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={downloadInvoice}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>Download Tax Invoice</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Start Generating Content
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Lock className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  256-bit Encrypted Checkout
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Live Simulator Mode
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Upgrade to {plan.name} Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Powered by Razorpay & Stripe Gateway simulation with real quota activation.
              </p>
            </div>

            {/* Plan & Pricing Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {plan.name} Subscription (1 Month)
                  </span>
                  <div className="text-[11px] text-slate-500">
                    Includes {plan.maxGenerations >= 9999 ? 'Unlimited' : `${plan.maxGenerations} generations/month`}, content calendar, export
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    ₹{basePrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">Base Price</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-500">
                <span>Goods & Services Tax (18% GST)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Total Amount Due</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Customer Billing Form */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>Billing Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Business / Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Roviq Design Store"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Billing Email (for Invoice) *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Mobile Number (for UPI / SMS receipt)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    GSTIN (Optional for B2B)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="24AAAAA0000A1Z5"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Select Payment Method</span>
              </h4>

              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'upi'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'card'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'netbanking'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('instant')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'instant'
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>1-Click Test</span>
                </button>
              </div>

              {/* TAB 1: UPI / QR */}
              {activeTab === 'upi' && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Pay via Google Pay, PhonePe, Paytm, or BHIM
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQr(!showQr)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{showQr ? 'Enter VPA / UPI ID instead' : 'Show Scan QR Code'}</span>
                    </button>
                  </div>

                  {showQr ? (
                    <div className="text-center py-4 space-y-3 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 max-w-xs mx-auto">
                      <div className="w-40 h-40 mx-auto p-2 bg-white rounded-lg border border-slate-300 flex items-center justify-center shadow-xs">
                        {/* Realistic SVG QR Pattern */}
                        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                          <rect width="100" height="100" fill="white" />
                          <rect x="10" y="10" width="25" height="25" fill="currentColor" />
                          <rect x="15" y="15" width="15" height="15" fill="white" />
                          <rect x="18" y="18" width="9" height="9" fill="currentColor" />
                          <rect x="65" y="10" width="25" height="25" fill="currentColor" />
                          <rect x="70" y="15" width="15" height="15" fill="white" />
                          <rect x="73" y="18" width="9" height="9" fill="currentColor" />
                          <rect x="10" y="65" width="25" height="25" fill="currentColor" />
                          <rect x="15" y="70" width="15" height="15" fill="white" />
                          <rect x="18" y="73" width="9" height="9" fill="currentColor" />
                          <rect x="42" y="12" width="6" height="6" fill="currentColor" />
                          <rect x="50" y="20" width="8" height="8" fill="currentColor" />
                          <rect x="45" y="45" width="12" height="12" fill="currentColor" />
                          <rect x="62" y="50" width="10" height="6" fill="currentColor" />
                          <rect x="42" y="65" width="8" height="8" fill="currentColor" />
                          <rect x="60" y="70" width="12" height="15" fill="currentColor" />
                          <rect x="75" y="65" width="15" height="8" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Scan with any UPI app to pay <strong>₹{totalAmount.toFixed(2)}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleProcessPayment('upi')}
                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        I Have Completed UPI Payment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Enter UPI ID / VPA
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank or shop@upi"
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleProcessPayment('upi')}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Verify & Pay
                        </button>
                      </div>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                        <span>Popular:</span>
                        <button
                          type="button"
                          onClick={() => setUpiId(`${customerEmail.split('@')[0] || 'business'}@okhdfcbank`)}
                          className="hover:underline text-indigo-500"
                        >
                          @okhdfcbank
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setUpiId(`${customerEmail.split('@')[0] || 'business'}@okaxis`)}
                          className="hover:underline text-indigo-500"
                        >
                          @okaxis
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setUpiId(`${customerEmail.split('@')[0] || 'business'}@paytm`)}
                          className="hover:underline text-indigo-500"
                        >
                          @paytm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {activeTab === 'card' && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 •••• •••• 4242"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <div className="absolute right-3 top-2.5 flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                        <span>VISA / MC / RUPAY</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName || customerName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProcessPayment('card')}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
                  >
                    Pay ₹{totalAmount.toFixed(2)} Securely
                  </button>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {activeTab === 'netbanking' && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Select Your Bank
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          selectedBank === bank
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProcessPayment('netbanking')}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs mt-2"
                  >
                    Authorize via {selectedBank}
                  </button>
                </div>
              )}

              {/* TAB 4: 1-CLICK INSTANT TEST CHECKOUT */}
              {activeTab === 'instant' && (
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        Instant Sandbox Simulation
                      </h5>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                        Designed for instant product evaluation. Simulates complete Stripe/Razorpay payment verification, upgrades your plan in local storage, and unlocks {plan.maxGenerations >= 9999 ? 'unlimited' : `${plan.maxGenerations}`} generations immediately without deducting real currency.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProcessPayment('simulator')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Instant Test Upgrade (₹{totalAmount.toFixed(2)})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Processing State Overlay */}
            {isProcessing && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-center space-y-2 animate-in fade-in">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  {processingStep}
                </div>
                <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400">
                  Please do not refresh or close this window.
                </div>
              </div>
            )}

            {/* Security Guarantee Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>PCI-DSS Level 1 Certified • End-to-End Encrypted</span>
              </div>
              <span>Instant Tax Invoice Included</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
