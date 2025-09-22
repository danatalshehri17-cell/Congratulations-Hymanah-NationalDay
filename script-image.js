// Image-based script using the original PNG design
// Global variables
let currentUserName = '';
let originalImage = null;
const IMAGE_PATH = 'تهنئة هيمنة باليوم الوطني.png'; // Path to your PNG file

// DOM Elements
const nameInput = document.getElementById('nameInput');
const generateBtn = document.getElementById('generateBtn');
const previewSection = document.getElementById('previewSection');
const pdfPreview = document.getElementById('pdfPreview');
const loading = document.getElementById('loading');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const shareBtn = document.getElementById('shareBtn');
const newCardBtn = document.getElementById('newCardBtn');

// Event Listeners
generateBtn.addEventListener('click', generateCustomCard);
nameInput.addEventListener('input', validateInput);
nameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateCustomCard();
    }
});
downloadBtn.addEventListener('click', downloadCard);
printBtn.addEventListener('click', printCard);
shareBtn.addEventListener('click', shareCard);
newCardBtn.addEventListener('click', resetApp);

// Validate input
function validateInput() {
    const name = nameInput.value.trim();
    generateBtn.disabled = name.length === 0;
    
    // Update button text based on input
    if (name.length > 0) {
        generateBtn.textContent = `إنشاء البطاقة باسم "${name}"`;
        generateBtn.style.background = 'linear-gradient(135deg, #0f5132, #198754)';
    } else {
        generateBtn.textContent = 'إنشاء البطاقة المخصصة';
        generateBtn.style.background = '#ccc';
    }
}

// Load the original image
function loadOriginalImage() {
    return new Promise((resolve, reject) => {
        if (originalImage) {
            resolve(originalImage);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous'; // Handle CORS if needed
        
        img.onload = function() {
            originalImage = img;
            resolve(img);
        };
        
        img.onerror = function() {
            reject(new Error('فشل في تحميل صورة التصميم الأصلي'));
        };
        
        img.src = IMAGE_PATH;
    });
}

// Generate custom card using the original PNG
async function generateCustomCard() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('يرجى إدخال اسمك أولاً');
        return;
    }

    try {
        showLoading(true);
        currentUserName = name;

        // Load the original image
        const img = await loadOriginalImage();
        
        // Create canvas with the original image and add name
        const canvas = await createCustomizedCard(img, name);
        
        // Display the card
        displayCard(canvas);
        
        // Show preview section
        previewSection.style.display = 'block';
        
        // Hide name input section
        document.getElementById('nameSection').style.display = 'none';
        
        showLoading(false);
        
        // Show success message
        showTemporaryMessage(`🎉 تم إنشاء بطاقة التهنئة باسم "${name}" بنجاح!`);
        
    } catch (error) {
        console.error('Error generating custom card:', error);
        showLoading(false);
        
        if (error.message.includes('تحميل صورة')) {
            alert('تعذر تحميل التصميم الأصلي. تأكد من وجود الملف: ' + IMAGE_PATH);
        } else {
            alert('حدث خطأ في إنشاء البطاقة: ' + error.message);
        }
    }
}

