import Tesseract from 'tesseract.js';

export interface ExtractedData {
    amount: string;
    date: string;
    merchant: string;
}

export const extractReceiptData = async (imageSrc: string): Promise<ExtractedData> => {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imageSrc,
            'eng', // English is generally good for standard chars
            { logger: m => console.log(m) }
        );

        const lines = text.split('\n').filter(line => line.trim().length > 0);
        let merchant = "Unknown Merchant";
        let date = new Date().toISOString().split('T')[0];
        let maxAmount = 0;

        // 1. Merchant Extraction (Simple Heuristic: First line that looks like text)
        for (const line of lines) {
            const cleanLine = line.trim();
            // Skip lines that are just numbers/dates or too short
            if (cleanLine.length > 3 && !/^\d+$/.test(cleanLine) && !cleanLine.match(/Total|Amount|Rp|IDR/i)) {
                merchant = cleanLine;
                break;
            }
        }

        // 2. Date Extraction
        // Matches DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
        const dateRegex = /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})|(\d{4}[./-]\d{1,2}[./-]\d{1,2})/;
        const dateMatch = text.match(dateRegex);
        if (dateMatch) {
            try {
                // Normalize separators to dashes for Date constructor
                const rawDate = dateMatch[0].replace(/[./]/g, '-');
                const parsed = new Date(rawDate);
                if (!isNaN(parsed.getTime())) {
                    date = parsed.toISOString().split('T')[0];
                }
            } catch (e) {
                console.warn("Date parse error:", e);
            }
        }

        // 3. Amount Extraction
        // Look for numbers. Common formats: 50.000, 50,000, 50000.00
        // We look for patterns that *might* be prices and find the largest one.
        const numberPattern = /[\d.,]+/g;
        const potentialNumbers = text.match(numberPattern);

        if (potentialNumbers) {
            potentialNumbers.forEach(numStr => {
                // Remove trailing dots/commas
                let cleanStr = numStr.replace(/[.,]$/, '');

                // Heuristic: If it contains '.', strictly remove it if it looks like thousand separator (e.g. 50.000)
                // If it contains ',', replace with '.' if it looks like decimal. 
                // However, IDR usually uses . for thousands. let's just strip non-digits for simplicity in IDR context
                // UNLESS there is a clearly decimal part (2 digits at end).

                // Basic cleanup: remove all non-digits
                // This assumes IDR integer amounts which is standard for most receipts.
                // For global support, this needs to be smarter.
                const digitsOnly = cleanStr.replace(/[^0-9]/g, '');
                const val = parseFloat(digitsOnly);

                // Reasonable Bounds Check: Receipt amounts usually > 100, < 100,000,000
                if (!isNaN(val) && val > 100 && val < 100000000) {
                    if (val > maxAmount) maxAmount = val;
                }
            });
        }

        return {
            merchant,
            date,
            amount: maxAmount > 0 ? maxAmount.toString() : '0'
        };

    } catch (error) {
        console.error("OCR API Error:", error);
        return {
            merchant: "Parse Error",
            date: new Date().toISOString().split('T')[0],
            amount: '0'
        };
    }
};
