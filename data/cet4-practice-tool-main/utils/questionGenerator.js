const questions = require('../data/questions');

// 打乱数组顺序的函数
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 打乱选择题选项并更新答案
function shuffleOptions(question) {
  const originalOptions = [...question.options];
  const originalAnswer = question.answer;
  
  // 创建选项和答案的配对
  const optionPairs = originalOptions.map((option, index) => ({
    option,
    isCorrect: index === originalAnswer
  }));
  
  // 打乱选项
  const shuffledPairs = shuffleArray(optionPairs);
  
  // 更新问题和答案
  question.options = shuffledPairs.map(pair => pair.option);
  question.answer = shuffledPairs.findIndex(pair => pair.isCorrect);
  
  return question;
}

// 随机选择一套题目
function selectRandomSet() {
  const setNumbers = ['set1', 'set2', 'set3', 'set4', 'set5'];
  const randomIndex = Math.floor(Math.random() * setNumbers.length);
  return setNumbers[randomIndex];
}

// 生成完整的考试题目
function generateExam() {
  const exam = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    sections: {}
  };

  // 随机选择5套题目，每套选择不同的模块
  const selectedSets = [];
  const modules = ['wordFilling', 'paragraphMatching', 'readingComprehension', 'translation', 'writing'];
  
  // 确保每个模块都被选择，且来自不同的套题
  const usedSets = new Set();
  
  modules.forEach(module => {
    let selectedSet;
    do {
      selectedSet = selectRandomSet();
    } while (usedSets.has(selectedSet));
    
    usedSets.add(selectedSet);
    selectedSets.push({ set: selectedSet, module });
  });

  // 构建考试内容
  selectedSets.forEach(({ set, module }) => {
    const questionSet = questions[set];
    
    if (module === 'readingComprehension') {
      // 仔细阅读有两道题，随机选择其中一道
      const randomIndex = Math.floor(Math.random() * 2);
      exam.sections[module] = {
        ...questionSet[module][randomIndex],
        sourceSet: set
      };
    } else {
      exam.sections[module] = {
        ...questionSet[module],
        sourceSet: set
      };
    }
  });

  // 打乱选择题选项
  Object.keys(exam.sections).forEach(sectionKey => {
    const section = exam.sections[sectionKey];
    
    if (sectionKey === 'readingComprehension' && section.questions) {
      section.questions.forEach(question => {
        if (question.options) {
          shuffleOptions(question);
        }
      });
    }
  });

  return exam;
}

// 验证答案
function validateAnswers(examId, userAnswers) {
  // 这里可以实现答案验证逻辑
  // 暂时返回模拟结果
  return {
    examId,
    score: Math.floor(Math.random() * 40) + 60, // 模拟60-100分
    feedback: "Good job! Keep practicing to improve your skills.",
    detailedResults: {}
  };
}

module.exports = {
  generateExam,
  validateAnswers,
  shuffleArray,
  shuffleOptions
}; 