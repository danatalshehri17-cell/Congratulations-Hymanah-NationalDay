// Final script with image upload and fallback options
// Global variables
let currentUserName = '';
let originalImage = null;
let uploadedImageFile = null;

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

// Add image upload option to the page
function addImageUploadOption() {
    const nameSection = document.getElementById('nameSection');
    const nameBox = nameSection.querySelector('.name-input-box');
    
    // Check if upload option already exists
    if (document.getElementById('imageUploadSection')) {
        return;
    }
    
    const uploadSection = document.createElement('div');
    uploadSection.id = 'imageUploadSection';
    uploadSection.style.cssText = `
        background: #f8f9fa;
        border: 2px dashed #0f5132;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        text-align: center;
    `;
    
    uploadSection.innerHTML = `
        <div style="margin-bottom: 15px;">
            <strong style="color: #0f5132;">📁 ارفع صورة التصميم الأصلي</strong>
            <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">إذا لم يتم تحميل التصميم تلقائياً، ارفعه يدوياً</p>
        </div>
        <input type="file" id="imageUpload" accept="image/*" style="display: none;">
        <label for="imageUpload" style="
            background: #0f5132;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            display: inline-block;
            font-size: 0.9rem;
            transition: all 0.3s;
        " onmouseover="this.style.background='#198754'" onmouseout="this.style.background='#0f5132'">
            اختر صورة التصميم
        </label>
        <div id="uploadStatus" style="margin-top: 10px; font-size: 0.9rem;"></div>
    `;
    
    nameBox.insertBefore(uploadSection, nameBox.firstChild);
    
    // Add event listener for file upload
    const imageUpload = document.getElementById('imageUpload');
    const uploadStatus = document.getElementById('uploadStatus');
    
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                uploadedImageFile = file;
                uploadStatus.style.color = '#155724';
                uploadStatus.textContent = `✅ تم اختيار: ${file.name}`;
            } else {
                uploadStatus.style.color = '#721c24';
                uploadStatus.textContent = '❌ يرجى اختيار ملف صورة صحيح';
            }
        }
    });
}

// Try to load the original image from different possible names
async function loadOriginalImage() {
    const possibleNames = [
        'تهنئة هيمنة باليوم الوطني.png',
        'تهنئة%20هيمنة%20باليوم%20الوطني.png',
        encodeURIComponent('تهنئة هيمنة باليوم الوطني.png'),
        'design.png',
        'card.png'
    ];
    
    // If user uploaded a file, use it
    if (uploadedImageFile) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = e.target.result;
            };
            reader.readAsDataURL(uploadedImageFile);
        });
    }
    
    // Try to load from possible file names
    for (const fileName of possibleNames) {
        try {
            const img = await loadImageByName(fileName);
            if (img) {
                originalImage = img;
                return img;
            }
        } catch (error) {
            console.log(`Failed to load ${fileName}:`, error.message);
        }
    }
    
    throw new Error('لم يتم العثور على صورة التصميم');
}

// Load image by name
function loadImageByName(fileName) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            resolve(img);
        };
        
        img.onerror = function() {
            reject(new Error(`Failed to load ${fileName}`));
        };
        
        img.src = fileName;
    });
}

// Generate custom card
async function generateCustomCard() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('يرجى إدخال اسمك أولاً');
        return;
    }

    try {
        showLoading(true);
        currentUserName = name;

        try {
            // Try to load the original image
            const img = await loadOriginalImage();
            
            // Create canvas with the original image and add name
            const canvas = await createCustomizedCard(img, name);
            displayCard(canvas, true); // true = using original design
            
        } catch (imageError) {
            console.log('Could not load original image, creating custom design:', imageError.message);
            
            // Fallback to custom-designed card
            const canvas = await createCustomDesignCard(name);
            displayCard(canvas, false); // false = using custom design
        }
        
        // Show preview section
        previewSection.style.display = 'block';
        document.getElementById('nameSection').style.display = 'none';
        
        showLoading(false);
        showTemporaryMessage(`🎉 تم إنشاء بطاقة التهنئة باسم "${name}" بنجاح!`);
        
    } catch (error) {
        console.error('Error generating custom card:', error);
        showLoading(false);
        alert('حدث خطأ في إنشاء البطاقة: ' + error.message);
    }
}

