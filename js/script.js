// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('button');
const gallery = document.getElementById('gallery');
const factText = document.getElementById('factText');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
let galleryItems = [];

// These facts are randomly selected each time the app loads.
const spaceFacts = [
	'One day on Venus is longer than one year on Venus.',
	'Neutron stars can spin about 600 times every second.',
	'Our Sun contains more than 99 percent of the mass in our solar system.',
	'A NASA spacesuit can cost around 12 million dollars.',
	'There are more trees on Earth than stars in the Milky Way.',
	'Saturn would float in water because it is less dense than water.',
	'Footprints on the Moon can last for millions of years because there is no wind.',
	'Light from the Sun takes about eight minutes to reach Earth.'
];

// Pick and display one fact when the page loads.
const randomFactIndex = Math.floor(Math.random() * spaceFacts.length);
factText.textContent = spaceFacts[randomFactIndex];

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

	gallery.innerHTML = `
		<div class="loading-state" role="status" aria-live="polite">
			<div class="loading-orbit" aria-hidden="true"><span></span></div>
			<p>🔄 Loading space photos...</p>
		</div>
	`;

	const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error('NASA could not return the images.');
		}

		const spaceImages = await response.json();
		galleryItems = (Array.isArray(spaceImages) ? spaceImages : [spaceImages])
			.filter((image) => image.media_type === 'image' && image.hdurl || image.media_type === 'video' && image.url);

		gallery.innerHTML = galleryItems.map((image, index) => image.media_type === 'video'
			? `
				<article class="gallery-item video-item">
					<div class="video-preview" aria-hidden="true">VIDEO</div>
					<p><strong>${image.title}</strong></p>
					<p>${image.date}</p>
					<a class="video-link" href="${image.url}" target="_blank" rel="noopener">
						Watch video on NASA <span aria-hidden="true">↗</span>
					</a>
				</article>
			`
			: `
				<article class="gallery-item" data-image-index="${index}" tabindex="0" role="button">
					<img src="${image.hdurl}" alt="${image.title}" />
					<p><strong>${image.title}</strong></p>
					<p>${image.date}</p>
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

// Show the selected image and its full APOD details in the modal.
function openModal(image) {
	modalImage.src = image.hdurl;
	modalImage.alt = image.title;
	modalTitle.textContent = image.title;
	modalDate.textContent = image.date;
	modalExplanation.textContent = image.explanation;
	imageModal.hidden = false;
	closeModalButton.focus();
}

function closeModal() {
	imageModal.hidden = true;
}

gallery.addEventListener('click', (event) => {
	const galleryItem = event.target.closest('.gallery-item');

	if (galleryItem && galleryItem.dataset.imageIndex !== undefined) {
		openModal(galleryItems[galleryItem.dataset.imageIndex]);
	}
});

gallery.addEventListener('keydown', (event) => {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		openModal(galleryItems[event.target.dataset.imageIndex]);
	}
});

closeModalButton.addEventListener('click', closeModal);

imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) {
		closeModal();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !imageModal.hidden) {
		closeModal();
	}
});
