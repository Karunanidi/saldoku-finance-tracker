import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useCreateTransaction } from '@/features/transactions/hooks/useTransactions';
import { CreateTransactionDTO } from '@/data/models/Transaction';
import { useAuthStore } from '@/features/auth/store/authStore';
import { extractReceiptData } from '../utils/ocrService';

export const ScannerPage = () => {
    const navigate = useNavigate();
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('Food');

    const createTransaction = useCreateTransaction();
    const { user } = useAuthStore();

    const processImage = async (image: string) => {
        setIsProcessing(true);
        setImageSrc(image);
        // Show review sheet immediately or wait? 
        // Better to wait for OCR to finish so fields aren't jumping, 
        // but showing the image first is good UX.
        // Let's show the sheet with a loading indicator overlay IF we wanted,
        // but for now, let's just wait for OCR then showing the sheet might look "stuck".
        // Better approach: Show sheet immediately, put "Scanning..." in the fields or overlay.
        setIsReviewOpen(true);

        const data = await extractReceiptData(image);
        if (data.amount) setAmount(data.amount);
        if (data.merchant) setMerchant(data.merchant);
        if (data.date) setDate(data.date);

        setIsProcessing(false);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    processImage(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const capture = useCallback(() => {
        const image = webcamRef.current?.getScreenshot();
        if (image) {
            processImage(image);
        }
    }, [webcamRef]);

    const handleRetake = () => {
        setImageSrc(null);
        setIsReviewOpen(false);
        setCameraError(null);
    };

    const onCameraError = useCallback((error: string | DOMException) => {
        console.error("Camera error:", error);
        setCameraError(typeof error === 'string' ? error : error.message || "Could not access camera");
    }, []);

    const handleSave = async () => {
        if (!user) return;

        const transactionData: CreateTransactionDTO = {
            amount: parseFloat(amount) || 0,
            category: category as any,
            description: merchant,
            date: new Date(date).toISOString(),
            is_expense: true,
            receipt_url: imageSrc || undefined
        };

        try {
            await createTransaction.mutateAsync(transactionData);
            navigate('/');
        } catch (error) {
            console.error("Failed to save transaction", error);
        }
    };

    const videoConstraints: MediaTrackConstraints = {
        facingMode: "environment",
        // Using ideal without strict bounds to allow the browser to choose the best fit
        width: { ideal: 1920 },
        height: { ideal: 1080 }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111318] dark:text-white antialiased overflow-hidden h-screen flex flex-col">
            <div className="relative flex-1 bg-black overflow-hidden flex flex-col">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-30 flex items-center p-4 pt-4 justify-between bg-gradient-to-b from-black/80 to-transparent">
                    <div className="text-white flex size-12 items-center justify-start">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 active:scale-90 transition-transform"
                        >
                            <span className="material-symbols-outlined text-3xl">arrow_back</span>
                        </button>
                    </div>
                    <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Receipt Scanner</h2>
                    <div className="w-12"></div>
                </div>

                {/* Camera Viewport */}
                <div className="relative flex-1 flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
                    {cameraError ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center gap-6">
                            <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined text-4xl">videocam_off</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white text-xl font-bold">Camera Unavailable</h3>
                                <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                                    {cameraError.includes('NotAllowedError') || cameraError.includes('Permission denied')
                                        ? "Please grant camera permission in your browser/system settings and try again."
                                        : "We couldn't access your camera. Make sure you are using a secure connection (HTTPS) and that no other app is using it."}
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-white text-black font-bold rounded-full active:scale-95 transition-transform"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : !imageSrc ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            onUserMediaError={onCameraError}
                            playsInline
                            className="absolute inset-0 w-full h-full object-contain bg-black"
                        />
                    ) : (
                        <img
                            src={imageSrc}
                            alt="Captured Receipt"
                            className="absolute inset-0 w-full h-full object-contain bg-black opacity-90"
                        />
                    )}

                    <div className="relative z-10 w-72 h-[28rem] border-2 border-primary/40 rounded-2xl flex items-center justify-center pointer-events-none">
                        <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                        <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                        <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>
                        {!imageSrc && (
                            <div className="bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full">
                                <p className="text-white text-sm font-medium text-center">Align receipt within frame</p>
                            </div>
                        )}
                    </div>

                    {!imageSrc && (
                        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-10 p-10 pb-14 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center gap-2 group opacity-50 active:opacity-100 transition-opacity"
                            >
                                <div className="flex shrink-0 items-center justify-center rounded-full size-14 bg-white/10 backdrop-blur-md text-white border border-white/10">
                                    <span className="material-symbols-outlined text-2xl">image</span>
                                </div>
                                <span className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Gallery</span>
                            </button>

                            <button
                                onClick={capture}
                                className="flex shrink-0 items-center justify-center rounded-full size-24 bg-white p-1.5 shadow-2xl active:scale-90 transition-transform cursor-pointer"
                            >
                                <div className="flex items-center justify-center rounded-full size-full bg-black/5 border-4 border-black/10">
                                    <span className="material-symbols-outlined text-5xl text-black">photo_camera</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setIsReviewOpen(true)}
                                className="flex flex-col items-center gap-2 group opacity-50 active:opacity-100 transition-opacity"
                            >
                                <div className="flex shrink-0 items-center justify-center rounded-full size-14 bg-white/10 backdrop-blur-md text-white border border-white/10">
                                    <span className="material-symbols-outlined text-2xl">edit_note</span>
                                </div>
                                <span className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Manual</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Review Extraction Sheet */}
                {isReviewOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity duration-300 ease-in-out"
                        onClick={() => setIsReviewOpen(false)}
                    />
                )}
                <div
                    className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out ${isReviewOpen ? 'translate-y-0' : 'translate-y-full'}`}
                >
                    <div
                        className="flex flex-col items-stretch bg-background-light dark:bg-background-dark rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-zinc-200 dark:border-zinc-800 px-6 pb-8 pt-2 max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-10 w-full items-center justify-center mb-2">
                            <div className="h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[#111318] dark:text-white text-xl font-extrabold leading-tight tracking-tight">Review Extraction</h3>
                            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase border transition-colors ${isProcessing ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                {isProcessing ? 'Scanning...' : 'AI Active'}
                            </span>
                        </div>

                        <div className={`space-y-4 transition-opacity duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em] ml-1">Merchant</label>
                                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                                    <span className="material-symbols-outlined text-primary">store</span>
                                    <input
                                        className="bg-transparent border-none p-0 focus:ring-0 text-base font-bold w-full text-zinc-900 dark:text-white outline-none"
                                        type="text"
                                        value={merchant}
                                        onChange={(e) => setMerchant(e.target.value)}
                                        placeholder="Merchant Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em] ml-1">Total Amount</label>
                                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                                        <span className="material-symbols-outlined text-green-500">payments</span>
                                        <input
                                            className="bg-transparent border-none p-0 focus:ring-0 text-base font-bold w-full text-zinc-900 dark:text-white outline-none"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em] ml-1">Date</label>
                                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                                        <span className="material-symbols-outlined text-zinc-400">calendar_today</span>
                                        <input
                                            className="bg-transparent border-none p-0 focus:ring-0 text-base font-bold w-full text-zinc-900 dark:text-white outline-none"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em] ml-1">Category</label>
                                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm relative">
                                    <span className="material-symbols-outlined text-orange-400">shopping_basket</span>
                                    <select
                                        className="bg-transparent border-none p-0 focus:ring-0 text-base font-bold w-full text-zinc-900 dark:text-white appearance-none pr-8 outline-none"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Food">Food</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Health">Health</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 text-zinc-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 pb-6">
                                <button
                                    onClick={handleRetake}
                                    className="flex-1 py-4 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold rounded-2xl active:scale-95 transition-transform"
                                >
                                    Retake
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={createTransaction.isPending}
                                    className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span>{createTransaction.isPending ? 'Saving...' : 'Save Transaction'}</span>
                                    <span className="material-symbols-outlined">check_circle</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
