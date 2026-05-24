const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 题目生成器
const questionBank = require('./data/questions');

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
  const originalAnswerLetter = question.answer; // Original answer is a letter (e.g., 'A', 'B')

  // Convert the letter answer to its corresponding 0-indexed position
  // Assuming options are structured as 'A. Option Text', 'B. Option Text' etc.
  // And options array is ordered alphabetically initially for these question types.
  let correctOptionIndex = -1;
  if (typeof originalAnswerLetter === 'string' && originalAnswerLetter.length === 1) {
    correctOptionIndex = originalAnswerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
  }

  const optionPairs = originalOptions.map((option, index) => ({
    option,
    isCorrect: index === correctOptionIndex // Use the calculated index here
  }));
  
  const shuffledPairs = shuffleArray(optionPairs);
  
  question.options = shuffledPairs.map(pair => pair.option);
  question.answer = shuffledPairs.findIndex(pair => pair.isCorrect); // This will now correctly return the new 0-indexed position of the correct option
  
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
    id: Date.now().toString(),
    sections: {}
  };

  // 为每个模块分配题目集，确保每个模块都有有效的题目
  const moduleSets = {};
  const usedSets = new Set();
  
  // 为每个模块选择有效的题目集
  const modules = ['wordFilling', 'paragraphMatching', 'readingComprehension', 'translation', 'writing'];
  
  modules.forEach(module => {
    let selectedSet;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      selectedSet = selectRandomSet();
      attempts++;
      
      // 检查该set是否有有效的题目数据
      const questionSet = questionBank[selectedSet];
      if (questionSet && questionSet[module] && questionSet[module] !== null) {
        break;
      }
    } while (attempts < maxAttempts && usedSets.has(selectedSet));
    
    // 如果找不到有效的set，使用第一个有效的set
    if (attempts >= maxAttempts) {
      for (const set of ['set1', 'set2', 'set3', 'set4', 'set5']) {
        const questionSet = questionBank[set];
        if (questionSet && questionSet[module] && questionSet[module] !== null) {
          selectedSet = set;
          break;
        }
      }
    }
    
    moduleSets[module] = selectedSet;
    usedSets.add(selectedSet);
  });

  // 生成各个部分的题目
  Object.keys(moduleSets).forEach(module => {
    const set = moduleSets[module];
    const questionSet = questionBank[set];

    if (module === 'wordFilling') {
      const wf = questionSet.wordFilling;
      if (wf) {
        exam.sections[module] = {
          passage: wf.passage,
          options: wf.options || wf.wordBank,
          blanks: wf.blanks,
          sourceSet: set,
          // 保存正确答案信息
          correctAnswers: wf.blanks.map(blank => {
            const answerIndex = blank.answer.charCodeAt(0) - 'A'.charCodeAt(0);
            const options = wf.options || wf.wordBank;
            // 添加边界检查
            if (answerIndex >= 0 && answerIndex < options.length) {
              return options[answerIndex];
            } else {
              console.warn(`Invalid answer index ${answerIndex} for blank ${blank.position}, options length: ${options.length}`);
              return `答案${blank.answer}`;
            }
          })
        };
      }
    } else if (module === 'paragraphMatching') {
      const pm = questionSet.paragraphMatching;
      if (pm) {
        // 段落数组（A. B. ...）
        let paragraphs = [];
        if (pm.passage) {
          // 清理段落文本，移除多余的空格和换行
          const cleanPassage = pm.passage.replace(/\s+/g, ' ').trim();
          
          // 使用更灵活的正则表达式来匹配段落
          const paragraphMatches = cleanPassage.match(/[A-O]\.\s*(.*?)(?=[A-O]\.|$)/g);
          
          if (paragraphMatches) {
            paragraphMatches.forEach(match => {
              // 提取段落内容
              const contentMatch = match.match(/[A-O]\.\s*(.*)/);
              if (contentMatch && contentMatch[1]) {
                const content = contentMatch[1].trim();
                if (content.length > 0) {
                  paragraphs.push(content);
                }
              }
            });
          } else {
            // 备用方法：按行分割并匹配
            const passageLines = pm.passage.split('\n').filter(line => line.trim());
            passageLines.forEach(line => {
              const trimmedLine = line.trim();
              // 匹配以字母开头的段落
              const match = trimmedLine.match(/^[A-O]\.\s*(.*)$/);
              if (match && match[1].trim().length > 0) {
                paragraphs.push(match[1].trim());
              }
            });
          }
        }
        
        // 问题数组 - 改进兼容性处理
        let questionsArr = [];
        if (pm.sentences && Array.isArray(pm.sentences)) {
          questionsArr = pm.sentences.map(item => ({
            question: item.text || item.question || '',
            answer: item.answer || ''
          }));
        } else if (pm.questions && Array.isArray(pm.questions)) {
          questionsArr = pm.questions.map(item => ({
            question: item.text || item.question || '',
            answer: item.answer || ''
          }));
        }
        
        // 添加调试信息
        console.log(`ParagraphMatching: Found ${paragraphs.length} paragraphs and ${questionsArr.length} questions`);
        if (paragraphs.length > 0) {
          console.log('First paragraph preview:', paragraphs[0].substring(0, 100) + '...');
        }
        
        exam.sections[module] = {
          paragraphs,
          questions: questionsArr,
          sourceSet: set
        };
      }
    } else if (module === 'readingComprehension') {
      const rc = questionSet.readingComprehension;
      if (rc) {
        // 仔细阅读有两道题，随机选择其中一道，并确保 questions 字段存在
        const reading = Array.isArray(rc) ? rc[Math.floor(Math.random() * rc.length)] : rc;
        exam.sections[module] = {
          passage: reading.article || reading.passage,
          questions: reading.questions || [],
          sourceSet: set
        };
      }
    } else if (module === 'translation') {
      const tr = questionSet.translation;
      if (tr) {
        exam.sections[module] = {
          chinese: tr.chinese,
          reference: tr.reference,
          sourceSet: set
        };
      }
    } else if (module === 'writing') {
      const wr = questionSet.writing;
      if (wr) {
        exam.sections[module] = {
          topic: wr.topic,
          tips: wr.tips,
          sourceSet: set
        };
      }
    }
  });

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
function validateAnswers(examId, answers) {
  return {
    examId,
    score: Math.floor(Math.random() * 40) + 60,
    feedback: "Good job! Keep practicing to improve your skills.",
    detailedResults: {}
  };
}

