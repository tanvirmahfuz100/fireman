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
            ${Array.from({length: 11}, (_, i) => {
                const credit = i * 0.5;
                return `<option value="${credit}" ${credit === 2 ? 'selected' : ''}>${credit} Credit${credit !== 1 ? 's' : ''}</option>`;
            }).join('')}
        </select>
        <select class="grade-select">
            ${grades.map(grade => 
                `<option value="${grade.value}" ${grade.value === 4.00 ? 'selected' : ''}>${grade.letter} (${grade.value.toFixed(2)})</option>`
            ).join('')}
        </select>
    `;
    
    const container = document.getElementById('courses-container');
    const viva = document.querySelector('.viva-row');
    container.insertBefore(labCourse, viva);
}

function calculateGPA() {
    let totalPoints = 0;
    let totalCredits = 0;
    
    document.querySelectorAll('.course-row').forEach(row => {
        const credit = parseFloat(row.querySelector('.credit-select').value);
        const grade = parseFloat(row.querySelector('.grade-select').value);
        
        if (!isNaN(credit) && !isNaN(grade)) {
            totalPoints += credit * grade;
            totalCredits += credit;
        }
    });

    if (totalCredits === 0) {
        document.getElementById('result-container').innerHTML = "Please add at least one course";
        return;
    }

    const gpa = totalPoints / totalCredits;
    document.getElementById('result-container').innerHTML = `
        <p>GPA: <strong>${gpa.toFixed(2)}</strong></p>
        <p>Total Credits: <strong>${totalCredits.toFixed(2)}</strong></p>
    `;
}

function resetForm() {
    const container = document.getElementById('courses-container');
    while (container.children.length > 6) {
        container.removeChild(container.lastElementChild);
    }
    
    document.querySelectorAll('.course-row').forEach((row, index) => {
        if (index < 5) {
            row.querySelector('.credit-select').value = 3;
            row.querySelector('.grade-select').value = 4.00;
        } else if (index === 5) {
            row.querySelector('.credit-select').value = 0.75;
            row.querySelector('.grade-select').value = 4.00;
        }
    });
    
    document.getElementById('result-container').innerHTML = '';
}

window.onload = initializeSelects;
