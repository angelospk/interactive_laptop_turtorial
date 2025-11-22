import type { NewLesson } from '../schema';

/**
 * Module 1: Mouse Training Lessons
 * Gamified lessons for mouse interaction
 */
export const module1Lessons: NewLesson[] = [
    // Lesson 1: Catch the Balloons (Hover)
    {
        id: 'module1-lesson1',
        moduleId: 'module1',
        lessonKey: 'hover-balloons',
        titleKey: 'module1_lesson1_title',
        descriptionKey: 'module1_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'hover',
        config: {
            targetCount: 5,
            timeLimit: 45,
            gameMode: true,
            theme: 'balloons',
            instructions: 'Μετακινήστε το ποντίκι πάνω από τα μπαλόνια για να σκάσουν!'
        },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: Whack-a-Mole (Click)
    {
        id: 'module1-lesson2',
        moduleId: 'module1',
        lessonKey: 'click-mole',
        titleKey: 'module1_lesson2_title',
        descriptionKey: 'module1_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'click',
        config: {
            targetCount: 10,
            timeLimit: 60,
            theme: 'moles',
            gameMode: true,
            instructions: 'Κάντε κλικ στους τυφλοπόντικες πριν κρυφτούν!'
        },
        enabled: true,
        requiredLessonId: 'module1-lesson1'
    },

    // Lesson 3: Open the Chests (Double Click)
    {
        id: 'module1-lesson3',
        moduleId: 'module1',
        lessonKey: 'double-click-chests',
        titleKey: 'module1_lesson3_title',
        descriptionKey: 'module1_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'double-click',
        config: {
            targetCount: 5,
            timeLimit: 40,
            theme: 'chests',
            gameMode: true,
            instructions: 'Κάντε διπλό κλικ στα σεντούκια για να βρείτε τον θησαυρό!'
        },
        enabled: true,
        requiredLessonId: 'module1-lesson2'
    },

    // Lesson 4: Sort the Trash (Drag)
    {
        id: 'module1-lesson4',
        moduleId: 'module1',
        lessonKey: 'drag-recycle',
        titleKey: 'module1_lesson4_title',
        descriptionKey: 'module1_lesson4_desc',
        difficulty: 'beginner',
        orderIndex: 4,
        lessonType: 'drag',
        config: {
            itemCount: 6,
            dropZones: 2,
            theme: 'recycle',
            gameMode: true,
            instructions: 'Σύρετε τα σκουπίδια στον σωστό κάδο ανακύκλωσης.'
        },
        enabled: true,
        requiredLessonId: 'module1-lesson3'
    },

    // Lesson 5: Right Click Mystery
    {
        id: 'module1-lesson5',
        moduleId: 'module1',
        lessonKey: 'right-click-mystery',
        titleKey: 'module1_lesson5_title',
        descriptionKey: 'module1_lesson5_desc',
        difficulty: 'intermediate',
        orderIndex: 5,
        lessonType: 'right-click',
        config: {
            targetCount: 6,
            timeLimit: 50,
            theme: 'mystery',
            instructions: 'Κάντε δεξί κλικ στα κουτιά για να δείτε τι έχουν μέσα.'
        },
        enabled: true,
        requiredLessonId: 'module1-lesson4'
    },

    // Lesson 6: Scroll Adventure
    {
        id: 'module1-lesson6',
        moduleId: 'module1',
        lessonKey: 'scroll-adventure',
        titleKey: 'module1_lesson6_title',
        descriptionKey: 'module1_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'scroll',
        config: {
            scrollDistance: 1500,
            timeLimit: 40,
            gameMode: true,
            instructions: 'Κυλήστε τη ροδέλα για να φτάσετε στο τέλος του δρόμου!'
        },
        enabled: true,
        requiredLessonId: 'module1-lesson5'
    },

    // Lesson 7: Catch the Flies (Precision Click)
    {
        id: 'module1-lesson7',
        moduleId: 'module1',
        lessonKey: 'precision-flies',
        titleKey: 'module1_lesson7_title',
        descriptionKey: 'module1_lesson7_desc',
        difficulty: 'intermediate',
        orderIndex: 7,
        lessonType: 'click',
        config: {
            targetCount: 15,
            timeLimit: 45,
            targetSize: 'small',
            theme: 'flies',
            gameMode: true,
            instructions: 'Πιάστε τις μικρές μύγες κάνοντας κλικ πάνω τους.'
        },
        enabled: true,
        requiredLessonId: 'module1-lesson6'
    },

    // Lesson 8: Puzzle (Drag & Drop)
    {
        id: 'module1-lesson8',
        moduleId: 'module1',
        lessonKey: 'puzzle-drag',
        titleKey: 'module1_lesson8_title',
        descriptionKey: 'module1_lesson8_desc',
        difficulty: 'advanced',
        orderIndex: 8,
        lessonType: 'drag',
        config: {
            itemCount: 4,
            dropZones: 4,
            theme: 'puzzle',
            gameMode: true,
            instructions: 'Συμπληρώστε το παζλ σέρνοντας τα κομμάτια.'
        },
        enabled: true,
        requiredLessonId: 'module1-lesson7'
    }
];