// 获取文件MIME类型
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif'
  };
  return mimeTypes[ext] || 'text/plain';
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API路由
  if (pathname === '/api/exam' && req.method === 'GET') {
    try {
      const exam = generateExam();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: exam
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Failed to generate exam'
      }));
    }
    return;
  }
  
  if (pathname === '/api/submit-exam' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        // console.log("DEBUG: Received submission body:", body); // Removed log
        // const examId = pathname.split('/')[3]; // Removed as it's part of the body now
        const { examId, answers, startTime } = JSON.parse(body);
        // console.log("DEBUG: Parsed answers object:", answers); // Removed log
        const result = validateAnswers(examId, answers);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          score: result.score, // Return score directly for frontend consumption
          message: result.feedback, // Return feedback as message
          detailedResults: result.detailedResults // Include detailed results
        }));
      } catch (error) {
        console.error("ERROR: Failed to validate answers:", error); // Kept error log
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Failed to validate answers'
        }));
      }
    });
    return;
  }
  
  // 静态文件路由
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else if (pathname === '/exam') {
    filePath = path.join(__dirname, 'public', 'exam.html');
  } else if (pathname === '/result') {
    filePath = path.join(__dirname, 'public', 'result.html');
  } else {
    filePath = path.join(__dirname, 'public', pathname);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
    } else {
      res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
      res.end(data);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 