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

// GPA Calculator Functions
function initializeSelects() {
    document.querySelectorAll('.credit-select').forEach((select, index) => {
        credits.forEach(credit => {
            const option = document.createElement('option');
            option.value = credit;
            option.textContent = `${credit} Credit${credit !== 1 ? 's' : ''}`;
            if (index < 5 && credit === 3) option.selected = true;
            if (index === 5 && credit === 0.75) option.selected = true;
            select.appendChild(option);
        });
    });

    document.querySelectorAll('.grade-select').forEach(select => {
        grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade.value;
            option.textContent = `${grade.letter} (${grade.value.toFixed(2)})`;
            if (grade.value === 4.00) option.selected = true;
            select.appendChild(option);
        });
    });
}

function addLabCourse() {
    const labCourse = document.createElement('div');
    labCourse.className = 'course-row';
    labCourse.innerHTML = `
        <span class="course-name">Lab Course</span>
        <select class="credit-select">
            ${credits.map(credit => 
                `<option value="${credit}" ${credit === 2 ? 'selected' : ''}>${credit} Credits</option>`
            ).join('')}
        </select>
        <select class="grade-select">
            ${grades.map(grade => 
                `<option value="${grade.value}">${grade.letter} (${grade.value.toFixed(2)})</option>`
            ).join('')}
        </select>
    `;
    
    const container = document.getElementById('courses-container');
    const viva = document.querySelector('.viva-row');
    container.insertBefore(labCourse, viva);
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
    const container = document.getElementById('courses-container');
    while (container.children.length > 6) {
        container.removeChild(container.lastElementChild);
    }
    initializeSelects();
    document.getElementById('result-container').innerHTML = '';
}

// CGPA Calculator Functions
let currentSystem = 'year';

document.querySelectorAll('.sys-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sys-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSystem = btn.dataset.system;
        generateCGPAInputs();
    });
});

function generateCGPAInputs() {
    const container = document.getElementById('cgpa-inputs');
    const count = currentSystem === 'year' ? 4 : 8;
    container.innerHTML = `
        <div class="input-grid">
            ${Array.from({length: count}, (_, i) => `
                <div class="input-group">
                    <label>${currentSystem.charAt(0).toUpperCase() + currentSystem.slice(1)} ${i+1}</label>
                    <input type="number" step="0.01" min="0" max="4" placeholder="Enter GPA">
                </div>
            `).join('')}
        </div>
    `;
}

function calculateCGPA() {
    const inputs = document.querySelectorAll('#cgpa-inputs input');
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
            <p>Total ${currentSystem}s calculated: ${validCount}</p>
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
    document.querySelectorAll('#cgpa-inputs input').forEach(input => input.value = '');
    document.getElementById('cgpa-result').innerHTML = '';
}

// Initialize
window.onload = () => {
    initializeSelects();
    generateCGPAInputs();
};
