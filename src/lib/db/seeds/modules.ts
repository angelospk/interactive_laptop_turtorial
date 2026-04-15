import type { NewModule } from '../schema';

/**
 * All modules in display order.
 * To change order: move the entry in the array.
 * To hide a module: set enabled: false.
 */
const _modules: Omit<NewModule, 'orderIndex' | 'createdAt'>[] = [
    { id: 'module1',  titleKey: 'module1_title',  descriptionKey: 'module1_description',  iconName: 'Mouse',     enabled: true },
    { id: 'module2',  titleKey: 'module2_title',  descriptionKey: 'module2_description',  iconName: 'Keyboard',  enabled: true },
    { id: 'module3',  titleKey: 'module3_title',  descriptionKey: 'module3_description',  iconName: 'Monitor',   enabled: true },
    { id: 'module4',  titleKey: 'module4_title',  descriptionKey: 'module4_description',  iconName: 'Folder',    enabled: true },
    { id: 'module5',  titleKey: 'module5_title',  descriptionKey: 'module5_description',  iconName: 'Globe',     enabled: true },
    { id: 'module6',  titleKey: 'module6_title',  descriptionKey: 'module6_description',  iconName: 'Mail',      enabled: true },
    { id: 'word',     titleKey: 'word_title',     descriptionKey: 'word_description',     iconName: 'FileText',  enabled: true },
    { id: 'module7',  titleKey: 'module7_title',  descriptionKey: 'module7_description',  iconName: 'Grid3X3',   enabled: true },
    { id: 'module8',  titleKey: 'module8_title',  descriptionKey: 'module8_description',  iconName: 'Shield',    enabled: true },
    { id: 'module9',  titleKey: 'module9_title',  descriptionKey: 'module9_description',  iconName: 'Settings',  enabled: true },
    { id: 'module10', titleKey: 'module10_title', descriptionKey: 'module10_description', iconName: 'AlertTriangle', enabled: true },
    { id: 'module11', titleKey: 'module11_title', descriptionKey: 'module11_description', iconName: 'Video',     enabled: true },
    { id: 'module12', titleKey: 'module12_title', descriptionKey: 'module12_description', iconName: 'Building2', enabled: true },
    { id: 'module13', titleKey: 'module13_title', descriptionKey: 'module13_description', iconName: 'Bot',       enabled: true },
];

export const allModules: NewModule[] = _modules.map((mod, i) => ({
    ...mod,
    orderIndex: i + 1
}));
