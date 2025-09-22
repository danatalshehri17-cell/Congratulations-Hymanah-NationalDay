// Direct script - uses card.png directly
let cardImage = null;
let currentUserName = '';
const CARD_IMAGE = 'card.png'; // Simple filename

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

// Add image upload section
function addImageUpload() {
    const nameSection = document.getElementById('nameSection');
    const nameBox = nameSection.querySelector('.name-input-box');
    
    const uploadHTML = `
        <div id="imageUploadArea" style="
            background: #f8f9fa;
            border: 3px dashed #0f5132;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            text-align: center;
            transition: all 0.3s;
        ">
            <div style="font-size: 3rem; margin-bottom: 15px;">📷</div>
            <h3 style="color: #0f5132; margin-bottom: 10px;">ارفع صورة البطاقة</h3>
            <p style="color: #666; margin-bottom: 20px;">ارفع صورة "تهنئة هيمنة باليوم الوطني.png" مرة واحدة فقط</p>
            <input type="file" id="imageUpload" accept="image/*" style="display: none;">
            <label for="imageUpload" style="
                background: linear-gradient(135deg, #0f5132, #198754);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                cursor: pointer;
                display: inline-block;
                font-weight: 600;
                transition: all 0.3s;
                box-shadow: 0 5px 15px rgba(15, 81, 50, 0.3);
            ">
                📁 اختر صورة البطاقة
            </label>
            <div id="uploadStatus" style="margin-top: 15px; font-weight: 600;"></div>
        </div>
    `;
    
    nameBox.insertAdjacentHTML('afterbegin', uploadHTML);
    
    // Handle file upload
    const imageUpload = document.getElementById('imageUpload');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadArea = document.getElementById('imageUploadArea');
    
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    uploadedImage = img;
                    uploadStatus.style.color = '#155724';
                    uploadStatus.innerHTML = `✅ تم تحميل الصورة بنجاح!<br><small>الآن يمكنك كتابة أي اسم عليها</small>`;
                    uploadArea.style.background = '#d1eddb';
                    uploadArea.style.borderColor = '#c3e6cb';
                    
                    // Enable name input
                    nameInput.disabled = false;
                    nameInput.focus();
                    validateInput();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            uploadStatus.style.color = '#721c24';
            uploadStatus.textContent = '❌ يرجى اختيار ملف صورة صحيح';
        }
    });
    
    // Disable name input until image is uploaded
    nameInput.disabled = true;
    nameInput.placeholder = 'ارفع الصورة أولاً...';
}

// Event Listeners
generateBtn.addEventListener('click', generateCustomCard);
nameInput.addEventListener('input', validateInput);
nameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !generateBtn.disabled) {
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
    const hasImage = uploadedImage !== null;
    
    generateBtn.disabled = !hasImage || name.length === 0;
    
    if (!hasImage) {
        generateBtn.textContent = 'ارفع الصورة أولاً';
        generateBtn.style.background = '#ccc';
    } else if (name.length > 0) {
        generateBtn.textContent = `اكتب "${name}" على البطاقة`;
        generateBtn.style.background = 'linear-gradient(135deg, #0f5132, #198754)';
    } else {
        generateBtn.textContent = 'أدخل الاسم لكتابته على البطاقة';
        generateBtn.style.background = '#ccc';
    }
}

// Generate custom card
async function generateCustomCard() {
    const name = nameInput.value.trim();
    if (!name || !uploadedImage) {
        return;
    }

    try {
        showLoading(true);
        currentUserName = name;

        // Create canvas with name on image
        const canvas = await addNameToImage(uploadedImage, name);
        
        // Display result
        displayCard(canvas);
        
        // Show preview section
        previewSection.style.display = 'block';
        document.getElementById('nameSection').style.display = 'none';
        
        showLoading(false);
        showTemporaryMessage(`🎉 تم كتابة "${name}" على البطاقة!`);
        
    } catch (error) {
        console.error('Error:', error);
        showLoading(false);
        alert('حدث خطأ: ' + error.message);
    }
}

// Add name to image
async function addNameToImage(img, userName) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Setup text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate font size (adjust this percentage as needed)
        const fontSize = Math.min(img.width, img.height) * 0.08;
        
        // Position (adjust these percentages to change position)
        const nameX = img.width * 0.5;  // Center horizontally
        const nameY = img.height * 0.75; // 75% down from top
        
        // Set font
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        
        // Measure text
        const textMetrics = ctx.measureText(userName);
        const textWidth = textMetrics.width;
        const padding = 25;
        
        // Background rectangle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
            nameX - (textWidth / 2) - padding,
            nameY - (fontSize / 2) - (padding/2),
            textWidth + (padding * 2),
            fontSize + padding
        );
        
        // Border
        ctx.strokeStyle = '#0f5132';
        ctx.lineWidth = 3;
        ctx.strokeRect(
            nameX - (textWidth / 2) - padding,
            nameY - (fontSize / 2) - (padding/2),
            textWidth + (padding * 2),
            fontSize + padding
        );
        
        // Text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Main text
        ctx.fillStyle = '#0f5132';
        ctx.fillText(userName, nameX, nameY);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Subtitle
        const subtitleY = nameY + (fontSize * 0.8);
        const subtitleSize = fontSize * 0.4;
        ctx.font = `${subtitleSize}px Arial, sans-serif`;
        ctx.fillText('كل عام وأنت بخير', nameX, subtitleY);
        
        // Stars
        const starSize = fontSize * 0.5;
        ctx.font = `${starSize}px Arial, sans-serif`;
        ctx.fillStyle = '#FFD700';
        ctx.fillText('⭐', nameX - (textWidth / 2) - padding - 15, nameY);
        ctx.fillText('⭐', nameX + (textWidth / 2) + padding + 15, nameY);
        
        resolve(canvas);
    });
}

