import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './edit';
import save from './save';
import attributes from './attributes';
import './style.scss';

registerBlockType('service-sync/service-list', {
    title: __('Service List', 'service-sync'),
    description: __('Display a list of services from Pocketbase', 'service-sync'),
    category: 'widgets',
    icon: 'list-view',
    keywords: [
        __('services', 'service-sync'),
        __('list', 'service-sync'),
        __('pocketbase', 'service-sync')
    ],
    supports: {
        align: ['wide', 'full'],
        html: false
    },
    attributes,
    edit,
    save
});