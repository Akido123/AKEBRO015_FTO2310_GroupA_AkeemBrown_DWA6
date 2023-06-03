// Fully working scripts.js file

import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

const bookData = {
	page: 1,
	matches: books,
}

const starting = document.createDocumentFragment()

/**
 * Iterates over all books properties to set as a home preview.
 * @returns {HTMLElement} `element` - This will be later appended to the homePage.
*/
function homePreview(){
	for (const { author, id, image, title } of bookData.matches.slice(0, BOOKS_PER_PAGE)) {
		const element = document.createElement('button')
		element.classList = 'preview'
		element.setAttribute('data-preview', id)
	
		element.innerHTML = `
			<img
				class="preview__image"
				src="${image}"
			/>
			
			<div class="preview__info">
				<h3 class="preview__title">${title}</h3>
				<div class="preview__author">${authors[author]}</div>
			</div>
		`
	
		starting.appendChild(element)
	}
	document.querySelector('[data-list-items]').appendChild(starting)
}


/**
 * Creates a dropdown list for genres.
 * @returns {HTMLElement} `element` - This will be later appended to the genre list options.
 */
function genreList(){
	const genreHtml = document.createDocumentFragment()
	const firstGenreElement = document.createElement('option')
	firstGenreElement.value = 'any'
	firstGenreElement.innerText = 'All Genres'
	genreHtml.appendChild(firstGenreElement)
	
	for (const [id, name] of Object.entries(genres)) {
		const element = document.createElement('option')
		element.value = id
		element.innerText = name
		genreHtml.appendChild(element)
	}
	document.querySelector('[data-search-genres]').appendChild(genreHtml)
}

/**
 * Creates a dropdown list for authors.
 * @returns {HTMLElement} `element` - This will later be appended to the author list options.
 */
function authorList(){
	const authorsHtml = document.createDocumentFragment()
	const firstAuthorElement = document.createElement('option')
	firstAuthorElement.value = 'any'
	firstAuthorElement.innerText = 'All Authors'
	authorsHtml.appendChild(firstAuthorElement)
	
	for (const [id, name] of Object.entries(authors)) {
		const element = document.createElement('option')
		element.value = id
		element.innerText = name
    authorsHtml.appendChild(element)
	}
	document.querySelector('[data-search-authors]').appendChild(authorsHtml)
}

/**
 * Checks to what color scheme is prefered and sets the colors respective of the preference.
 */
function modePreference(){
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		document.querySelector('[data-settings-theme]').value = 'night'
		document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
		document.documentElement.style.setProperty('--color-light', '10, 10, 20');
	} else {
		document.querySelector('[data-settings-theme]').value = 'day'
		document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
		document.documentElement.style.setProperty('--color-light', '255, 255, 255');
	}
}

/**
 * Creates a button, "show more", of the list of books and the number of books left to display.
 */
function showMoreButton(){
	document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`
	document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) > 0
	
	document.querySelector('[data-list-button]').innerHTML = `
		<span>Show more</span>
		<span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
	`
}

/**
 * Closes the filter search overlay.
 */
function closeSearchOverlay(){
	document.querySelector('[data-search-cancel]').addEventListener('click', () => {
		document.querySelector('[data-search-overlay]').open = false
	})	
}

/**
 * Closes the scheme settings overlay.
 */
function closeSettingsOverlay(){
	document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
		document.querySelector('[data-settings-overlay]').open = false
	})
}

/**
 * Opens the filter search overlay.
 */
function openSearchOverlay(){
	document.querySelector('[data-header-search]').addEventListener('click', () => {
		document.querySelector('[data-search-overlay]').open = true 
		document.querySelector('[data-search-title]').focus()
	})
}

/**
 * Opens the scheme settings overlay.
 */
function openSettingsOverlay(){
	document.querySelector('[data-header-settings]').addEventListener('click', () => {
		document.querySelector('[data-settings-overlay]').open = true 
	})
}

/**
 * Closes the overlay for the various lists.
 */
function closeListOverlay(){
	document.querySelector('[data-list-close]').addEventListener('click', () => {
		document.querySelector('[data-list-active]').open = false
	})
}

/**
 * The filter option to check and change the homepage preview respective of the filters.
 */
function filterOption() {
	document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
		event.preventDefault()
		const formData = new FormData(event.target)
		const { theme } = Object.fromEntries(formData)
	
		modePreference()
		
		closeSettingsOverlay()
	})
	
	document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
		event.preventDefault()
		const formData = new FormData(event.target)
		const filters = Object.fromEntries(formData)
		const result = []
	
		for (const book of books) {
			let genreMatch = filters.genre === 'any'
	
			for (const singleGenre of book.genres) {
				if (genreMatch) break;
				if (singleGenre === filters.genre) { genreMatch = true }
			}
	
			if (
				(filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
				(filters.author === 'any' || book.author === filters.author) && 
				genreMatch
			) {
				result.push(book)
			}
		}
	
		bookData.page = 1;
		bookData.matches = result
	
		if (result.length < 1) {
			document.querySelector('[data-list-message]').classList.add('list__message_show')
		} else {
			document.querySelector('[data-list-message]').classList.remove('list__message_show')
		}
	
		document.querySelector('[data-list-items]').innerHTML = ''
		homePreview()
	
		showMoreButton()
	
		window.scrollTo({top: 0, behavior: 'smooth'});
		closeSearchOverlay()
	})
}

/**
 * Allows you to click the "Show More" button to display more of the books.
 */
function showMoreBooks(){
	document.querySelector('[data-list-button]').addEventListener('click', () => {
		homePreview()
		page += 1
	})
}

/**
 * Clicking on books will preview the books: image, description and author.
 */
function bookPreview(){
	document.querySelector('[data-list-items]').addEventListener('click', (event) => {
		const pathArray = Array.from(event.path || event.composedPath())
		let active = null
	
		for (const node of pathArray) {
			if (active) break
	
			if (node?.dataset?.preview) {
				let result = null
		
				for (const singleBook of books) {
					if (result) break;
					if (singleBook.id === node?.dataset?.preview) result = singleBook
				} 
			
				active = result
			}
		}
		
		if (active) {
			document.querySelector('[data-list-active]').open = true
			document.querySelector('[data-list-blur]').src = active.image
			document.querySelector('[data-list-image]').src = active.image
			document.querySelector('[data-list-title]').innerText = active.title
			document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
			document.querySelector('[data-list-description]').innerText = active.description
		}
	})
}