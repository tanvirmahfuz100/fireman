let schedule = {};
let vacations = [];

function getBangladeshTime() {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
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
    
    refreshDisplay();
}

function isWeekend() {
    const day = getBangladeshTime().getDay();
    return day === 5 || day === 6;
}

function getTimeLabel(hour) {
    if ((hour >= 0 && hour < 4) || (hour >= 19 && hour <= 23)) return 'রাত';
    if (hour >= 4 && hour < 6) return 'ভোর';
    if (hour >= 6 && hour < 12) return 'সকাল';
    if (hour >= 12 && hour < 15) return 'দুপুর';
    if (hour >= 15 && hour < 18) return 'বিকাল';
    return 'সন্ধ্যা';
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
    
    let displayHour = hour % 12 || 12;
    return `${label} ${toBengaliDigits(displayHour)}ঃ${toBengaliDigits(minute.toString().padStart(2, '0'))}`;
}

function formatRemainingTime(totalSeconds) {
    if (totalSeconds <= 0) return 'এখনই';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${toBengaliDigits(hours)} ঘন্টা`);
    if (minutes > 0) parts.push(`${toBengaliDigits(minutes)} মিনিট`);
    if (seconds > 0) parts.push(`${toBengaliDigits(seconds)} সেকেন্ড`);
    
    return parts.join(' ');
}

function getNextBus(routeKey) {
    const route = schedule[routeKey];
    const now = getBangladeshTime();
    let nextBus = null;
    let minTimeDiff = Infinity;
    
    route.tables.forEach(table => {
        table.rows.forEach(row => {
            const [time, location, bus] = row;
            const [hour, minute] = time.split(':').map(Number);
            const rowDate = new Date(now);
            rowDate.setHours(hour, minute, 0, 0);
            
            if (rowDate < now) rowDate.setDate(rowDate.getDate() + 1);
            
            const timeDiff = rowDate - now;
            if (timeDiff > 0 && timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextBus = { time, bus };
            }
        });
    });
    
    return nextBus ? 
        `${nextBus.bus} ছাড়বে ${formatTimeToBengali(nextBus.time)} এ, আর ${formatRemainingTime(Math.ceil(minTimeDiff/1000))} এর মধ্যে।` : 
        'আজ আর কোন বাস নেই।';
}

function generateSchedule(isVacation) {
    let html = '';
    const now = getBangladeshTime();
    
    Object.keys(schedule).forEach(routeKey => {
        const route = schedule[routeKey];
        html += `<div class="route-card ${routeKey}" id="${routeKey}">
            <div class="route-header">
                <h3 class="route-name">${route.name.split(':')[0].trim()}</h3>
            </div>`;
        
        route.tables.forEach(table => {
            html += `<div class="schedule-table"><h4>${table.title}</h4>
                <table><tr>${table.headers.map(h => `<th>${h}</th>`).join('')}<th>স্ট্যাটাস</th></tr>`;
            
            table.rows.forEach(row => {
                const [time, location, bus] = row;
                const [hour, minute] = time.split(':').map(Number);
                const rowDate = new Date(now);
                rowDate.setHours(hour, minute, 0, 0);
                
                const displayTime = isVacation ? '-' : formatTimeToBengali(time);
                const status = isVacation ? '-' : 
                    (rowDate < now ? 'চলে গেছে' : 'যাবে');
                
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

function checkVacation() {
    const today = getBangladeshTime();
    return vacations.some(v => {
        const startDate = new Date(v.date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + v.days);
        return today >= startDate && today <= endDate;
    });
}

function toggleScheduleVisibility() {
    const container = document.getElementById('scheduleContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    const btn = document.querySelector('.toggle-btn');
    if (btn) {
        btn.textContent = container.style.display === 'none' ? 'পুরো শিডিউল দেখুন' : 'শিডিউল লুকান';
    }
}

function refreshDisplay() {
    const isVacation = checkVacation();
    
    if (isWeekend()) {
        document.getElementById('statusMessage').innerHTML = 'আজকে ছুটির দিন';
        document.getElementById('scheduleContainer').style.display = 'none';
        document.getElementById('nextBusAlert').innerHTML = '<div class="info-message">আজকে ছুটির দিন</div>';
        document.getElementById('vacationNotice').innerHTML = '';
    } else if (isVacation) {
        const msg = `বাস চলাচলের সময়সূচি নির্ধারিত হয়নি। দয়া করে অফিসিয়াল নোটিশ দেখুন: 
                   <a href="https://bu.ac.bd/?ref=transport">https://bu.ac.bd/?ref=transport</a>
                   <button onclick="toggleScheduleVisibility()" class="toggle-btn">পুরো শিডিউল দেখুন</button>`;
        document.getElementById('vacationNotice').innerHTML = msg;
        generateSchedule(true);
        document.getElementById('scheduleContainer').style.display = 'none';
        document.getElementById('nextBusAlert').innerHTML = '<div class="info-message">বর্তমানে কোন বাসের সময়সূচি নেই।</div>';
    } else {
        document.getElementById('scheduleContainer').style.display = 'block';
        generateSchedule(false);
        let nextBusHtml = '';
        Object.keys(schedule).forEach(routeKey => {
            const route = schedule[routeKey];
            nextBusHtml += `
                <div class="route-card ${routeKey}">
                    <div class="route-header">
                        <h3 class="route-name">${route.name.split(':')[0].trim()}</h3>
                        <p class="route-status-text">${getNextBus(routeKey)}</p>
                    </div>
                    <p class="route-path">${route.name.split(':')[1].trim()}</p>
                </div>`;
        });
        document.getElementById('nextBusAlert').innerHTML = nextBusHtml;
        document.getElementById('vacationNotice').innerHTML = '';
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
        date: new Date(v.date)
    }));
    
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(refreshDisplay, 1000);
}).catch(error => {
    console.error('Error:', error);
    document.getElementById('errorMessage').innerHTML = 
        'ডেটা লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।';
});

function scrollToRoute(routeId) {
    document.getElementById(routeId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}
