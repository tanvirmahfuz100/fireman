const credits = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const grades = [
    { letter: 'A+', value: 4.00 },
    { letter: 'A', value: 3.75 },
    { letter: 'A-', value: 3.50 },
    { letter: 'B+', value: 3.25 },
    { letter: 'B', value: 3.00 },
    { letter: 'B-', value: 2.75 },
    { letter: 'C+', value: 2.50 },
    { letter: 'C', value: 2.25 },
    { letter: 'D', value: 2.00 },
    { letter: 'F', value: 0.00 }
];

let currentSystem = 'semester';

// System Toggle Handler
document.querySelectorAll('.sys-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sys-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSystem = btn.dataset.system;
        initializeCourses();
        initializeCGPA();
    });
});

// GPA Calculator Functions
function initializeCourses() {
    const container = document.getElementById('courses-container');
    container.innerHTML = '';
    const initialCourses = currentSystem === 'semester' ? 5 : 10;

    for(let i = 1; i <= initialCourses; i++) {
        addCourse(i);
    }

    if(currentSystem === 'semester') {
        addViva();
    }
}

function addCourse(number = null) {
    const course = document.createElement('div');
    course.className = 'course-row';
    course.innerHTML = `
        <span class="course-name">Course ${number || ''}</span>
        <select class="credit-select">
            ${credits.map(c => `<option value="${c}" ${c === 3 ? 'selected' : ''}>${c} Credit${c !== 1 ? 's' : ''}</option>`).join('')}
        </select>
        <select class="grade-select">
            ${grades.map(g => `<option value="${g.value}">${g.letter} (${g.value.toFixed(2)})</option>`).join('')}
        </select>
        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
    document.getElementById('courses-container').appendChild(course);
}

function addViva() {
    const viva = document.createElement('div');
    viva.className = 'course-row viva';
    viva.innerHTML = `
        <span class="course-name">Viva</span>
        <select class="credit-select">
            <option value="0.75">0.75 Credits</option>
        </select>
        <select class="grade-select">
            ${grades.map(g => `<option value="${g.value}">${g.letter} (${g.value.toFixed(2)})</option>`).join('')}
        </select>
        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
    document.getElementById('courses-container').appendChild(viva);
}

function calculateGPA() {
    let totalPoints = 0, totalCredits = 0;
    
    document.querySelectorAll('.course-row').forEach(row => {
        const credit = parseFloat(row.querySelector('.credit-select').value);
        const grade = parseFloat(row.querySelector('.grade-select').value);
        
        if (!isNaN(credit) && !isNaN(grade)) {
            totalPoints += credit * grade;
            totalCredits += credit;
        }
    });

    const resultContainer = document.getElementById('result-container');
    if (totalCredits === 0) {
        resultContainer.innerHTML = "<div class='error'>Please add courses first!</div>";
        return;
    }

    const gpa = totalPoints / totalCredits;
    resultContainer.innerHTML = `
        <p>GPA: <strong>${gpa.toFixed(2)}</strong></p>
        <p>Total Credits: <strong>${totalCredits.toFixed(2)}</strong></p>
    `;
}

function resetForm() {
    initializeCourses();
    document.getElementById('result-container').innerHTML = '';
}

// CGPA Calculator Functions
function initializeCGPA() {
    document.getElementById('cgpa-inputs').innerHTML = '';
    addCGPAUnit();
    if(currentSystem === 'year') addCGPAUnit();
}

function addCGPAUnit() {
    const unit = document.createElement('div');
    unit.className = 'cgpa-unit';
    unit.innerHTML = `
        <input type="number" step="0.01" min="0" max="4" 
               placeholder="${currentSystem === 'semester' ? 'Semester' : 'Year'} GPA">
        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
    document.getElementById('cgpa-inputs').appendChild(unit);
}

function calculateCGPA() {
    const inputs = document.querySelectorAll('.cgpa-unit input');
    let total = 0, validCount = 0;

    inputs.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value) && value >= 0 && value <= 4) {
            total += value;
            validCount++;
        }
    });

    const resultContainer = document.getElementById('cgpa-result');
    if (validCount === 0) {
        resultContainer.innerHTML = "<div class='error'>Please enter at least one GPA!</div>";
        return;
    }

    const cgpa = total / validCount;
    const performance = getPerformance(cgpa);
    resultContainer.innerHTML = `
        <div class="cgpa-result">
            <p>CGPA: <strong>${cgpa.toFixed(2)}</strong></p>
            <p>Total ${currentSystem}s: ${validCount}</p>
            <div class="performance ${performance.class}">${performance.text}</div>
        </div>
    `;
}

function getPerformance(cgpa) {
    if (cgpa >= 3.7) return {class: 'best', text: 'Best! Outstanding Achievement!'};
    if (cgpa >= 3.5) return {class: 'better', text: 'Better! Excellent Performance!'};
    if (cgpa >= 3.0) return {class: 'good', text: 'Good! Keep Up the Good Work!'};
    return {class: 'encourage', text: 'Keep Going! You Can Improve!'};
}

function resetCGPA() {
    initializeCGPA();
    document.getElementById('cgpa-result').innerHTML = '';
}

// Initial Setup
window.onload = () => {
    initializeCourses();
    initializeCGPA();
};
