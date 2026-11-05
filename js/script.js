// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('button');
const gallery = document.getElementById('gallery');

// NASA provides DEMO_KEY for learning and small projects.
const apiKey = 'DEMO_KEY';

// Fetch APOD images for the dates selected by the user.
async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate) {
		gallery.innerHTML = '<p class="placeholder">Please choose a start and end date.</p>';
		return;
	}

	if (startDate > endDate) {
		gallery.innerHTML = '<p class="placeholder">The start date must be before the end date.</p>';
		return;
	}

	gallery.innerHTML = '<p class="placeholder">Loading space images...</p>';

	const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error('NASA could not return the images.');
		}

		const spaceImages = await response.json();
		const images = Array.isArray(spaceImages) ? spaceImages : [spaceImages];

		gallery.innerHTML = images
			.filter((image) => image.media_type === 'image' && image.hdurl)
			.map((image) => `
				<article class="gallery-item">
					<a href="${image.hdurl}" target="_blank" rel="noopener">
						<img src="${image.hdurl}" alt="${image.title}" />
					</a>
					<p><strong>${image.title}</strong></p>
					<p>${image.date}</p>
					<p>${image.explanation}</p>
				</article>
			`)
			.join('');

		if (!gallery.innerHTML) {
			gallery.innerHTML = '<p class="placeholder">No image results were found for these dates.</p>';
		}
	} catch (error) {
		gallery.innerHTML = `<p class="placeholder">${error.message} Please try again.</p>`;
	}
}

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Get images when the user clicks the button.
getImagesButton.addEventListener('click', getSpaceImages);
