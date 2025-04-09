// Initialize Vue App
const { createApp } = Vue;

createApp({
    data() {
        return {
            activeTab: 0,
            routes: Object.values(schedule),
            vacations: []
        }
    },
    mounted() {
        this.initializeClock();
        this.loadVacations();
        this.updateBusStatus();
        setInterval(() => {
            this.updateBusStatus();
        }, 30000);
    },
    methods: {
        initializeClock() {
            setInterval(() => {
                const options = {
                    timeZone: 'Asia/Dhaka',
                    hour12: true,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit'
                };
                const date = new Date().toLocaleDateString('bn-BD', options);
                const time = new Date().toLocaleTimeString('bn-BD', options);
                document.getElementById('real-time-clock').innerHTML = `
                    ${date}<br>
                    <span class="text-primary">${time}</span>
                `;
            }, 1000);
        },

        async loadVacations() {
            try {
                const response = await fetch('vacations.json');
                this.vacations = await response.json();
            } catch (error) {
                console.error('Error loading vacations:', error);
            }
        },

        updateBusStatus() {
            const statusElement = document.getElementById('status-message');
            if (this.isVacationDay()) {
                statusElement.innerHTML = `
                    <strong class="fs-5">নোটিশ:</strong> 
                    <span class="ms-2">আজকে বাস চলাচল বন্ধ (ছুটির দিন)</span>
                `;
                return;
            }

            let statusMessage = '<h5 class="mb-3">বর্তমান বাস অবস্থা:</h5>';
            const currentTime = this.getCurrentBangladeshTime();

            this.routes.forEach(route => {
                const allTimes = [];
                route.tables.forEach(table => {
                    table.rows.forEach(row => {
                        const time = this.parseBengaliTime(row[0]);
                        allTimes.push(time);
                    });
                });

                allTimes.sort((a, b) => a.localeCompare(b));
                
                let nextBus = null;
                let lastBus = null;

                for (const time of allTimes) {
                    if (time > currentTime) {
                        nextBus = time;
                        break;
                    }
                    lastBus = time;
                }

                statusMessage += `
                    <div class="route-status mb-3">
                        <strong>${route.name}</strong><br>
                        ${lastBus ? `সর্বশেষ বাস: ${this.toBengaliTime(lastBus)}` : ''}
                        ${nextBus ? `পরবর্তী বাস: ${this.toBengaliTime(nextBus)}` : 'আজকে আর বাস নেই'}
                    </div>`;
            });

            statusElement.innerHTML = statusMessage;
        },

        parseBengaliTime(bengaliTime) {
            const isPM = bengaliTime.includes('রাত');
            let [_, hour, minute] = bengaliTime.match(/(\d+):(\d+)/) || [null, '00', '00'];
            
            hour = this.convertToEnglishDigits(hour);
            minute = this.convertToEnglishDigits(minute);

            if (isPM && hour < 12) hour = parseInt(hour) + 12;
            if (!isPM && hour == 12) hour = 0;

            return `${hour.toString().padStart(2, '0')}:${minute}`;
        },

        convertToEnglishDigits(bengaliNumber) {
            const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            return bengaliNumber.split('').map(d => {
                const index = bengaliDigits.indexOf(d);
                return index !== -1 ? index : d;
            }).join('');
        },

        toBengaliTime(time) {
            const [hour, minute] = time.split(':');
            let period = '';
            let formattedHour = parseInt(hour);
            
            if (formattedHour >= 12) {
                period = 'রাত';
                if (formattedHour > 12) formattedHour -= 12;
            }
            
            return `${period} ${this.toBengaliDigits(formattedHour)}:${this.toBengaliDigits(minute)}`;
        },

        toBengaliDigits(number) {
            const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            return number.toString().split('').map(d => digits[d] || d).join('');
        },

        isVacationDay() {
            const today = new Date().toISOString().split('T')[0];
            return this.vacations.some(v => v.date === today);
        },

        getCurrentBangladeshTime() {
            const options = {
                timeZone: 'Asia/Dhaka',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date().toLocaleTimeString('en-BD', options);
        }
    }
}).mount('#app');

// Schedule Data
const schedule = { /* Keep your existing schedule data here */ };
