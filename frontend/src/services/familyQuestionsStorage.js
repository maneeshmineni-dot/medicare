/**
 * Local & Cloud Store for Family Reminiscence Trivia Questions
 */

const STORAGE_KEY = 'pv_family_custom_questions_v1';

const DEFAULT_FAMILY_QUESTIONS = [
  {
    id: 'fq_1',
    question: 'What is the name of your eldest son?',
    correctAnswer: 'Ravi',
    options: ['Ravi', 'Suresh', 'Kiran', 'Mahesh'],
    relationTag: 'son',
    hint: 'He is an engineer living in Bangalore.'
  },
  {
    id: 'fq_2',
    question: 'Where did your family spend summer vacations in your childhood?',
    correctAnswer: 'Grandmother’s Village',
    options: ['Grandmother’s Village', 'Shimla', 'Ooty', 'Goa'],
    relationTag: 'childhood',
    hint: 'With mango orchards and the river.'
  },
  {
    id: 'fq_3',
    question: 'Which sweet dish is prepared every year for your birthday?',
    correctAnswer: 'Payasam (Kheer)',
    options: ['Payasam (Kheer)', 'Gulab Jamun', 'Mysore Pak', 'Laddoo'],
    relationTag: 'tradition',
    hint: 'Made with cardamom and roasted cashews.'
  }
];

export const familyQuestionsStorage = {
  getQuestions: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAMILY_QUESTIONS));
        return DEFAULT_FAMILY_QUESTIONS;
      }
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_FAMILY_QUESTIONS;
    }
  },

  addQuestion: (questionData) => {
    try {
      const questions = familyQuestionsStorage.getQuestions();
      const newQ = {
        id: 'fq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        ...questionData,
        createdAt: Date.now()
      };
      questions.push(newQ);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      return newQ;
    } catch (e) {
      console.warn('[FamilyQuestionsStorage] Save error:', e);
      return questionData;
    }
  },

  deleteQuestion: (id) => {
    try {
      const questions = familyQuestionsStorage.getQuestions().filter(q => q.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      return true;
    } catch (e) {
      return false;
    }
  }
};
