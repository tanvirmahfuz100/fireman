let allVacations = [];

// Convert numbers to Bengali digits
function toBengaliNum(num) {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => 
        isNaN(digit) ? digit : bengaliDigits[parseInt(digit)]
    ).join('');
}

// Pad numbers with leading zeros and convert to Bengali
function pad(number) {
    return toBengaliNum(number.toString().padStart(2, '0'));
}

// Format date to Bengali
function formatDateToBengali(date) {
    const months = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const day = toBengaliNum(date.getDate());
    const month = months[date.getMonth()];
    const year = toBengaliNum(date.getFullYear());
    return `${day} ${month} ${year}`;
}

// Calculate end date based on start date and duration
function calculateEndDate(startDate, days) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1); // Subtract 1 since start day is inclusive
    return endDate;
}

// Determine Bengali time period based on hour
function getBengaliTimePeriod(hour) {
    if (hour >= 0 && hour < 4) return 'রাত';
    if (hour >= 4 && hour < 6) return 'ভোর';
    if (hour >= 6 && hour < 12) return 'সকাল';
    if (hour >= 12 && hour < 15) return 'দুপুর';
    if (hour >= 15 && hour < 18) return 'বিকাল';
    if (hour >= 18 && hour < 19) return 'সন্ধ্যা';
    if (hour >= 19 && hour < 24) return 'রাত';
}

// Update current time in Bengali with 12-hour format
function updateTime() {
    const now = new Date();
    const bangladeshTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    const dateStr = formatDateToBengali(bangladeshTime);
    
    let hours = bangladeshTime.getHours();
    const minutes = pad(bangladeshTime.getMinutes());
    const seconds = pad(bangladeshTime.getSeconds());
    
    const period = getBengaliTimePeriod(hours);
    hours = hours % 12 || 12;
    const hoursBengali = pad(hours);
    
    document.getElementById('current-time').innerHTML = 
        `আজকের সময় ও তারিখ: <span class="bengali-text">${dateStr}, ${hoursBengali}:${minutes}:${seconds} ${period}</span>`;
}

// Update countdown in Bengali
function updateCountdown() {
    const now = new Date();
    const bangladeshNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));

    const upcoming = allVacations
        .map(v => {
            const vacDateStr = `${v.date}T00:00:00`;
            const vacStart = new Date(new Date(vacDateStr).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
            const vacEnd = calculateEndDate(vacStart, v.days);
            return { ...v, vacStart, vacEnd };
        })
        .filter(v => v.vacEnd >= bangladeshNow)
        .sort((a, b) => a.vacStart - b.vacStart);

    const countdownElement = document.getElementById('countdown');
    if (upcoming.length > 0) {
        const nextVacation = upcoming[0];
        
        // Check if vacation is currently running
        if (nextVacation.vacStart <= bangladeshNow && nextVacation.vacEnd >= bangladeshNow) {
            countdownElement.innerHTML = `<span class="bengali-text running-vacation">ছুটি চলছে! ${nextVacation.name}</span>`;
            return;
        }

        const diffMs = nextVacation.vacStart - bangladeshNow;
        if (diffMs > 0) {
            const diffSeconds = Math.floor(diffMs / 1000);
            const days = Math.floor(diffSeconds / (3600 * 24));
            const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((diffSeconds % 3600) / 60);
            const seconds = Math.floor(diffSeconds % 60);
            
            // Convert to Bengali numbers
            const bengaliDays = toBengaliNum(days);
            const bengaliHours = pad(hours);
            const bengaliMinutes = pad(minutes);
            const bengaliSeconds = pad(seconds);
            
            const vacationNameClass = nextVacation.name.includes("পবিত্র মাহে রমজানের") 
                ? "next-vacation" 
                : "bengali-text";
                
            countdownElement.innerHTML = `আগামী ছুটি <span class="${vacationNameClass}">${nextVacation.name}</span> ${bengaliDays} দিন, ${bengaliHours} ঘণ্টা, ${bengaliMinutes} মিনিট, ${bengaliSeconds} সেকেন্ড এই সময়ের মধ্যে শুরু হবে`;
        } else {
            countdownElement.textContent = `আগামী ছুটি শুরু হয়ে গেছে!`;
        }
    } else {
        countdownElement.textContent = `কোনো আগামী ছুটি নেই।`;
    }
}

// Render vacations with Bengali formatting and end date
function renderVacations() {
    const now = new Date();
    const bangladeshNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));

    const upcoming = [];
    const past = [];
    const running = [];

    allVacations.forEach(v => {
        const vacDateStr = `${v.date}T00:00:00`;
        const vacStart = new Date(new Date(vacDateStr).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
        const endDate = calculateEndDate(vacStart, v.days);
        
        // Calculate days remaining
        const diffTime = vacStart - bangladeshNow;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Check if vacation is currently running
        if (vacStart <= bangladeshNow && endDate >= bangladeshNow) {
            running.push({ ...v, endDate, status: 'running' });
        } else if (diffTime > 0) {
            upcoming.push({ ...v, daysRemaining: diffDays, endDate });
        } else {
            past.push({ ...v, endDate });
        }
    });

    // Render upcoming vacations (including running ones at the top)
    const upcomingBody = document.getElementById('upcoming-vacations');
    
    upcomingBody.innerHTML = [...running, ...upcoming].map(v => {
        const isRunning = v.status === 'running';
        return `
            <tr ${isRunning ? 'class="running-vacation-row"' : ''}>
                <td><span class="bengali-text">${formatDateToBengali(new Date(v.date))}</span></td>
                <td><span class="bengali-text">${v.name}</span></td>
                <td><span class="bengali-text">${toBengaliNum(v.days)}</span></td>
                <td><span class="bengali-text">${formatDateToBengali(v.endDate)}</span></td>
                <td>
                    ${isRunning 
                        ? '<span class="bengali-text running-vacation">ছুটি চলছে</span>' 
                        : `<span class="bengali-text">${toBengaliNum(v.daysRemaining)}</span>`
                    }
                </td>
            </tr>
        `;
    }).join('');

    // Render past vacations
    const pastBody = document.getElementById('past-vacations-body');
    pastBody.innerHTML = past.map(v => `
        <tr class="past">
            <td><span class="bengali-text">${formatDateToBengali(new Date(v.date))}</span></td>
            <td><span class="bengali-text">${v.name}</span></td>
            <td><span class="bengali-text">${toBengaliNum(v.days)}</span></td>
            <td><span class="bengali-text">${formatDateToBengali(v.endDate)}</span></td>
        </tr>
    `).join('');
}

// Fetch vacations and set up intervals
function init() {
    console.log('Initializing vacation app...');
    fetch('/vacations')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(vacations => {
            console.log('Vacations loaded:', vacations);
            allVacations = vacations.sort((a, b) => new Date(a.date) - new Date(b.date));
            renderVacations();
            updateTime();
            updateCountdown();
            setInterval(() => {
                updateTime();
                updateCountdown();
            }, 1000);
        })
        .catch(error => {
            console.error('Error fetching vacations:', error);
            document.getElementById('countdown').innerHTML = 
                '<span style="color: red;">ছুটির তথ্য লোড করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।</span>';
        });
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
