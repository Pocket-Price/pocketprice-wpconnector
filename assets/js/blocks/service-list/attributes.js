export default {
    // Display options
    layout: {
        type: 'string',
        default: 'grid'
    },
    columns: {
        type: 'number',
        default: 3
    },
    limit: {
        type: 'number',
        default: 12
    },
    
    // Filters
    searchTerm: {
        type: 'string',
        default: ''
    },
    minCost: {
        type: 'string',
        default: ''
    },
    maxCost: {
        type: 'string',
        default: ''
    },
    sortBy: {
        type: 'string',
        default: '-created'
    },
    
    // Visibility
    showCost: {
        type: 'boolean',
        default: true
    },
    showDescription: {
        type: 'boolean',
        default: true
    },
    showUrl: {
        type: 'boolean',
        default: true
    },
    showDate: {
        type: 'boolean',
        default: false
    },
    
    // Pagination
    enablePagination: {
        type: 'boolean',
        default: false
    },
    enableLoadMore: {
        type: 'boolean',
        default: false
    },
    
    // Advanced
    className: {
        type: 'string',
        default: ''
    },
    customCSS: {
        type: 'string',
        default: ''
    }
};