// Display card
function displayCard(canvas) {
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
    `;
    successMsg.innerHTML = `
        <div style="font-size: 1.4rem; margin-bottom: 10px;">🎉 تم بنجاح! 🎉</div>
        <div style="font-size: 1.1rem;">تم كتابة "${currentUserName}" على البطاقة</div>
    `;
    pdfPreview.appendChild(successMsg);
    
    // Card container
    const cardContainer = document.createElement('div');
    cardContainer.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        text-align: center;
    `;
    
    // Style canvas
    canvas.style.cssText = `
        max-width: 100%;
        max-height: 80vh;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        cursor: pointer;
    `;
    
    // Click to zoom
    let isZoomed = false;
    canvas.addEventListener('click', function() {
        if (!isZoomed) {
            canvas.style.maxWidth = 'none';
            canvas.style.maxHeight = 'none';
            isZoomed = true;
            showTemporaryMessage('🔍 تم التكبير - اضغط مرة أخرى للتصغير');
        } else {
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '80vh';
            isZoomed = false;
            showTemporaryMessage('🔍 تم التصغير');
        }
    });
    
    cardContainer.appendChild(canvas);
    pdfPreview.appendChild(cardContainer);
    
    // Store for download
    window.currentCanvas = canvas;
    
    // Add another name button
    const anotherNameBtn = document.createElement('button');
    anotherNameBtn.textContent = '✏️ كتابة اسم آخر على نفس البطاقة';
    anotherNameBtn.style.cssText = `
        background: linear-gradient(135deg, #17a2b8, #138496);
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
        transition: all 0.3s;
    `;
    anotherNameBtn.addEventListener('click', function() {
        // Go back to name input without losing the uploaded image
        document.getElementById('nameSection').style.display = 'block';
        previewSection.style.display = 'none';
        nameInput.value = '';
        nameInput.focus();
        validateInput();
    });
    cardContainer.appendChild(anotherNameBtn);
}

// Download, print, share functions (same as before but simplified)
function downloadCard() {
    if (window.currentCanvas) {
        const link = document.createElement('a');
        link.download = `بطاقة_تهنئة_${currentUserName}.png`;
        link.href = window.currentCanvas.toDataURL('image/png', 1.0);
        link.click();
        showTemporaryMessage('📥 تم التحميل!');
    }
}

function printCard() {
    if (window.currentCanvas) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>طباعة البطاقة</title></head>
            <body style="margin:0;padding:20px;text-align:center;">
                <img src="${window.currentCanvas.toDataURL()}" style="max-width:100%;">
            </body></html>
        `);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
        showTemporaryMessage('🖨️ تم فتح الطباعة!');
    }
}

function shareCard() {
    if (window.currentCanvas) {
        window.currentCanvas.toBlob(async (blob) => {
            if (navigator.share) {
                const file = new File([blob], `بطاقة_${currentUserName}.png`, { type: 'image/png' });
                await navigator.share({
                    title: 'بطاقة تهنئة',
                    files: [file]
                });
            } else {
                const whatsapp = `https://wa.me/?text=${encodeURIComponent('بطاقة تهنئة باليوم الوطني 🇸🇦')}`;
                window.open(whatsapp, '_blank');
            }
            showTemporaryMessage('📱 تم فتح المشاركة!');
        });
    }
}

function resetApp() {
    uploadedImage = null;
    currentUserName = '';
    window.currentCanvas = null;
    
    nameInput.value = '';
    nameInput.disabled = true;
    nameInput.placeholder = 'ارفع الصورة أولاً...';
    
    document.getElementById('nameSection').style.display = 'block';
    previewSection.style.display = 'none';
    
    // Reset upload area
    const uploadArea = document.getElementById('imageUploadArea');
    if (uploadArea) {
        uploadArea.style.background = '#f8f9fa';
        uploadArea.style.borderColor = '#0f5132';
        document.getElementById('uploadStatus').innerHTML = '';
        document.getElementById('imageUpload').value = '';
    }
    
    validateInput();
    showTemporaryMessage('🔄 تم إعادة التعيين!');
}

function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

function showTemporaryMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: linear-gradient(135deg, #d1eddb, #c3e6cb);
        color: #155724;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    addImageUpload();
    validateInput();
    
    showTemporaryMessage('📷 ارفع صورة البطاقة أولاً، ثم اكتب أي اسم عليها!');
});