// Create customized card with original image
async function createCustomizedCard(originalImg, userName) {
    return new Promise((resolve) => {
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
        const baseFontSize = Math.min(canvas.width, canvas.height) * 0.06;
        
        // Position the name (adjust these values based on your image)
        const nameX = canvas.width * 0.5; // Center horizontally
        const nameY = canvas.height * 0.65; // 65% down from top
        
        // Add background for the name
        const fontSize = baseFontSize;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        
        // Measure text to create background
        const textMetrics = ctx.measureText(userName);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        // Semi-transparent background for better readability
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
            nameX - (textWidth / 2) - 25,
            nameY - (textHeight / 2) - 15,
            textWidth + 50,
            textHeight + 30
        );
        
        // Add border to background
        ctx.strokeStyle = '#0f5132';
        ctx.lineWidth = 3;
        ctx.strokeRect(
            nameX - (textWidth / 2) - 25,
            nameY - (textHeight / 2) - 15,
            textWidth + 50,
            textHeight + 30
        );
        
        // Add the user's name
        ctx.fillStyle = '#0f5132'; // Saudi green
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        
        // Add text stroke for better visibility
        ctx.strokeText(userName, nameX, nameY);
        ctx.fillText(userName, nameX, nameY);
        
        // Add small subtitle
        const subtitleY = nameY + fontSize * 0.8;
        const subtitleFontSize = fontSize * 0.5;
        ctx.font = `${subtitleFontSize}px Arial, sans-serif`;
        ctx.fillStyle = '#0f5132';
        
        const subtitle = 'كل عام وأنت بخير';
        ctx.fillText(subtitle, nameX, subtitleY);
        
        resolve(canvas);
    });
}

// Create custom design card (fallback)
async function createCustomDesignCard(userName) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size (A4 proportions)
        canvas.width = 800;
        canvas.height = 1200;
        
        // Saudi colors
        const saudiGreen = '#0f5132';
        const gold = '#FFD700';
        const white = '#FFFFFF';
        const lightGreen = '#e8f5e8';
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, white);
        gradient.addColorStop(0.3, lightGreen);
        gradient.addColorStop(0.7, lightGreen);
        gradient.addColorStop(1, white);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Decorative borders
        ctx.fillStyle = saudiGreen;
        ctx.fillRect(0, 0, canvas.width, 30); // Top
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30); // Bottom
        ctx.fillRect(0, 0, 30, canvas.height); // Left
        ctx.fillRect(canvas.width - 30, 0, 30, canvas.height); // Right
        
        // Title
        ctx.fillStyle = saudiGreen;
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🇸🇦 اليوم الوطني السعودي 🇸🇦', canvas.width / 2, 150);
        
        // Year
        ctx.fillStyle = gold;
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.fillText('94', canvas.width / 2, 220);
        
        // Congratulations text
        ctx.fillStyle = saudiGreen;
        ctx.font = '32px Arial, sans-serif';
        ctx.fillText('تهنئة خاصة', canvas.width / 2, 400);
        
        // Name section
        const nameY = 550;
        const nameSize = 56;
        ctx.font = `bold ${nameSize}px Arial, sans-serif`;
        
        const textMetrics = ctx.measureText(userName);
        const textWidth = textMetrics.width;
        const padding = 40;
        
        // Name background
        ctx.fillStyle = lightGreen;
        ctx.strokeStyle = saudiGreen;
        ctx.lineWidth = 4;
        const rectX = canvas.width / 2 - (textWidth / 2) - padding;
        const rectY = nameY - 40;
        const rectWidth = textWidth + (padding * 2);
        const rectHeight = 80;
        
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        
        // User name
        ctx.fillStyle = saudiGreen;
        ctx.fillText(userName, canvas.width / 2, nameY);
        
        // Subtitle
        ctx.font = '28px Arial, sans-serif';
        ctx.fillText('كل عام وأنت بخير', canvas.width / 2, nameY + 80);
        
        // Stars decoration
        ctx.fillStyle = gold;
        ctx.font = '32px Arial, sans-serif';
        ctx.fillText('⭐', rectX - 40, nameY);
        ctx.fillText('⭐', rectX + rectWidth + 20, nameY);
        
        // Bottom messages
        ctx.fillStyle = saudiGreen;
        ctx.font = '24px Arial, sans-serif';
        ctx.fillText('بمناسبة اليوم الوطني للمملكة العربية السعودية', canvas.width / 2, 750);
        
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillText('💚 دام عزك يا وطن 💚', canvas.width / 2, 950);
        
        // Decorative circles
        ctx.fillStyle = gold;
        for (let i = 0; i < 7; i++) {
            ctx.beginPath();
            ctx.arc(100 + (i * 100), 1050, 8, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        resolve(canvas);
    });
}

