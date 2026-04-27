const defaultSubjects = [
    { name: "Automata Theory and Applications", credits: 4.0, type: "theory" },
    { name: "Information Retrieval Systems", credits: 3.0, type: "theory" },
    { name: "Computer Vision and Image Processing", credits: 3.0, type: "theory" },
    { name: "R Programming", credits: 2.0, type: "theory" },
    { name: "Cryptography", credits: 3.0, type: "theory" },
    { name: "Verbal Ability and Critical Reasoning", credits: 1.5, type: "lab" },
    { name: "Computer Vision and Information Retrieval Systems Lab", credits: 2.0, type: "lab" },
    { name: "R Programming Lab", credits: 1.5, type: "lab" },
    { name: "Technical and Business Communication Skills", credits: 3.0, type: "theory" }
];

const gradingSystem = [
    { grade: "O", points: 10, minPercentage: 90, maxPercentage: 100 },
    { grade: "A+", points: 9, minPercentage: 80, maxPercentage: 89 },
    { grade: "A", points: 8, minPercentage: 70, maxPercentage: 79 },
    { grade: "B+", points: 7, minPercentage: 60, maxPercentage: 69 },
    { grade: "B", points: 6, minPercentage: 50, maxPercentage: 59 },
    { grade: "C", points: 5, minPercentage: 40, maxPercentage: 49 }
];

let subjects = [];
let isDetailedMode = true;

// Initialize app
function init() {
    subjects = defaultSubjects.map((s, index) => ({
        ...s,
        id: Date.now() + index,
        mid1: 0,
        mid2: 0,
        assig1: 0,
        assig2: 0,
        dayToDay: 0,
        skill1: 0,
        skill2: 0,
        simpleInternal: 0,
        targetGrade: null
    }));
    
    renderTable();
    setupEventListeners();
    loadFromLocalStorage();
}

function saveToLocalStorage() {
    localStorage.setItem('cgpa_subjects', JSON.stringify(subjects));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('cgpa_subjects');
    if (saved) {
        const loadedSubjects = JSON.parse(saved);
        // Map loaded data to current subject structure to avoid breaking changes
        subjects = subjects.map(s => {
            const found = loadedSubjects.find(ls => ls.name === s.name);
            return found ? { ...s, ...found, id: s.id } : s;
        });
        renderTable();
    }
}

