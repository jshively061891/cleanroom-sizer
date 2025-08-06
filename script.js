document.addEventListener('DOMContentLoaded', function() {
    const { jsPDF } = window.jspdf;
    const addRoomButton = document.getElementById('add-room');
    const exportPdfButton = document.getElementById('export-pdf');
    const roomsContainer = document.getElementById('rooms-container');
    const environmentSelect = document.getElementById('environment');
    const indoorOptions = document.getElementById('indoor-options');
    const tempControlledSelect = document.getElementById('temp-controlled');
    const spaceTempInputs = document.getElementById('space-temp-inputs');
    const locationInput = document.getElementById('location-input');
    const customTemps = document.getElementById('custom-temps');
    const locationSelect = document.getElementById('location');
    const designTempsDisplay = document.getElementById('design-temps-display');
    const themeToggle = document.getElementById('theme-toggle');
    let roomCount = 1;
    let latestResults = null; // Store latest results for PDF export

    // Dark mode toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }

    function addEquipmentListener(roomDiv) {
        const addEquipButton = roomDiv.querySelector('.add-equipment');
        const equipContainer = roomDiv.querySelector('.equipment-container');
        let equipCount = 0;

        addEquipButton.addEventListener('click', function() {
            equipCount++;
            const equipDiv = document.createElement('div');
            equipDiv.className = 'equipment grid grid-cols-1 md:grid-cols-2 gap-4 mt-2';
            equipDiv.innerHTML = `
                <div>
                    <label class="block text-sm font-medium">Equipment Name:</label>
                    <input type="text" class="equip-name input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium">Watts:</label>
                    <input type="number" class="equip-watts input-field" required>
                </div>
                <button type="button" class="remove-equipment btn btn-secondary mt-2">Remove Equipment</button>
            `;
            equipContainer.appendChild(equipDiv);

            equipDiv.querySelector('.remove-equipment').addEventListener('click', function() {
                equipContainer.removeChild(equipDiv);
            });
        });
    }

    function addRemoveRoomListener(roomDiv) {
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-room btn btn-secondary mt-2';
        removeButton.textContent = 'Remove Room';
        roomDiv.appendChild(removeButton);

        removeButton.addEventListener('click', function() {
            if (roomsContainer.children.length > 1) {
                roomsContainer.removeChild(roomDiv);
                updateRoomNumbers();
            }
        });
    }

    function updateRoomNumbers() {
        const rooms = roomsContainer.querySelectorAll('.room');
        rooms.forEach((room, index) => {
            room.querySelector('h3').textContent = `Room ${index + 1}`;
        });
        roomCount = rooms.length;
    }

    function updateAch(roomDiv) {
        const isoSelect = roomDiv.querySelector('.iso-class');
        const achInput = roomDiv.querySelector('.custom-ach');

        isoSelect.addEventListener('change', function() {
            const isoClass = parseInt(isoSelect.value);
            const achRanges = {
                5: 450,
                6: 150,
                7: 65,
                8: 30
            };
            achInput.value = achRanges[isoClass] || '';
        });
    }

    addRoomButton.addEventListener('click', function() {
        roomCount++;
        const roomDiv = document.createElement('div');
        roomDiv.className = 'room bg-gray-50 dark:bg-gray-700 p-4 rounded-md';
        roomDiv.innerHTML = `
            <h3 class="text-lg font-semibold">Room ${roomCount}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                    <label class="block text-sm font-medium">Room Length (ft):</label>
                    <input type="number" class="length input-field" required>
                </div>
                <div>
                    <label class="block text-sm font-medium">Room Width (ft):</label>
                    <input type="number" class="width input-field" required>
                </div>
                <div>
                    <label class="block text-sm font-medium">Room Height (ft):</label>
                    <input type="number" class="height input-field" required>
                </div>
                <div>
                    <label class="block text-sm font-medium">ISO Class:</label>
                    <select class="iso-class input-field">
                        <option value="">-</option>
                        <option value="5">ISO 5 (200-450 ACH)</option>
                        <option value="6">ISO 6 (65-150 ACH)</option>
                        <option value="7">ISO 7 (30-65 ACH)</option>
                        <option value="8">ISO 8 (10-30 ACH)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium">Custom ACH:</label>
                    <input type="number" class="custom-ach input-field" required>
                </div>
                <div>
                    <label class="block text-sm font-medium">Single Pass Air:</label>
                    <select class="single-pass input-field">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>
            </div>
            <div class="equipment-container mt-4">
                <h4 class="text-md font-semibold">Equipment Loads</h4>
            </div>
            <button type="button" class="add-equipment btn btn-secondary mt-2">Add Equipment</button>
        `;
        roomsContainer.appendChild(roomDiv);
        addEquipmentListener(roomDiv);
        addRemoveRoomListener(roomDiv);
        updateAch(roomDiv);
    });

    // Add listeners to initial room
    addEquipmentListener(document.querySelector('.room'));
    updateAch(document.querySelector('.room'));

    // U.S. cities list with ASHRAE extreme design data (0.4% cooling DB/MCWB, 99.6% heating DB)
    const cities = [
        {city: "Anchorage", state: "AK", country: "USA", coolingDB: 77, mcwb: 62, heatingDB: -26},
        {city: "Auburn-Opelika", state: "AL", country: "USA", coolingDB: 95, mcwb: 75, heatingDB: 17},
        {city: "Baltimore", state: "MD", country: "USA", coolingDB: 95, mcwb: 77, heatingDB: 11},
        {city: "Birmingham", state: "AL", country: "USA", coolingDB: 97, mcwb: 76, heatingDB: 15},
        {city: "Boston", state: "MA", country: "USA", coolingDB: 91, mcwb: 74, heatingDB: 5},
        {city: "Buffalo", state: "NY", country: "USA", coolingDB: 89, mcwb: 73, heatingDB: -4},
        {city: "Charlotte", state: "NC", country: "USA", coolingDB: 94, mcwb: 76, heatingDB: 16},
        {city: "Chicago", state: "IL", country: "USA", coolingDB: 94, mcwb: 76, heatingDB: -10},
        {city: "Cleveland", state: "OH", country: "USA", coolingDB: 91, mcwb: 74, heatingDB: -2},
        {city: "Dallas", state: "TX", country: "USA", coolingDB: 102, mcwb: 76, heatingDB: 19},
        {city: "Denver", state: "CO", country: "USA", coolingDB: 96, mcwb: 64, heatingDB: 2},
        {city: "Detroit", state: "MI", country: "USA", coolingDB: 92, mcwb: 75, heatingDB: -4},
        {city: "Dothan", state: "AL", country: "USA", coolingDB: 97, mcwb: 77, heatingDB: 22},
        {city: "Fairbanks", state: "AK", country: "USA", coolingDB: 85, mcwb: 63, heatingDB: -50},
        {city: "Hartford", state: "CT", country: "USA", coolingDB: 91, mcwb: 74, heatingDB: 5},
        {city: "Honolulu", state: "HI", country: "USA", coolingDB: 90, mcwb: 76, heatingDB: 60},
        {city: "Houston", state: "TX", country: "USA", coolingDB: 97, mcwb: 78, heatingDB: 24},
        {city: "Huntsville", state: "AL", country: "USA", coolingDB: 96, mcwb: 76, heatingDB: 13},
        {city: "Indianapolis", state: "IN", country: "USA", coolingDB: 93, mcwb: 75, heatingDB: -2},
        {city: "Jacksonville", state: "FL", country: "USA", coolingDB: 95, mcwb: 78, heatingDB: 26},
        {city: "Juneau", state: "AK", country: "USA", coolingDB: 76, mcwb: 61, heatingDB: 0},
        {city: "Kansas City", state: "KS", country: "USA", coolingDB: 99, mcwb: 76, heatingDB: 0},
        {city: "Las Vegas", state: "NV", country: "USA", coolingDB: 112, mcwb: 70, heatingDB: 24},
        {city: "Little Rock", state: "AR", country: "USA", coolingDB: 99, mcwb: 77, heatingDB: 16},
        {city: "Los Angeles", state: "CA", country: "USA", coolingDB: 88, mcwb: 70, heatingDB: 39},
        {city: "Miami", state: "FL", country: "USA", coolingDB: 93, mcwb: 79, heatingDB: 41},
        {city: "Milwaukee", state: "WI", country: "USA", coolingDB: 91, mcwb: 74, heatingDB: -7},
        {city: "Minneapolis", state: "MN", country: "USA", coolingDB: 92, mcwb: 73, heatingDB: -16},
        {city: "Mobile", state: "AL", country: "USA", coolingDB: 95, mcwb: 78, heatingDB: 22},
        {city: "Montgomery", state: "AL", country: "USA", coolingDB: 98, mcwb: 77, heatingDB: 19},
        {city: "New York", state: "NY", country: "USA", coolingDB: 91, mcwb: 74, heatingDB: 7},
        {city: "Philadelphia", state: "PA", country: "USA", coolingDB: 94, mcwb: 76, heatingDB: 7},
        {city: "Phoenix", state: "AZ", country: "USA", coolingDB: 113, mcwb: 72, heatingDB: 28},
        {city: "Portland", state: "OR", country: "USA", coolingDB: 94, mcwb: 68, heatingDB: 20},
        {city: "Reno", state: "NV", country: "USA", coolingDB: 98, mcwb: 63, heatingDB: 7},
        {city: "San Antonio", state: "TX", country: "USA", coolingDB: 100, mcwb: 76, heatingDB: 24},
        {city: "San Diego", state: "CA", country: "USA", coolingDB: 83, mcwb: 69, heatingDB: 42},
        {city: "San Francisco", state: "CA", country: "USA", coolingDB: 81, mcwb: 64, heatingDB: 35},
        {city: "Savannah", state: "GA", country: "USA", coolingDB: 97, mcwb: 77, heatingDB: 20},
        {city: "Seattle", state: "WA", country: "USA", coolingDB: 85, mcwb: 67, heatingDB: 20},
        {city: "St Louis", state: "MO", country: "USA", coolingDB: 98, mcwb: 76, heatingDB: -1},
        {city: "Tucson", state: "AZ", country: "USA", coolingDB: 108, mcwb: 69, heatingDB: 25},
        {city: "Washington", state: "DC", country: "USA", coolingDB: 96, mcwb: 77, heatingDB: 12}
    ].sort((a, b) => a.city.localeCompare(b.city));

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.city;
        option.text = `${city.city}, ${city.state}, ${city.country}`;
        option.dataset.coolingdb = city.coolingDB;
        option.dataset.mcwb = city.mcwb;
        option.dataset.heatingdb = city.heatingDB;
        locationSelect.appendChild(option);
    });

    environmentSelect.addEventListener('change', updateInputs);
    tempControlledSelect.addEventListener('change', updateInputs);

    function updateInputs() {
        const environment = environmentSelect.value;
        indoorOptions.style.display = environment === 'indoor' ? 'block' : 'none';
        locationInput.style.display = environment === 'outdoor' || (environment === 'indoor' && tempControlledSelect.value === 'no') ? 'block' : 'none';
        customTemps.style.display = environment === 'outdoor' || (environment === 'indoor' && tempControlledSelect.value === 'no') ? 'block' : 'none';
        spaceTempInputs.style.display = (environment === 'indoor' && tempControlledSelect.value === 'yes') ? 'block' : 'none';

        const selectedOption = locationSelect.options[locationSelect.selectedIndex];
        if (locationInput.style.display === 'block' && selectedOption && selectedOption.value) {
            designTempsDisplay.innerHTML = `
                Summer Design: DB ${selectedOption.dataset.coolingdb}°F, MCWB ${selectedOption.dataset.mcwb}°F<br>
                Winter Design: DB ${selectedOption.dataset.heatingdb}°F
            `;
            document.getElementById('custom-cooling-db').value = selectedOption.dataset.coolingdb;
            document.getElementById('custom-mcwb').value = selectedOption.dataset.mcwb;
            document.getElementById('custom-heating-db').value = selectedOption.dataset.heatingdb;
        } else {
            designTempsDisplay.innerHTML = '';
            document.getElementById('custom-cooling-db').value = '';
            document.getElementById('custom-mcwb').value = '';
            document.getElementById('custom-heating-db').value = '';
        }
    }

    locationSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            designTempsDisplay.innerHTML = `
                Summer Design: DB ${selectedOption.dataset.coolingdb}°F, MCWB ${selectedOption.dataset.mcwb}°F<br>
                Winter Design: DB ${selectedOption.dataset.heatingdb}°F
            `;
            document.getElementById('custom-cooling-db').value = selectedOption.dataset.coolingdb;
            document.getElementById('custom-mcwb').value = selectedOption.dataset.mcwb;
            document.getElementById('custom-heating-db').value = selectedOption.dataset.heatingdb;
        } else {
            designTempsDisplay.innerHTML = '';
            document.getElementById('custom-cooling-db').value = '';
            document.getElementById('custom-mcwb').value = '';
            document.getElementById('custom-heating-db').value = '';
        }
    });

    // Psychrometric functions
    function fToC(T_F) {
        return (T_F - 32) / 1.8;
    }

    function saturationVaporPressure(T_C) {
        return 6.112 * Math.exp((17.67 * T_C) / (T_C + 243.5));
    }

    function vaporPressure(RH, P_sat) {
        return (RH / 100) * P_sat;
    }

    function humidityRatio(P_v) {
        const P_atm = 1013.25;
        return 0.62198 * P_v / (P_atm - P_v);
    }

    function enthalpy(T_F, W) {
        return 0.24 * T_F + W * (1061 + 0.444 * T_F);
    }

    function humidityRatioFromDBWB(T_db_F, T_wb_F) {
        const T_db_C = fToC(T_db_F);
        const T_wb_C = fToC(T_wb_F);
        const P_sat_wb = saturationVaporPressure(T_wb_C);
        const P_atm = 1013.25;
        const psych_constant = 0.00066;
        const P_v = P_sat_wb - P_atm * (T_db_C - T_wb_C) * psych_constant * (1 + 0.00115 * T_wb_C);
        return 0.62198 * P_v / (P_atm - P_v);
    }

    function dewPoint(T_F, RH) {
        const T_C = fToC(T_F);
        const P_sat = saturationVaporPressure(T_C);
        const P_v = vaporPressure(RH, P_sat);
        const Td_C = (243.5 * Math.log(P_v / 6.112)) / (17.67 - Math.log(P_v / 6.112));
        return Td_C * 1.8 + 32; // °F
    }

    document.getElementById('hvac-form').addEventListener('submit', function(event) {
        event.preventDefault();
        exportPdfButton.classList.remove('hidden'); // Show export button after calculation

        const roomTemp = parseFloat(document.getElementById('room-temp').value);
        const roomRH = parseFloat(document.getElementById('room-rh').value);
        const totalPeople = parseInt(document.getElementById('people').value);
        const rWall = parseFloat(document.getElementById('r-wall').value);
        const rRoof = parseFloat(document.getElementById('r-roof').value);
        const rFloor = parseFloat(document.getElementById('r-floor').value);
        const ffuWattage = parseFloat(document.getElementById('ffu-wattage').value);
        const safetyFactor = parseFloat(document.getElementById('safety-factor').value) / 100;
        const environment = environmentSelect.value;

        let outdoorTemp, outdoorRH, outdoorWinterTemp, useWB = false, outdoorW;
        let environmentDetails = '';
        if (environment === '') {
            document.getElementById('results').innerHTML = 'Error: Please select an environment (Indoor or Outdoor).';
            return;
        }
        if (environment === 'indoor') {
            const controlled = tempControlledSelect.value;
            if (controlled === 'yes') {
                outdoorTemp = parseFloat(document.getElementById('space-temp').value);
                outdoorRH = parseFloat(document.getElementById('space-rh').value);
                outdoorWinterTemp = outdoorTemp;
                environmentDetails = `Indoor, Temp-Controlled, Space Temp: ${outdoorTemp}°F, Space RH: ${outdoorRH}%`;
            } else {
                const selectedLocation = locationSelect.options[locationSelect.selectedIndex];
                if (selectedLocation.value === '') {
                    document.getElementById('results').innerHTML = 'Error: Please select a location.';
                    return;
                }
                outdoorTemp = parseFloat(document.getElementById('custom-cooling-db').value) || parseFloat(selectedLocation.dataset.coolingdb);
                const mcwb = parseFloat(document.getElementById('custom-mcwb').value) || parseFloat(selectedLocation.dataset.mcwb);
                outdoorW = humidityRatioFromDBWB(outdoorTemp, mcwb);
                useWB = true;
                outdoorWinterTemp = parseFloat(document.getElementById('custom-heating-db').value) || parseFloat(selectedLocation.dataset.heatingdb);
                environmentDetails = `Indoor, Non-Temp-Controlled, Location: ${selectedLocation.text}, Custom Cooling DB: ${outdoorTemp}°F, MCWB: ${mcwb}°F, Heating DB: ${outdoorWinterTemp}°F`;
            }
        } else {
            const selectedLocation = locationSelect.options[locationSelect.selectedIndex];
            if (selectedLocation.value === '') {
                document.getElementById('results').innerHTML = 'Error: Please select a location.';
                return;
            }
            outdoorTemp = parseFloat(document.getElementById('custom-cooling-db').value) || parseFloat(selectedLocation.dataset.coolingdb);
            const mcwb = parseFloat(document.getElementById('custom-mcwb').value) || parseFloat(selectedLocation.dataset.mcwb);
            outdoorW = humidityRatioFromDBWB(outdoorTemp, mcwb);
            useWB = true;
            outdoorWinterTemp = parseFloat(document.getElementById('custom-heating-db').value) || parseFloat(selectedLocation.dataset.heatingdb);
            environmentDetails = `Outdoor, Location: ${selectedLocation.text}, Custom Cooling DB: ${outdoorTemp}°F, MCWB: ${mcwb}°F, Heating DB: ${outdoorWinterTemp}°F`;
        }

        if (isNaN(roomTemp) || isNaN(roomRH) || roomRH < 0 || roomRH > 100) {
            document.getElementById('results').innerHTML = 'Error: Invalid room temperature or RH.';
            return;
        }
        if (isNaN(totalPeople) || totalPeople < 0) {
            document.getElementById('results').innerHTML = 'Error: Invalid number of people.';
            return;
        }
        if (isNaN(rWall) || isNaN(rRoof) || isNaN(rFloor) || rWall <= 0 || rRoof <= 0 || rFloor <= 0) {
            document.getElementById('results').innerHTML = 'Error: Invalid R-values.';
            return;
        }
        if (isNaN(ffuWattage) || ffuWattage <= 0) {
            document.getElementById('results').innerHTML = 'Error: Invalid FFU wattage.';
            return;
        }
        if (isNaN(safetyFactor) || safetyFactor < 0 || safetyFactor > 0.5) {
            document.getElementById('results').innerHTML = 'Error: Invalid safety factor (0-50%).';
            return;
        }
        if (environment === 'indoor' && tempControlledSelect.value === 'yes') {
            if (isNaN(outdoorTemp) || isNaN(outdoorRH) || outdoorRH < 0 || outdoorRH > 100) {
                document.getElementById('results').innerHTML = 'Error: Invalid space temperature or RH.';
                return;
            }
        } else {
            if (isNaN(outdoorTemp) || isNaN(outdoorWinterTemp)) {
                document.getElementById('results').innerHTML = 'Error: Invalid location or custom temps.';
                return;
            }
        }

        const room_T_C = fToC(roomTemp);
        const room_P_sat = saturationVaporPressure(room_T_C);
        const room_P_v = vaporPressure(roomRH, room_P_sat);
        const room_W = humidityRatio(room_P_v);
        const h_room = enthalpy(roomTemp, room_W);

        let h_outdoor, winter_W;
        if (useWB) {
            h_outdoor = enthalpy(outdoorTemp, outdoorW);
            winter_W = humidityRatioFromDBWB(outdoorWinterTemp, outdoorWinterTemp); // Assume low RH (20%) for winter
        } else {
            const outdoor_T_C = fToC(outdoorTemp);
            const outdoor_P_sat = saturationVaporPressure(outdoor_T_C);
            const outdoor_P_v = vaporPressure(outdoorRH, outdoor_P_sat);
            const outdoor_W_local = humidityRatio(outdoor_P_v);
            h_outdoor = enthalpy(outdoorTemp, outdoor_W_local);
            const winter_T_C = fToC(outdoorWinterTemp);
            const winter_P_sat = saturationVaporPressure(winter_T_C);
            const winter_P_v = vaporPressure(20, winter_P_sat); // Assume 20% RH for winter
            winter_W = humidityRatio(winter_P_v);
        }

        const rooms = document.querySelectorAll('.room');
        let totalCfm = 0;
        let totalFfUs = 0;
        let totalLightingWatts = 0;
        let totalEquipWatts = 0;
        let totalFfuWatts = 0;
        let totalMakeupCfm = 0;
        let totalRecircCfm = 0;
        let totalEnvelopeLoad = 0;
        let validationMessages = [];
        let roomDetails = [];

        let resultsHtml = ''; // Declare once at the start

        rooms.forEach((room, index) => {
            const length = parseFloat(room.querySelector('.length').value);
            const width = parseFloat(room.querySelector('.width').value);
            const height = parseFloat(room.querySelector('.height').value);
            const customAch = parseFloat(room.querySelector('.custom-ach').value);
            const singlePass = room.querySelector('.single-pass').value;
            const isoClass = room.querySelector('.iso-class').value;

            if (isNaN(length) || isNaN(width) || isNaN(height) || length <= 0 || width <= 0 || height <= 0) {
                document.getElementById('results').innerHTML = 'Error: Invalid room dimensions.';
                return;
            }
            if (isNaN(customAch) || customAch <= 0) {
                document.getElementById('results').innerHTML = `Error in Room ${index + 1}: Invalid ACH.`;
                return;
            }
            if (isoClass === '') {
                document.getElementById('results').innerHTML = `Error in Room ${index + 1}: Please select an ISO Class.`;
                return;
            }

            const volume = length * width * height;
            const cfm = (volume * customAch) / 60 * (1 + safetyFactor); // Apply safety factor to CFM
            totalCfm += cfm;

            const cfmPerFFU = 600;
            const ffus = Math.ceil(cfm / cfmPerFFU); // Round up to ensure whole FFUs
            totalFfUs += ffus;

            const ffuWatts = ffus * ffuWattage;
            totalFfuWatts += ffuWatts;

            const area = length * width;
            const workplaneHeight = 2.5;
            const h_rc = height - workplaneHeight;
            if (h_rc <= 0) {
                document.getElementById('results').innerHTML = `Error in Room ${index + 1}: Height too low.`;
                return;
            }
            const rcr = 5 * h_rc * (length + width) / area;

            const cuTable = [1.19, 1.03, 0.89, 0.78, 0.69, 0.62, 0.55, 0.50, 0.46, 0.42, 0.38];
            const rcrIndex = Math.min(Math.round(rcr), 10);
            const cu = cuTable[rcrIndex];

            const illuminance = 60;
            const llf = 0.8;
            const lumensPerFixture = 5000;
            const wattsPerFixture = 50;

            const numFixtures = Math.ceil((illuminance * area) / (lumensPerFixture * cu * llf));
            const lightingWatts = numFixtures * wattsPerFixture;
            totalLightingWatts += lightingWatts;

            let equipWatts = 0;
            let equipDetails = '';
            const equipments = room.querySelectorAll('.equipment');
            equipments.forEach(equip => {
                const name = equip.querySelector('.equip-name').value.trim() || 'Unnamed Equipment';
                const watts = parseFloat(equip.querySelector('.equip-watts').value);
                if (!isNaN(watts) && watts > 0) {
                    equipWatts += watts;
                    equipDetails += `- ${name}: ${watts} W\n`;
                }
            });
            totalEquipWatts += equipWatts;

            // Envelope load for this room (sensible)
            const wallArea = 2 * (length + width) * height;
            const roofArea = area;
            const floorArea = area;
            const envelopeLoad = (wallArea / rWall + roofArea / rRoof + floorArea / rFloor) * (roomTemp - outdoorTemp); // BTU/hr, positive for cooling
            totalEnvelopeLoad += envelopeLoad;

            // Makeup for this room
            const roomMakeupCfm = (singlePass === 'yes') ? cfm : cfm * 0.1;
            totalMakeupCfm += roomMakeupCfm;
            const roomRecircCfm = cfm - roomMakeupCfm;
            totalRecircCfm += roomRecircCfm;

            if (customAch > 500) validationMessages.push(`Room ${index + 1}: Extreme ACH (${customAch}); may require oversized fans.`);
            if (cfm > 10000) validationMessages.push(`Room ${index + 1}: High CFM (${cfm.toFixed(2)}); may require multiple units.`);

            roomDetails.push({
                index: index + 1,
                singlePass,
                cfm,
                roomMakeupCfm,
                roomRecircCfm,
                ffus,
                ffuWatts,
                rcr,
                cu,
                numFixtures,
                lightingWatts,
                equipDetails,
                equipWatts,
                envelopeLoad
            });

            resultsHtml += `
                <h3 class="text-lg font-semibold">Room ${index + 1}</h3>
                <div class="text-sm">
                    <p><span class="font-medium">Single Pass Air:</span> ${singlePass.charAt(0).toUpperCase() + singlePass.slice(1)}</p>
                    <p><span class="font-medium">Air Handler Sizing:</span> ${cfm.toFixed(2)} CFM</p>
                    <p><span class="font-medium">Makeup Air:</span> ${roomMakeupCfm.toFixed(2)} CFM</p>
                    <p><span class="font-medium">Recirculating Air:</span> ${roomRecircCfm.toFixed(2)} CFM</p>
                    <p><span class="font-medium">Number of FFUs:</span> ${ffus} (rounded up from ${(cfm / cfmPerFFU).toFixed(2)})</p>
                    <p><span class="font-medium">FFU Heat Load:</span> ${ffuWatts} W (${(ffuWatts * 3.412).toFixed(2)} BTU/hr)</p>
                    <p><span class="font-medium">Lighting Load:</span></p>
                    <p class="ml-4">- Room Cavity Ratio (RCR): ${rcr.toFixed(2)}</p>
                    <p class="ml-4">- Coefficient of Utilization (CU): ${cu.toFixed(2)}</p>
                    <p class="ml-4">- Number of 2x4 LED Fixtures: ${numFixtures}</p>
                    <p class="ml-4">- Total Lighting Watts: ${lightingWatts} W</p>
                    <p><span class="font-medium">Equipment Load:</span></p>
                    <p class="ml-4">${equipDetails || 'No equipment added'}</p>
                    <p><span class="font-medium">Total Equipment Watts:</span> ${equipWatts} W</p>
                    <p><span class="font-medium">Envelope Load:</span> ${envelopeLoad.toFixed(2)} BTU/hr</p>
                </div><br>
            `;
        });

        // Ventilation CFM for people
        const ventilationCfm = totalPeople * 10; // 10 CFM per person for fresh air
        totalMakeupCfm = Math.max(totalMakeupCfm, ventilationCfm);

        // Global occupant load
        const peopleSensible = totalPeople * 250; // BTU/hr
        const peopleLatent = totalPeople * 200; // BTU/hr
        const totalPeopleLoad = peopleSensible + peopleLatent;

        const internalHeatLoad = (totalLightingWatts + totalEquipWatts + totalFfuWatts) * 3.412 + totalPeopleLoad;

        // Mixed air for coil
        const T_mixed = (totalRecircCfm * roomTemp + totalMakeupCfm * outdoorTemp) / totalCfm;
        const W_mixed = (totalRecircCfm * room_W + totalMakeupCfm * (useWB ? outdoorW : humidityRatio(vaporPressure(outdoorRH, saturationVaporPressure(fToC(outdoorTemp)))))) / totalCfm;
        const h_mixed = (totalRecircCfm * h_room + totalMakeupCfm * h_outdoor) / totalCfm;

        // Supply conditions for coil sizing (supply temp = roomTemp - 10°F, RH = roomRH)
        const supplyDeltaT = 10; // Assumed cooling coil delta T
        const supplyTemp = roomTemp - supplyDeltaT;
        const supply_T_C = fToC(supplyTemp);
        const supply_P_sat = saturationVaporPressure(supply_T_C);
        const supply_P_v = vaporPressure(roomRH, supply_P_sat); // Assume same RH
        const supply_W = humidityRatio(supply_P_v);
        const h_supply = enthalpy(supplyTemp, supply_W);

        const coilLoad = 4.5 * totalCfm * (h_mixed - h_supply); // BTU/hr

        const fanHeat = 1.08 * totalCfm * 2;

        const totalCoolingLoad = (internalHeatLoad + coilLoad + fanHeat + Math.max(totalEnvelopeLoad, 0)) * (1 + safetyFactor); // Apply safety factor
        const acTonnage = totalCoolingLoad / 12000;

        // Humidification load (winter, if W_outdoor < room_W)
        const deltaW = Math.max(room_W - winter_W, 0);
        const humidLoad = 0.69 * totalMakeupCfm * deltaW * 1075; // lb/ft3 air density * CFM * deltaW (lb/lb) * latent heat (BTU/lb)
        const humidWater = (humidLoad / 970) * (1 + safetyFactor); // lb/hr water for steam humidifier
        const humidKw = (humidLoad / 3412) * (1 + safetyFactor); // kW for electric steam humidifier

        // Heater calculation (winter heating)
        const heaterBtu = 1.08 * totalMakeupCfm * Math.max((roomTemp - outdoorWinterTemp), 0) + humidLoad;
        let heaterKw = (heaterBtu / 3412) * (1 + safetyFactor);

        // Reheat for dehumid mode (over-cooling to 55°F for moisture removal)
        const dehumidCoilTemp = 55; // Assumed coil temp for dehumid
        const reheatBtu = 1.08 * totalCfm * (roomTemp - dehumidCoilTemp); // BTU/hr
        const reheatKw = (reheatBtu / 3412) * (1 + safetyFactor); // kW

        // Combine heater and reheat: take the maximum for the heater size
        heaterKw = Math.max(heaterKw, reheatKw);

        // Verify heater size for 3 tons cooling (example)
        const exampleCoolingTons = 3;
        const exampleCfm = (exampleCoolingTons * 12000) / (4.5 * (h_mixed - h_supply)); // Estimate CFM for 3 tons
        const exampleReheatBtu = 1.08 * exampleCfm * (roomTemp - dehumidCoilTemp);
        const exampleReheatKw = (exampleReheatBtu / 3412) * (1 + safetyFactor);
        if (acTonnage >= exampleCoolingTons && heaterKw < exampleReheatKw) {
            heaterKw = exampleReheatKw; // Ensure heater is large enough
        }

        // Power consumption
        const totalDemandKw = (totalFfuWatts + totalLightingWatts + totalEquipWatts) / 1000 + acTonnage * 1.2 + heaterKw + humidKw;
        const amps480 = totalDemandKw * 1000 / (480 * Math.sqrt(3) * 0.85); // 3-phase
        const amps208 = totalDemandKw * 1000 / (208 * 1 * 0.85); // Single-phase

        // Validation
        const roomDewPoint = dewPoint(roomTemp, roomRH);
        if (roomDewPoint < 40 || roomRH < 40) {
            validationMessages.push('Low dew point or RH detected; consider desiccant wheel for dehumidification.');
        }
        if (totalCfm > 20000) validationMessages.push('High total CFM; may require multiple air handlers.');
        if (acTonnage > 50) validationMessages.push('High AC tonnage; may require multiple units.');
        if (heaterKw > 50) validationMessages.push('High heater kW; verify winter or dehumidification conditions.');
        if (humidWater > 100) validationMessages.push('High humidifier water rate; consider alternative humidification methods.');

        resultsHtml += `
            <h2 class="text-xl font-semibold">Validation</h2>
            ${validationMessages.length > 0 ? validationMessages.map(msg => `<p class="text-sm">${msg}</p>`).join('') : '<p class="text-sm">No extreme parameters detected.</p>'}
            <h2 class="text-xl font-semibold">Total HVAC System</h2>
            <h3 class="text-md font-bold">Airflow</h3>
            <div class="text-sm">
                <p><span class="font-medium">Total Air Handler Sizing:</span> ${totalCfm.toFixed(2)} CFM</p>
                <p><span class="font-medium">Total Recirculating CFM:</span> ${totalRecircCfm.toFixed(2)} CFM</p>
                <p><span class="font-medium">Total Makeup Air CFM:</span> ${totalMakeupCfm.toFixed(2)} CFM (incl. 10 CFM/person ventilation)</p>
            </div>
            <h3 class="text-md font-bold">FFUs</h3>
            <div class="text-sm">
                <p><span class="font-medium">Total Number of FFUs:</span> ${totalFfUs}</p>
                <p><span class="font-medium">Total FFU Watts:</span> ${totalFfuWatts} W (${(totalFfuWatts * 3.412).toFixed(2)} BTU/hr)</p>
            </div>
            <h3 class="text-md font-bold">Loads</h3>
            <div class="text-sm">
                <p><span class="font-medium">Total Lighting Watts:</span> ${totalLightingWatts} W</p>
                <p><span class="font-medium">Total Equipment Watts:</span> ${totalEquipWatts} W</p>
                <p><span class="font-medium">Total Envelope Load:</span> ${totalEnvelopeLoad.toFixed(2)} BTU/hr</p>
                <p><span class="font-medium">Total Occupant Load:</span> ${totalPeople} people (${peopleSensible} sensible + ${peopleLatent} latent = ${totalPeopleLoad} BTU/hr)</p>
            </div>
            <h3 class="text-md font-bold">Mixed Air Conditions</h3>
            <div class="text-sm">
                <p><span class="font-medium">Temperature:</span> ${T_mixed.toFixed(2)}°F</p>
                <p><span class="font-medium">Humidity Ratio:</span> ${W_mixed.toFixed(5)} lb/lb</p>
                <p><span class="font-medium">Enthalpy:</span> ${h_mixed.toFixed(2)} BTU/lb</p>
            </div>
            <h3 class="text-md font-bold">Conditioning</h3>
            <div class="text-sm">
                <p><span class="font-medium">Coil Load:</span> ${coilLoad.toFixed(2)} BTU/hr</p>
                <p><span class="font-medium">Humidifier Sizing:</span></p>
                <p class="ml-4">- Humidification Load: ${humidLoad.toFixed(2)} BTU/hr</p>
                <p class="ml-4">- Water Rate: ${humidWater.toFixed(2)} lb/hr</p>
                <p class="ml-4">- Electric Power (Steam): ${humidKw.toFixed(2)} kW</p>
            </div>
            <h3 class="text-md font-bold">Sizing</h3>
            <div class="text-sm">
                <p><span class="font-medium">AC Tonnage:</span> ${acTonnage.toFixed(2)} tons</p>
                <p><span class="font-medium">Heater kW:</span> ${heaterKw.toFixed(2)} kW (sized for winter heating or dehumidification)</p>
            </div>
            <h3 class="text-md font-bold">Power Consumption</h3>
            <div class="text-sm">
                <p><span class="font-medium">Estimated Demand Load:</span> ${totalDemandKw.toFixed(2)} kW</p>
                <p><span class="font-medium">Amperage at 480V (3-phase, PF 0.85):</span> ${amps480.toFixed(2)} A</p>
                <p><span class="font-medium">Amperage at 208V (single-phase, PF 0.85):</span> ${amps208.toFixed(2)} A</p>
            </div>
            <small class="text-xs">
                <h3 class="text-sm font-semibold">Assumptions Used in Calculations:</h3>
                <ul>
                    <li>FFU capacity: 600 CFM per unit.</li>
                    <li>Lighting: 60 fc illuminance, 0.8 LLF, 5000 lumens/50W per LED fixture, 80% ceiling/50% wall/20% floor reflectance.</li>
                    <li>Occupant load: 250 BTU/hr sensible, 200 BTU/hr latent per person.</li>
                    <li>Non-single-pass makeup air: 10% of room CFM.</li>
                    <li>Ventilation: 10 CFM per person for fresh air, added as minimum makeup.</li>
                    <li>Coil supply: 10°F below room temp, same RH.</li>
                    <li>Fan heat: 2°F rise across fans.</li>
                    <li>Winter outdoor RH: 20% for non-controlled spaces.</li>
                    <li>Humidifier: Steam-based, 970 BTU/lb water vaporization.</li>
                    <li>Reheat for dehumidification: Assumed 55°F coil temp.</li>
                    <li>Power: Cooling 1.2 kW/ton, power factor 0.85 for amperage.</li>
                    <li>Atmospheric pressure: 1013.25 mbar (sea level).</li>
                    <li>Workplane height: 2.5 ft for lighting.</li>
                    <li>No infiltration, exfiltration, or process exhaust included.</li>
                    <li>Safety factor applied to CFM, cooling load, humidifier, and heater calculations.</li>
                </ul>
            </small>
        `;

        document.getElementById('results').innerHTML = resultsHtml;

        // Store results for PDF export
        latestResults = {
            designRequirements: {
                roomTemp,
                roomRH,
                totalPeople,
                rWall,
                rRoof,
                rFloor,
                ffuWattage,
                safetyFactor: safetyFactor * 100,
                environment: environmentDetails
            },
            validationMessages,
            totalHvac: {
                totalCfm,
                totalRecircCfm,
                totalMakeupCfm,
                totalFfUs,
                totalFfuWatts,
                totalLightingWatts,
                totalEquipWatts,
                totalEnvelopeLoad,
                totalPeopleLoad,
                T_mixed,
                W_mixed,
                h_mixed,
                coilLoad,
                humidLoad,
                humidWater,
                humidKw,
                acTonnage,
                heaterKw,
                totalDemandKw,
                amps480,
                amps208
            },
            roomDetails
        };
    });

    exportPdfButton.addEventListener('click', function() {
        if (!latestResults) {
            alert('Please calculate results first.');
            return;
        }

        const doc = new jsPDF();
        let y = 20;

        // Page 1: Design Requirements, Assumptions, Total HVAC System
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Cleanroom HVAC Sizing Report', 20, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Design Requirements', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const { designRequirements, totalHvac, roomDetails, validationMessages } = latestResults;
        doc.text(`Room Temperature: ${designRequirements.roomTemp}°F`, 20, y); y += 6;
        doc.text(`Room Relative Humidity: ${designRequirements.roomRH}%`, 20, y); y += 6;
        doc.text(`Total People: ${designRequirements.totalPeople}`, 20, y); y += 6;
        doc.text(`Wall R-Value: ${designRequirements.rWall}`, 20, y); y += 6;
        doc.text(`Roof R-Value: ${designRequirements.rRoof}`, 20, y); y += 6;
        doc.text(`Floor R-Value: ${designRequirements.rFloor}`, 20, y); y += 6;
        doc.text(`FFU Wattage: ${designRequirements.ffuWattage} W`, 20, y); y += 6;
        doc.text(`Safety Factor: ${designRequirements.safetyFactor}%`, 20, y); y += 6;
        doc.text(`Environment: ${designRequirements.environment}`, 20, y); y += 6;

        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Assumptions', 20, y); y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const assumptions = [
            'FFU capacity: 600 CFM per unit.',
            'Lighting: 60 fc illuminance, 0.8 LLF, 5000 lumens/50W per LED fixture, 80% ceiling/50% wall/20% floor reflectance.',
            'Occupant load: 250 BTU/hr sensible, 200 BTU/hr latent per person.',
            'Non-single-pass makeup air: 10% of room CFM.',
            'Ventilation: 10 CFM per person for fresh air, added as minimum makeup.',
            'Coil supply: 10°F below room temp, same RH.',
            'Fan heat: 2°F rise across fans.',
            'Winter outdoor RH: 20% for non-controlled spaces.',
            'Humidifier: Steam-based, 970 BTU/lb water vaporization.',
            'Reheat for dehumidification: Assumed 55°F coil temp.',
            'Power: Cooling 1.2 kW/ton, power factor 0.85 for amperage.',
            'Atmospheric pressure: 1013.25 mbar (sea level).',
            'Workplane height: 2.5 ft for lighting.',
            'No infiltration, exfiltration, or process exhaust included.',
            'Safety factor applied to CFM, cooling load, humidifier, and heater calculations.'
        ];
        assumptions.forEach(assumption => {
            doc.text(`- ${assumption}`, 20, y); y += 6;
        });

        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Total HVAC System', 20, y); y += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Airflow', 20, y); y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Air Handler Sizing: ${totalHvac.totalCfm.toFixed(2)} CFM`, 20, y); y += 6;
        doc.text(`Total Recirculating CFM: ${totalHvac.totalRecircCfm.toFixed(2)} CFM`, 20, y); y += 6;
        doc.text(`Total Makeup Air CFM: ${totalHvac.totalMakeupCfm.toFixed(2)} CFM (incl. 10 CFM/person ventilation)`, 20, y); y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('FFUs', 20, y); y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Number of FFUs: ${totalHvac.totalFfUs}`, 20, y); y += 6;
        doc.text(`Total FFU Watts: ${totalHvac.totalFfuWatts} W (${(totalHvac.totalFfuWatts * 3.412).toFixed(2)} BTU/hr)`, 20, y); y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Loads', 20, y); y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Lighting Watts: ${totalHvac.totalLightingWatts} W`, 20, y); y += 6;
        doc.text(`Total Equipment Watts: ${totalHvac.totalEquipWatts} W`, 20, y); y += 6;
        doc.text(`Total Envelope Load: ${totalHvac.totalEnvelopeLoad.toFixed(2)} BTU/hr`, 20, y); y += 6;
        doc.text(`Total Occupant Load: ${totalHvac.totalPeopleLoad} BTU/hr`, 20, y); y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Mixed Air Conditions', 20, y); y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Temperature: ${totalHvac.T_mixed.toFixed(2)}°F`, 20, y); y += 6;
        doc.text(`Humidity Ratio: ${totalHvac.W_mixed.toFixed(5)} lb/lb`, 20, y); y += 6;
        doc.text(`Enthalpy: ${totalHvac.h_mixed.toFixed(2)} BTU/lb`, 20, y); y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Conditioning', 20, y); y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Coil Load: ${totalHvac.coilLoad.toFixed(2)} BTU/hr`, 20, y); y += 6;
        doc.text(`Humidifier Sizing:`, 20, y); y += 6;
        doc.text(`  - Humidification Load: ${totalHvac.humidLoad.toFixed(2)} BTU/hr`, 20, y); y += 6;
        doc.text(`  - Water Rate: ${totalHvac.humidWater.toFixed(2)} lb/hr`, 20, y); y += 6;
        doc.text(`  - Electric Power (Steam): ${totalHvac.humidKw.toFixed(2)} kW`, 20, y); y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Sizing', 20, y); y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`AC Tonnage: ${totalHvac.acTonnage.toFixed(2)} tons`, 20, y); y += 6;
        doc.text(`Heater kW: ${totalHvac.heaterKw.toFixed(2)} kW (sized for winter heating or dehumidification)`, 20, y); y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Power Consumption', 20, y); y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Estimated Demand Load: ${totalHvac.totalDemandKw.toFixed(2)} kW`, 20, y); y += 6;
        doc.text(`Amperage at 480V (3-phase, PF 0.85): ${totalHvac.amps480.toFixed(2)} A`, 20, y); y += 6;
        doc.text(`Amperage at 208V (single-phase, PF 0.85): ${totalHvac.amps208.toFixed(2)} A`, 20, y); y += 6;

        // Page 2: Room-by-Room Details
        doc.addPage();
        y = 20;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Room-by-Room Details', 20, y);
        y += 10;

        roomDetails.forEach(room => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Room ${room.index}`, 20, y); y += 10;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Single Pass Air: ${room.singlePass.charAt(0).toUpperCase() + room.singlePass.slice(1)}`, 20, y); y += 6;
            doc.text(`Air Handler Sizing: ${room.cfm.toFixed(2)} CFM`, 20, y); y += 6;
            doc.text(`Makeup Air: ${room.roomMakeupCfm.toFixed(2)} CFM`, 20, y); y += 6;
            doc.text(`Recirculating Air: ${room.roomRecircCfm.toFixed(2)} CFM`, 20, y); y += 6;
            doc.text(`Number of FFUs: ${room.ffus} (rounded up from ${(room.cfm / 600).toFixed(2)})`, 20, y); y += 6;
            doc.text(`FFU Heat Load: ${room.ffuWatts} W (${(room.ffuWatts * 3.412).toFixed(2)} BTU/hr)`, 20, y); y += 6;
            doc.text(`Lighting Load:`, 20, y); y += 6;
            doc.text(`  - Room Cavity Ratio (RCR): ${room.rcr.toFixed(2)}`, 20, y); y += 6;
            doc.text(`  - Coefficient of Utilization (CU): ${room.cu.toFixed(2)}`, 20, y); y += 6;
            doc.text(`  - Number of 2x4 LED Fixtures: ${room.numFixtures}`, 20, y); y += 6;
            doc.text(`  - Total Lighting Watts: ${room.lightingWatts} W`, 20, y); y += 6;
            doc.text(`Equipment Load: ${room.equipDetails || 'No equipment added'}`, 20, y); y += 6;
            doc.text(`Total Equipment Watts: ${room.equipWatts} W`, 20, y); y += 6;
            doc.text(`Envelope Load: ${room.envelopeLoad.toFixed(2)} BTU/hr`, 20, y); y += 10;
        });

        doc.save('Cleanroom_HVAC_Report.pdf');
    });
});