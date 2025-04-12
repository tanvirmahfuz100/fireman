let allVacations = [];

// Convert numbers to Bengali digits
function toBengaliNum(num) {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => bengaliDigits[digit]).join('');
}

// Pad numbers with leading zeros and convert to Bengali
function pad(number) {
    return toBengaliNum(number.toString().padStart(2, '0'));
}

// Format date to Bengali
function formatDateToBengali(date) {
    const months = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
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
        `আজকের সময় ও তারিখ: <span class="bengali-text">${dateStr}, ${hoursBengali}:${minutes}:${seconds} ${period}</span>`;
}

// Update countdown in Bengali
function updateCountdown() {
    const now = new Date();
    const bangladeshNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));

    const upcoming = allVacations
        .map(v => {
            const vacDateStr = `${v.date}T00:00:00`;
            const vacStart = new Date(new Date(vacDateStr).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
            return { ...v, vacStart };
        })
        .filter(v => v.vacStart > bangladeshNow)
        .sort((a, b) => a.vacStart - b.vacStart);

    const countdownElement = document.getElementById('countdown');
    if (upcoming.length > 0) {
        const nextVacation = upcoming[0];
        const diffMs = nextVacation.vacStart - bangladeshNow;
        if (diffMs > 0) {
            const diffSeconds = Math.floor(diffMs / 1000);
            const days = toBengaliNum(Math.floor(diffSeconds / (3600 * 24)));
            const hours = pad(Math.floor((diffSeconds % (3600 * 24)) / 3600));
            const minutes = pad(Math.floor((diffSeconds % 3600) / 60));
            const seconds = pad(Math.floor(diffSeconds % 60));
            const vacationNameClass = nextVacation.name === "পবিত্র মাহে রমজানের ছুটি, মহান স্বাধীনতা ও জাতীয় দিবস, শবে কদর ঈদুল ফিতর" 
                ? "next-vacation" 
                : "bengali-text";
            countdownElement.innerHTML = `আগামী ছুটি <span class="${vacationNameClass}">${nextVacation.name}</span> ${days} দিন, ${hours} ঘণ্টা, ${minutes} মিনিট, ${seconds} সেকেন্ড এই সময়ের মধ্যে শুরু হবে`;
        } else {
            countdownElement.textContent = `আগামী ছুটি শুরু হয়ে গেছে!`;
        }
    } else {
        countdownElement.textContent = `কোনো আগামী ছুটি নেই।`;
    }
}

// Fetch vacations and set up intervals
fetch('/vacations')
    .then(response => response.json())
    .then(vacations => {
        allVacations = vacations;
        renderVacations();
        updateTime();
        updateCountdown();
        setInterval(() => {
            updateTime();
            updateCountdown();
        }, 1000);
    })
    .catch(error => console.error('Error fetching vacations:', error));

// Render vacations with Bengali formatting and end date
function renderVacations() {
    const now = new Date();
    const bangladeshNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));

    const upcoming = [];
    const past = [];

    allVacations.forEach(v => {
        const vacDateStr = `${v.date}T00:00:00`;
        const vacStart = new Date(new Date(vacDateStr).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
        const diffTime = vacStart - bangladeshNow;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const endDate = calculateEndDate(vacStart, v.days);
        if (diffTime > 0) {
            upcoming.push({ ...v, daysRemaining: diffDays, endDate });
        } else {
            past.push({ ...v, endDate });
        }
    });

    // Render upcoming vacations
    const upcomingBody = document.getElementById('upcoming-vacations');
    upcomingBody.innerHTML = upcoming.map(v => `
        <tr>
            <td><span class="bengali-text">${formatDateToBengali(new Date(v.date))}</span></td>
            <td><span class="bengali-text">${v.name}</span></td>
            <td><span class="bengali-text">${toBengaliNum(v.days)}</span></td>
            <td><span class="bengali-text">${formatDateToBengali(v.endDate)}</span></td>
            <td><span class="bengali-text">${toBengaliNum(v.daysRemaining)}</span></td>
        </tr>
    `).join('');

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
