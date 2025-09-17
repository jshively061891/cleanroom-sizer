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
    let latestResults = null;


    // Dark mode toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }

    document.getElementById('makeup-same-surround').addEventListener('change', function() {
        const useCustomInputs = this.value === 'no';
        document.getElementById('makeup-custom-inputs').style.display = useCustomInputs ? 'block' : 'none';
    });


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
                    <input type="text" class="equip-name input-field" placeholder="e.g., Centrifuge">
                </div>
                <div>
                    <label class="block text-sm font-medium">Watts:</label>
                    <input type="number" class="equip-watts input-field" required>
                </div>
                <button type="button" class="remove-equipment btn btn-secondary mt-2 col-span-full">Remove Equipment</button>
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
                        <option value="5">ISO 5 (Class 100)</option>
                        <option value="6">ISO 6 (Class 1,000)</option>
                        <option value="7">ISO 7 (Class 10,000)</option>
                        <option value="8">ISO 8 (Class 100,000)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium">Custom ACH:</label>
                    <input type="number" class="custom-ach input-field" placeholder="Auto-fills from ISO" required>
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
        option.text = `${city.city}, ${city.state}`;
        option.dataset.coolingdb = city.coolingDB;
        option.dataset.mcwb = city.mcwb;
        option.dataset.heatingdb = city.heatingDB;
        locationSelect.appendChild(option);
    });

    environmentSelect.addEventListener('change', updateInputs);
    tempControlledSelect.addEventListener('change', updateInputs);

    function updateInputs() {
        const environment = environmentSelect.value;
        const makeupAirSection = document.getElementById('makeup-air-section');

        indoorOptions.style.display = environment === 'indoor' ? 'block' : 'none';
        const showLocation = environment === 'outdoor' || (environment === 'indoor' && tempControlledSelect.value === 'no');
        locationInput.style.display = showLocation ? 'block' : 'none';
        customTemps.style.display = showLocation ? 'block' : 'none';
        spaceTempInputs.style.display = (environment === 'indoor' && tempControlledSelect.value === 'yes') ? 'block' : 'none';

        if (environment === 'indoor' || environment === 'outdoor') {
            makeupAirSection.style.display = 'block';
        } else {
            makeupAirSection.style.display = 'none';
        }
        
        locationSelect.dispatchEvent(new Event('change'));
    }

    locationSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.value) {
            designTempsDisplay.innerHTML = `
                <b>ASHRAE Data:</b> Summer DB ${selectedOption.dataset.coolingdb}°F / MCWB ${selectedOption.dataset.mcwb}°F | Winter DB ${selectedOption.dataset.heatingdb}°F
            `;
            document.getElementById('custom-cooling-db').value = selectedOption.dataset.coolingdb;
            document.getElementById('custom-mcwb').value = selectedOption.dataset.mcwb;
            document.getElementById('custom-heating-db').value = selectedOption.dataset.heatingdb;
        } else {
            designTempsDisplay.innerHTML = '';
        }
    });

    // Psychrometric functions
    function fToC(T_F) { return (T_F - 32) / 1.8; }
    function saturationVaporPressure(T_C) { return 6.112 * Math.exp((17.67 * T_C) / (T_C + 243.5)); }
    function vaporPressure(RH_decimal, P_sat) { return RH_decimal * P_sat; }
    function humidityRatio(P_v) { const P_atm = 1013.25; return 0.62198 * P_v / (P_atm - P_v); }
    function enthalpy(T_F, W) { return 0.24 * T_F + W * (1061 + 0.444 * T_F); }
    function humidityRatioFromDBWB(T_db_F, T_wb_F) {
        const T_db_C = fToC(T_db_F);
        const T_wb_C = fToC(T_wb_F);
        const P_sat_wb = saturationVaporPressure(T_wb_C);
        const P_atm = 1013.25;
        const psych_constant = 0.00066;
        const P_v = P_sat_wb - P_atm * (T_db_C - T_wb_C) * psych_constant * (1 + 0.00115 * T_wb_C);
        return 0.62198 * P_v / (P_atm - P_v);
    }
    function dewPoint(T_F, RH_decimal) {
        const T_C = fToC(T_F);
        const P_sat = saturationVaporPressure(T_C);
        const P_v = vaporPressure(RH_decimal, P_sat);
        const Td_C = (243.5 * Math.log(P_v / 6.112)) / (17.67 - Math.log(P_v / 6.112));
        return Td_C * 1.8 + 32;
    }

    document.getElementById('hvac-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        // --- 1. GATHER AND VALIDATE INPUTS ---
        const roomTemp = parseFloat(document.getElementById('room-temp').value);
        const roomRH = parseFloat(document.getElementById('room-rh').value) / 100;
        const totalPeople = parseInt(document.getElementById('people').value);
        const rWall = parseFloat(document.getElementById('r-wall').value);
        const rRoof = parseFloat(document.getElementById('r-roof').value);
        const rFloor = parseFloat(document.getElementById('r-floor').value);
        const ffuWattage = parseFloat(document.getElementById('ffu-wattage').value);
        const safetyFactor = parseFloat(document.getElementById('safety-factor').value) / 100;
        const environment = environmentSelect.value;
        let validationMessages = [];

        if (isNaN(roomTemp) || isNaN(roomRH) || isNaN(totalPeople) || isNaN(rWall) || isNaN(rRoof) || isNaN(rFloor) || isNaN(ffuWattage) || isNaN(safetyFactor)) {
            document.getElementById('results').innerHTML = '<p class="text-red-500">Error: Please fill all required fields with valid numbers.</p>';
            return;
        }
        if (environment === '') {
            document.getElementById('results').innerHTML = '<p class="text-red-500">Error: Please select an environment.</p>';
            return;
        }

        // --- 2. CALCULATE AIR PROPERTIES ---
        const room_W = humidityRatio(vaporPressure(roomRH, saturationVaporPressure(fToC(roomTemp))));
        const h_room = enthalpy(roomTemp, room_W);
        const roomDewPoint = dewPoint(roomTemp, roomRH);
        const dehumidCoilTemp = roomDewPoint - 2.5;

        if (dehumidCoilTemp < 40 || dehumidCoilTemp > 55) {
            validationMessages.push(`Warning: Calculated dehumidification coil temp (${dehumidCoilTemp.toFixed(1)}°F) is outside the typical safe range (40-55°F). This may risk coil freezing. Please consult an engineer.`);
        }
        
        let outdoorTemp, outdoorRH, outdoorWinterTemp, useWB = false, outdoorW, mcwb, environmentDetails = '';
        
        if (environment === 'indoor') {
            if (tempControlledSelect.value === 'yes') {
                outdoorTemp = parseFloat(document.getElementById('space-temp').value);
                outdoorRH = parseFloat(document.getElementById('space-rh').value);
                outdoorWinterTemp = outdoorTemp;
                environmentDetails = `Indoor, Conditioned Space (${outdoorTemp}°F, ${outdoorRH}%)`;
            } else {
                const selectedLocation = locationSelect.options[locationSelect.selectedIndex];
                if (!selectedLocation.value) { document.getElementById('results').innerHTML = '<p class="text-red-500">Error: Please select a location for the non-conditioned space.</p>'; return; }
                outdoorTemp = parseFloat(document.getElementById('custom-cooling-db').value);
                mcwb = parseFloat(document.getElementById('custom-mcwb').value);
                outdoorWinterTemp = parseFloat(document.getElementById('custom-heating-db').value);
                useWB = true;
                environmentDetails = `Indoor, Non-Conditioned Space (Using ${selectedLocation.text} data)`;
            }
        } else { // Outdoor
            const selectedLocation = locationSelect.options[locationSelect.selectedIndex];
            if (!selectedLocation.value) { document.getElementById('results').innerHTML = '<p class="text-red-500">Error: Please select a location.</p>'; return; }
            outdoorTemp = parseFloat(document.getElementById('custom-cooling-db').value);
            mcwb = parseFloat(document.getElementById('custom-mcwb').value);
            outdoorWinterTemp = parseFloat(document.getElementById('custom-heating-db').value);
            useWB = true;
            environmentDetails = `Outdoor (Using ${selectedLocation.text} data)`;
        }

        if (useWB) {
            outdoorW = humidityRatioFromDBWB(outdoorTemp, mcwb);
        }

        // --- 3. PROCESS ROOM-BY-ROOM DETAILS ---
        const rooms = document.querySelectorAll('.room');
        let totalCfm = 0, totalFfUs = 0, totalLightingWatts = 0, totalEquipWatts = 0, totalFfuWatts = 0, totalMakeupCfm = 0, totalRecircCfm = 0, totalEnvelopeLoad = 0;
        let roomDetails = [];

        for (const [index, room] of rooms.entries()) {
            const length = parseFloat(room.querySelector('.length').value);
            const width = parseFloat(room.querySelector('.width').value);
            const height = parseFloat(room.querySelector('.height').value);
            const isoClass = room.querySelector('.iso-class').value;
            const customAch = parseFloat(room.querySelector('.custom-ach').value);
            if (isNaN(length) || isNaN(width) || isNaN(height) || isNaN(customAch) || length <= 0 || width <= 0 || height <= 0 || customAch <= 0 || !isoClass) {
                 document.getElementById('results').innerHTML = `<p class="text-red-500">Error: Room ${index + 1} has invalid dimensions, ISO class, or ACH.</p>`;
                 return;
            }
            
            const singlePass = room.querySelector('.single-pass').value;
            const volume = length * width * height;
            const cfm = (volume * customAch) / 60 * (1 + safetyFactor);
            totalCfm += cfm;

            const cfmPerFFU = 600;
            const ffus = Math.ceil(cfm / cfmPerFFU);
            totalFfUs += ffus;
            const ffuWatts = ffus * ffuWattage;
            totalFfuWatts += ffuWatts;

            const area = length * width;
            const workplaneHeight = 2.5;
            const h_rc = height - workplaneHeight;
            const rcr = 5 * h_rc * (length + width) / area;
            const cuTable = [1.19, 1.03, 0.89, 0.78, 0.69, 0.62, 0.55, 0.50, 0.46, 0.42, 0.38];
            const cu = cuTable[Math.min(Math.round(rcr), 10)];
            const numFixtures = Math.ceil((60 * area) / (5000 * cu * 0.8));
            const lightingWatts = numFixtures * 50;
            totalLightingWatts += lightingWatts;

            let equipWatts = 0;
            let equipDetails = '';
            room.querySelectorAll('.equipment').forEach(equip => {
                const name = equip.querySelector('.equip-name').value.trim() || 'Unnamed';
                const watts = parseFloat(equip.querySelector('.equip-watts').value);
                if (!isNaN(watts) && watts > 0) {
                    equipWatts += watts;
                    equipDetails += `- ${name}: ${watts} W\n`;
                }
            });
            totalEquipWatts += equipWatts;
            
            const envelopeLoad = ((2 * (length + width) * height) / rWall + (area / rRoof) + (area / rFloor)) * (outdoorTemp - roomTemp);
            totalEnvelopeLoad += envelopeLoad;

            const roomMakeupCfm = (singlePass === 'yes') ? cfm : cfm * 0.1;
            totalMakeupCfm += roomMakeupCfm;
            totalRecircCfm += (cfm - roomMakeupCfm);
            
            roomDetails.push({ index: index + 1, length, width, height, isoClass, volume, singlePass, cfm, roomMakeupCfm, ffus, ffuWatts, lightingWatts, numFixtures, equipWatts, envelopeLoad, equipDetails });
        }

        // --- 4. CALCULATE TOTAL SYSTEM LOADS & SIZING ---
        const ventilationCfm = totalPeople * 10;
        totalMakeupCfm = Math.max(totalMakeupCfm, ventilationCfm);

        let envelopeLoad = totalEnvelopeLoad;
        if (environment === 'indoor' && tempControlledSelect.value === 'yes') {
            const spaceTemp = parseFloat(document.getElementById('space-temp').value);
            if (outdoorTemp !== roomTemp) {
                envelopeLoad = Math.max(0, totalEnvelopeLoad * (roomTemp - spaceTemp) / (roomTemp - outdoorTemp));
            } else {
                envelopeLoad = 0;
            }
        }

        const makeupSameSurround = document.getElementById('makeup-same-surround').value === 'yes';
        let makeupTemp, makeupW;
        if (makeupSameSurround) {
            makeupTemp = outdoorTemp;
            makeupW = useWB ? outdoorW : humidityRatio(vaporPressure(outdoorRH / 100, saturationVaporPressure(fToC(outdoorTemp))));
        } else {
            makeupTemp = parseFloat(document.getElementById('makeup-temp').value);
            const customMakeupRH = parseFloat(document.getElementById('makeup-rh').value);
            if (isNaN(makeupTemp) || isNaN(customMakeupRH)) { document.getElementById('results').innerHTML = '<p class="text-red-500">Error: Please enter valid custom makeup air values.</p>'; return; }
            makeupW = humidityRatio(vaporPressure(customMakeupRH / 100, saturationVaporPressure(fToC(makeupTemp))));
        }

        const T_mixed = (totalRecircCfm * roomTemp + totalMakeupCfm * makeupTemp) / totalCfm;
        const W_mixed = (totalRecircCfm * room_W + totalMakeupCfm * makeupW) / totalCfm;
        const h_mixed = (totalRecircCfm * h_room + totalMakeupCfm * enthalpy(makeupTemp, makeupW)) / totalCfm;

        const peopleSensible = totalPeople * 250;
        const peopleLatent = totalPeople * 200;
        const totalPeopleLoad = peopleSensible + peopleLatent;
        
        const totalRoomSensibleLoad = (totalLightingWatts + totalEquipWatts + totalFfuWatts) * 3.412 + peopleSensible + Math.max(0, envelopeLoad);   
        const requiredSupplyTemp = roomTemp - (totalRoomSensibleLoad / (1.08 * totalCfm));

        const dehumid_T_C = fToC(dehumidCoilTemp);
        const dehumid_W = humidityRatio(saturationVaporPressure(dehumid_T_C));
        const h_dehumid_supply = enthalpy(dehumidCoilTemp, dehumid_W);
        const dehumidCoilLoad = 4.5 * totalCfm * (h_mixed - h_dehumid_supply);
        
        const sensibleLoad = 1.08 * totalCfm * (T_mixed - dehumidCoilTemp);
        let latentLoad = dehumidCoilLoad - sensibleLoad;
        let shrNote = '';
        if (latentLoad < 0) {
            latentLoad = 0;
            shrNote = '(Coil is not dehumidifying)';
        }
        const totalCoilBtu = sensibleLoad + latentLoad;
        const shr = totalCoilBtu > 0 ? sensibleLoad / totalCoilBtu : 0;
        if (shr < 0.7 && latentLoad > 0) shrNote = '(Low SHR suggests high latent load; consider auxiliary dehumidification)';

        const fanHeat = 1.08 * totalCfm * 2;
        const totalCoolingLoad = (dehumidCoilLoad + fanHeat) * (1 + safetyFactor);
        const acTonnage = totalCoolingLoad / 12000;

        const winter_T_C = fToC(outdoorWinterTemp);
        const winter_P_sat = saturationVaporPressure(winter_T_C);
        const winter_W = humidityRatio(vaporPressure(0.20, winter_P_sat));
        const deltaW = Math.max(room_W - winter_W, 0);
        const humidLoad = 0.69 * totalMakeupCfm * deltaW * 1075;
        const heaterBtu = 1.08 * totalMakeupCfm * Math.max((roomTemp - outdoorWinterTemp), 0) + humidLoad;
        let heaterKw = (heaterBtu / 3412) * (1 + safetyFactor);
        const reheatBtu = 1.08 * totalCfm * Math.max(0, (requiredSupplyTemp - dehumidCoilTemp));
        const reheatKw = (reheatBtu / 3412) * (1 + safetyFactor);
        heaterKw = Math.max(heaterKw, reheatKw);
        
        const humidWater = (humidLoad / 970) * (1 + safetyFactor);
        const humidKw = (humidLoad / 3412) * (1 + safetyFactor);
        
        const hvacKw = acTonnage * 1.2 + heaterKw + humidKw;
        const ffuKw = totalFfuWatts / 1000;
        const lightingKw = totalLightingWatts / 1000;
        const equipmentKw = totalEquipWatts / 1000;
        const totalDemandKw = hvacKw + ffuKw + lightingKw + equipmentKw;
        const amps480 = totalDemandKw * 1000 / (480 * Math.sqrt(3) * 0.85);
        const amps208Three = totalDemandKw * 1000 / (208 * Math.sqrt(3) * 0.85);

        let dehumPintsPerDay = 0, dehumAddedHeat = 0, dehumNote = '', dehumSizingExample = '';
        if (dehumidCoilTemp < 50) {
            const moistureLbPerHour = latentLoad / 1075;
            dehumPintsPerDay = (moistureLbPerHour * 24) / 1.043;

            const pintsPerKwh = 1.8;
            const dehumPowerKw = (dehumPintsPerDay > 0) ? (dehumPintsPerDay / 24) / pintsPerKwh : 0;
            const dehumHeatFromPower = dehumPowerKw * 3412;

            dehumAddedHeat = latentLoad + dehumHeatFromPower;
            dehumNote = `The required coil temperature of ${dehumidCoilTemp.toFixed(1)}°F is low, increasing the risk of coil freezing. As an alternative, a standalone dehumidifier could be used to handle the latent load.`;
            
            const newRoomSensibleLoad = totalRoomSensibleLoad + dehumAddedHeat;
            const newAcTonnage = ((newRoomSensibleLoad + fanHeat) * (1 + safetyFactor)) / 12000;
            dehumSizingExample = `If this strategy is used, the main AC unit sizing changes. The new system would require a primary AC unit of <strong>${newAcTonnage.toFixed(2)} tons</strong> (sized for sensible loads) paired with a <strong>${dehumPintsPerDay.toFixed(0)} pints/day</strong> dehumidifier.`;
        }

        // --- 5. STORE AND DISPLAY RESULTS ---
        const tempRange = `${(roomTemp - 1).toFixed(1)} - ${(roomTemp + 1).toFixed(1)}°F`;
        const rhRange = `${Math.max(0, roomRH * 100 - 5).toFixed(0)} - ${Math.min(100, roomRH * 100 + 5).toFixed(0)}%`;
        
        const isoSummary = {};
        roomDetails.forEach(room => {
            if (!isoSummary[room.isoClass]) isoSummary[room.isoClass] = { count: 0, totalVolume: 0 };
            isoSummary[room.isoClass].count++;
            isoSummary[room.isoClass].totalVolume += room.volume;
        });
        let narrative = `This report outlines HVAC requirements for an ${environment} facility `;
        if (environment === 'outdoor' || (environment === 'indoor' && tempControlledSelect.value === 'no')) {
            narrative += `located in ${locationSelect.options[locationSelect.selectedIndex].text}, `;
        }
        narrative += `comprising ${roomDetails.length} cleanroom${roomDetails.length > 1 ? 's' : ''}: `;
        const summaryParts = Object.keys(isoSummary).map(isoClass => {
            const { count, totalVolume } = isoSummary[isoClass];
            return `${count} ISO ${isoClass} room${count > 1 ? 's' : ''} (${totalVolume.toFixed(0)} ft³)`;
        });
        narrative += summaryParts.join(', and ') + '.';


        const sensibleTons = sensibleLoad / 12000;
        const latentTons = latentLoad / 12000;
        const totalCoilTons = totalCoilBtu / 12000;
        latestResults = { designRequirements: { roomTemp, roomRH, totalPeople, rWall, rRoof, rFloor, ffuWattage, safetyFactor: safetyFactor * 100, environmentDetails, tempRange, rhRange, outdoorTemp, mcwb: useWB ? mcwb : null, outdoorRH: useWB ? null : outdoorRH, outdoorWinterTemp, useWB, roomDewPoint, dehumidCoilTemp, requiredSupplyTemp }, validationMessages, narrative, totalHvac: { totalCfm, totalRecircCfm, totalMakeupCfm, totalFfUs, totalFfuWatts, totalLightingWatts, totalEquipWatts, totalEnvelopeLoad: envelopeLoad, totalPeopleLoad, T_mixed, W_mixed, h_mixed, humidLoad, humidWater, humidKw, acTonnage, heaterKw, hvacKw, ffuKw, lightingKw, equipmentKw, totalDemandKw, amps480, amps208Three, sensibleLoad, latentLoad, totalCoilBtu, sensibleTons, latentTons, totalCoilTons, shr, shrNote, dehumPintsPerDay, dehumAddedHeat, dehumNote, dehumSizingExample }, roomDetails };
        
        const assumptionsList = [
            `Dehumidification coil temp auto-calculated to ${dehumidCoilTemp.toFixed(1)}°F (2.5°F below room dew point).`,
            `Required supply air temperature calculated to be ${requiredSupplyTemp.toFixed(1)}°F to meet room sensible loads.`,
            'Fan heat gain is estimated at a 2°F temperature rise across the main supply fan.',
            'Makeup air for non-single-pass rooms is 10% of room CFM, with a minimum of 10 CFM/person for ventilation.',
            'Winter outdoor air is assumed to be 20% RH for humidification calculations.',
            'Cooling power consumption is estimated at 1.2 kW per ton.',
            'Electrical power calculations assume a power factor (PF) of 0.85.',
            'Standard sea-level atmospheric pressure is used for all psychrometric calculations.'
        ];

        let resultsHtml = `
            <div class="space-y-6">
                <p class="text-lg italic text-gray-700 dark:text-gray-300">${narrative}</p>

                <div>
                    <h2 class="text-2xl font-bold border-b pb-2 mb-4">Executive Summary</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                            <p class="text-sm text-gray-600 dark:text-gray-400">Total Airflow (CFM)</p>
                            <p class="text-3xl font-bold">${totalCfm.toFixed(0)}</p>
                        </div>
                        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                            <p class="text-sm text-gray-600 dark:text-gray-400">Final AC Sizing (Tons)</p>
                            <p class="text-3xl font-bold">${acTonnage.toFixed(2)}</p>
                            <p class="text-xs text-gray-500">(Includes fan heat & safety factor)</p>
                        </div>
                        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                            <p class="text-sm text-gray-600 dark:text-gray-400">Heater Sizing (kW)</p>
                            <p class="text-3xl font-bold">${heaterKw.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 class="text-2xl font-bold border-b pb-2 mb-4">System Design Targets</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p><span class="font-medium">Setpoint:</span> ${roomTemp}°F at ${roomRH*100}% RH</p>
                        <p><span class="font-medium">Control Range:</span> ${tempRange} at ${rhRange}</p>
                    </div>
                </div>

                <div>
                    <h2 class="text-2xl font-bold border-b pb-2 mb-4">System Totals</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div>
                            <h3 class="font-semibold text-lg mb-2">Airflow & Loads</h3>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Total Recirculating Air:</span> ${totalRecircCfm.toFixed(0)} CFM</p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Total Makeup Air:</span> ${totalMakeupCfm.toFixed(0)} CFM</p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Total Internal Heat Load:</span> ${((totalFfuWatts + totalLightingWatts + totalEquipWatts) * 3.412 + totalPeopleLoad).toFixed(0)} BTU/hr</p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Adjusted Envelope Load:</span> ${envelopeLoad.toFixed(0)} BTU/hr</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg mb-2">Conditioning</h3>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Sensible Cooling:</span> ${sensibleTons.toFixed(2)} tons</p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Latent Cooling:</span> ${latentTons.toFixed(2)} tons</p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Sensible Heat Ratio (SHR):</span> ${shr.toFixed(2)} <span class="text-xs">${shrNote}</span></p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Humidification Load:</span> ${humidLoad.toFixed(0)} BTU/hr (${humidKw.toFixed(2)} kW)</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg mb-2">Component Sizing</h3>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Total FFUs Required:</span> ${totalFfUs}</p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Calculated Coil Load:</span> ${totalCoilTons.toFixed(2)} tons</p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Humidifier Water Rate:</span> ${humidWater.toFixed(2)} lb/hr</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg mb-2">Electrical</h3>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Total Demand Load:</span> ${totalDemandKw.toFixed(2)} kW</p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Amperage @ 480V/3ph:</span> ${amps480.toFixed(1)} A</p>
                            <p><span class="font-medium text-gray-600 dark:text-gray-400">Amperage @ 208V/3ph:</span> ${amps208Three.toFixed(1)} A</p>
                        </div>
                    </div>
                </div>

                ${dehumPintsPerDay > 0 ? `
                <div>
                    <h2 class="text-2xl font-bold border-b pb-2 mb-4">Dehumidification Strategy Note</h2>
                    <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md" role="alert">
                        <p class="font-bold">Low Temperature Warning</p>
                        <p>${dehumNote}</p>
                        <div class="mt-2 pt-2 border-t border-blue-200">
                            <p class="font-semibold">Standalone Dehumidifier Sizing:</p>
                            <ul class="list-disc list-inside text-sm">
                                <li>Required Capacity: <b>${dehumPintsPerDay.toFixed(0)} pints/day</b></li>
                                <li>Estimated Heat Added to Space: <b>${dehumAddedHeat.toFixed(0)} BTU/hr</b></li>
                            </ul>
                            <p class="text-xs mt-2"><b>Important:</b> ${dehumSizingExample.replace(/<strong>/g, '<b>').replace(/<\/strong>/g, '</b>')}</p>
                        </div>
                    </div>
                </div>` : ''}

                ${validationMessages.length > 0 ? `
                <div>
                    <h2 class="text-2xl font-bold border-b pb-2 mb-4">Validation & Notes</h2>
                    <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
                        ${validationMessages.map(msg => `<p>${msg}</p>`).join('')}
                    </div>
                </div>` : ''}

                <div>
                    <h2 class="text-2xl font-bold border-b pb-2 mb-4">Room-by-Room Breakdown</h2>
                    <div class="space-y-2">
                        ${roomDetails.map(room => `
                        <details class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <summary class="font-semibold cursor-pointer">Room ${room.index} Summary: ${room.cfm.toFixed(0)} CFM / ${room.ffus} FFUs</summary>
                            <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-sm grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Dimensions (LxWxH):</span> ${room.length} x ${room.width} x ${room.height} ft</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Lighting Fixtures:</span> ${room.numFixtures} fixtures</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Makeup Air:</span> ${room.roomMakeupCfm.toFixed(0)} CFM</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">FFU Heat Load:</span> ${(room.ffuWatts * 3.412).toFixed(0)} BTU/hr</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Lighting Heat Load:</span> ${(room.lightingWatts * 3.412).toFixed(0)} BTU/hr</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Equipment Heat Load:</span> ${(room.equipWatts * 3.412).toFixed(0)} BTU/hr</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Envelope Heat Load:</span> ${room.envelopeLoad.toFixed(0)} BTU/hr</p>
                            </div>
                        </details>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <h2 class="text-2xl font-bold border-b pb-2 mb-4">Design Parameters & Assumptions</h2>
                    <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p><b>Key Input Parameters:</b> Room Temp: ${roomTemp}°F, Room RH: ${roomRH*100}%, Environment: ${environmentDetails}, Safety Factor: ${safetyFactor*100}%</p>
                        <ul class="list-disc list-inside">
                            ${assumptionsList.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div>
                    <details class="bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 p-3 rounded-lg">
                        <summary class="font-semibold text-lg cursor-pointer">Specification Sheet for Manufacturer Unit Selection</summary>
                        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-sm space-y-4">
                            <div>
                                <h4 class="font-bold">Airflow Requirements</h4>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Total Supply Airflow:</span> ${totalCfm.toFixed(0)} CFM</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">External Static Pressure (ESP):</span> 1.5 "w.g. <em>(Assumed value. Must be calculated by engineer.)</em></p>
                            </div>
                            <div>
                                <h4 class="font-bold">Cooling Coil Performance</h4>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Entering Air Temp (Mixed Air):</span> ${T_mixed.toFixed(1)}°F</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Entering Air Humidity (Mixed Air):</span> ${W_mixed.toFixed(5)} lb/lb</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Leaving Air Temp:</span> ${dehumidCoilTemp.toFixed(1)}°F @ saturation</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Total Cooling Capacity:</span> ${(totalCoilBtu).toFixed(0)} BTU/hr</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Sensible Cooling Capacity:</span> ${sensibleLoad.toFixed(0)} BTU/hr</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Sensible Heat Ratio (SHR):</span> ${shr.toFixed(2)}</p>
                            </div>
                            <div>
                                <h4 class="font-bold">Heating & Humidification</h4>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Total Heating Capacity:</span> ${(heaterKw * 3412).toFixed(0)} BTU/hr (${heaterKw.toFixed(2)} kW)</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Humidification Required:</span> ${humidWater.toFixed(2)} lb/hr</p>
                            </div>
                             <div>
                                <h4 class="font-bold">Electrical</h4>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Suggested Service:</span> 480V / 3-Phase</p>
                                <p><span class="font-medium text-gray-600 dark:text-gray-400">Max Electrical Load (Total System):</span> ${totalDemandKw.toFixed(2)} kW</p>
                            </div>
                        </div>
                    </details>
                </div>

            </div>
        `;

        document.getElementById('results').innerHTML = resultsHtml;
        exportPdfButton.classList.remove('hidden');
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    });

    exportPdfButton.addEventListener('click', function() {
        if (!latestResults) {
            alert('Please calculate results first.');
            return;
        }

        const doc = new jsPDF();
        const { designRequirements, totalHvac, roomDetails, validationMessages, narrative } = latestResults;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        let y = margin;

        function checkPageBreak(yPos, requiredSpace = 20) {
            if (yPos >= pageHeight - margin - requiredSpace) {
                doc.addPage();
                return margin;
            }
            return yPos;
        }

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Cleanroom HVAC Sizing Report', margin, y);
        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, margin, y);
        y += 10;

        doc.setFont('helvetica', 'italic');
        const narrativeLines = doc.splitTextToSize(narrative, 170);
        doc.text(narrativeLines, margin, y);
        y += (narrativeLines.length * 5) + 5;
        doc.setFont('helvetica', 'normal');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', margin, y); y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`- Total Airflow (CFM): ${totalHvac.totalCfm.toFixed(0)}`, margin, y); y += 6;
        doc.text(`- Final AC Sizing (Tons): ${totalHvac.acTonnage.toFixed(2)} (Includes fan heat & safety factor)`, margin, y); y += 6;
        doc.text(`- Heater Sizing (kW): ${totalHvac.heaterKw.toFixed(2)}`, margin, y); y += 10;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('System Design Targets', margin, y); y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`- Setpoint: ${designRequirements.roomTemp}°F at ${designRequirements.roomRH * 100}% RH`, margin, y); y += 6;
        doc.text(`- Control Range: ${designRequirements.tempRange} at ${designRequirements.rhRange}`, margin, y); y += 10;

        y = checkPageBreak(y);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('System Totals', margin, y); y += 5;
        doc.setLineWidth(0.2);
        doc.line(margin, y, 190, y); y += 5;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Airflow & Loads', margin, y); y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`- Total Recirculating Air: ${totalHvac.totalRecircCfm.toFixed(0)} CFM`, margin + 2, y); y += 5;
        doc.text(`- Total Makeup Air: ${totalHvac.totalMakeupCfm.toFixed(0)} CFM`, margin + 2, y); y += 5;
        const totalInternalLoad = ((totalHvac.totalFfuWatts + totalHvac.totalLightingWatts + totalHvac.totalEquipWatts) * 3.412 + totalHvac.totalPeopleLoad);
        doc.text(`- Total Internal Heat Load: ${totalInternalLoad.toFixed(0)} BTU/hr`, margin + 2, y); y += 5;
        doc.text(`- Adjusted Envelope Load: ${totalHvac.totalEnvelopeLoad.toFixed(0)} BTU/hr`, margin + 2, y); y += 8;
        
        y = checkPageBreak(y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Conditioning', margin, y); y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`- Calculated Coil Load: ${totalHvac.totalCoilTons.toFixed(2)} tons`, margin + 2, y); y += 5;
        doc.text(`- Sensible Cooling: ${totalHvac.sensibleTons.toFixed(2)} tons`, margin + 2, y); y += 5;
        doc.text(`- Latent Cooling: ${totalHvac.latentTons.toFixed(2)} tons`, margin + 2, y); y += 5;
        doc.text(`- Sensible Heat Ratio (SHR): ${totalHvac.shr.toFixed(2)} ${totalHvac.shrNote}`, margin + 2, y); y += 5;
        doc.text(`- Humidification Load: ${totalHvac.humidLoad.toFixed(0)} BTU/hr (${totalHvac.humidKw.toFixed(2)} kW)`, margin + 2, y); y += 8;

        y = checkPageBreak(y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Electrical', margin, y); y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`- Total Demand Load: ${totalHvac.totalDemandKw.toFixed(2)} kW`, margin + 2, y); y += 5;
        doc.text(`- Amperage @ 480V/3ph: ${totalHvac.amps480.toFixed(1)} A`, margin + 2, y); y += 5;
        doc.text(`- Amperage @ 208V/3ph: ${totalHvac.amps208Three.toFixed(1)} A`, margin + 2, y); y += 10;
        
        doc.addPage();
        y = margin;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Room-by-Room Breakdown', margin, y); y += 5;
        doc.setLineWidth(0.2);
        doc.line(margin, y, 190, y); y+= 5;
        
        roomDetails.forEach(room => {
            y = checkPageBreak(y, 45);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`Room ${room.index}`, margin, y); y += 6;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`- Dimensions (LxWxH): ${room.length} x ${room.width} x ${room.height} ft`, margin + 2, y); y += 5;
            doc.text(`- Airflow: ${room.cfm.toFixed(0)} CFM`, margin + 2, y); y += 5;
            doc.text(`- FFUs: ${room.ffus}`, margin + 2, y); y += 5;
            doc.text(`- Lighting Fixtures: ${room.numFixtures}`, margin + 2, y); y += 5;
            const roomTotalLoad = (room.ffuWatts + room.lightingWatts + room.equipWatts) * 3.412 + room.envelopeLoad;
            doc.text(`- Total Room Load: ${roomTotalLoad.toFixed(0)} BTU/hr`, margin + 2, y); y += 8;
        });
        
        doc.addPage();
        y = margin;
        
        if (totalHvac.dehumPintsPerDay > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Alternative Dehumidification Strategy', margin, y); y += 8;
            doc.setLineWidth(0.2);
            doc.line(margin, y - 2, 190, y - 2);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            const noteLines = doc.splitTextToSize(totalHvac.dehumNote, 170);
            doc.text(noteLines, margin, y); 
            y += (noteLines.length * 5) + 2;

            doc.text(`- Required Capacity: ${totalHvac.dehumPintsPerDay.toFixed(0)} pints/day`, margin + 2, y); y += 5;
            doc.text(`- Estimated Heat Added to Space: ${totalHvac.dehumAddedHeat.toFixed(0)} BTU/hr`, margin + 2, y); y += 8;
            
            doc.setFont('helvetica', 'bold');
            const sizingLines = doc.splitTextToSize(totalHvac.dehumSizingExample.replace(/<strong>|<\/strong>/g, ''), 170);
            doc.text(sizingLines, margin, y); 
            y += (sizingLines.length * 5) + 5;
            y = checkPageBreak(y);
        }

        const assumptionsList = [
            `Dehumidification coil temp auto-calculated to ${designRequirements.dehumidCoilTemp.toFixed(1)}°F (2.5°F below room dew point).`,
            `Required supply air temperature calculated to be ${designRequirements.requiredSupplyTemp.toFixed(1)}°F to meet room sensible loads.`,
            'Fan heat gain is estimated at a 2°F temperature rise across the main supply fan.',
            'Makeup air for non-single-pass rooms is 10% of room CFM, with a minimum of 10 CFM/person for ventilation.',
            'Winter outdoor air is assumed to be 20% RH for humidification calculations.',
            'Cooling power consumption is estimated at 1.2 kW per ton.',
            'Electrical power calculations assume a power factor (PF) of 0.85.',
            'Standard sea-level atmospheric pressure is used for all psychrometric calculations.'
        ];

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Design Parameters & Assumptions', margin, y); y += 8;
        doc.setLineWidth(0.2);
        doc.line(margin, y - 2, 190, y - 2);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Environment: ${designRequirements.environmentDetails}`, margin, y); y += 6;
        assumptionsList.forEach(item => {
            y = checkPageBreak(y, 10);
            const splitText = doc.splitTextToSize(`- ${item}`, 170);
            doc.text(splitText, margin, y);
            y += (splitText.length * 4) + 2;
        });

        doc.addPage();
        y = margin;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Specification Sheet for Manufacturer Unit Selection', margin, y); y += 8;
        doc.setLineWidth(0.2);
        doc.line(margin, y, 190, y); y += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Airflow Requirements', margin, y); y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Supply Airflow: ${totalHvac.totalCfm.toFixed(0)} CFM`, margin + 2, y); y += 6;
        doc.text(`External Static Pressure (ESP): 1.5 "w.g.`, margin + 2, y); y += 5;
        doc.setFont('helvetica', 'italic');
        doc.text('(Assumed value. Must be calculated by design engineer.)', margin + 2, y); y += 8;
        doc.setFont('helvetica', 'normal');

        y = checkPageBreak(y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Cooling Coil Performance', margin, y); y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`- Entering Air Temp (Mixed Air): ${totalHvac.T_mixed.toFixed(1)}°F`, margin + 2, y); y += 5;
        doc.text(`- Entering Air Humidity (Mixed Air): ${totalHvac.W_mixed.toFixed(5)} lb/lb`, margin + 2, y); y += 5;
        doc.text(`- Leaving Air Temp: ${designRequirements.dehumidCoilTemp.toFixed(1)}°F @ saturation`, margin + 2, y); y += 5;
        doc.text(`- Total Cooling Capacity: ${(totalHvac.totalCoilBtu).toFixed(0)} BTU/hr`, margin + 2, y); y += 5;
        doc.text(`- Sensible Cooling Capacity: ${totalHvac.sensibleLoad.toFixed(0)} BTU/hr`, margin + 2, y); y += 5;
        doc.text(`- Sensible Heat Ratio (SHR): ${totalHvac.shr.toFixed(2)}`, margin + 2, y); y += 8;
        
        y = checkPageBreak(y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Heating & Humidification', margin, y); y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`- Total Heating Capacity: ${(totalHvac.heaterKw * 3412).toFixed(0)} BTU/hr (${totalHvac.heaterKw.toFixed(2)} kW)`, margin + 2, y); y += 5;
        doc.text(`- Humidification Required: ${totalHvac.humidWater.toFixed(2)} lb/hr`, margin + 2, y); y += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Electrical', margin, y); y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`- Suggested Service: 480V / 3-Phase`, margin + 2, y); y += 5;
        doc.text(`- Max Electrical Load (Total System): ${totalHvac.totalDemandKw.toFixed(2)} kW`, margin + 2, y); y += 5;

        doc.save('Cleanroom_HVAC_Sizing_Report.pdf');
    });
});