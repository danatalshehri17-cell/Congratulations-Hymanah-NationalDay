// Fixed script with embedded PDF template
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
downloadBtn.addEventListener('click', downloadPdf);
printBtn.addEventListener('click', printPdf);
shareBtn.addEventListener('click', sharePdf);
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

// Generate custom card with built-in template
async function generateCustomCard() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('يرجى إدخال اسمك أولاً');
        return;
    }

    try {
        showLoading(true);
        currentUserName = name;

        // Create PDF directly without external template
        const pdfBytes = await createNationalDayCard(name);
        
        // Create blob URL for the PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        if (modifiedPdfUrl) {
            URL.revokeObjectURL(modifiedPdfUrl);
        }
        modifiedPdfUrl = URL.createObjectURL(blob);

        // Display the PDF
        await displayPdf(modifiedPdfUrl);
        
        // Show preview section
        previewSection.style.display = 'block';
        
        // Hide name input section
        document.getElementById('nameSection').style.display = 'none';
        
        showLoading(false);
        
        // Show success message
        showTemporaryMessage(`🎉 تم إنشاء بطاقة التهنئة باسم "${name}" بنجاح!`);
        
    } catch (error) {
        console.error('Error generating custom card:', error);
        alert('حدث خطأ في إنشاء البطاقة. تفاصيل الخطأ: ' + error.message);
        showLoading(false);
    }
}

// Create a beautiful National Day card from scratch
async function createNationalDayCard(userName) {
    try {
        // Create new PDF document
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        // Add a page (A4 size)
        const page = pdfDoc.addPage([595, 842]); // A4 size in points
        const { width, height } = page.getSize();
        
        // Embed font
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
        
        // Colors
        const saudiGreen = PDFLib.rgb(0.059, 0.318, 0.196); // #0f5132
        const gold = PDFLib.rgb(1, 0.84, 0);
        const white = PDFLib.rgb(1, 1, 1);
        const lightGreen = PDFLib.rgb(0.8, 0.95, 0.87);
        
        // Background gradient effect (simulate with rectangles)
        for (let i = 0; i < 20; i++) {
            const opacity = 0.1 - (i * 0.005);
            page.drawRectangle({
                x: 0,
                y: height - (i * 42),
                width: width,
                height: 42,
                color: saudiGreen,
                opacity: opacity,
            });
        }
        
        // Top decorative border
        page.drawRectangle({
            x: 0,
            y: height - 20,
            width: width,
            height: 20,
            color: saudiGreen,
        });
        
        // Bottom decorative border  
        page.drawRectangle({
            x: 0,
            y: 0,
            width: width,
            height: 20,
            color: saudiGreen,
        });
        
        // Side decorative borders
        page.drawRectangle({
            x: 0,
            y: 0,
            width: 20,
            height: height,
            color: saudiGreen,
        });
        
        page.drawRectangle({
            x: width - 20,
            y: 0,
            width: 20,
            height: height,
            color: saudiGreen,
        });
        
        // Main title
        const titleText = 'اليوم الوطني السعودي';
        const titleSize = 36;
        const titleWidth = boldFont.widthOfTextAtSize(titleText, titleSize);
        
        page.drawText(titleText, {
            x: (width - titleWidth) / 2,
            y: height - 120,
            size: titleSize,
            font: boldFont,
            color: saudiGreen,
        });
        
        // Year - you can update this
        const yearText = '94';
        const yearSize = 28;
        const yearWidth = boldFont.widthOfTextAtSize(yearText, yearSize);
        
        page.drawText(yearText, {
            x: (width - yearWidth) / 2,
            y: height - 160,
            size: yearSize,
            font: boldFont,
            color: gold,
        });
        
        // Decorative elements around title
        const starSize = 20;
        page.drawText('⭐', {
            x: (width - titleWidth) / 2 - 40,
            y: height - 120,
            size: starSize,
            color: gold,
        });
        
        page.drawText('⭐', {
            x: (width + titleWidth) / 2 + 20,
            y: height - 120,
            size: starSize,
            color: gold,
        });
        
        // Saudi flag emoji area (simulated with rectangles)
        const flagY = height - 250;
        const flagWidth = 100;
        const flagHeight = 60;
        const flagX = (width - flagWidth) / 2;
        
        // Flag background (green)
        page.drawRectangle({
            x: flagX,
            y: flagY,
            width: flagWidth,
            height: flagHeight,
            color: saudiGreen,
        });
        
        // Flag text area (white)
        page.drawRectangle({
            x: flagX + 10,
            y: flagY + 20,
            width: flagWidth - 20,
            height: 20,
            color: white,
        });
        
        // Congratulations message
        const congrats = 'تهنئة خاصة';
        const congratsSize = 24;
        const congratsWidth = font.widthOfTextAtSize(congrats, congratsSize);
        
        page.drawText(congrats, {
            x: (width - congratsWidth) / 2,
            y: height - 320,
            size: congratsSize,
            font: font,
            color: saudiGreen,
        });
        
        // Main name section
        const nameY = height - 420;
        const nameSize = 42;
        const nameWidth = boldFont.widthOfTextAtSize(userName, nameSize);
        const nameX = (width - nameWidth) / 2;
        
        // Name background
        const namePadding = 30;
        page.drawRectangle({
            x: nameX - namePadding,
            y: nameY - namePadding/2,
            width: nameWidth + (namePadding * 2),
            height: nameSize + namePadding,
            color: lightGreen,
            borderColor: saudiGreen,
            borderWidth: 3,
        });
        
        // Name text
        page.drawText(userName, {
            x: nameX,
            y: nameY,
            size: nameSize,
            font: boldFont,
            color: saudiGreen,
        });
        
        // Subtitle
        const subtitle = 'كل عام وأنت بخير';
        const subtitleSize = 20;
        const subtitleWidth = font.widthOfTextAtSize(subtitle, subtitleSize);
        
        page.drawText(subtitle, {
            x: (width - subtitleWidth) / 2,
            y: nameY - 60,
            size: subtitleSize,
            font: font,
            color: saudiGreen,
        });
        
        // Decorative stars around name
        page.drawText('⭐', {
            x: nameX - namePadding - 30,
            y: nameY,
            size: 18,
            color: gold,
        });
        
        page.drawText('⭐', {
            x: nameX + nameWidth + namePadding + 10,
            y: nameY,
            size: 18,
            color: gold,
        });
        
        // Patriotic message
        const patrioticMsg = 'بمناسبة اليوم الوطني للمملكة العربية السعودية';
        const patrioticSize = 16;
        const patrioticWidth = font.widthOfTextAtSize(patrioticMsg, patrioticSize);
        
        page.drawText(patrioticMsg, {
            x: (width - patrioticWidth) / 2,
            y: height - 520,
            size: patrioticSize,
            font: font,
            color: saudiGreen,
        });
        
        // Bottom message
        const bottomMsg = 'دام عزك يا وطن';
        const bottomSize = 22;
        const bottomWidth = boldFont.widthOfTextAtSize(bottomMsg, bottomSize);
        
        page.drawText(bottomMsg, {
            x: (width - bottomWidth) / 2,
            y: 100,
            size: bottomSize,
            font: boldFont,
            color: saudiGreen,
        });
        
        // Decorative elements at bottom
        const heartSize = 16;
        page.drawText('💚', {
            x: (width - bottomWidth) / 2 - 30,
            y: 100,
            size: heartSize,
            color: saudiGreen,
        });
        
        page.drawText('💚', {
            x: (width + bottomWidth) / 2 + 15,
            y: 100,
            size: heartSize,
            color: saudiGreen,
        });
        
        // Add some decorative circles
        for (let i = 0; i < 5; i++) {
            page.drawCircle({
                x: 80 + (i * 100),
                y: 60,
                size: 5,
                color: gold,
                opacity: 0.6,
            });
        }
        
        // Save and return PDF
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
        
    } catch (error) {
        console.error('Error creating National Day card:', error);
        throw new Error('فشل في إنشاء بطاقة التهنئة: ' + error.message);
    }
}

