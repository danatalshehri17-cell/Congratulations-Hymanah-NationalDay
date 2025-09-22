// Direct script - uses card.png automatically
let cardImage = null;
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

// Try to load the card image
function loadCardImage() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            cardImage = img;
            console.log('Card image loaded successfully');
            resolve(img);
        };
        
        img.onerror = function() {
            reject(new Error('لم يتم العثور على card.png'));
        };
        
        img.src = './card.png'; // Simple filename
    });
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
    generateBtn.disabled = name.length === 0;
    
    if (name.length > 0) {
        generateBtn.textContent = `اكتب "${name}" على البطاقة`;
        generateBtn.style.background = 'linear-gradient(135deg, #0f5132, #198754)';
    } else {
        generateBtn.textContent = 'أدخل الاسم';
        generateBtn.style.background = '#ccc';
    }
}

// Generate custom card
async function generateCustomCard() {
    const name = nameInput.value.trim();
    if (!name) return;

    try {
        showLoading(true);
        currentUserName = name;

        // Use the loaded card image
        if (!cardImage) {
            throw new Error('البطاقة غير محملة');
        }

        // Create canvas with name
        const canvas = await addNameToCard(cardImage, name);
        
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
        alert('خطأ: ' + error.message);
    }
}

// Add name to card
async function addNameToCard(img, userName) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Match image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original card
        ctx.drawImage(img, 0, 0);
        
        // Setup text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Font size based on image
        const fontSize = Math.min(img.width, img.height) * 0.07;
        
        // Position - adjust these to match where "هيمنة" appears
        const nameX = img.width * 0.5;   // Center
        const nameY = img.height * 0.72; // Adjust this percentage
        
        // Set font
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        
        // Measure text
        const textWidth = ctx.measureText(userName).width;
        const padding = 20;
        
        // White background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
            nameX - (textWidth / 2) - padding,
            nameY - (fontSize / 2) - 10,
            textWidth + (padding * 2),
            fontSize + 20
        );
        
        // Green border
        ctx.strokeStyle = '#0f5132';
        ctx.lineWidth = 3;
        ctx.strokeRect(
            nameX - (textWidth / 2) - padding,
            nameY - (fontSize / 2) - 10,
            textWidth + (padding * 2),
            fontSize + 20
        );
        
        // Write name
        ctx.fillStyle = '#0f5132';
        ctx.fillText(userName, nameX, nameY);
        
        resolve(canvas);
    });
}

// Display card
function displayCard(canvas) {
    pdfPreview.innerHTML = '';
    
    // Success message
    const msg = document.createElement('div');
    msg.style.cssText = `
        background: #d1eddb; color: #155724; padding: 20px; 
        border-radius: 15px; margin-bottom: 20px; text-align: center; 
        font-weight: 600; border: 2px solid #c3e6cb;
    `;
    msg.innerHTML = `🎉 تم كتابة "${currentUserName}" على البطاقة الأصلية!`;
    pdfPreview.appendChild(msg);
    
    // Canvas container
    const container = document.createElement('div');
    container.style.cssText = `
        background: white; padding: 20px; border-radius: 15px; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.15); text-align: center;
    `;
    
    // Style canvas
    canvas.style.cssText = `
        max-width: 100%; max-height: 80vh; border-radius: 10px; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.2); cursor: pointer;
    `;
    
    // Click to zoom
    let zoomed = false;
    canvas.addEventListener('click', () => {
        if (!zoomed) {
            canvas.style.maxWidth = 'none';
            canvas.style.maxHeight = 'none';
            zoomed = true;
        } else {
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '80vh';
            zoomed = false;
        }
    });
    
    container.appendChild(canvas);
    pdfPreview.appendChild(container);
    
    // Store for download
    window.currentCanvas = canvas;
    
    // Another name button
    const anotherBtn = document.createElement('button');
    anotherBtn.textContent = '✏️ اكتب اسم آخر';
    anotherBtn.style.cssText = `
        background: #17a2b8; color: white; border: none; 
        padding: 15px 25px; border-radius: 25px; font-weight: 600; 
        cursor: pointer; margin-top: 15px;
    `;
    anotherBtn.addEventListener('click', () => {
        document.getElementById('nameSection').style.display = 'block';
        previewSection.style.display = 'none';
        nameInput.value = '';
        nameInput.focus();
    });
    container.appendChild(anotherBtn);
}

// Simple functions
function downloadCard() {
    if (window.currentCanvas) {
        const link = document.createElement('a');
        link.download = `بطاقة_${currentUserName}.png`;
        link.href = window.currentCanvas.toDataURL('image/png', 1.0);
        link.click();
        showTemporaryMessage('📥 تم التحميل!');
    }
}

function printCard() {
    if (window.currentCanvas) {
        const win = window.open('', '_blank');
        win.document.write(`<html><body style="margin:0;text-align:center;"><img src="${window.currentCanvas.toDataURL()}" style="max-width:100%;"></body></html>`);
        win.document.close();
        win.onload = () => win.print();
    }
}

function shareCard() {
    if (window.currentCanvas) {
        window.currentCanvas.toBlob(async (blob) => {
            if (navigator.share) {
                await navigator.share({
                    files: [new File([blob], `بطاقة_${currentUserName}.png`, { type: 'image/png' })]
                });
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent('بطاقة تهنئة 🇸🇦')}`, '_blank');
            }
        });
    }
}

function resetApp() {
    currentUserName = '';
    nameInput.value = '';
    document.getElementById('nameSection').style.display = 'block';
    previewSection.style.display = 'none';
    nameInput.focus();
}

function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

function showTemporaryMessage(message) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; top: 30px; right: 30px; background: #d1eddb; 
        color: #155724; padding: 15px 25px; border-radius: 15px; 
        z-index: 1001; font-weight: 600; transform: translateX(100%); 
        transition: transform 0.3s;
    `;
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => div.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        div.style.transform = 'translateX(100%)';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    generateBtn.disabled = true;
    nameInput.focus();
    
    // Try to load card image
    loadCardImage().then(() => {
        showTemporaryMessage('✅ تم تحميل البطاقة! اكتب الاسم الآن');
        nameInput.disabled = false;
    }).catch(() => {
        showTemporaryMessage('⚠️ لم يتم العثور على card.png - غير اسم الملف إلى card.png');
        nameInput.disabled = true;
        nameInput.placeholder = 'غير اسم الملف إلى card.png أولاً...';
    });
});
