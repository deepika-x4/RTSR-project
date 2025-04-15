// Family Health Portal - Core Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });
    }

    // Initialize data structure if it doesn't exist
    if (!localStorage.getItem('familyHealthData')) {
        localStorage.setItem('familyHealthData', JSON.stringify({
            personal: {},
            family: [],
            documents: [],
            diseaseRisks: {}
        }));
    }

    // Get current data
    const appData = JSON.parse(localStorage.getItem('familyHealthData'));

    // Export functionality
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const dataStr = JSON.stringify(appData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportName = 'family-health-data-' + new Date().toISOString().slice(0, 10) + '.json';
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportName);
            linkElement.click();
            
            showToast('Data exported successfully!', 'success');
        });
    }

    // Print functionality
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }

    // Disease risk calculation
    function calculateDiseaseRisks() {
        const diseases = {};
        
        // Process personal conditions
        if (appData.personal.conditions) {
            appData.personal.conditions.forEach(condition => {
                diseases[condition] = (diseases[condition] || 0) + 1;
            });
        }
        
        // Process family conditions
        appData.family.forEach(member => {
            if (member.conditions) {
                member.conditions.forEach(condition => {
                    diseases[condition] = (diseases[condition] || 0) + 1;
                });
            }
        });
        
        // Calculate probabilities
        const totalMembers = appData.family.length + 1; // self + family
        const risks = {};
        
        for (const [disease, count] of Object.entries(diseases)) {
            // Simple probability calculation (would be more complex in real app)
            risks[disease] = Math.min(1, (count / totalMembers) * 2).toFixed(2);
        }
        
        appData.diseaseRisks = risks;
        localStorage.setItem('familyHealthData', JSON.stringify(appData));
        return risks;
    }

    // Process uploaded document
    function processDocument(text) {
        return fetch('/process_document', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Update personal conditions
                if (!appData.personal.conditions) {
                    appData.personal.conditions = [];
                }
                
                Object.keys(data.diseases).forEach(disease => {
                    if (!appData.personal.conditions.includes(disease)) {
                        appData.personal.conditions.push(disease);
                    }
                });
                
                localStorage.setItem('familyHealthData', JSON.stringify(appData));
                calculateDiseaseRisks();
                return data.diseases;
            }
            throw new Error('Document processing failed');
        });
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Initialize disease risks if not calculated
    if (!appData.diseaseRisks || Object.keys(appData.diseaseRisks).length === 0) {
        calculateDiseaseRisks();
    }
});