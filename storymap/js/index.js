var sidebar = $('#sidebar').sidebar({ position: 'right' });

document.addEventListener('DOMContentLoaded', function () {
    // Define basemaps
	const basemaps = {
		default_map: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
			attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
			maxZoom: 18,
			className: 'map-default', // used to css style 'per map' or other purposes
			label: 'Default' // used for mapNames[basemapKey] =  solely for display purposes to user (which map is displayed)
		}),
		dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
			attribution: '©OpenStreetMap, ©CartoDB',
			maxZoom: 18,
			className: 'map-dark',
			label: 'dark'
		}),
		osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
			maxZoom: 18,
			className: 'map-osm',
			label: 'OpenStreetMap'
		}),
		terrain: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap, © OpenStreetMap contributors',
			maxZoom: 17,
			className: 'map-terrain',
			label: 'Terrain'
		})
	};



    // Initialize map
    const map = L.map('map').setView([40.0, -10.0], 3);
    basemaps.default_map.addTo(map);
    document.getElementById('map-type-indicator').textContent = 'Map: Default';

    // Default grey marker icon
    const defaultGreyIcon = L.icon({
        iconUrl: 'storymap/assets/marker_grey.svg',
        //shadowUrl: '',
        iconSize: [30, 41],
        iconAnchor: [16, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    /* Locations (intro excluded)
	 * if no basemap: '' provided, default_map is used
	 * chapter, title, date are only used to generate the 'timeline'
	*/
    const locations = [
        {
            id: 'kings-landing',
            chapter: 'Chapter 2',
            title: "King's Landing",
            date: '299 AC',
            coords: [57.41424757265092, -6.174358621777013],
            zoom: 12,
            //basemap: 'dark',
            marker: 'storymap/assets/marker_red.svg'
        },
        {
            id: 'harrenhal',
            chapter: 'Chapter 3',
            title: 'Harrenhal',
            date: '300 AC',
            coords: [57.54250374972666, -5.974599776570065],
            zoom: 15,
            //basemap: 'dark',
            marker: 'storymap/assets/marker_red.svg'
        },
        {
            id: 'braavos',
            chapter: 'Chapter 4',
            title: 'Braavos',
            date: '301 AC',
            coords: [57.40295340164181, -5.827636610853287],
            zoom: 14,
            basemap: 'terrain',
            marker: 'storymap/assets/marker_red.svg'
        },
        {
            id: 'winterfell',
            chapter: 'Chapter 5',
            title: 'Winterfell',
            date: '302 AC',
            coords: [57.36960868897496, -5.801725224879025],
            zoom: 16,
            //basemap: 'terrain',
            marker: 'storymap/assets/marker_red.svg'
        },
        {
            id: 'jim',
            chapter: 'Chapter 5',
            title: 'Winterfell',
            date: '302 AC',
            coords: [57.42991847435301, -6.032366660994257],
            zoom: 16,
            //basemap: 'terrain',
            marker: 'storymap/assets/marker_red.svg'
        },
        {
            id: 'jimm',
            chapter: 'Chapter 5',
            title: 'Winterfell',
            date: '302 AC',
            coords: [57.34650072009196, -6.008113379893222],
            zoom: 16,
            basemap: 'terrain',
            marker: 'storymap/assets/marker_red.svg'
        },
        {
            id: 'jimmy',
            chapter: 'Chapter 5',
            title: 'Winterfell',
            date: '302 AC',
            coords: [57.34395626645615, -5.833110225886605],
            zoom: 16,
            //basemap: 'terrain',
            marker: 'storymap/assets/marker_red.svg'
        }
    ];

    const markers = [];
    let currentLocation = -1; // intro
    let previousLocation = null;
    let currentBasemap = null;
    let isTransitioning = false;

    let connectionLines = [];
    let activeConnectionLine = null;

    // Map padding for sidebar
    function getMapPadding() {
        const sidebarWidth = document.querySelector('.sidebar').offsetWidth || 300;
        return {
            paddingTopLeft: [0, 0],
            paddingBottomRight: [sidebarWidth, 0],
            padding: [50, 50]
        };
    }

    function fitMapToMarkers() {
        if (markers.length === 0) return;

        const group = L.featureGroup(markers);
        const bounds = group.getBounds();
        const padding = getMapPadding();

        map.fitBounds(bounds, {
            padding: padding.padding,
            paddingTopLeft: padding.paddingTopLeft,
            paddingBottomRight: padding.paddingBottomRight
        });
    }

    function showLoadingIndicator() {
        document.getElementById('loading-indicator').style.display = 'flex';
        document.getElementById('map').style.opacity = '0.7';
    }

    function hideLoadingIndicator() {
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('map').style.opacity = '1';
    }

	function changeBasemap(basemapsKey) {
		const newLayer = basemaps[basemapsKey];
		if (!newLayer) return;

		if (currentBasemap && map.hasLayer(currentBasemap)) {
			map.removeLayer(currentBasemap);

			const oldClass = currentBasemap.options.className;
			if (oldClass) map.getContainer().classList.remove(oldClass);
		}

		currentBasemap = newLayer;
		currentBasemap.addTo(map);

		if (currentBasemap.options.className) {
			map.getContainer().classList.add(currentBasemap.options.className);
		}

		// Display label directly from basemap options
		document.getElementById('map-type-indicator').textContent = `Map: ${currentBasemap.options.label || basemapsKey}`;
	}

    function drawConnections() {
        connectionLines.forEach(line => map.removeLayer(line));
        connectionLines = [];

        if (activeConnectionLine) {
            map.removeLayer(activeConnectionLine);
            activeConnectionLine = null;
        }

        for (let i = 0; i < locations.length - 1; i++) {
            const line = L.polyline([locations[i].coords, locations[i + 1].coords], {
                color: '#555',
                weight: 3,
                opacity: 0.7,
                dashArray: '5,10',
                lineCap: 'round'
            }).addTo(map);

            connectionLines.push(line);
        }

        updateActivePath();
    }

	function updateActivePath() {
		if (activeConnectionLine) {
			map.removeLayer(activeConnectionLine);
			activeConnectionLine = null;
		}

		// Don't draw path if either index is intro (-1)
		if (
			previousLocation !== null &&
			previousLocation >= 0 &&
			currentLocation !== null &&
			currentLocation >= 0 &&
			previousLocation !== currentLocation
		) {
			const activeLine = L.polyline([locations[previousLocation].coords, locations[currentLocation].coords], {
				color: '#f53d00',
				weight: 4,
				opacity: 0.9
			}).addTo(map);

			/*
			L.polylineDecorator(activeLine, {
				patterns: [
					{
						offset: '0',
						repeat: 40,
						symbol: L.Symbol.dash({pixelSize: 20})
					}
				]
			}).addTo(map);
			*/

			activeConnectionLine = activeLine;
		}
	}

    function updateMarkerIcons() {
        markers.forEach((marker, index) => {
            if (index === currentLocation && locations[index].marker) {
                const activeIcon = L.icon({
                    iconUrl: locations[index].marker,
                    //shadowUrl: '',
					iconSize: [30, 41],
					iconAnchor: [16, 41],
					popupAnchor: [1, -34],
					shadowSize: [41, 41]
                });

                marker.setIcon(activeIcon);
            } else {
                marker.setIcon(defaultGreyIcon);
            }
        });
    }

    // Fly to marker(s) respecting sidebar
    function flyToMarkers(latLngs, maxZoom = 16, duration = 1.5) {
        if (!latLngs || latLngs.length === 0) return;

        const sidebar = document.querySelector('.sidebar');
        const sidebarWidth = sidebar ? sidebar.offsetWidth : 0;

        const bounds = latLngs.length === 1 ? L.latLngBounds(latLngs[0], latLngs[0]) : L.latLngBounds(latLngs);

        map.flyToBounds(bounds, {
            paddingTopLeft: [0, 0],
            paddingBottomRight: [sidebarWidth, 0],
            maxZoom: maxZoom,
            duration: duration,
            easeLinearity: 0.25
        });
    }

	function navigateToLocation(index) {
		if (isTransitioning || index === currentLocation) return;

		isTransitioning = true;
		previousLocation = currentLocation;
		currentLocation = index;

		// Handle intro state (no location)
		if (index === -1) {
			showStory('intro');
			// Remove active class from all timeline items when going back to intro
			document.querySelectorAll('.timeline-item').forEach(item => {
				item.classList.remove('active');
			});
			updateMarkerIcons();
			
			setTimeout(() => {
				fitMapToMarkers();
				hideLoadingIndicator();
				isTransitioning = false;
			}, 1000);
			return;
		}

		const location = locations[index];

		showLoadingIndicator();

		if (location.basemap) changeBasemap(location.basemap);
		else changeBasemap('default_map'); // fallback to default_map

		showStory(location.id);
		setActiveTimelineItem(index);
		updateMarkerIcons();

		flyToMarkers([location.coords], location.zoom);

		setTimeout(() => {
			hideLoadingIndicator();
			updateActivePath();
			isTransitioning = false;
		}, 1000);
	}

	function startOver() {
		if (isTransitioning) return;
		isTransitioning = true;

		showLoadingIndicator();

		previousLocation = currentLocation;
		currentLocation = -1; // intro
		changeBasemap('default_map'); // reset aka fallback to default_map

		showStory('intro');
		document.querySelectorAll('.timeline-item').forEach(item => item.classList.remove('active'));
		updateMarkerIcons();

		setTimeout(() => {
			fitMapToMarkers();
			drawConnections();
			hideLoadingIndicator();
			isTransitioning = false;
		}, 500);
	}

    // Create markers and timeline
    const timeline = document.getElementById('timeline');
    locations.forEach((loc, index) => {
        const marker = L.marker(loc.coords, { icon: defaultGreyIcon }).addTo(map);
        marker.on('click', () => navigateToLocation(index));
        markers.push(marker);

        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `<div class="chapter">${loc.chapter}</div><div class="location">${loc.title}</div><div class="date">${loc.date}</div>`;
        item.addEventListener('click', () => navigateToLocation(index));
        timeline.appendChild(item);
    });

    function setActiveTimelineItem(index) {
        document.querySelectorAll('.timeline-item').forEach((item, i) => {
            if (i === index) item.classList.add('active');
            else item.classList.remove('active');
        });
    }

    function showStory(id) {
        document.querySelectorAll('.story-content').forEach(c => c.classList.remove('active'));
        const el = document.getElementById(`story-${id}`);
        if (el) el.classList.add('active');
    }

	document.getElementById('prev-btn').addEventListener('click', () => {
		if (currentLocation > -1) {
			// If we're at first location (0), go back to intro (-1)
			const prevIndex = currentLocation === 0 ? -1 : currentLocation - 1;
			navigateToLocation(prevIndex);
		}
	});

	document.getElementById('next-btn').addEventListener('click', () => {
		if (currentLocation < locations.length - 1) {
			// If we're at intro (-1), go to first location (0)
			const nextIndex = currentLocation === -1 ? 0 : currentLocation + 1;
			navigateToLocation(nextIndex);
		}
	});

    document.getElementById('start-over-btn').addEventListener('click', startOver);

    window.addEventListener('resize', () => {
        if (markers.length > 0) setTimeout(fitMapToMarkers, 300);
    });

    // Initialize intro view
	showStory('intro');
	currentLocation = -1;
	// Don't set any timeline items as active initially
	document.querySelectorAll('.timeline-item').forEach(item => {
		item.classList.remove('active');
	});
	updateMarkerIcons();
	setTimeout(() => {
		fitMapToMarkers();
		drawConnections();
	}, 500);
});
