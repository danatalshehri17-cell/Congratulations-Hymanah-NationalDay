// Simple script using only the specific PNG image
// Global variables
let currentUserName = '';
let originalImage = null;
const IMAGE_PATH = 'تهنئة هيمنة باليوم الوطني.png'; // Your specific image

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
    
    if (name.length > 0) {
        generateBtn.textContent = `كتابة "${name}" على البطاقة`;
        generateBtn.style.background = 'linear-gradient(135deg, #0f5132, #198754)';
    } else {
        generateBtn.textContent = 'اكتب الاسم على البطاقة';
        generateBtn.style.background = '#ccc';
    }
}

// Load the specific image
function loadImage() {
    return new Promise((resolve, reject) => {
        if (originalImage) {
            resolve(originalImage);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            originalImage = img;
            console.log('Image loaded successfully:', img.width, 'x', img.height);
            resolve(img);
        };
        
        img.onerror = function() {
            console.error('Failed to load image:', IMAGE_PATH);
            reject(new Error('فشل في تحميل الصورة: ' + IMAGE_PATH));
        };
        
        // Try different ways to load the image
        img.src = IMAGE_PATH;
    });
}

// Generate custom card with name on the image
async function generateCustomCard() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('يرجى إدخال الاسم أولاً');
        return;
    }

    try {
        showLoading(true);
        currentUserName = name;

        // Load the image
        const img = await loadImage();
        
        // Create canvas with the image and add name
        const canvas = await addNameToImage(img, name);
        
        // Display the result
        displayCard(canvas);
        
        // Show preview section
        previewSection.style.display = 'block';
        document.getElementById('nameSection').style.display = 'none';
        
        showLoading(false);
        showTemporaryMessage(`🎉 تم كتابة "${name}" على البطاقة بنجاح!`);
        
    } catch (error) {
        console.error('Error generating card:', error);
        showLoading(false);
        
        if (error.message.includes('تحميل الصورة')) {
            alert('لم يتم العثور على صورة البطاقة. تأكد من وجود الملف: ' + IMAGE_PATH);
        } else {
            alert('حدث خطأ: ' + error.message);
        }
    }
}

// Add name to the image
async function addNameToImage(img, userName) {
    return new Promise((resolve) => {
        // Create canvas with same size as image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Setup text properties
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate font size based on image dimensions
        const fontSize = Math.min(img.width, img.height) * 0.08; // 8% of smallest dimension
        
        // Position for the name (you can adjust these percentages)
        const nameX = img.width * 0.5;  // Center horizontally (50%)
        const nameY = img.height * 0.7; // 70% down from top (adjust as needed)
        
        // Set font
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        
        // Measure text for background
        const textMetrics = ctx.measureText(userName);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        // Add semi-transparent background behind text
        const padding = 30;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // White with 90% opacity
        ctx.fillRect(
            nameX - (textWidth / 2) - padding,
            nameY - (textHeight / 2) - (padding/2),
            textWidth + (padding * 2),
            textHeight + padding
        );
        
        // Add border around background
        ctx.strokeStyle = '#0f5132'; // Saudi green
        ctx.lineWidth = 4;
        ctx.strokeRect(
            nameX - (textWidth / 2) - padding,
            nameY - (textHeight / 2) - (padding/2),
            textWidth + (padding * 2),
            textHeight + padding
        );
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw the name
        ctx.fillStyle = '#0f5132'; // Saudi green
        ctx.fillText(userName, nameX, nameY);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add a small decorative element below the name
        const subtitleY = nameY + (fontSize * 0.7);
        const subtitleFontSize = fontSize * 0.4;
        ctx.font = `${subtitleFontSize}px Arial, sans-serif`;
        ctx.fillStyle = '#0f5132';
        
        const subtitle = 'كل عام وأنت بخير';
        ctx.fillText(subtitle, nameX, subtitleY);
        
        // Add small stars on sides
        const starSize = fontSize * 0.5;
        ctx.font = `${starSize}px Arial, sans-serif`;
        ctx.fillStyle = '#FFD700'; // Gold color
        
        ctx.fillText('⭐', nameX - (textWidth / 2) - padding - 20, nameY);
        ctx.fillText('⭐', nameX + (textWidth / 2) + padding + 20, nameY);
        
        resolve(canvas);
    });
}

