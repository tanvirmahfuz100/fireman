let schedule = {};
let vacations = [];
let currentDate = new Date();

function getBangladeshTime() {
    const now = new Date();
    return new Date(now.getTime() + (6 * 60 * 60 * 1000));
}

function updateClock() {
    const options = { 
        timeZone: 'Asia/Dhaka',
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const formatter = new Intl.DateTimeFormat('bn-BD', options);
    const banglaTime = formatter.format(getBangladeshTime());
    document.getElementById('real-time-clock').innerHTML = `
        <h3>বর্তমান সময়: ${banglaTime}</h3>
    `;
}

function isWeekend() {
    const day = currentDate.getDay();
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
    } else if (hour >= 18 && hour < 19) {
        return 'সন্ধ্যা';
    } else {
        return 'রাত';
    }
}

function toBengaliDigits(number) {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return number.toString().split('').map(digit => bengaliDigits[digit]).join('');
}

function formatTimeToBengali(timeString) {
    const [hourStr, minuteStr] = timeString.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    const label = getTimeLabel(hour);
    
    let displayHour = hour;
    if (hour == 0) {
        displayHour = 12;
    } else if (hour > 12) {
        displayHour = hour - 12;
    }
    
    const bengaliHour = toBengaliDigits(displayHour);
    const bengaliMinute = toBengaliDigits(minute).padStart(2, '০');
    
    return `${label} ${bengaliHour}ঃ${bengaliMinute}`;
}

function formatRemainingTime(totalSeconds) {
    if (totalSeconds <= 0) return 'এখনই';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let parts = [];
    if (hours > 0) {
        parts.push(`${toBengaliDigits(hours)} ঘন্টা`);
    }
    if (minutes > 0) {
        parts.push(`${toBengaliDigits(minutes)} মিনিট`);
    }
    if (seconds > 0 || parts.length === 0) {
        parts.push(`${toBengaliDigits(seconds)} সেকেন্ড`);
    }
    
    return parts.join(' ');
}

function getNextBus(routeKey) {
    const route = schedule[routeKey];
    let nextBus = null;
    let minTimeDiff = Infinity;
    
    route.tables.forEach(table => {
        table.rows.forEach(row => {
            const [time, location, bus] = row;
            const [hour, minute] = time.split(':').map(Number);
            const rowDate = new Date(currentDate);
            rowDate.setHours(hour, minute, 0, 0);
            const timeDiff = rowDate - currentDate;
            if (timeDiff > 0 && timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextBus = { time, location, bus, rowDate };
            }
        });
    });
    
    if (nextBus) {
        const remainingSeconds = Math.ceil(minTimeDiff /1000);
        const remainingTimeStr = formatRemainingTime(remainingSeconds);
        const formattedTime = formatTimeToBengali(nextBus.time);
        return `${nextBus.bus} ছাড়বে ${formattedTime} এ, আর ${remainingTimeStr} এর মধ্যে।`;
    } else {
        return 'আজ আর কোন বাস নেই।';
    }
}

function generateSchedule(isVacation) {
    let html = '';
    
    Object.keys(schedule).forEach(routeKey => {
        const route = schedule[routeKey];
        const routeNumber = route.name.split(':')[0].trim();
        html += `<div class="route-card" id="${routeKey}"><h3>${routeNumber}</h3>`;
        
        route.tables.forEach(table => {
            html += `<div class="schedule-table"><h4>${table.title}</h4><table>`;
            html += `<tr>${table.headers.map(h => `<th>${h}</th>`).join('')}<th>স্ট্যাটাস</th></tr>`;
            
            table.rows.forEach(row => {
                const [time, location, bus] = row;
                const displayTime = isVacation ? '-' : formatTimeToBengali(time);
                let status = '-';
                if (!isVacation) {
                    const [hour, minute] = time.split(':').map(Number);
                    const rowDate = new Date(currentDate);
                    rowDate.setHours(hour, minute, 0, 0);
                    status = rowDate < currentDate ? 'চলে গেছে' : 'যাবে';
                }
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

function scrollToRoute(routeId) {
    const element = document.getElementById(routeId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize
Promise.all([
    fetch('bus_schedule.json').then(r => r.json()),
    fetch('vacations.json').then(r => r.json())
]).then(([scheduleData, vacationData]) => {
    schedule = scheduleData;
    vacations = vacationData;
    currentDate = getBangladeshTime();
    
    const statusMessage = document.getElementById('statusMessage');
    const scheduleContainer = document.getElementById('scheduleContainer');
    const vacationNotice = document.getElementById('vacationNotice');
    const nextBusAlert = document.getElementById('nextBusAlert');
    
    const today = currentDate.toISOString().split('T')[0];
    const isVacationDay = vacations.some(v => v.date === today);
    
    if (isWeekend()) {
        statusMessage.innerHTML = 'আজকে ছুটির দিন';
        scheduleContainer.style.display = 'none';
        vacationNotice.style.display = 'none';
        nextBusAlert.innerHTML = '<p>আজকে ছুটির দিন</p>';
        nextBusAlert.style.display = 'block';
    } else if (isVacationDay) {
        const vacationMessage = `বাস চলাচলের সময়সূচি নির্ধারিত হয়নি। দয়া করে অফিসিয়াল নোটিশ দেখুন: <a href="https://bu.ac.bd/?ref=transport">https://bu.ac.bd/?ref=transport</a>`;
        vacationNotice.innerHTML = vacationMessage;
        vacationNotice.style.display = 'block';
        nextBusAlert.innerHTML = `<p>${vacationMessage}</p>`;
        nextBusAlert.style.display = 'block';
        generateSchedule(true); // Show "-" for times
    } else {
        vacationNotice.style.display = 'none';
        let nextBusHtml = '';
        Object.keys(schedule).forEach(routeKey => {
            const route = schedule[routeKey];
            const nextBusInfo = getNextBus(routeKey);
            const [routeNumber, routePath] = route.name.split(':');
            nextBusHtml += `
                <div class="route-card">
                    <div class="route-header">
                        <h3 class="route-name">${routeNumber.trim()}</h3>
                        <p class="route-status-text">${nextBusInfo}</p>
                    </div>
                    <p class="route-path">${routePath.trim()}</p>
                </div>
            `;
        });
        nextBusAlert.innerHTML = nextBusHtml;
        nextBusAlert.style.display = 'block';
        generateSchedule(false); // Show regular schedule
    }
    
    setInterval(updateClock, 1000);
    updateClock();
}).catch(error => {
    console.error('Error loading data:', error);
    document.getElementById('statusMessage').innerHTML = 
        'ডেটা লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।';
});