// Create customized card with name overlay
async function createCustomizedCard(originalImg, userName) {
    return new Promise((resolve, reject) => {
        try {
            // Create canvas with same dimensions as original image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = originalImg.width;
            canvas.height = originalImg.height;
            
            // Draw the original image
            ctx.drawImage(originalImg, 0, 0);
            
            // Configure text styling for Arabic
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Calculate font size based on image size
            const baseFontSize = Math.min(canvas.width, canvas.height) * 0.08;
            
            // Find where "هيمنة" appears and replace it
            // Since we can't detect text position automatically, we'll place it in a good spot
            
            // Position the name (you may need to adjust these values based on your image)
            const nameX = canvas.width * 0.5; // Center horizontally
            const nameY = canvas.height * 0.6; // 60% down from top (adjust as needed)
            
            // Add background for the name (optional, for better readability)
            const fontSize = baseFontSize;
            ctx.font = `bold ${fontSize}px Arial, sans-serif`;
            
            // Measure text to create background
            const textMetrics = ctx.measureText(userName);
            const textWidth = textMetrics.width;
            const textHeight = fontSize;
            
            // Semi-transparent background for better readability
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(
                nameX - (textWidth / 2) - 20,
                nameY - (textHeight / 2) - 10,
                textWidth + 40,
                textHeight + 20
            );
            
            // Add border to background
            ctx.strokeStyle = '#0f5132';
            ctx.lineWidth = 3;
            ctx.strokeRect(
                nameX - (textWidth / 2) - 20,
                nameY - (textHeight / 2) - 10,
                textWidth + 40,
                textHeight + 20
            );
            
            // Add the user's name
            ctx.fillStyle = '#0f5132'; // Saudi green
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            
            // Add text stroke for better visibility
            ctx.strokeText(userName, nameX, nameY);
            ctx.fillText(userName, nameX, nameY);
            
            // Add small subtitle (optional)
            const subtitleY = nameY + fontSize * 0.8;
            const subtitleFontSize = fontSize * 0.4;
            ctx.font = `${subtitleFontSize}px Arial, sans-serif`;
            ctx.fillStyle = '#0f5132';
            
            const subtitle = 'كل عام وأنت بخير';
            ctx.fillText(subtitle, nameX, subtitleY);
            
            resolve(canvas);
        } catch (error) {
            reject(error);
        }
    });
}

// Display card in preview
function displayCard(canvas) {
    try {
        // Clear previous preview
        pdfPreview.innerHTML = '';
        
        // Add success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            background: linear-gradient(135deg, #d1eddb, #c3e6cb);
            color: #155724;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 600;
            border: 2px solid #c3e6cb;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        `;
        successMsg.innerHTML = `
            <div style="font-size: 1.3rem; margin-bottom: 10px;">🎉 بطاقتك الجميلة جاهزة! 🎉</div>
            <div style="font-size: 1rem;">تم استخدام التصميم الأصلي مع إضافة اسم "${currentUserName}"</div>
        `;
        pdfPreview.appendChild(successMsg);
        
        // Add canvas to preview
        const cardContainer = document.createElement('div');
        cardContainer.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto;
        `;
        
        // Style the canvas
        canvas.style.cssText = `
            max-width: 100%;
            max-height: 800px;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        cardContainer.appendChild(canvas);
        pdfPreview.appendChild(cardContainer);
        
        // Store canvas globally for download
        window.currentCanvas = canvas;
        
        // Add position adjustment tip
        const tip = document.createElement('div');
        tip.style.cssText = `
            background: #e3f2fd;
            color: #1565c0;
            padding: 15px;
            border-radius: 10px;
            margin-top: 15px;
            text-align: center;
            font-size: 0.9rem;
            border: 1px solid #bbdefb;
        `;
        tip.innerHTML = `
            💡 <strong>نصيحة:</strong> إذا كان موضع الاسم غير مناسب، أخبرني وسأعدله لك!
        `;
        pdfPreview.appendChild(tip);
        
    } catch (error) {
        console.error('Error displaying card:', error);
        pdfPreview.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">حدث خطأ في عرض البطاقة</p>';
    }
}

// Download card as image
function downloadCard() {
    try {
        if (window.currentCanvas) {
            const link = document.createElement('a');
            link.download = `بطاقة_تهنئة_${currentUserName}_اليوم_الوطني.png`;
            link.href = window.currentCanvas.toDataURL('image/png', 1.0); // High quality
            link.click();
            showTemporaryMessage('تم تحميل البطاقة بجودة عالية! 📥');
        } else {
            alert('لا توجد بطاقة للتحميل');
        }
    } catch (error) {
        console.error('Error downloading:', error);
        alert('حدث خطأ في التحميل: ' + error.message);
    }
}