// Display the card
function displayCard(canvas) {
    try {
        // Clear previous content
        pdfPreview.innerHTML = '';
        
        // Success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            background: linear-gradient(135deg, #d1eddb, #c3e6cb);
            color: #155724;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 600;
            border: 2px solid #c3e6cb;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        `;
        successMsg.innerHTML = `
            <div style="font-size: 1.4rem; margin-bottom: 10px;">🎉 البطاقة جاهزة! 🎉</div>
            <div style="font-size: 1.1rem;">تم كتابة "${currentUserName}" على بطاقة التهنئة الأصلية</div>
        `;
        pdfPreview.appendChild(successMsg);
        
        // Card container
        const cardContainer = document.createElement('div');
        cardContainer.style.cssText = `
            background: white;
            padding: 25px;
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
            max-height: 80vh;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            cursor: pointer;
        `;
        
        // Add click to zoom functionality
        canvas.addEventListener('click', function() {
            if (canvas.style.maxWidth === '100%') {
                canvas.style.maxWidth = 'none';
                canvas.style.maxHeight = 'none';
                canvas.style.width = 'auto';
                canvas.style.height = 'auto';
                showTemporaryMessage('🔍 تم تكبير البطاقة - اضغط مرة أخرى للتصغير');
            } else {
                canvas.style.maxWidth = '100%';
                canvas.style.maxHeight = '80vh';
                showTemporaryMessage('🔍 تم تصغير البطاقة');
            }
        });
        
        cardContainer.appendChild(canvas);
        pdfPreview.appendChild(cardContainer);
        
        // Store canvas for download
        window.currentCanvas = canvas;
        
        // Add tip
        const tip = document.createElement('div');
        tip.style.cssText = `
            background: #e3f2fd;
            color: #1565c0;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            text-align: center;
            font-size: 0.95rem;
            border: 1px solid #bbdefb;
        `;
        tip.innerHTML = `
            💡 <strong>نصيحة:</strong> اضغط على البطاقة لتكبيرها أو تصغيرها
        `;
        pdfPreview.appendChild(tip);
        
    } catch (error) {
        console.error('Error displaying card:', error);
        pdfPreview.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">حدث خطأ في عرض البطاقة</p>';
    }
}

// Download card
function downloadCard() {
    try {
        if (window.currentCanvas) {
            const link = document.createElement('a');
            link.download = `بطاقة_تهنئة_${currentUserName}_اليوم_الوطني.png`;
            link.href = window.currentCanvas.toDataURL('image/png', 1.0);
            link.click();
            showTemporaryMessage('📥 تم تحميل البطاقة بجودة عالية!');
        } else {
            alert('لا توجد بطاقة للتحميل');
        }
    } catch (error) {
        console.error('Error downloading:', error);
        alert('حدث خطأ في التحميل');
    }
}

// Print card
function printCard() {
    try {
        if (window.currentCanvas) {
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
                        }
                        img { 
                            max-width: 100%; 
                            max-height: 100vh; 
                        }
                        @media print {
                            body { padding: 0; }
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
            
            showTemporaryMessage('🖨️ تم فتح نافذة الطباعة!');
        } else {
            alert('لا توجد بطاقة للطباعة');
        }
    } catch (error) {
        console.error('Error printing:', error);
        alert('حدث خطأ في الطباعة');
    }
}

// Share card
async function shareCard() {
    try {
        if (window.currentCanvas) {
            window.currentCanvas.toBlob(async (blob) => {
                try {
                    if (navigator.share) {
                        const file = new File([blob], `بطاقة_تهنئة_${currentUserName}.png`, { type: 'image/png' });
                        
                        await navigator.share({
                            title: 'بطاقة تهنئة باليوم الوطني',
                            text: `بطاقة تهنئة باسم ${currentUserName} 🇸🇦`,
                            files: [file]
                        });
                        
                        showTemporaryMessage('📱 تم مشاركة البطاقة بنجاح!');
                    } else {
                        // Fallback sharing
                        const shareText = `بطاقة تهنئة باسم ${currentUserName} بمناسبة اليوم الوطني السعودي 🇸🇦`;
                        const shareUrl = window.location.href;
                        
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                        window.open(whatsappUrl, '_blank');
                        
                        showTemporaryMessage('📱 تم فتح واتساب للمشاركة!');
                    }
                } catch (shareError) {
                    console.error('Error sharing:', shareError);
                    showTemporaryMessage('⚠️ حدث خطأ في المشاركة');
                }
            }, 'image/png', 1.0);
        } else {
            alert('لا توجد بطاقة للمشاركة');
        }
    } catch (error) {
        console.error('Error preparing share:', error);
        alert('حدث خطأ في تحضير المشاركة');
    }
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
    currentUserName = '';
    window.currentCanvas = null;
    
    // Reset form
    nameInput.value = '';
    generateBtn.disabled = true;
    generateBtn.textContent = 'اكتب الاسم على البطاقة';
    generateBtn.style.background = '#ccc';
    
    // Reset UI
    document.getElementById('nameSection').style.display = 'block';
    previewSection.style.display = 'none';
    pdfPreview.innerHTML = '';
    
    nameInput.focus();
    showTemporaryMessage('🔄 تم إعادة تعيين التطبيق!');
}

// Show/hide loading
function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    generateBtn.disabled = true;
    nameInput.focus();
    
    console.log('🎉 موقع كتابة الأسماء على البطاقة جاهز!');
    
    // Pre-load the image
    loadImage().then(() => {
        showTemporaryMessage('✅ تم تحميل بطاقة التهنئة! أدخل الاسم الآن 🇸🇦');
    }).catch((error) => {
        console.error('Error loading image:', error);
        showTemporaryMessage('⚠️ تعذر تحميل البطاقة. تأكد من وجود الملف في المجلد.');
    });
});
