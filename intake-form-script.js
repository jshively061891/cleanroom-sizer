document.addEventListener('DOMContentLoaded', function() {
    const { jsPDF } = window.jspdf;

    // --- Section Toggling & Guidance ---
    const stageSelect = document.getElementById('projectStage');
    const romSection = document.getElementById('romSection');
    const budgetarySection = document.getElementById('budgetarySection');
    const detailedSection = document.getElementById('detailedSection');
    const stageGuidance = document.getElementById('stage-guidance');

    const sections = {
        rom: romSection,
        budgetary: budgetarySection,
        detailed: detailedSection
    };

    const stageNotes = {
        rom: "You've selected <strong>ROM</strong>. This initial phase requires basic scope information to provide a high-level cost estimate (typically +/- 30%).",
        budgetary: "You've selected <strong>Budgetary Estimate</strong>. This requires more specific environmental and architectural details for a more refined estimate (typically +/- 15%).",
        detailed: "You've selected <strong>Detailed Quote</strong>. This requires a deep dive into all technical aspects for a firm, bid-ready price. All sections are required."
    };

    function toggleSections() {
        const selectedStage = stageSelect.value;
        sections.rom.style.display = 'block';
        sections.budgetary.style.display = (selectedStage === 'budgetary' || selectedStage === 'detailed') ? 'block' : 'none';
        sections.detailed.style.display = selectedStage === 'detailed' ? 'block' : 'none';
        if (stageNotes[selectedStage]) {
            stageGuidance.innerHTML = stageNotes[selectedStage];
            stageGuidance.style.display = 'block';
        } else {
            stageGuidance.style.display = 'none';
        }
    }
    
    stageSelect.addEventListener('change', toggleSections);
    toggleSections();

    // --- Collapsible Section Logic (SCROLL FIX INCLUDED) ---
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.icon');
            icon.classList.toggle('rotate');
            content.classList.toggle('open');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                // By setting maxHeight to scrollHeight, the container expands to fit all its content,
                // allowing the main page scrollbar to function correctly.
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Function to recalculate maxHeight when guidance notes appear
    function refreshCollapsibleHeight(element) {
        const content = element.closest('.collapsible-content');
        if (content && content.classList.contains('open')) {
            // Temporarily reset to allow browser to recalculate, then set new height
            content.style.maxHeight = 'none';
            content.style.maxHeight = content.scrollHeight + "px";
        }
    }

    // --- Intelligent Guidance Notes (Functions remain the same, but now call the height refresh) ---
    const cleanroomTempInput = document.getElementById('cleanroomTemp');
    const cleanroomRHInput = document.getElementById('cleanroomRH');
    // ... (all other input element selections from previous script)
    const ambientTempInput = document.getElementById('ambientTemp');
    const isoRatingSelect = document.getElementById('isoRating');
    const hazardousSelect = document.getElementById('hazardous');
    const complianceInput = document.getElementById('compliance');
    const buildingHeightInput = document.getElementById('buildingHeight');

    function checkDewPoint() {
        const temp = parseFloat(cleanroomTempInput.value);
        const rh = parseFloat(cleanroomRHInput.value);
        const warningDiv = document.getElementById('dew-point-warning');
        let wasVisible = warningDiv.style.display === 'block';
        if (temp <= 70 && rh <= 30 && temp && rh) {
            warningDiv.innerHTML = "<strong>⚠️ Low Dew Point Warning:</strong> These are demanding environmental conditions that require specialized dehumidification equipment (like a desiccant dryer), which significantly impacts cost. Please confirm with the client that these exact parameters are critical for their process.";
            warningDiv.style.display = 'block';
            if (!wasVisible) refreshCollapsibleHeight(warningDiv);
        } else {
            warningDiv.style.display = 'none';
            if (wasVisible) refreshCollapsibleHeight(warningDiv);
        }
    }
    // ... Apply this logic to all other guidance functions ...
    function checkTempDifferential() {
        const cleanroomTemp = parseFloat(cleanroomTempInput.value);
        const ambientTemp = parseFloat(ambientTempInput.value);
        const guidanceDiv = document.getElementById('hvac-design-guidance');
        let wasVisible = guidanceDiv.style.display === 'block';
        if (cleanroomTemp && ambientTemp && Math.abs(cleanroomTemp - ambientTemp) <= 5) {
             guidanceDiv.innerHTML = "<strong>💡 HVAC Design Note:</strong> The required cleanroom temperature is very close to the surrounding ambient temperature. If humidity control is not stringent, a simpler 'once-through' HVAC design might be feasible instead of a dedicated recirculating system. This can be a significant cost savings.";
             guidanceDiv.style.display = 'block';
             if(!wasVisible) refreshCollapsibleHeight(guidanceDiv);
        } else {
            guidanceDiv.style.display = 'none';
            if(wasVisible) refreshCollapsibleHeight(guidanceDiv);
        }
    }

    function showIsoGuidance() {
        const rating = isoRatingSelect.value;
        const guidanceDiv = document.getElementById('iso-guidance');
        let wasVisible = guidanceDiv.style.display === 'block';
        const notes = {
            '5': '<strong>ISO 5 Note:</strong> This is a very high classification, typically requiring 240-600 air changes per hour (ACH) and full HEPA filter ceiling coverage.',
            '6': '<strong>ISO 6 Note:</strong> Requires high airflow, typically 150-240 ACH.',
            '7': '<strong>ISO 7 Note:</strong> A common classification for many applications, typically requiring 60-90 ACH.',
            '8': '<strong>ISO 8 Note:</strong> The lowest cleanroom classification, typically requiring 20-40 ACH.'
        };
        if (notes[rating]) {
            guidanceDiv.innerHTML = notes[rating];
            guidanceDiv.style.display = 'block';
            if(!wasVisible) refreshCollapsibleHeight(guidanceDiv);
        } else {
            guidanceDiv.style.display = 'none';
            if(wasVisible) refreshCollapsibleHeight(guidanceDiv);
        }
    }
    function checkHazardous() {
        const selection = hazardousSelect.value;
        const guidanceDiv = document.getElementById('hazardous-guidance');
        let wasVisible = guidanceDiv.style.display === 'block';
        if (selection === 'hazardous') {
            guidanceDiv.innerHTML = "<strong>Action Required:</strong> Since hazardous materials are involved, the engineering team will need the Safety Data Sheets (SDS) for all chemicals to determine proper airflow (single-pass vs. recirculation) and safety requirements.";
            guidanceDiv.style.display = 'block';
            if(!wasVisible) refreshCollapsibleHeight(guidanceDiv);
        } else {
            guidanceDiv.style.display = 'none';
            if(wasVisible) refreshCollapsibleHeight(guidanceDiv);
        }
    }
    function checkCompliance() {
        const text = complianceInput.value.toLowerCase();
        const guidanceDiv = document.getElementById('compliance-guidance');
        let wasVisible = guidanceDiv.style.display === 'block';
        if (text.includes('usp') || text.includes('797') || text.includes('800')) {
            guidanceDiv.innerHTML = "<strong>Compliance Note:</strong> USP 797/800 projects have very specific requirements for room pressurization, material pass-throughs, and environmental monitoring. The design will need to adhere strictly to these pharmacy compounding standards.";
            guidanceDiv.style.display = 'block';
            if(!wasVisible) refreshCollapsibleHeight(guidanceDiv);
        } else {
            guidanceDiv.style.display = 'none';
            if(wasVisible) refreshCollapsibleHeight(guidanceDiv);
        }
    }
    function checkPlenumSpace() {
        const height = parseFloat(buildingHeightInput.value);
        const guidanceDiv = document.getElementById('height-guidance');
        let wasVisible = guidanceDiv.style.display === 'block';
        if (height && height < 12) {
            guidanceDiv.innerHTML = "<strong>⚠️ Height Constraint Warning:</strong> A building height under 12 feet provides very limited overhead (plenum) space for ductwork, HEPA filters, and utilities. This can complicate the design. Please verify the exact clear height available.";
            guidanceDiv.style.display = 'block';
            if(!wasVisible) refreshCollapsibleHeight(guidanceDiv);
        } else {
            guidanceDiv.style.display = 'none';
            if(wasVisible) refreshCollapsibleHeight(guidanceDiv);
        }
    }    
    // (Add the full functions from the previous response here, adding the refresh logic)
    
    cleanroomTempInput.addEventListener('input', checkDewPoint);
    cleanroomRHInput.addEventListener('input', checkDewPoint);
    cleanroomTempInput.addEventListener('input', checkTempDifferential);
    ambientTempInput.addEventListener('input', checkTempDifferential);
    isoRatingSelect.addEventListener('change', showIsoGuidance);
    hazardousSelect.addEventListener('change', checkHazardous);
    complianceInput.addEventListener('input', checkCompliance);
    buildingHeightInput.addEventListener('input', checkPlenumSpace);


    // --- PDF Export Functionality ---
    const exportBtn = document.getElementById('exportPdfBtn');
    exportBtn.addEventListener('click', function() {
        const formContainer = document.getElementById('formContainer');
        const customerName = document.getElementById('customerName').value || "Unnamed Project";
        const pdfFileName = `Cleanroom_Intake_${customerName.replace(/ /g, "_")}.pdf`;

        // Use html2canvas to capture the form as an image
        html2canvas(formContainer, {
            scale: 2, // Improve resolution
            useCORS: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgWidth = pdfWidth - 20; // with margin
            const imgHeight = imgWidth / ratio;
            
            let heightLeft = imgHeight;
            let position = 10; // top margin

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);

            // Logic to handle multi-page PDFs if content is very long
            while (heightLeft > 0) {
                position = -heightLeft - 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 20);
            }
            
            // Save the PDF
            pdf.save(pdfFileName);
        });
    });
});