// Display card in preview
function displayCard(canvas, usingOriginalDesign = false) {
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
        
        const designType = usingOriginalDesign ? 'التصميم الأصلي' : 'تصميم مخصص جميل';
        successMsg.innerHTML = `
            <div style="font-size: 1.3rem; margin-bottom: 10px;">🎉 بطاقتك جاهزة! 🎉</div>
            <div style="font-size: 1rem;">تم إنشاء البطاقة باستخدام ${designType} مع اسم "${currentUserName}"</div>
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
            link.href = window.currentCanvas.toDataURL('image/png', 1.0);
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

// Show share options (same as before)
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
        " onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
            <span style="font-size: 24px;">${option.icon}</span>
            <span>مشاركة عبر ${option.name}</span>
        </a>`
    ).join('');
    
    const popup = window.open('', '_blank', 'width=500,height=500');
    popup.document.write(`
        <html dir="rtl">
        <head><title>مشاركة البطاقة</title><meta charset="UTF-8">
        <style>body{font-family:Arial;padding:0;margin:0;background:linear-gradient(135deg,#0f5132,#198754);min-height:100vh;display:flex;align-items:center;justify-content:center}.container{background:white;padding:30px;border-radius:20px;max-width:400px;width:90%}</style>
        </head>
        <body>
            <div class="container">
                <h3 style="color:#0f5132;text-align:center;margin-bottom:25px">🎉 مشاركة البطاقة 🎉</h3>
                ${shareDialog}
                <button onclick="window.close()" style="width:100%;margin-top:25px;padding:18px;background:#666;color:white;border:none;border-radius:12px;cursor:pointer">إغلاق</button>
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
    currentUserName = '';
    originalImage = null;
    uploadedImageFile = null;
    window.currentCanvas = null;
    
    // Reset form
    nameInput.value = '';
    generateBtn.disabled = true;
    generateBtn.textContent = 'إنشاء البطاقة المخصصة';
    generateBtn.style.background = '#ccc';
    
    // Remove upload section if exists
    const uploadSection = document.getElementById('imageUploadSection');
    if (uploadSection) {
        uploadSection.remove();
    }
    
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
    
    console.log('🎉 موقع بطاقات التهنئة النهائي جاهز!');
    
    // Try to load original image, if fails, add upload option
    loadOriginalImage().then(() => {
        showTemporaryMessage('✅ تم تحميل التصميم الأصلي! أدخل اسمك الآن 🇸🇦');
    }).catch(() => {
        // Add image upload option
        addImageUploadOption();
        showTemporaryMessage('📁 لم يتم العثور على التصميم الأصلي. يمكنك رفعه أو سيتم إنشاء تصميم جميل لك');
    });
});