function renderTable() {
    const tbody = document.getElementById('subjects-body');
    tbody.innerHTML = '';

    subjects.forEach((subject) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', subject.id);
        
        // Subject Name Column
        const nameTd = document.createElement('td');
        nameTd.innerHTML = `<input type="text" value="${subject.name}" onchange="updateSubjectName(${subject.id}, this.value)">`;
        tr.appendChild(nameTd);

        // Internal Marks Column
        const internalTd = document.createElement('td');
        internalTd.className = 'internal-col';
        
        if (isDetailedMode) {
            if (subject.type === "lab") {
                internalTd.innerHTML = `
                    <div class="detailed-inputs">
                        <div class="input-group">
                            <label>Day-to-Day (20)</label>
                            <input type="number" value="${subject.dayToDay}" min="0" max="20" oninput="updateInternal(${subject.id}, 'dayToDay', this.value)">
                        </div>
                        <div class="input-group">
                            <label>Skill Test 1 (30)</label>
                            <input type="number" value="${subject.skill1}" min="0" max="30" oninput="updateInternal(${subject.id}, 'skill1', this.value)">
                        </div>
                        <div class="input-group">
                            <label>Skill Test 2 (30)</label>
                            <input type="number" value="${subject.skill2}" min="0" max="30" oninput="updateInternal(${subject.id}, 'skill2', this.value)">
                        </div>
                    </div>
                `;
            } else {
                internalTd.innerHTML = `
                    <div class="detailed-inputs">
                        <div class="input-group">
                            <label>Mid 1 (30)</label>
                            <input type="number" value="${subject.mid1}" min="0" max="30" oninput="updateInternal(${subject.id}, 'mid1', this.value)">
                        </div>
                        <div class="input-group">
                            <label>Mid 2 (30)</label>
                            <input type="number" value="${subject.mid2}" min="0" max="30" oninput="updateInternal(${subject.id}, 'mid2', this.value)">
                        </div>
                        <div class="input-group">
                            <label>Asgn 1 (10)</label>
                            <input type="number" value="${subject.assig1}" min="0" max="10" oninput="updateInternal(${subject.id}, 'assig1', this.value)">
                        </div>
                        <div class="input-group">
                            <label>Asgn 2 (10)</label>
                            <input type="number" value="${subject.assig2}" min="0" max="10" oninput="updateInternal(${subject.id}, 'assig2', this.value)">
                        </div>
                    </div>
                `;
            }
        } else {
            internalTd.innerHTML = `
                <div class="input-group">
                    <label>Internal (50)</label>
                    <input type="number" value="${subject.simpleInternal}" min="0" max="50" oninput="updateInternal(${subject.id}, 'simple', this.value)">
                </div>
            `;
        }
        tr.appendChild(internalTd);

        // Grades Columns
        const internalTotal = calculateInternalTotal(subject);
        const gradesTd = document.createElement('td');
        gradesTd.setAttribute('colspan', '6');
        
        const gradeGrid = document.createElement('div');
        gradeGrid.className = 'grade-grid';

        gradingSystem.forEach(grade => {
            const reqExternal = grade.minPercentage - internalTotal;
            let displayVal = "";
            let isDisabled = false;

            const minPossibleTotal = internalTotal + 20;
            
            if (reqExternal > 50 || minPossibleTotal > grade.maxPercentage) {
                displayVal = "N/A";
                isDisabled = true;
            } else {
                // Rule: External passing is 20M
                displayVal = Math.max(20, Math.ceil(reqExternal));
            }

            const btn = document.createElement('button');
            btn.className = `grade-btn ${grade.grade.toLowerCase().replace('+', 'p')} ${isDisabled ? 'disabled' : ''} ${subject.targetGrade === grade.grade ? 'active' : ''}`;
            btn.innerText = displayVal;
            btn.title = `Total needed: ${grade.minPercentage}`;
            
            if (!isDisabled) {
                btn.onclick = () => selectGrade(subject.id, grade.grade);
            }
            
            gradeGrid.appendChild(btn);
        });
        
        gradesTd.appendChild(gradeGrid);
        tr.appendChild(gradesTd);

        // Action Column
        const actionTd = document.createElement('td');
        actionTd.innerHTML = `<button class="delete-btn" onclick="deleteSubject(${subject.id})"><i class="fas fa-trash"></i></button>`;
        tr.appendChild(actionTd);

        tbody.appendChild(tr);
    });

    calculateTotalGPA();
}

function calculateInternalTotal(subject) {
    if (isDetailedMode) {
        if (subject.type === "lab") {
            const skillAvg = (parseFloat(subject.skill1 || 0) + parseFloat(subject.skill2 || 0)) / 2;
            const dayTotal = parseFloat(subject.dayToDay || 0);
            return Math.ceil(dayTotal + skillAvg);
        } else {
            const midAvg = (parseFloat(subject.mid1 || 0) + parseFloat(subject.mid2 || 0)) / 2;
            const assigTotal = parseFloat(subject.assig1 || 0) + parseFloat(subject.assig2 || 0);
            return Math.ceil(midAvg + assigTotal);
        }
    } else {
        return Math.ceil(parseFloat(subject.simpleInternal || 0));
    }
}

function updateInternal(id, field, value) {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
        const val = parseFloat(value) || 0;
        if (field === 'mid1') subject.mid1 = Math.min(30, Math.max(0, val));
        if (field === 'mid2') subject.mid2 = Math.min(30, Math.max(0, val));
        if (field === 'assig1') subject.assig1 = Math.min(10, Math.max(0, val));
        if (field === 'assig2') subject.assig2 = Math.min(10, Math.max(0, val));
        if (field === 'dayToDay') subject.dayToDay = Math.min(20, Math.max(0, val));
        if (field === 'skill1') subject.skill1 = Math.min(30, Math.max(0, val));
        if (field === 'skill2') subject.skill2 = Math.min(30, Math.max(0, val));
        if (field === 'simple') subject.simpleInternal = Math.min(50, Math.max(0, val));
        
        // Update the row's grade buttons without re-rendering everything
        updateRowGrades(id);
        calculateTotalGPA();
    }
}

