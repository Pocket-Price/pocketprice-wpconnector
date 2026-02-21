
/**
 * Interactive Data Table Frontend JavaScript
 * 
 * Handles data fetching, filtering, sorting, pagination and all interactive features
 */

document.addEventListener('DOMContentLoaded', function() {
	const tables = document.querySelectorAll('.wp-block-telex-block-telex-data-table');
	
	tables.forEach(initializeTable);
});

function initializeTable(tableBlock) {
	const container = tableBlock.querySelector('.telex-data-table-container');
	if (!container) return;
	
	const config = JSON.parse(container.dataset.config || '{}');
	
	const state = {
		allData: [],
		filteredData: [],
		displayData: [],
		currentPage: 1,
		sortColumn: null,
		sortDirection: 'asc',
		searchTerm: '',
		columnFilters: {},
		availableColumns: config.selectedColumns || []
	};
	
	// Initialize
	fetchData(container, config, state);
}

async function fetchData(container, config, state) {
	if (!config.dataSourceUrl) {
		showError(container, 'No data source configured');
		return;
	}
	
	showLoading(container);
	
	try {
		const response = await fetch(config.dataSourceUrl);
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		
		const data = await response.json();
		
		if (!Array.isArray(data) || data.length === 0) {
			throw new Error('Invalid data format. Expected an array of objects.');
		}
		
		// Extract columns if not specified
		if (state.availableColumns.length === 0) {
			state.availableColumns = Object.keys(data[0]);
		}
		
		state.allData = data;
		state.filteredData = data;
		
		renderTable(container, config, state);
		
	} catch (error) {
		showError(container, `Error loading data: ${error.message}`);
	}
}

function showLoading(container) {
	container.innerHTML = `
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading data...</p>
		</div>
	`;
}

function showError(container, message) {
	container.innerHTML = `
		<div class="error-state">
			<p>${message}</p>
			<button onclick="location.reload()">Retry</button>
		</div>
	`;
}

function renderTable(container, config, state) {
	if (state.filteredData.length === 0) {
		container.innerHTML = `
			<div class="empty-state">
				<p>No data available</p>
			</div>
		`;
		return;
	}
	
	// Apply pagination
	const startIndex = (state.currentPage - 1) * config.rowsPerPage;
	const endIndex = startIndex + config.rowsPerPage;
	state.displayData = state.filteredData.slice(startIndex, endIndex);
	
	let html = '<div class="table-container-inner">';
	
	// Header with search
	if (config.showSearch) {
		html += `
			<div class="table-header">
				<div class="table-search">
					<input 
						type="text" 
						placeholder="Search table..." 
						value="${state.searchTerm}"
						class="table-search-input"
					/>
				</div>
			</div>
		`;
	}
	
	// Table wrapper
	const wrapperClass = config.responsiveMode === 'scroll' ? 'responsive-scroll' : '';
	html += `<div class="table-wrapper ${wrapperClass}">`;
	
	// Table
	const tableClasses = [
		'data-table',
		config.showBorders ? 'with-borders' : '',
		config.alternatingRows ? 'alternating-rows' : ''
	].filter(Boolean).join(' ');
	
	html += `<table class="${tableClasses}">`;
	
	// Table header
	html += '<thead>';
	html += '<tr>';
	
	state.availableColumns.forEach(column => {
		const sortClass = config.enableSorting ? 'sortable' : '';
		const sortIndicator = state.sortColumn === column 
			? `<span class="sort-indicator active">${state.sortDirection === 'asc' ? '↑' : '↓'}</span>`
			: config.enableSorting ? '<span class="sort-indicator">⇅</span>' : '';
		
		html += `<th class="${sortClass}" data-column="${column}">${column}${sortIndicator}</th>`;
	});
	
	html += '</tr>';
	
	// Filter row
	if (config.showColumnFilters) {
		html += '<tr class="filter-row">';
		
		state.availableColumns.forEach(column => {
			const uniqueValues = [...new Set(state.allData.map(row => row[column]))].sort();
			const currentFilter = state.columnFilters[column] || '';
			
			html += `<th><select class="column-filter" data-column="${column}">`;
			html += `<option value="">All</option>`;
			
			uniqueValues.forEach(value => {
				const selected = value === currentFilter ? 'selected' : '';
				html += `<option value="${value}" ${selected}>${value}</option>`;
			});
			
			html += '</select></th>';
		});
		
		html += '</tr>';
	}
	
	html += '</thead>';
	
	// Table body
	html += '<tbody>';
	
	state.displayData.forEach(row => {
		html += '<tr>';
		
		state.availableColumns.forEach(column => {
			const label = config.responsiveMode === 'stack' ? `data-label="${column}"` : '';
			html += `<td ${label}>${row[column] || '-'}</td>`;
		});
		
		html += '</tr>';
	});
	
	html += '</tbody>';
	html += '</table>';
	html += '</div>'; // table-wrapper
	
	// Pagination
	if (config.showPagination) {
		const totalPages = Math.ceil(state.filteredData.length / config.rowsPerPage);
		const showingFrom = startIndex + 1;
		const showingTo = Math.min(endIndex, state.filteredData.length);
		const totalEntries = state.filteredData.length;
		
		html += `
			<div class="table-pagination">
				<div class="pagination-info">
					Showing ${showingFrom} to ${showingTo} of ${totalEntries} entries
				</div>
				<div class="pagination-controls">
					<button class="prev-page" ${state.currentPage === 1 ? 'disabled' : ''}>Previous</button>
		`;
		
		// Page numbers
		for (let i = 1; i <= Math.min(totalPages, 5); i++) {
			const activeClass = i === state.currentPage ? 'active' : '';
			html += `<span class="page-number ${activeClass}" data-page="${i}">${i}</span>`;
		}
		
		if (totalPages > 5) {
			html += '<span>...</span>';
			html += `<span class="page-number" data-page="${totalPages}">${totalPages}</span>`;
		}
		
		html += `
					<button class="next-page" ${state.currentPage === totalPages ? 'disabled' : ''}>Next</button>
				</div>
			</div>
		`;
	}
	
	html += '</div>'; // table-container-inner
	
	container.innerHTML = html;
	
	// Attach event listeners
	attachEventListeners(container, config, state);
}

