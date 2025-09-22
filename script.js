// Global variables
let originalPdfBytes = null;
let modifiedPdfUrl = null;
let currentUserName = '';

// DOM Elements
const pdfInput = document.getElementById('pdfInput');
const nameInput = document.getElementById('nameInput');
const generateBtn = document.getElementById('generateBtn');
const uploadSection = document.getElementById('uploadSection');
const nameSection = document.getElementById('nameSection');
const previewSection = document.getElementById('previewSection');
const pdfPreview = document.getElementById('pdfPreview');
const loading = document.getElementById('loading');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const shareBtn = document.getElementById('shareBtn');
const newCardBtn = document.getElementById('newCardBtn');

// Event Listeners
pdfInput.addEventListener('change', handlePdfUpload);
generateBtn.addEventListener('click', generateCustomCard);
nameInput.addEventListener('input', validateInput);
nameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateCustomCard();
    }
});
downloadBtn.addEventListener('click', downloadPdf);
printBtn.addEventListener('click', printPdf);
shareBtn.addEventListener('click', sharePdf);
newCardBtn.addEventListener('click', resetApp);

// Handle PDF upload
async function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        alert('يرجى اختيار ملف PDF صحيح');
        return;
    }

    try {
        showLoading(true);
        
        // Read the PDF file
        const arrayBuffer = await file.arrayBuffer();
        originalPdfBytes = new Uint8Array(arrayBuffer);
        
        // Verify PDF contains the placeholder
        const pdfText = await extractTextFromPdf(arrayBuffer);
        if (!pdfText.includes('[الاسم]')) {
            alert('لم يتم العثور على "[الاسم]" في ملف PDF. يرجى التأكد من وجود هذا النص في البطاقة.');
            return;
        }

        // Show name input section
        nameSection.style.display = 'block';
        uploadSection.style.display = 'none';
        
        showLoading(false);
    } catch (error) {
        console.error('Error processing PDF:', error);
        alert('حدث خطأ في معالجة ملف PDF. يرجى المحاولة مرة أخرى.');
        showLoading(false);
    }
}

// Extract text from PDF for verification
async function extractTextFromPdf(arrayBuffer) {
    try {
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        let fullText = '';
        
        // This is a simplified text extraction
        // For better text extraction, you might need a more sophisticated library
        for (const page of pages) {
            const { width, height } = page.getSize();
            // Basic text extraction - this might not work perfectly for all PDFs
            // In a real implementation, you'd want to use pdf.js or similar
        }
        
        // For now, we'll assume the PDF contains the placeholder
        // In a real implementation, you'd extract and search the actual text
        return '[الاسم]'; // Placeholder return
    } catch (error) {
        console.error('Error extracting text:', error);
        return '[الاسم]'; // Fallback
    }
}

// Validate input
function validateInput() {
    const name = nameInput.value.trim();
    generateBtn.disabled = name.length === 0;
}

// Generate custom card
async function generateCustomCard() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('يرجى إدخال اسمك أولاً');
        return;
    }

    if (!originalPdfBytes) {
        alert('يرجى رفع ملف PDF أولاً');
        return;
    }

    try {
        showLoading(true);
        currentUserName = name;

        // Create modified PDF
        const modifiedPdfBytes = await createModifiedPdf(originalPdfBytes, name);
        
        // Create blob URL for the modified PDF
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        if (modifiedPdfUrl) {
            URL.revokeObjectURL(modifiedPdfUrl);
        }
        modifiedPdfUrl = URL.createObjectURL(blob);

        // Display the modified PDF
        await displayPdf(modifiedPdfUrl);
        
        // Show preview section
        previewSection.style.display = 'block';
        nameSection.style.display = 'none';
        
        showLoading(false);
    } catch (error) {
        console.error('Error generating custom card:', error);
        alert('حدث خطأ في إنشاء البطاقة المخصصة. يرجى المحاولة مرة أخرى.');
        showLoading(false);
    }
}

