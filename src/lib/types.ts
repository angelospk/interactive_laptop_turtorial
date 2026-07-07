export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Lesson definition (in-code, registered in registry)
export type LessonDefinition = {
    id: string;
    moduleId: string;
    key: string; // Unique key for this lesson
    titleKey: string; // i18n key
    descriptionKey?: string; // i18n key
    component: any; // Svelte component
    difficulty: DifficultyLevel;
    order: number;
    prerequisites?: string[]; // Lesson IDs that must be completed first
};

// Module definition (group of lessons)
export type ModuleDefinition = {
    id: string;
    titleKey: string; // i18n key
    descriptionKey: string; // i18n key
    iconName: string;
    lessons: LessonDefinition[];
};

// User progress data (from database)
export type UserLessonProgress = {
    lessonId: string;
    completed: boolean;
    score?: number;
    stars?: number;
    completedAt?: Date;
    attempts: number;
    lastAttemptAt?: Date;
};

// Combined lesson info with user progress
export type LessonWithProgress = LessonDefinition & {
    isNew: boolean; // Not viewed yet
    progress?: UserLessonProgress;
    isLocked: boolean; // Prerequisites not met
};

// User session data
export type UserSession = {
    id: string;
    username: string;
    displayName?: string;
    lastLogin?: Date;
    isAdmin?: boolean;
    // Preferred learning device (windows|mac|android|iphone); null/undefined = not
    // chosen yet -> onboarding shows the device-confirmation step. See ROADMAP Φάση 1.
    preferredDevice?: 'windows' | 'mac' | 'android' | 'iphone' | null;
};
