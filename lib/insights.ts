import { Note } from '@/types/note';

export interface NoteInsight {
  tagline: string;
  quote: string;
  category: 'productivity' | 'creativity' | 'motivation' | 'mindfulness' | 'general';
}

const taglinesByCategory: Record<string, string[]> = {
  productivity: [
    "Your ideas are building momentum",
    "Small steps, big progress",
    "You're turning thoughts into action",
    "Organization is your superpower",
    "Progress happens one note at a time",
    "You're crafting your roadmap to success",
    "Ideas captured, potential unlocked",
  ],
  creativity: [
    "Your creativity knows no bounds",
    "Every note is a brushstroke on your canvas",
    "Innovation starts with a single thought",
    "You're painting with possibilities",
    "Imagination in progress",
    "Your mind is a universe of ideas",
    "Creativity flows through your notes",
  ],
  motivation: [
    "You're building something meaningful",
    "Every note is a step forward",
    "Your dedication is inspiring",
    "Great things are taking shape",
    "You're creating your legacy",
    "Persistence pays off",
    "Your journey is unfolding beautifully",
  ],
  mindfulness: [
    "Reflection leads to growth",
    "Your thoughts matter, capture them",
    "Mindful moments, meaningful notes",
    "Clarity comes from expression",
    "You're present with your ideas",
    "Peace begins with a thought",
    "Your inner voice deserves to be heard",
  ],
  general: [
    "Your digital garden is blooming",
    "Thoughts captured, memories preserved",
    "Every note tells a story",
    "Your ideas are taking shape",
    "Knowledge grows with every note",
    "You're building your wisdom library",
    "Ideas that deserve to be remembered",
  ],
};

const quotesByCategory: Record<string, string[]> = {
  productivity: [
    "Productivity is being able to do things that you were never able to do before. — Franz Kafka",
    "The way to get started is to quit talking and begin doing. — Walt Disney",
    "Your mind is for having ideas, not holding them. — David Allen",
    "Amateurs sit and wait for inspiration, the rest of us just get up and go to work. — Stephen King",
    "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
  ],
  creativity: [
    "Creativity is intelligence having fun. — Albert Einstein",
    "Every artist was first an amateur. — Ralph Waldo Emerson",
    "To live a creative life, we must lose our fear of being wrong. — Joseph Chilton Pearce",
    "Creativity takes courage. — Henri Matisse",
    "The creative adult is the child who survived. — Ursula K. Le Guin",
  ],
  motivation: [
    "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
    "It always seems impossible until it is done. — Nelson Mandela",
    "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
    "The only way to do great work is to love what you do. — Steve Jobs",
  ],
  mindfulness: [
    "The present moment is filled with joy and happiness. If you are attentive, you will see it. — Thich Nhat Hanh",
    "Mindfulness is a way of befriending ourselves and our experience. — Jon Kabat-Zinn",
    "Wherever you are, be all there. — Jim Elliot",
    "The mind is everything. What you think you become. — Buddha",
    "Peace comes from within. Do not seek it without. — Buddha",
  ],
  general: [
    "A writer is someone for whom writing is more difficult than it is for other people. — Thomas Mann",
    "Ideas are like rabbits. You get a couple and learn how to handle them, and pretty soon you have a dozen. — John Steinbeck",
    "Write what should not be forgotten. — Isabel Allende",
    "The pen is the tongue of the mind. — Horace",
    "We write to taste life twice, in the moment and in retrospect. — Anaïs Nin",
  ],
};

function analyzeContent(notes: Note[]): { category: string; keywords: string[] } {
  if (notes.length === 0) {
    return { category: 'general', keywords: [] };
  }

  const allContent = notes.map(n => `${n.title} ${n.content}`).join(' ').toLowerCase();
  
  const categoryKeywords: Record<string, string[]> = {
    productivity: ['task', 'todo', 'project', 'goal', 'deadline', 'schedule', 'plan', 'work', 'meeting', 'email', ' urgent', 'priority'],
    creativity: ['idea', 'design', 'art', 'create', 'innovation', 'imagine', 'brainstorm', 'concept', 'inspiration', 'draft'],
    motivation: ['dream', 'success', 'achieve', 'ambition', 'aspiration', 'future', 'vision', 'challenge', 'growth', 'potential'],
    mindfulness: ['reflect', 'meditate', 'gratitude', 'journal', 'feelings', 'emotion', 'peace', 'calm', 'mindful', 'presence'],
  };

  let maxScore = 0;
  let bestCategory = 'general';
  const foundKeywords: string[] = [];

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    keywords.forEach(keyword => {
      if (allContent.includes(keyword)) {
        score++;
        if (!foundKeywords.includes(keyword)) {
          foundKeywords.push(keyword);
        }
      }
    });
    
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  // Check pinned notes for priority themes
  const pinnedNotes = notes.filter(n => n.isPinned);
  if (pinnedNotes.length > 0) {
    const pinnedContent = pinnedNotes.map(n => `${n.title} ${n.content}`).join(' ').toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let pinnedScore = 0;
      keywords.forEach(keyword => {
        if (pinnedContent.includes(keyword)) pinnedScore += 2;
      });
      if (pinnedScore > maxScore) {
        maxScore = pinnedScore;
        bestCategory = category;
      }
    }
  }

  return { category: bestCategory, keywords: foundKeywords };
}

export function generateInsight(notes: Note[]): NoteInsight {
  const analysis = analyzeContent(notes);
  const category = analysis.category as NoteInsight['category'];
  
  const taglines = taglinesByCategory[category];
  const quotes = quotesByCategory[category];
  
  // Random selection on every reload
  const taglineIndex = Math.floor(Math.random() * taglines.length);
  const quoteIndex = Math.floor(Math.random() * quotes.length);
  
  return {
    tagline: taglines[taglineIndex],
    quote: quotes[quoteIndex],
    category,
  };
}

export function getQuickStats(notes: Note[]): { label: string; value: string }[] {
  if (notes.length === 0) return [];

  const totalNotes = notes.length;
  const pinnedNotes = notes.filter(n => n.isPinned).length;
  const recentNotes = notes.filter(n => {
    const daysSinceCreated = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 7;
  }).length;

  const stats = [
    { label: 'Total Notes', value: totalNotes.toString() },
  ];

  if (pinnedNotes > 0) {
    stats.push({ label: 'Pinned', value: pinnedNotes.toString() });
  }

  if (recentNotes > 0) {
    stats.push({ label: 'This Week', value: `+${recentNotes}` });
  }

  return stats;
}
