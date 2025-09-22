// Canvas-based script for reliable card generation
// Global variables
let modifiedPdfUrl = null;
let currentUserName = '';

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

// Generate custom card using Canvas
async function generateCustomCard() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('يرجى إدخال اسمك أولاً');
        return;
    }

    try {
        showLoading(true);
        currentUserName = name;

        // Create canvas card
        const canvas = await createCanvasCard(name);
        
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
        alert('حدث خطأ في إنشاء البطاقة. سنحاول طريقة أخرى...');
        
        // Fallback to simple HTML card
        createSimpleHtmlCard(name);
        showLoading(false);
    }
}

// Create beautiful card using Canvas
async function createCanvasCard(userName) {
    return new Promise((resolve, reject) => {
        try {
            // Create canvas
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
            
            // Top border
            ctx.fillStyle = saudiGreen;
            ctx.fillRect(0, 0, canvas.width, 30);
            
            // Bottom border
            ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
            
            // Side borders
            ctx.fillRect(0, 0, 30, canvas.height);
            ctx.fillRect(canvas.width - 30, 0, 30, canvas.height);
            
            // Title
            ctx.fillStyle = saudiGreen;
            ctx.font = 'bold 48px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('اليوم الوطني السعودي', canvas.width / 2, 120);
            
            // Year
            ctx.fillStyle = gold;
            ctx.font = 'bold 36px Arial, sans-serif';
            ctx.fillText('94', canvas.width / 2, 180);
            
            // Flag area (simplified)
            const flagX = canvas.width / 2 - 80;
            const flagY = 220;
            const flagWidth = 160;
            const flagHeight = 100;
            
            // Flag background
            ctx.fillStyle = saudiGreen;
            ctx.fillRect(flagX, flagY, flagWidth, flagHeight);
            
            // Flag text area
            ctx.fillStyle = white;
            ctx.fillRect(flagX + 20, flagY + 30, flagWidth - 40, 40);
            
            // Saudi text on flag (simplified)
            ctx.fillStyle = saudiGreen;
            ctx.font = 'bold 16px Arial, sans-serif';
            ctx.fillText('لا إله إلا الله محمد رسول الله', canvas.width / 2, flagY + 55);
            
            // Congratulations text
            ctx.fillStyle = saudiGreen;
            ctx.font = '32px Arial, sans-serif';
            ctx.fillText('تهنئة خاصة', canvas.width / 2, 400);
            
            // Name section background
            const nameY = 500;
            const nameWidth = ctx.measureText(userName).width;
            const padding = 60;
            
            // Name background rectangle
            ctx.fillStyle = lightGreen;
            ctx.strokeStyle = saudiGreen;
            ctx.lineWidth = 4;
            const rectX = canvas.width / 2 - (nameWidth / 2) - padding;
            const rectY = nameY - 40;
            const rectWidth = nameWidth + (padding * 2);
            const rectHeight = 80;
            
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
            ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
            
            // User name
            ctx.fillStyle = saudiGreen;
            ctx.font = 'bold 56px Arial, sans-serif';
            ctx.fillText(userName, canvas.width / 2, nameY);
            
            // Subtitle
            ctx.fillStyle = saudiGreen;
            ctx.font = '28px Arial, sans-serif';
            ctx.fillText('كل عام وأنت بخير', canvas.width / 2, nameY + 80);
            
            // Stars decoration
            ctx.fillStyle = gold;
            ctx.font = '32px Arial, sans-serif';
            ctx.fillText('⭐', rectX - 40, nameY);
            ctx.fillText('⭐', rectX + rectWidth + 20, nameY);
            
            // Patriotic message
            ctx.fillStyle = saudiGreen;
            ctx.font = '24px Arial, sans-serif';
            ctx.fillText('بمناسبة اليوم الوطني للمملكة العربية السعودية', canvas.width / 2, 680);
            
            // Bottom message
            ctx.fillStyle = saudiGreen;
            ctx.font = 'bold 32px Arial, sans-serif';
            ctx.fillText('دام عزك يا وطن', canvas.width / 2, 900);
            
            // Hearts decoration
            ctx.fillStyle = saudiGreen;
            ctx.font = '28px Arial, sans-serif';
            ctx.fillText('💚', canvas.width / 2 - 200, 900);
            ctx.fillText('💚', canvas.width / 2 + 180, 900);
            
            // Decorative circles at bottom
            ctx.fillStyle = gold;
            for (let i = 0; i < 7; i++) {
                ctx.beginPath();
                ctx.arc(100 + (i * 100), 1050, 8, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            // Year at bottom
            ctx.fillStyle = saudiGreen;
            ctx.font = '20px Arial, sans-serif';
            ctx.fillText('2024 - 1446', canvas.width / 2, 1120);
            
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
            <div style="font-size: 1.3rem; margin-bottom: 10px;">🎉 بطاقتك جاهزة! 🎉</div>
            <div style="font-size: 1rem;">بطاقة تهنئة مخصصة باسم "${currentUserName}" بمناسبة اليوم الوطني السعودي</div>
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
        `;
        
        // Style the canvas
        canvas.style.cssText = `
            max-width: 100%;
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

// Fallback: Create simple HTML card
function createSimpleHtmlCard(userName) {
    // Clear previous preview
    pdfPreview.innerHTML = '';
    
    // Create HTML card
    const htmlCard = document.createElement('div');
    htmlCard.style.cssText = `
        background: linear-gradient(135deg, #f8f9fa, #e8f5e8);
        border: 5px solid #0f5132;
        border-radius: 20px;
        padding: 60px 40px;
        text-align: center;
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 20px auto;
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
    `;
    
    htmlCard.innerHTML = `
        <div style="border-bottom: 3px solid #0f5132; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #0f5132; font-size: 2.5rem; margin: 0; font-weight: bold;">🇸🇦</h1>
            <h2 style="color: #0f5132; font-size: 1.8rem; margin: 10px 0; font-weight: bold;">اليوم الوطني السعودي</h2>
            <p style="color: #FFD700; font-size: 1.3rem; font-weight: bold; margin: 0;">94</p>
        </div>
        
        <div style="margin: 40px 0;">
            <p style="color: #0f5132; font-size: 1.2rem; margin-bottom: 20px;">تهنئة خاصة</p>
            <div style="background: white; border: 3px solid #0f5132; border-radius: 15px; padding: 25px; margin: 20px 0;">
                <h3 style="color: #0f5132; font-size: 2.2rem; margin: 0; font-weight: bold;">${userName}</h3>
            </div>
            <p style="color: #0f5132; font-size: 1.1rem; margin-top: 20px;">⭐ كل عام وأنت بخير ⭐</p>
        </div>
        
        <div style="border-top: 3px solid #0f5132; padding-top: 20px; margin-top: 30px;">
            <p style="color: #0f5132; font-size: 1rem; margin: 10px 0;">بمناسبة اليوم الوطني للمملكة العربية السعودية</p>
            <h4 style="color: #0f5132; font-size: 1.4rem; margin: 20px 0; font-weight: bold;">💚 دام عزك يا وطن 💚</h4>
            <p style="color: #666; font-size: 0.9rem; margin: 0;">2024 - 1446</p>
        </div>
    `;
    
    pdfPreview.appendChild(htmlCard);
    
    // Store HTML card for download
    window.currentHtmlCard = htmlCard;
    
    // Show preview section
    previewSection.style.display = 'block';
    document.getElementById('nameSection').style.display = 'none';
    
    showTemporaryMessage(`✅ تم إنشاء بطاقة HTML باسم "${userName}" بنجاح!`);
}

// Download card (Canvas or HTML)
function downloadCard() {
    try {
        if (window.currentCanvas) {
            // Download canvas as image
            const link = document.createElement('a');
            link.download = `بطاقة_تهنئة_${currentUserName}_اليوم_الوطني.png`;
            link.href = window.currentCanvas.toDataURL();
            link.click();
            showTemporaryMessage('تم تحميل البطاقة كصورة! 📥');
        } else if (window.currentHtmlCard) {
            // Download HTML card (print to PDF)
            window.print();
            showTemporaryMessage('يمكنك حفظ الصفحة كـ PDF من خيارات الطباعة! 📄');
        } else {
            alert('لا توجد بطاقة للتحميل');
        }
    } catch (error) {
        console.error('Error downloading:', error);
        alert('حدث خطأ في التحميل. جرب الطباعة بدلاً من ذلك.');
    }
}

// Print card
function printCard() {
    try {
        if (window.currentCanvas || window.currentHtmlCard) {
            window.print();
            showTemporaryMessage('تم فتح نافذة الطباعة! 🖨️');
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
            // Convert canvas to blob and share
            window.currentCanvas.toBlob(async (blob) => {
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
            });
        } else {
            showShareOptions();
        }
    } catch (error) {
        console.error('Error sharing:', error);
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
    if (modifiedPdfUrl) {
        URL.revokeObjectURL(modifiedPdfUrl);
        modifiedPdfUrl = null;
    }
    currentUserName = '';
    window.currentCanvas = null;
    window.currentHtmlCard = null;
    
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
    
    console.log('🎉 موقع بطاقات التهنئة (Canvas) جاهز!');
    
    setTimeout(() => {
        showTemporaryMessage('أهلاً بك! أدخل اسمك لإنشاء بطاقة التهنئة 🇸🇦');
    }, 1000);
});