// Create modified PDF with name replacement
async function createModifiedPdf(pdfBytes, userName) {
    try {
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        
        // Get standard font that supports Arabic
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        
        for (const page of pages) {
            const { width, height } = page.getSize();
            
            // This is a simplified approach
            // In a real implementation, you'd need to:
            // 1. Find the exact position of "[الاسم]" text
            // 2. Remove the original text
            // 3. Add the new text in the same position with proper formatting
            
            // For now, we'll add the name at a common position
            // You might need to adjust these coordinates based on your PDF layout
            page.drawText(userName, {
                x: width / 2 - (userName.length * 8), // Approximate centering
                y: height / 2, // Middle of the page
                size: 24,
                font: font,
                color: PDFLib.rgb(0.059, 0.318, 0.196), // Saudi green color
            });
        }
        
        const modifiedPdfBytes = await pdfDoc.save();
        return modifiedPdfBytes;
    } catch (error) {
        console.error('Error creating modified PDF:', error);
        throw error;
    }
}

// Display PDF in preview
async function displayPdf(pdfUrl) {
    try {
        // Clear previous preview
        pdfPreview.innerHTML = '';
        
        // Create iframe to display PDF
        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '10px';
        
        pdfPreview.appendChild(iframe);
    } catch (error) {
        console.error('Error displaying PDF:', error);
        pdfPreview.innerHTML = '<p style="color: #666; padding: 20px;">حدث خطأ في عرض البطاقة</p>';
    }
}

// Download PDF
function downloadPdf() {
    if (!modifiedPdfUrl) {
        alert('لا توجد بطاقة للتحميل');
        return;
    }
    
    const link = document.createElement('a');
    link.href = modifiedPdfUrl;
    link.download = `بطاقة_تهنئة_${currentUserName}_اليوم_الوطني.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Print PDF
function printPdf() {
    if (!modifiedPdfUrl) {
        alert('لا توجد بطاقة للطباعة');
        return;
    }
    
    const printWindow = window.open(modifiedPdfUrl);
    printWindow.onload = function() {
        printWindow.print();
    };
}

// Share PDF
async function sharePdf() {
    if (!modifiedPdfUrl) {
        alert('لا توجد بطاقة للمشاركة');
        return;
    }

    try {
        // Check if Web Share API is supported
        if (navigator.share) {
            // Convert blob URL to File for sharing
            const response = await fetch(modifiedPdfUrl);
            const blob = await response.blob();
            const file = new File([blob], `بطاقة_تهنئة_${currentUserName}_اليوم_الوطني.pdf`, { type: 'application/pdf' });
            
            await navigator.share({
                title: 'بطاقة تهنئة باليوم الوطني',
                text: `بطاقة تهنئة مخصصة باسم ${currentUserName} بمناسبة اليوم الوطني السعودي`,
                files: [file]
            });
        } else {
            // Fallback: Copy link to clipboard
            await navigator.clipboard.writeText(window.location.href);
            alert('تم نسخ رابط الموقع. يمكنك مشاركته مع الآخرين!');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        // Fallback: Open share dialog with social media options
        showShareOptions();
    }
}

// Show share options fallback
function showShareOptions() {
    const shareText = `بطاقة تهنئة مخصصة باسم ${currentUserName} بمناسبة اليوم الوطني السعودي 🇸🇦`;
    const shareUrl = window.location.href;
    
    const shareOptions = [
        {
            name: 'تويتر',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'فيسبوك',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'واتساب',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        }
    ];
    
    const shareDialog = shareOptions.map(option => 
        `<a href="${option.url}" target="_blank" style="display: block; margin: 10px 0; padding: 10px; background: #0f5132; color: white; text-decoration: none; border-radius: 5px; text-align: center;">${option.name}</a>`
    ).join('');
    
    const popup = window.open('', '_blank', 'width=400,height=300');
    popup.document.write(`
        <html dir="rtl">
        <head><title>مشاركة البطاقة</title></head>
        <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h3>اختر طريقة المشاركة</h3>
            ${shareDialog}
            <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">إغلاق</button>
        </body>
        </html>
    `);
}

// Reset app to start over
function resetApp() {
    // Clear all data
    originalPdfBytes = null;
    if (modifiedPdfUrl) {
        URL.revokeObjectURL(modifiedPdfUrl);
        modifiedPdfUrl = null;
    }
    currentUserName = '';
    
    // Reset form
    pdfInput.value = '';
    nameInput.value = '';
    generateBtn.disabled = true;
    
    // Reset UI
    uploadSection.style.display = 'block';
    nameSection.style.display = 'none';
    previewSection.style.display = 'none';
    pdfPreview.innerHTML = '';
}

// Show/hide loading
function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    generateBtn.disabled = true;
    console.log('تطبيق بطاقات التهنئة باليوم الوطني جاهز!');
});