// Display PDF in preview
async function displayPdf(pdfUrl) {
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
        
        // Create iframe to display PDF
        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.style.cssText = `
            width: 100%;
            height: 700px;
            border: none;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            background: white;
        `;
        
        pdfPreview.appendChild(iframe);
        
    } catch (error) {
        console.error('Error displaying PDF:', error);
        pdfPreview.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">حدث خطأ في عرض البطاقة</p>';
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

// Share PDF
async function sharePdf() {
    if (!modifiedPdfUrl) {
        alert('لا توجد بطاقة للمشاركة');
        return;
    }

    try {
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
        " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)'">
            <span style="font-size: 24px;">${option.icon}</span>
            <span>مشاركة عبر ${option.name}</span>
        </a>`
    ).join('');
    
    const popup = window.open('', '_blank', 'width=500,height=600,scrollbars=yes');
    popup.document.write(`
        <html dir="rtl">
        <head>
            <title>مشاركة البطاقة</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: 'Arial', sans-serif; 
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
                h3 { 
                    color: #0f5132; 
                    text-align: center; 
                    margin-bottom: 25px;
                    font-size: 1.4rem;
                    margin-top: 0;
                }
                .close-btn {
                    width: 100%;
                    margin-top: 25px; 
                    padding: 18px; 
                    background: #666; 
                    color: white; 
                    border: none; 
                    border-radius: 12px; 
                    cursor: pointer;
                    font-size: 1.1rem;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .close-btn:hover {
                    background: #555;
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h3>🎉 مشاركة بطاقة التهنئة 🎉</h3>
                ${shareDialog}
                <button class="close-btn" onclick="window.close()">إغلاق</button>
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
    
    // Animate in
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 400);
    }, 4000);
}

// Reset app to start over
function resetApp() {
    // Clear data
    if (modifiedPdfUrl) {
        URL.revokeObjectURL(modifiedPdfUrl);
        modifiedPdfUrl = null;
    }
    currentUserName = '';
    
    // Reset form
    nameInput.value = '';
    generateBtn.disabled = true;
    generateBtn.textContent = 'إنشاء البطاقة المخصصة';
    generateBtn.style.background = '#ccc';
    
    // Reset UI
    document.getElementById('nameSection').style.display = 'block';
    previewSection.style.display = 'none';
    pdfPreview.innerHTML = '';
    
    // Focus on name input
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
    nameInput.focus(); // Focus on name input immediately
    
    console.log('🎉 موقع بطاقات التهنئة جاهز للاستخدام!');
    
    // Show welcome message
    setTimeout(() => {
        showTemporaryMessage('أهلاً بك! أدخل اسمك لإنشاء بطاقة التهنئة 🇸🇦');
    }, 1000);
});
