import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    InspectorControls,
    BlockControls,
    useBlockProps
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    ToggleControl,
    SelectControl,
    TextControl,
    Button,
    Spinner,
    Placeholder,
    ToolbarGroup,
    ToolbarButton
} from '@wordpress/components';
import { list, grid } from '@wordpress/icons';

import ServiceCard from '@components/ServiceCard';
import LoadingSpinner from '@components/LoadingSpinner';
import { useServices } from '@utils/api';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const {
        layout,
        columns,
        limit,
        searchTerm,
        minCost,
        maxCost,
        sortBy,
        showCost,
        showDescription,
        showUrl,
        showDate,
        enablePagination,
        enableLoadMore
    } = attributes;
    
    // Fetch services using custom hook
    const { 
        services, 
        loading, 
        error, 
        refresh 
    } = useServices({
        limit,
        searchTerm,
        minCost,
        maxCost,
        sortBy
    });
    
    const blockProps = useBlockProps({
        className: `service-sync-list layout-${layout} columns-${columns}`
    });
    
    // Layout toolbar
    const layoutControls = (
        <BlockControls>
            <ToolbarGroup>
                <ToolbarButton
                    icon={grid}
                    label={__('Grid', 'service-sync')}
                    isActive={layout === 'grid'}
                    onClick={() => setAttributes({ layout: 'grid' })}
                />
                <ToolbarButton
                    icon={list}
                    label={__('List', 'service-sync')}
                    isActive={layout === 'list'}
                    onClick={() => setAttributes({ layout: 'list' })}
                />
            </ToolbarGroup>
        </BlockControls>
    );
    
    // Sidebar controls
    const inspectorControls = (
        <InspectorControls>
            {/* Display Settings */}
            <PanelBody title={__('Display Settings', 'service-sync')} initialOpen={true}>
                <SelectControl
                    label={__('Layout', 'service-sync')}
                    value={layout}
                    options={[
                        { label: __('Grid', 'service-sync'), value: 'grid' },
                        { label: __('List', 'service-sync'), value: 'list' },
                        { label: __('Masonry', 'service-sync'), value: 'masonry' }
                    ]}
                    onChange={(value) => setAttributes({ layout: value })}
                />
                
                {layout === 'grid' && (
                    <RangeControl
                        label={__('Columns', 'service-sync')}
                        value={columns}
                        onChange={(value) => setAttributes({ columns: value })}
                        min={1}
                        max={4}
                    />
                )}
                
                <RangeControl
                    label={__('Number of Services', 'service-sync')}
                    value={limit}
                    onChange={(value) => setAttributes({ limit: value })}
                    min={1}
                    max={50}
                />
                
                <SelectControl
                    label={__('Sort By', 'service-sync')}
                    value={sortBy}
                    options={[
                        { label: __('Newest First', 'service-sync'), value: '-created' },
                        { label: __('Oldest First', 'service-sync'), value: 'created' },
                        { label: __('Name A-Z', 'service-sync'), value: 'name' },
                        { label: __('Name Z-A', 'service-sync'), value: '-name' },
                        { label: __('Cost Low-High', 'service-sync'), value: 'cost' },
                        { label: __('Cost High-Low', 'service-sync'), value: '-cost' }
                    ]}
                    onChange={(value) => setAttributes({ sortBy: value })}
                />
            </PanelBody>
            
            {/* Filter Settings */}
            <PanelBody title={__('Filters', 'service-sync')} initialOpen={false}>
                <TextControl
                    label={__('Search Term', 'service-sync')}
                    value={searchTerm}
                    onChange={(value) => setAttributes({ searchTerm: value })}
                    placeholder={__('Search services...', 'service-sync')}
                />
                
                <TextControl
                    label={__('Minimum Cost', 'service-sync')}
                    value={minCost}
                    onChange={(value) => setAttributes({ minCost: value })}
                    type="text"
                    placeholder="0"
                />
                
                <TextControl
                    label={__('Maximum Cost', 'service-sync')}
                    value={maxCost}
                    onChange={(value) => setAttributes({ maxCost: value })}
                    type="text"
                    placeholder="100000"
                />
            </PanelBody>
            
            {/* Visibility Settings */}
            <PanelBody title={__('Visibility', 'service-sync')} initialOpen={false}>
                <ToggleControl
                    label={__('Show Cost', 'service-sync')}
                    checked={showCost}
                    onChange={(value) => setAttributes({ showCost: value })}
                />
                
                <ToggleControl
                    label={__('Show Description', 'service-sync')}
                    checked={showDescription}
                    onChange={(value) => setAttributes({ showDescription: value })}
                />
                
                <ToggleControl
                    label={__('Show URL Button', 'service-sync')}
                    checked={showUrl}
                    onChange={(value) => setAttributes({ showUrl: value })}
                />
                
                <ToggleControl
                    label={__('Show Date', 'service-sync')}
                    checked={showDate}
                    onChange={(value) => setAttributes({ showDate: value })}
                />
            </PanelBody>
            
            {/* Pagination Settings */}
            <PanelBody title={__('Pagination', 'service-sync')} initialOpen={false}>
                <ToggleControl
                    label={__('Enable Pagination', 'service-sync')}
                    checked={enablePagination}
                    onChange={(value) => setAttributes({ enablePagination: value })}
                />
                
                <ToggleControl
                    label={__('Enable Load More', 'service-sync')}
                    checked={enableLoadMore}
                    onChange={(value) => setAttributes({ enableLoadMore: value })}
                />
            </PanelBody>
        </InspectorControls>
    );
    
    // Render loading state
    if (loading) {
        return (
            <>
                {layoutControls}
                {inspectorControls}
                <div {...blockProps}>
                    <Placeholder
                        icon="list-view"
                        label={__('Service List', 'service-sync')}
                    >
                        <Spinner />
                        <p>{__('Loading services...', 'service-sync')}</p>
                    </Placeholder>
                </div>
            </>
        );
    }
    
    // Render error state
    if (error) {
        return (
            <>
                {layoutControls}
                {inspectorControls}
                <div {...blockProps}>
                    <Placeholder
                        icon="warning"
                        label={__('Service List', 'service-sync')}
                        className="service-sync-error"
                    >
                        <p>{error}</p>
                        <Button isSecondary onClick={refresh}>
                            {__('Retry', 'service-sync')}
                        </Button>
                    </Placeholder>
                </div>
            </>
        );
    }
    
    // Render empty state
    if (!services || services.length === 0) {
        return (
            <>
                {layoutControls}
                {inspectorControls}
                <div {...blockProps}>
                    <Placeholder
                        icon="list-view"
                        label={__('Service List', 'service-sync')}
                    >
                        <p>{__('No services found', 'service-sync')}</p>
                        {(searchTerm || minCost || maxCost) && (
                            <Button 
                                isSecondary 
                                onClick={() => {
                                    setAttributes({ 
                                        searchTerm: '', 
                                        minCost: '', 
                                        maxCost: '' 
                                    });
                                }}
                            >
                                {__('Clear Filters', 'service-sync')}
                            </Button>
                        )}
                    </Placeholder>
                </div>
            </>
        );
    }
    
    // Render services
    return (
        <>
            {layoutControls}
            {inspectorControls}
            
            <div {...blockProps}>
                <div className="service-sync-header">
                    <h3>{__('Service List Preview', 'service-sync')}</h3>
                    <Button isSecondary isSmall onClick={refresh}>
                        {__('Refresh', 'service-sync')}
                    </Button>
                </div>
                
                <div className={`service-sync-grid layout-${layout} columns-${columns}`}>
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            showCost={showCost}
                            showDescription={showDescription}
                            showUrl={showUrl}
                            showDate={showDate}
                        />
                    ))}
                </div>
                
                {services.length >= limit && (
                    <div className="service-sync-footer">
                        <p className="service-sync-note">
                            {__('Showing', 'service-sync')} {services.length} {__('services', 'service-sync')}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}