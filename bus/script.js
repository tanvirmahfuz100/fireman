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
        <h3>বর্তমান সময়: ${banglaTime}</h3>
    `;
    
    refreshDisplay();
}

function isWeekend() {
    const day = getBangladeshTime().getDay();
    return day === 5 || day === 6; // Friday (5) or Saturday (6)
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
    return number.toString().split('').map(digit => 
        isNaN(parseInt(digit)) ? digit : bengaliDigits[parseInt(digit)]
    ).join('');
}

function formatTimeToBengali(timeString) {
    if (!timeString || timeString === '-') return '-';
    
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const label = getTimeLabel(hour);
    
    let displayHour = hour % 12 || 12;
    return `${label} ${toBengaliDigits(displayHour)}ঃ${toBengaliDigits(minute.toString().padStart(2, '0'))}`;
}

function formatRemainingTime(totalSeconds) {
    if (totalSeconds <= 0) return 'এখনই';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    const parts = [];
    if (hours > 0) parts.push(`${toBengaliDigits(hours)} ঘন্টা`);
    if (minutes > 0) parts.push(`${toBengaliDigits(minutes)} মিনিট`);
    if (seconds > 0) parts.push(`${toBengaliDigits(seconds)} সেকেন্ড`);
    
    return parts.join(' ');
}

function getNextBus(routeKey) {
    const route = schedule[routeKey];
    if (!route) return 'সময়সূচী পাওয়া যায়নি।';
    
    const now = getBangladeshTime();
    let nextBus = null;
    let minTimeDiff = Infinity;
    
    route.tables.forEach(table => {
        table.rows.forEach(row => {
            const [time, location, bus] = row;
            if (time === '-') return; // Skip if no time (vacation)
            
            const [hour, minute] = time.split(':').map(Number);
            const rowDate = new Date(now);
            rowDate.setHours(hour, minute, 0, 0);
            
            // If time already passed today, check for tomorrow
            if (rowDate < now) rowDate.setDate(rowDate.getDate() + 1);
            
            const timeDiff = rowDate - now;
            if (timeDiff > 0 && timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextBus = { time, bus };
            }
        });
    });
    
    return nextBus ? 
        `${nextBus.bus} ছাড়বে ${formatTimeToBengali(nextBus.time)} এ, আর ${formatRemainingTime(Math.ceil(minTimeDiff/1000))} এর মধ্যে।` : 
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
                <p class="route-path">${route.name.split(':')[1]?.trim() || ''}</p>
            </div>`;
        
        route.tables.forEach(table => {
            html += `<div class="schedule-table"><h4>${table.title}</h4>
                <table><tr>${table.headers.map(h => `<th>${h}</th>`).join('')}<th>স্ট্যাটাস</th></tr>`;
            
            table.rows.forEach(row => {
                const [time, location, bus] = row;
                
                // Handle vacation display
                const displayTime = isVacation ? '-' : formatTimeToBengali(time);
                const status = isVacation ? '-' : getStatus(time, now);
                
                html += `<tr>
                    <td>${displayTime}</td>
                    <td>${location}</td>
                    <td>${bus}</td>
                    <td class="${status === 'চলে গেছে' ? 'passed' : 'upcoming'}">${status}</td>
                </tr>`;
            });
            
            html += `</table></div>`;
        });
        html += `</div>`;
    });
    
    document.getElementById('scheduleContainer').innerHTML = html;
}

function getStatus(timeStr, now) {
    if (timeStr === '-') return '-';
    
    const [hour, minute] = timeStr.split(':').map(Number);
    const rowDate = new Date(now);
    rowDate.setHours(hour, minute, 0, 0);
    
    return rowDate < now ? 'চলে গেছে' : 'যাবে';
}

function checkVacation() {
    const today = getBangladeshTime();
    const formattedToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    return vacations.some(v => {
        const startDate = new Date(v.date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (v.days - 1)); // -1 because the start day counts as day 1
        
        return today >= startDate && today <= endDate;
    });
}

function toggleScheduleVisibility() {
    const container = document.getElementById('scheduleContainer');
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
        document.querySelector('.toggle-btn').textContent = 'শিডিউল লুকান';
    } else {
        container.style.display = 'none';
        document.querySelector('.toggle-btn').textContent = 'পুরো শিডিউল দেখুন';
    }
}

