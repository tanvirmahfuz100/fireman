let schedule = {};
let vacations = [];

function getBangladeshTime() {
    return new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
}

function updateClock() {
    const options = { 
        timeZone: 'Asia/Dhaka',
        hour12: false,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const formatter = new Intl.DateTimeFormat('bn-BD', options);
    const banglaTime = formatter.format(new Date());
    document.getElementById('real-time-clock').innerHTML = `
        <h3>বর্তমান সময়: ${banglaTime}</h3>
    `;
    
    // Refresh every second
    currentDate = new Date(getBangladeshTime());
    refreshDisplay();
}

function isWeekend() {
    const day = new Date(getBangladeshTime()).getDay();
    return day === 5 || day === 6; // 5 = Friday, 6 = Saturday
}

function getTimeLabel(hour) {
    if ((hour >= 0 && hour < 4) || (hour >= 19 && hour <= 23)) {
        return 'রাত';
    } else if (hour >= 4 && hour < 6) {
        return 'ভোর';
    } else if (hour >= 6 && hour < 12) {
        return 'সকাল';
    } else if (hour >= 12 && hour < 15) {
        return 'দুপুর';
    } else if (hour >= 15 && hour < 18) {
        return 'বিকাল';
    } else {
        return 'সন্ধ্যা';
    }
}

function toBengaliDigits(number) {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return number.toString().split('').map(digit => bengaliDigits[digit] || digit).join('');
}

function formatTimeToBengali(timeString) {
    const [hourStr, minuteStr] = timeString.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    const label = getTimeLabel(hour);
    
    let displayHour = hour;
    if (hour > 12) {
        displayHour = hour - 12;
    } else if (hour === 0) {
        displayHour = 12;
    }
    
    return `${label} ${toBengaliDigits(displayHour)}ঃ${toBengaliDigits(minute.toString().padStart(2, '0'))}`;
}

function formatRemainingTime(totalSeconds) {
    if (totalSeconds <= 0) return 'এখনই';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let parts = [];
    if (hours > 0) parts.push(`${toBengaliDigits(hours)} ঘন্টা`);
    if (minutes > 0) parts.push(`${toBengaliDigits(minutes)} মিনিট`);
    if (seconds > 0 || parts.length === 0) parts.push(`${toBengaliDigits(seconds)} সেকেন্ড`);
    
    return parts.join(' ');
}

function getNextBus(routeKey) {
    const route = schedule[routeKey];
    const now = new Date(getBangladeshTime());
    let nextBus = null;
    let minTimeDiff = Infinity;
    
    route.tables.forEach(table => {
        table.rows.forEach(row => {
            const [time, location, bus] = row;
            const [hour, minute] = time.split(':').map(Number);
            const rowDate = new Date(now);
            rowDate.setFullYear(2025); // Force 2025 year
            rowDate.setHours(hour, minute, 0, 0);
            
            // Handle next day
            if (rowDate < now) rowDate.setDate(rowDate.getDate() + 1);
            
            const timeDiff = rowDate - now;
            if (timeDiff > 0 && timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextBus = { time, location, bus, rowDate };
            }
        });
    });
    
    return nextBus ? 
        `${nextBus.bus} ছাড়বে ${formatTimeToBengali(nextBus.time)} এ, আর ${formatRemainingTime(Math.ceil(minTimeDiff/1000))} এর মধ্যে।` : 
        'আজ আর কোন বাস নেই।';
}

function generateSchedule(isVacation) {
    let html = '';
    Object.keys(schedule).forEach(routeKey => {
        const route = schedule[routeKey];
        html += `<div class="route-card" id="${routeKey}">
            <div class="route-header">
                <h3 class="route-name">${route.name.split(':')[0].trim()}</h3>
            </div>`;
        
        route.tables.forEach(table => {
            html += `<div class="schedule-table"><h4>${table.title}</h4><table>
                <tr>${table.headers.map(h => `<th>${h}</th>`).join('')}<th>স্ট্যাটাস</th></tr>`;
            
            table.rows.forEach(row => {
                const [time, location, bus] = row;
                const displayTime = isVacation ? '-' : formatTimeToBengali(time);
                const status = isVacation ? '-' : 
                    (new Date(2025, currentDate.getMonth(), currentDate.getDate(), 
                     ...time.split(':').map(Number)) < currentDate ? 'চলে গেছে' : 'যাবে';
                
                html += `<tr>
                    <td>${displayTime}</td>
                    <td>${location}</td>
                    <td>${bus}</td>
                    <td>${status}</td>
                </tr>`;
            });
            
            html += `</table></div>`;
        });
        html += `</div>`;
    });
    document.getElementById('scheduleContainer').innerHTML = html;
}

function refreshDisplay() {
    const now = new Date(getBangladeshTime());
    const today = new Date(now);
    today.setFullYear(2025); // Set to 2025
    
    const isVacationDay = vacations.some(v => 
        new Date(v.date) <= today && 
        new Date(v.date).setDate(new Date(v.date).getDate() + v.days) >= today
    );
    
    if (isWeekend()) {
        document.getElementById('statusMessage').innerHTML = 'আজকে ছুটির দিন';
        document.getElementById('scheduleContainer').style.display = 'none';
        document.getElementById('nextBusAlert').innerHTML = '<p>আজকে ছুটির দিন</p>';
    } else if (isVacationDay) {
        const msg = `বাস চলাচলের সময়সূচি নির্ধারিত হয়নি। দয়া করে অফিসিয়াল নোটিশ দেখুন: 
                   <a href="https://bu.ac.bd/?ref=transport">https://bu.ac.bd/?ref=transport</a>`;
        document.getElementById('vacationNotice').innerHTML = msg;
        generateSchedule(true);
    } else {
        document.getElementById('scheduleContainer').style.display = 'block';
        generateSchedule(false);
        let nextBusHtml = '';
        Object.keys(schedule).forEach(routeKey => {
            const route = schedule[routeKey];
            nextBusHtml += `
                <div class="route-card">
                    <div class="route-header">
                        <h3 class="route-name">${route.name.split(':')[0].trim()}</h3>
                        <p class="route-status-text">${getNextBus(routeKey)}</p>
                    </div>
                    <p class="route-path">${route.name.split(':')[1].trim()}</p>
                </div>`;
        });
        document.getElementById('nextBusAlert').innerHTML = nextBusHtml;
    }
}

// Initialize
Promise.all([
    fetch('bus_schedule.json').then(r => r.json()),
    fetch('vacations.json').then(r => r.json())
]).then(([scheduleData, vacationData]) => {
    schedule = scheduleData;
    vacations = vacationData.map(v => ({
        ...v,
        date: new Date(v.date).setFullYear(2025) // Force 2025 dates
    }));
    
    updateClock();
    setInterval(updateClock, 1000);
}).catch(error => {
    console.error('Error:', error);
    document.getElementById('errorMessage').innerHTML = 
        'ডেটা লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।';
});

// Scroll function
function scrollToRoute(routeId) {
    document.getElementById(routeId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}
