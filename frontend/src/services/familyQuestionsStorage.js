/**
 * Local & Cloud Store for Family Reminiscence Trivia Questions
 */

const STORAGE_KEY = 'pv_family_custom_questions_v1';

export const familyQuestionsStorage = {
  getQuestions: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
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