function attachEventListeners(container, config, state) {
	// Search
	const searchInput = container.querySelector('.table-search-input');
	if (searchInput) {
		searchInput.addEventListener('input', (e) => {
			state.searchTerm = e.target.value.toLowerCase();
			state.currentPage = 1;
			applyFilters(container, config, state);
		});
	}
	
	// Column filters
	const columnFilters = container.querySelectorAll('.column-filter');
	columnFilters.forEach(filter => {
		filter.addEventListener('change', (e) => {
			const column = e.target.dataset.column;
			state.columnFilters[column] = e.target.value;
			state.currentPage = 1;
			applyFilters(container, config, state);
		});
	});
	
	// Sorting
	if (config.enableSorting) {
		const sortableHeaders = container.querySelectorAll('th.sortable');
		sortableHeaders.forEach(header => {
			header.addEventListener('click', () => {
				const column = header.dataset.column;
				
				if (state.sortColumn === column) {
					state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
				} else {
					state.sortColumn = column;
					state.sortDirection = 'asc';
				}
				
				applySorting(container, config, state);
			});
		});
	}
	
	// Pagination
	const prevButton = container.querySelector('.prev-page');
	const nextButton = container.querySelector('.next-page');
	const pageNumbers = container.querySelectorAll('.page-number');
	
	if (prevButton) {
		prevButton.addEventListener('click', () => {
			if (state.currentPage > 1) {
				state.currentPage--;
				renderTable(container, config, state);
			}
		});
	}
	
	if (nextButton) {
		nextButton.addEventListener('click', () => {
			const totalPages = Math.ceil(state.filteredData.length / config.rowsPerPage);
			if (state.currentPage < totalPages) {
				state.currentPage++;
				renderTable(container, config, state);
			}
		});
	}
	
	pageNumbers.forEach(pageNum => {
		pageNum.addEventListener('click', () => {
			state.currentPage = parseInt(pageNum.dataset.page);
			renderTable(container, config, state);
		});
	});
}

function applyFilters(container, config, state) {
	state.filteredData = state.allData.filter(row => {
		// Search filter
		if (state.searchTerm) {
			const searchMatch = state.availableColumns.some(column => {
				const value = String(row[column] || '').toLowerCase();
				return value.includes(state.searchTerm);
			});
			
			if (!searchMatch) return false;
		}
		
		// Column filters
		for (const [column, filterValue] of Object.entries(state.columnFilters)) {
			if (filterValue && row[column] !== filterValue) {
				return false;
			}
		}
		
		return true;
	});
	
	// Re-apply sorting if active
	if (state.sortColumn) {
		applySorting(container, config, state, false);
	} else {
		renderTable(container, config, state);
	}
}

function applySorting(container, config, state, render = true) {
	if (!state.sortColumn) return;
	
	state.filteredData.sort((a, b) => {
		const aValue = a[state.sortColumn];
		const bValue = b[state.sortColumn];
		
		// Handle different data types
		const aNum = parseFloat(aValue);
		const bNum = parseFloat(bValue);
		
		let comparison = 0;
		
		if (!isNaN(aNum) && !isNaN(bNum)) {
			// Numeric comparison
			comparison = aNum - bNum;
		} else {
			// String comparison
			comparison = String(aValue).localeCompare(String(bValue));
		}
		
		return state.sortDirection === 'asc' ? comparison : -comparison;
	});
	
	if (render) {
		renderTable(container, config, state);
	}
}