function updateRowGrades(id) {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;

    const internalTotal = calculateInternalTotal(subject);
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    const gradeButtons = row.querySelectorAll('.grade-btn');
    gradingSystem.forEach((grade, index) => {
        const reqExternal = grade.minPercentage - internalTotal;
        const minPossibleTotal = internalTotal + 20;
        const btn = gradeButtons[index];
        
        let displayVal = "";
        let isDisabled = false;

        if (reqExternal > 50 || minPossibleTotal > grade.maxPercentage) {
            displayVal = "N/A";
            isDisabled = true;
        } else {
            // Rule: External passing is 20M. 
            // If they need less than 20 to reach the grade, they still need 20 to pass.
            displayVal = Math.max(20, Math.ceil(reqExternal));
        }

        btn.innerText = displayVal;
        btn.className = `grade-btn ${grade.grade.toLowerCase().replace('+', 'p')} ${isDisabled ? 'disabled' : ''} ${subject.targetGrade === grade.grade ? 'active' : ''}`;
        
        if (isDisabled) {
            btn.onclick = null;
        } else {
            btn.onclick = () => selectGrade(subject.id, grade.grade);
        }
    });
    saveToLocalStorage();
}

function updateSubjectName(id, name) {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
        subject.name = name;
        saveToLocalStorage();
    }
}

function selectGrade(id, grade) {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
        subject.targetGrade = subject.targetGrade === grade ? null : grade;
        updateRowGrades(id);
        calculateTotalGPA();
        saveToLocalStorage();
    }
}

function deleteSubject(id) {
    subjects = subjects.filter(s => s.id !== id);
    renderTable();
}

function calculateTotalGPA() {
    let totalPoints = 0;
    let totalCredits = 0;
    let hasSelections = false;

    subjects.forEach(subject => {
        if (subject.targetGrade) {
            const gradeInfo = gradingSystem.find(g => g.grade === subject.targetGrade);
            totalPoints += (gradeInfo.points * subject.credits);
            totalCredits += subject.credits;
            hasSelections = true;
        }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    document.getElementById('total-gpa').innerText = gpa;
}

function setupEventListeners() {
    document.getElementById('detailed-tab').onclick = () => {
        isDetailedMode = true;
        document.getElementById('detailed-tab').classList.add('active');
        document.getElementById('simple-tab').classList.remove('active');
        renderTable();
    };

    document.getElementById('simple-tab').onclick = () => {
        isDetailedMode = false;
        document.getElementById('simple-tab').classList.add('active');
        document.getElementById('detailed-tab').classList.remove('active');
        renderTable();
    };

    document.getElementById('add-subject').onclick = () => {
        const name = prompt("Enter Subject Name:", "New Subject");
        if (!name) return;
        
        const creditsInput = prompt("Enter Credits:", "3.0");
        if (creditsInput === null) return;
        const credits = parseFloat(creditsInput) || 3.0;

        subjects.push({
            id: Date.now(),
            name: name,
            credits: credits,
            type: "theory", // Default to theory
            mid1: 0,
            mid2: 0,
            assig1: 0,
            assig2: 0,
            dayToDay: 0,
            skill1: 0,
            skill2: 0,
            simpleInternal: 0,
            targetGrade: null
        });
        renderTable();
        saveToLocalStorage();
    };

    document.getElementById('reset-all').onclick = () => {
        if (confirm("Reset all marks and subjects?")) {
            localStorage.removeItem('cgpa_subjects');
            init();
        }
    };

    document.getElementById('predict-all').onclick = () => {
        subjects.forEach(subject => {
            const internal = calculateInternalTotal(subject);
            // Auto-select the highest possible grade
            for (let grade of gradingSystem) {
                if (grade.minPercentage - internal <= 50) {
                    subject.targetGrade = grade.grade;
                    break;
                }
            }
        });
        renderTable();
    };
}

init();
