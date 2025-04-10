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

function checkVacation() {
    const today = currentDate.toISOString().split('T')[0];
    const vacation = vacations.find(v => v.date === today);
    
    if(vacation) {
        document.getElementById('vacationNotice').style.display = 'block';
        document.getElementById('vacationNotice').innerHTML = `
            <strong>ছুটির দিন নোটিশ:</strong> ${vacation.name} উপলক্ষে বাস সিডিউল পরিবর্তিত হতে পারে। অফিসিয়াল নোটিশ চেক করুন।
        `;
    }
}

function generateSchedule() {
    let html = '';
    
    Object.keys(schedule).forEach(routeKey => {
        const route = schedule[routeKey];
        html += `<div class="route-card"><h3>${route.name}</h3>`;
        
        route.tables.forEach(table => {
            html += `<div class="schedule-table"><h4>${table.title}</h4><table>`;
            html += `<tr>${table.headers.map(h => `<th>${h}</th>`).join('')}<th>স্ট্যাটাস</th></tr>`;
            
            table.rows.forEach(row => {
                const [time, location, bus] = row;
                const [hour, minute] = time.split(':');
                const rowDate = new Date(currentDate);
                rowDate.setHours(hour, minute, 0, 0);
                
                let status = 'upcoming';
                if(rowDate < currentDate) status = 'departed';
                
                html += `<tr class="${status}">
                    <td>${time}</td>
                    <td>${location}</td>
                    <td>${bus}</td>
                    <td>${status === 'departed' ? 'চলে গেছে' : 'আসছে'}</td>
                </tr>`;
            });
            
            html += `</table></div>`;
        });
        
        html += `</div>`;
    });
    
    document.getElementById('scheduleContainer').innerHTML = html;
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
    
    if (isWeekend()) {
        statusMessage.innerHTML = 'আজকে ছুটির দিন';
        scheduleContainer.style.display = 'none';
        vacationNotice.style.display = 'none';
    } else {
        checkVacation();
        generateSchedule();
    }
    
    setInterval(updateClock, 1000);
    updateClock();
}).catch(error => {
    console.error('Error loading data:', error);
    document.getElementById('statusMessage').innerHTML = 
        'ডেটা লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।