// Print card
function printCard() {
    try {
        if (window.currentCanvas) {
            // Create a new window with the card for printing
            const printWindow = window.open('', '_blank');
            const cardDataUrl = window.currentCanvas.toDataURL('image/png', 1.0);
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>بطاقة تهنئة - ${currentUserName}</title>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            min-height: 100vh;
                            background: #f5f5f5;
                        }
                        img { 
                            max-width: 100%; 
                            max-height: 100vh; 
                            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        }
                        @media print {
                            body { background: white; }
                            img { box-shadow: none; }
                        }
                    </style>
                </head>
                <body>
                    <img src="${cardDataUrl}" alt="بطاقة تهنئة ${currentUserName}">
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.onload = function() {
                printWindow.print();
            };
            
            showTemporaryMessage('تم فتح نافذة الطباعة! 🖨️');
        } else {
            alert('لا توجد بطاقة للطباعة');
        }
    } catch (error) {
        console.error('Error printing:', error);
        alert('حدث خطأ في الطباعة: ' + error.message);
    }
}

// Share card
async function shareCard() {
    try {
        if (window.currentCanvas) {
            window.currentCanvas.toBlob(async (blob) => {
                try {
                    if (navigator.share) {
                        const file = new File([blob], `بطاقة_تهنئة_${currentUserName}_اليوم_الوطني.png`, { type: 'image/png' });
                        
                        await navigator.share({
                            title: 'بطاقة تهنئة باليوم الوطني',
                            text: `بطاقة تهنئة مخصصة باسم ${currentUserName} بمناسبة اليوم الوطني السعودي 🇸🇦`,
                            files: [file]
                        });
                        
                        showTemporaryMessage('تم مشاركة البطاقة بنجاح! 📱');
                    } else {
                        showShareOptions();
                    }
                } catch (shareError) {
                    console.error('Error sharing:', shareError);
                    showShareOptions();
                }
            }, 'image/png', 1.0);
        } else {
            showShareOptions();
        }
    } catch (error) {
        console.error('Error preparing share:', error);
        showShareOptions();
    }
}

// Show share options
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
            gap: 15px;
            margin: 12px 0; 
            padding: 18px; 
            background: ${option.color}; 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        " onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
            <span style="font-size: 24px;">${option.icon}</span>
            <span>مشاركة عبر ${option.name}</span>
        </a>`
    ).join('');
    
    const popup = window.open('', '_blank', 'width=500,height=600');
    popup.document.write(`
        <html dir="rtl">
        <head>
            <title>مشاركة البطاقة</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial; 
                    padding: 0;
                    margin: 0;
                    background: linear-gradient(135deg, #0f5132, #198754);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
                    max-width: 400px;
                    width: 90%;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h3 style="color: #0f5132; text-align: center; margin-bottom: 25px;">🎉 مشاركة البطاقة 🎉</h3>
                ${shareDialog}
                <button onclick="window.close()" style="width: 100%; margin-top: 25px; padding: 18px; background: #666; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 1.1rem;">إغلاق</button>
            </div>
        </body>
        </html>
    `);
}

// Show temporary message
function showTemporaryMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: linear-gradient(135deg, #d1eddb, #c3e6cb);
        color: #155724;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 600;
        font-size: 1.1rem;
        border: 2px solid #c3e6cb;
        transform: translateX(100%);
        transition: transform 0.4s ease;
        max-width: 350px;
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => messageDiv.remove(), 400);
    }, 4000);
}

// Reset app
function resetApp() {
    // Clear data
    currentUserName = '';
    window.currentCanvas = null;
    
    // Reset form
    nameInput.value = '';
    generateBtn.disabled = true;
    generateBtn.textContent = 'إنشاء البطاقة المخصصة';
    generateBtn.style.background = '#ccc';
    
    // Reset UI
    document.getElementById('nameSection').style.display = 'block';
    previewSection.style.display = 'none';
    pdfPreview.innerHTML = '';
    
    nameInput.focus();
    showTemporaryMessage('تم إعادة تعيين التطبيق! 🔄');
}

// Show/hide loading
function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    generateBtn.disabled = true;
    nameInput.focus();
    
    console.log('🎉 موقع بطاقات التهنئة (بالتصميم الأصلي) جاهز!');
    
    // Pre-load the original image
    loadOriginalImage().then(() => {
        showTemporaryMessage('✅ تم تحميل التصميم الأصلي بنجاح! أدخل اسمك الآن 🇸🇦');
    }).catch((error) => {
        console.error('Error loading original image:', error);
        showTemporaryMessage('⚠️ تعذر تحميل التصميم الأصلي. تأكد من وجود الملف في المجلد.');
    });
});
