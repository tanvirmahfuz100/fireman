const schedule = {
  route1: {
    name: "রুট ১: বরিশাল ক্লাব ↔ বাংলা বাজার মোড় ↔ নুরিয়া স্কুল ↔ আমতলার মোড় ↔ রুপাতলী হাউজিং ↔ কাঁঠালতলা ↔ টোল ঘর ↔ বিশ্ববিদ্যালয়",
    tables: [
      {
        title: "বরিশাল ক্লাব থেকে ছাড়ে",
        headers: ["ছাড়ার সময়", "ছাড়ার স্থান", "বাস নং"],
        rows: [
          ["৭:৩০", "বরিশাল ক্লাব", "বিআরটিসি-০৪"],
          ["৮:৩০", "বরিশাল ক্লাব", "বিআরটিসি-০৫ ও ০৬"],
          // Add all other rows for Table 1
        ]
      },
      {
        title: "বিশ্ববিদ্যালয় থেকে ছাড়ে",
        headers: ["ছাড়ার সময়", "ছাড়ার স্থান", "বাস নং"],
        rows: [
          ["৮:৩০", "বিশ্ববিদ্যালয়", "চিত্রা ও বিআরটিসি-০৪"],
          ["৯:৩০", "বিশ্ববিদ্যালয়", "বিআরটিসি-০৫ ও ০৬"],
          // Add all other rows for Table 2
        ]
      }
    ]
  },
  route2: {
    name: "রুট ২: নতুন বাজার (টেম্পু স্ট্যান্ড) ↔ মুন্সি গ্যারেজ ↔ অপসোনিন মোড় ↔ বটতলার মোড় ↔ করিম কুটির ↔ বিশ্ববিদ্যালয়",
    tables: [
      {
        title: "নতুন বাজার থেকে ছাড়ে",
        headers: ["ছাড়ার সময়", "ছাড়ার স্থান", "বাস নং"],
        rows: [
          ["৭:৩০", "নতুন বাজার (টেম্পু স্ট্যান্ড)", "আন্ধারমানিক"],
          ["৮:৩০", "নতুন বাজার (টেম্পু স্ট্যান্ড)", "সুগন্ধা"],
          // Add all other rows
        ]
      },
      {
        title: "বিশ্ববিদ্যালয় থেকে ছাড়ে",
        headers: ["ছাড়ার সময়", "ছাড়ার স্থান", "বাস নং"],
        rows: [
          ["৭:৪৫", "বিশ্ববিদ্যালয়", "সুগন্ধা"],
          ["৮:৩০", "বিশ্ববিদ্যালয়", "সন্ধ্যা"],
          // Add all other rows
        ]
      }
    ]
  },
  route3: {
    name: "রুট ৩: নথুল্লাবাদ ব্রীজের ঢাল ↔ কলেজ এভিনিউ ↔ টিটিসি মূল গেট ↔ চৌমাথার মোড় ↔ থানা কাউন্সিলের মূল গেট ↔ আমতলার মোড় ↔ রুপাতলী হাউজিং ↔ কাঁঠালতলা ↔ টোল ঘর ↔ বিশ্ববিদ্যালয়",
    tables: [
      {
        title: "নথুল্লাবাদ থেকে ছাড়ে",
        headers: ["ছাড়ার সময়", "ছাড়ার স্থান", "বাস নং"],
        rows: [
          ["৭:৩০", "নথুল্লাবাদ ব্রীজের ঢাল", "বিআরটিসি-০৮"],
          ["৮:৩০", "নথুল্লাবাদ ব্রীজের ঢাল", "বিআরটিসি-০৭, বিআরটিসি-০৯"],
          // Add all other rows
        ]
      },
      {
        title: "বিশ্ববিদ্যালয় থেকে ছাড়ে",
        headers: ["ছাড়ার সময়", "ছাড়ার স্থান", "বাস নং"],
        rows: [
          ["৮:৩০", "বিশ্ববিদ্যালয়", "বিআরটিসি-০৮"],
          ["৯:৩০", "বিশ্ববিদ্যালয়", "বিআরটিসি-০৭, ০৯"],
          // Add all other rows
        ]
      }
    ]
  }
};

// Update the status message function to handle Bengali text
function updateBusStatus() {
    if (vacations.includes(getCurrentDate())) {
        document.getElementById('status-message').innerHTML = 
            '<strong>নোটিশ:</strong> আজকের বাস চলাচল বন্ধ আছে (বিশ্ববিদ্যালয় ছুটি)';
        return;
    }

    let statusMessage = '<h5 class="mb-3">বর্তমান বাস অবস্থা:</h5>';
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-BD', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    for (const route in schedule) {
        const allTimes = [];
        schedule[route].tables.forEach(table => {
            table.rows.forEach(row => {
                allTimes.push(convertTo24Hour(row[0]));
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
                <strong>${schedule[route].name}</strong><br>
                ${lastBus ? `সর্বশেষ বাস ছেড়ে গেছে: ${convertToBengaliTime(lastBus)}` : ''}<br>
                ${nextBus ? `পরবর্তী বাস: ${convertToBengaliTime(nextBus)}` : 'আজকে আর কোন বাস নেই'}
            </div>`;
    }

    document.getElementById('status-message').innerHTML = statusMessage;
}

// Helper function to convert time to Bengali numerals
function convertToBengaliTime(time) {
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    
    return time.split('').map(char => {
        const index = englishNumbers.indexOf(char);
        return index !== -1 ? bengaliNumbers[index] : char;
    }).join('');
}

// Helper function to handle time conversions
function convertTo24Hour(bengaliTime) {
    const time = convertToEnglishDigits(bengaliTime);
    const [hour, minute] = time.split(':');
    return `${hour.padStart(2, '0')}:${minute}`;
}

function convertToEnglishDigits(bengaliTime) {
    const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return bengaliTime.split('').map(char => {
        const index = bengaliNumbers.indexOf(char);
        return index !== -1 ? index.toString() : char;
    }).join('');
}