const questionBank = require('./data/questions');

// 随机选择一套题目
function selectRandomSet() {
  const setNumbers = ['set1', 'set2', 'set3', 'set4', 'set5'];
  const randomIndex = Math.floor(Math.random() * setNumbers.length);
  return setNumbers[randomIndex];
}

// 生成完整的考试题目
function generateExam() {
  console.log('开始生成考试...');
  
  const exam = {
    id: Date.now().toString(),
    sections: {}
  };

  // 为每个模块分配题目集，确保每个模块都有有效的题目
  const moduleSets = {};
  const usedSets = new Set();
  
  // 为每个模块选择有效的题目集
  const modules = ['wordFilling', 'paragraphMatching', 'readingComprehension', 'translation', 'writing'];
  
  console.log('开始为每个模块选择题库...');
  
  modules.forEach(module => {
    console.log(`\n处理模块: ${module}`);
    let selectedSet;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      selectedSet = selectRandomSet();
      attempts++;
      console.log(`  尝试 ${attempts}: 选择 set ${selectedSet}`);
      
      // 检查该set是否有有效的题目数据
      const questionSet = questionBank[selectedSet];
      console.log(`  questionSet 存在: ${!!questionSet}`);
      if (questionSet) {
        console.log(`  ${module} 存在: ${!!questionSet[module]}`);
        console.log(`  ${module} 不为null: ${questionSet[module] !== null}`);
      }
      
      if (questionSet && questionSet[module] && questionSet[module] !== null) {
        console.log(`  ✓ 找到有效的 set: ${selectedSet}`);
        break;
      }
    } while (attempts < maxAttempts && usedSets.has(selectedSet));
    
    // 如果找不到有效的set，使用第一个有效的set
    if (attempts >= maxAttempts) {
      console.log(`  达到最大尝试次数，寻找第一个有效的set...`);
      for (const set of ['set1', 'set2', 'set3', 'set4', 'set5']) {
        const questionSet = questionBank[set];
        if (questionSet && questionSet[module] && questionSet[module] !== null) {
          selectedSet = set;
          console.log(`  ✓ 找到备选 set: ${selectedSet}`);
          break;
        }
      }
    }
    
    moduleSets[module] = selectedSet;
    usedSets.add(selectedSet);
    console.log(`  最终选择: ${selectedSet}`);
  });

  console.log('\n开始生成各个部分的题目...');
  console.log('moduleSets:', moduleSets);

  // 生成各个部分的题目
  Object.keys(moduleSets).forEach(module => {
    const set = moduleSets[module];
    const questionSet = questionBank[set];
    
    console.log(`\n处理 ${module} 模块，使用 set: ${set}`);

    if (module === 'wordFilling') {
      const wf = questionSet.wordFilling;
      console.log(`  wordFilling 存在: ${!!wf}`);
      if (wf) {
        console.log(`  passage 存在: ${!!wf.passage}`);
        console.log(`  options/wordBank 存在: ${!!(wf.options || wf.wordBank)}`);
        console.log(`  blanks 存在: ${!!wf.blanks}`);
        
        exam.sections[module] = {
          passage: wf.passage,
          options: wf.options || wf.wordBank,
          blanks: wf.blanks,
          sourceSet: set,
          // 保存正确答案信息
          correctAnswers: wf.blanks.map(blank => {
            const answerIndex = blank.answer.charCodeAt(0) - 'A'.charCodeAt(0);
            return wf.options[answerIndex] || wf.wordBank[answerIndex];
          })
        };
        console.log(`  ✓ wordFilling 模块创建成功`);
      }
    } else if (module === 'paragraphMatching') {
      const pm = questionSet.paragraphMatching;
      console.log(`  paragraphMatching 存在: ${!!pm}`);
      if (pm) {
        // 段落数组（A. B. ...）
        let paragraphs = [];
        if (pm.passage) {
          const passageLines = pm.passage.split('\n').filter(line => line.trim());
          passageLines.forEach(line => {
            const match = line.match(/^[A-O]\.\s*(.*)$/);
            if (match) paragraphs.push(match[1]);
          });
        }
        // 问题数组
        const questionsArr = (pm.sentences || pm.questions || []).map(item => ({
          question: item.text || item.question,
          answer: item.answer
        }));
        exam.sections[module] = {
          paragraphs,
          questions: questionsArr,
          sourceSet: set
        };
        console.log(`  ✓ paragraphMatching 模块创建成功`);
      }
    } else if (module === 'readingComprehension') {
      const rc = questionSet.readingComprehension;
      console.log(`  readingComprehension 存在: ${!!rc}`);
      if (rc) {
        // 仔细阅读有两道题，随机选择其中一道，并确保 questions 字段存在
        const reading = Array.isArray(rc) ? rc[Math.floor(Math.random() * rc.length)] : rc;
        exam.sections[module] = {
          passage: reading.article || reading.passage,
          questions: reading.questions || [],
          sourceSet: set
        };
        console.log(`  ✓ readingComprehension 模块创建成功`);
      }
    } else if (module === 'translation') {
      const tr = questionSet.translation;
      console.log(`  translation 存在: ${!!tr}`);
      if (tr) {
        exam.sections[module] = {
          chinese: tr.chinese,
          reference: tr.reference,
          sourceSet: set
        };
        console.log(`  ✓ translation 模块创建成功`);
      }
    } else if (module === 'writing') {
      const wr = questionSet.writing;
      console.log(`  writing 存在: ${!!wr}`);
      if (wr) {
        exam.sections[module] = {
          topic: wr.topic,
          tips: wr.tips,
          sourceSet: set
        };
        console.log(`  ✓ writing 模块创建成功`);
      }
    }
  });

  console.log('\n最终生成的考试结构:');
  console.log('exam.id:', exam.id);
  console.log('exam.sections keys:', Object.keys(exam.sections));
  
  Object.keys(exam.sections).forEach(sectionKey => {
    const section = exam.sections[sectionKey];
    console.log(`  ${sectionKey}:`, {
      sourceSet: section.sourceSet,
      hasData: !!section
    });
  });

  return exam;
}

try {
  console.log('开始测试 generateExam 函数...');
  const exam = generateExam();
  console.log('\n✓ 考试生成成功！');
  console.log('考试ID:', exam.id);
  console.log('模块数量:', Object.keys(exam.sections).length);
} catch (error) {
  console.error('\n✗ 考试生成失败！');
  console.error('错误信息:', error.message);
  console.error('错误堆栈:', error.stack);
} 