function refreshDisplay() {
    const isVacation = checkVacation();
    
    if (isWeekend()) {
        document.getElementById('statusMessage').innerHTML = '<i class="fas fa-calendar-day"></i> আজকে ছুটির দিন';
        document.getElementById('statusMessage').style.display = 'block';
        document.getElementById('nextBusAlert').innerHTML = '<div class="info-message">আজকে ছুটির দিন</div>';
        document.getElementById('vacationNotice').innerHTML = '';
        
        // Still generate and display the schedule for reference
        generateSchedule(true);
        document.getElementById('scheduleContainer').style.display = 'block';
    } else if (isVacation) {
        const msg = `<i class="fas fa-exclamation-triangle"></i> বাস চলাচলের সময়সূচি নির্ধারিত হয়নি। দয়া করে অফিসিয়াল নোটিশ দেখুন: 
                   <a href="https://bu.ac.bd/?ref=transport">https://bu.ac.bd/?ref=transport</a>`;
        document.getElementById('statusMessage').innerHTML = 'ছুটির দিন';
        document.getElementById('statusMessage').style.display = 'block';
        document.getElementById('vacationNotice').innerHTML = msg + 
                   `<button onclick="toggleScheduleVisibility()" class="toggle-btn">পুরো শিডিউল দেখুন</button>`;
        
        generateSchedule(true);
        // Don't hide the schedule by default - just let user toggle it
        document.getElementById('scheduleContainer').style.display = 'block';
        document.getElementById('nextBusAlert').innerHTML = '<div class="info-message">বর্তমানে কোন বাসের সময়সূচি নেই।</div>';
    } else {
        document.getElementById('statusMessage').style.display = 'none';
        document.getElementById('vacationNotice').innerHTML = '<div class="info-message" style="background: #d4edda; color: #155724;">শিডিউল অনুসারে আজ বাস থাকবে</div>';
        
        generateSchedule(false);
        // Always display the schedule in normal mode
        document.getElementById('scheduleContainer').style.display = 'block';
        
        let nextBusHtml = '';
        Object.keys(schedule).forEach(routeKey => {
            const route = schedule[routeKey];
            const routeName = route.name.split(':')[0].trim();
            const routePath = route.name.split(':')[1]?.trim() || '';
            
            nextBusHtml += `
                <div class="route-card ${routeKey}">
                    <div class="route-header">
                        <h3 class="route-name">${routeName}</h3>
                        <p class="route-status-text">${getNextBus(routeKey)}</p>
                    </div>
                    <p class="route-path">${routePath}</p>
                </div>`;
        });
        document.getElementById('nextBusAlert').innerHTML = nextBusHtml;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Show loading message while data is being fetched
    document.getElementById('nextBusAlert').innerHTML = '<div class="info-message">ডেটা লোড হচ্ছে...</div>';
    
    // Always make sure the schedule container exists
    if (!document.getElementById('scheduleContainer')) {
        console.error('Schedule container not found in the DOM');
        document.getElementById('errorMessage').innerHTML = 'পৃষ্ঠা লোড করতে সমস্যা হয়েছে।';
        return;
    }
    
    Promise.all([
        fetch('./bus_schedule.json').then(r => r.json()).catch(e => {
            console.error('Failed to load schedule:', e);
            throw new Error('Schedule data could not be loaded');
        }),
        fetch('./vacations.json').then(r => r.json()).catch(e => {
            console.error('Failed to load vacations:', e);
            throw new Error('Vacation data could not be loaded');
        })
    ]).then(([scheduleData, vacationData]) => {
        schedule = scheduleData;
        vacations = vacationData;
        
        // Check if data loaded properly
        if (!schedule || Object.keys(schedule).length === 0) {
            throw new Error('Schedule data is empty');
        }
        
        updateClock();
        setInterval(updateClock, 1000);
        setInterval(refreshDisplay, 10000); // Update every 10 seconds instead of every second
    }).catch(error => {
        console.error('Error:', error);
        document.getElementById('errorMessage').innerHTML = 
            'ডেটা লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।';
    });
});

function scrollToRoute(routeId) {
    const element = document.getElementById(routeId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        console.error(`Element with ID ${routeId} not found`);
    }
}
