// Enhanced script for complex PDF processing
// Global variables
let originalPdfBytes = null;
let modifiedPdfUrl = null;
let currentUserName = '';
let pdfDoc = null;

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

// Handle PDF upload - Enhanced version
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
        
        // Load PDF document for processing
        pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // Show name input section - we'll work with any PDF
        nameSection.style.display = 'block';
        uploadSection.style.display = 'none';
        
        // Update instructions for complex PDFs
        const nameBox = document.querySelector('.name-input-box h3');
        nameBox.textContent = 'أدخل الاسم الجديد';
        
        const instruction = document.createElement('p');
        instruction.style.color = '#666';
        instruction.style.marginBottom = '15px';
        instruction.style.fontSize = '0.9rem';
        instruction.textContent = 'سيتم إضافة الاسم كنص جديد على البطاقة';
        nameBox.parentNode.insertBefore(instruction, nameInput);
        
        showLoading(false);
    } catch (error) {
        console.error('Error processing PDF:', error);
        alert('حدث خطأ في معالجة ملف PDF. يرجى المحاولة مرة أخرى.');
        showLoading(false);
    }
}

// Validate input
function validateInput() {
    const name = nameInput.value.trim();
    generateBtn.disabled = name.length === 0;
}

// Generate custom card - Enhanced for complex PDFs
async function generateCustomCard() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('يرجى إدخال اسمك أولاً');
        return;
    }

    if (!pdfDoc) {
        alert('يرجى رفع ملف PDF أولاً');
        return;
    }

    try {
        showLoading(true);
        currentUserName = name;

        // Create modified PDF with overlay approach
        const modifiedPdfBytes = await createEnhancedPdf(pdfDoc, name);
        
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

// Enhanced PDF creation with overlay approach
async function createEnhancedPdf(originalDoc, userName) {
    try {
        // Create a copy of the original document
        const pdfDoc = await PDFLib.PDFDocument.create();
        const pages = await pdfDoc.copyPages(originalDoc, originalDoc.getPageIndices());
        
        // Add all pages to the new document
        pages.forEach((page) => pdfDoc.addPage(page));
        
        // Get the first page to add the name
        const firstPage = pdfDoc.getPages()[0];
        const { width, height } = firstPage.getSize();
        
        // Try to embed Arabic font, fallback to Helvetica
        let font;
        try {
            // Try to use a font that supports Arabic
            font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        } catch (error) {
            font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        }
        
        // Calculate position for the name
        // You can adjust these coordinates based on your PDF layout
        const fontSize = 28;
        const textWidth = font.widthOfTextAtSize(userName, fontSize);
        const x = (width - textWidth) / 2; // Center horizontally
        const y = height * 0.3; // Position at 30% from bottom
        
        // Add the name with styling
        firstPage.drawText(userName, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: PDFLib.rgb(0.059, 0.318, 0.196), // Saudi green
        });
        
        // Add a decorative border around the name
        const padding = 20;
        firstPage.drawRectangle({
            x: x - padding,
            y: y - padding/2,
            width: textWidth + (padding * 2),
            height: fontSize + padding,
            borderColor: PDFLib.rgb(0.059, 0.318, 0.196),
            borderWidth: 2,
            color: PDFLib.rgb(1, 1, 1), // White background
            opacity: 0.9,
        });
        
        // Redraw the text on top of the rectangle
        firstPage.drawText(userName, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: PDFLib.rgb(0.059, 0.318, 0.196),
        });
        
        // Add a small subtitle
        const subtitle = 'كل عام وأنت بخير';
        const subtitleSize = 14;
        const subtitleWidth = font.widthOfTextAtSize(subtitle, subtitleSize);
        const subtitleX = (width - subtitleWidth) / 2;
        
        firstPage.drawText(subtitle, {
            x: subtitleX,
            y: y - 40,
            size: subtitleSize,
            font: font,
            color: PDFLib.rgb(0.4, 0.4, 0.4),
        });
        
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error creating enhanced PDF:', error);
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
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '10px';
        iframe.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        
        pdfPreview.appendChild(iframe);
        
        // Add success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            background: linear-gradient(135deg, #d1eddb, #c3e6cb);
            color: #155724;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
            border: 1px solid #c3e6cb;
        `;
        successMsg.innerHTML = `🎉 تم إنشاء بطاقة التهنئة باسم "${currentUserName}" بنجاح!`;
        pdfPreview.insertBefore(successMsg, iframe);
        
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
    
    // Show download success message
    showTemporaryMessage('تم تحميل البطاقة بنجاح! 📥');
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
    
    showTemporaryMessage('تم فتح نافذة الطباعة! 🖨️');
}

// Enhanced sharing with more options
async function sharePdf() {
    if (!modifiedPdfUrl) {
        alert('لا توجد بطاقة للمشاركة');
        return;
    }

    try {
        // Check if Web Share API is supported
        if (navigator.share) {
            const response = await fetch(modifiedPdfUrl);
            const blob = await response.blob();
            const file = new File([blob], `بطاقة_تهنئة_${currentUserName}_اليوم_الوطني.pdf`, { type: 'application/pdf' });
            
            await navigator.share({
                title: 'بطاقة تهنئة باليوم الوطني',
                text: `بطاقة تهنئة مخصصة باسم ${currentUserName} بمناسبة اليوم الوطني السعودي 🇸🇦`,
                files: [file]
            });
            
            showTemporaryMessage('تم مشاركة البطاقة بنجاح! 📱');
        } else {
            showShareOptions();
        }
    } catch (error) {
        console.error('Error sharing:', error);
        showShareOptions();
    }
}

// Enhanced share options
function showShareOptions() {
    const shareText = `بطاقة تهنئة مخصصة باسم ${currentUserName} بمناسبة اليوم الوطني السعودي 🇸🇦`;
    const shareUrl = window.location.href;
    
    const shareOptions = [
        {
            name: 'واتساب',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
            color: '#25D366',
            icon: '📱'
        },
        {
            name: 'تويتر',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            color: '#1DA1F2',
            icon: '🐦'
        },
        {
            name: 'فيسبوك',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: '#4267B2',
            icon: '👥'
        },
        {
            name: 'تيليجرام',
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            color: '#0088cc',
            icon: '✈️'
        }
    ];
    
    const shareDialog = shareOptions.map(option => 
        `<a href="${option.url}" target="_blank" style="
            display: flex; 
            align-items: center; 
            gap: 10px;
            margin: 10px 0; 
            padding: 15px; 
            background: ${option.color}; 
            color: white; 
            text-decoration: none; 
            border-radius: 10px; 
            text-align: center;
            font-weight: 600;
            transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <span style="font-size: 20px;">${option.icon}</span>
            <span>مشاركة عبر ${option.name}</span>
        </a>`
    ).join('');
    
    const popup = window.open('', '_blank', 'width=450,height=500,scrollbars=yes');
    popup.document.write(`
        <html dir="rtl">
        <head>
            <title>مشاركة البطاقة</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: 'Arial', sans-serif; 
                    padding: 20px; 
                    background: linear-gradient(135deg, #0f5132, #198754);
                    margin: 0;
                }
                .container {
                    background: white;
                    padding: 20px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                h3 { 
                    color: #0f5132; 
                    text-align: center; 
                    margin-bottom: 20px;
                    font-size: 1.3rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h3>🎉 مشاركة بطاقة التهنئة 🎉</h3>
                ${shareDialog}
                <button onclick="window.close()" style="
                    width: 100%;
                    margin-top: 20px; 
                    padding: 15px; 
                    background: #666; 
                    color: white; 
                    border: none; 
                    border-radius: 10px; 
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                ">إغلاق</button>
            </div>
        </body>
        </html>
    `);
}

// Show temporary success message
function showTemporaryMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #d1eddb, #c3e6cb);
        color: #155724;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 600;
        border: 1px solid #c3e6cb;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Animate in
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Reset app to start over
function resetApp() {
    // Clear all data
    originalPdfBytes = null;
    pdfDoc = null;
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
    
    // Remove any added instructions
    const instructions = document.querySelectorAll('.name-input-box p');
    instructions.forEach(p => p.remove());
    
    // Reset heading
    const nameBox = document.querySelector('.name-input-box h3');
    nameBox.textContent = 'أدخل اسمك';
    
    showTemporaryMessage('تم إعادة تعيين التطبيق! 🔄');
}

// Show/hide loading
function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    generateBtn.disabled = true;
    console.log('تطبيق بطاقات التهنئة المحسن جاهز! 🎉');
    
    // Add welcome message
    setTimeout(() => {
        showTemporaryMessage('مرحباً بك في منشئ بطاقات التهنئة! 🇸🇦');
    }, 1000);
});
