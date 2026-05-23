// 答案页面的JavaScript
document.addEventListener('DOMContentLoaded', function() {
    displayAnswers();
    setupEventListeners();
});

// 显示答案对比
function displayAnswers() {
    const examData = JSON.parse(localStorage.getItem('examData') || '{}');
    const userAnswers = JSON.parse(localStorage.getItem('examAnswers') || '{}');
    
    if (!examData.sections) {
        alert('没有找到考试数据，请重新参加考试');
        window.location.href = '/';
        return;
    }
    
    // 显示选词填空答案
    displayWordFillingAnswers(examData.sections.wordFilling, userAnswers.wordFilling);
    
    // 显示段落匹配答案
    displayParagraphMatchingAnswers(examData.sections.paragraphMatching, userAnswers.paragraphMatching);
    
    // 显示仔细阅读答案
    displayReadingComprehensionAnswers(examData.sections.readingComprehension, userAnswers.readingComprehension);
    
    // 显示翻译答案
    displayTranslationAnswers(examData.sections.translation, userAnswers.translation);
    
    // 显示写作答案
    displayWritingAnswers(examData.sections.writing, userAnswers.writing);
}

// 显示选词填空答案
function displayWordFillingAnswers(section, userAnswers) {
    const container = document.getElementById('wf-answers-container');
    if (!section || !section.blanks) {
        container.innerHTML = '<p>暂无答案数据</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // 获取正确答案（从原始题目数据中）
    const correctAnswers = getCorrectWordFillingAnswers(section);
    
    userAnswers.forEach((userAnswer, index) => {
        const correctAnswer = correctAnswers[index];
        const isCorrect = userAnswer === correctAnswer;
        
        const answerItem = document.createElement('div');
        answerItem.className = `answer-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        const label = isCorrect ? '正确' : '错误';
        const labelClass = isCorrect ? 'label-correct' : 'label-incorrect';
        
        answerItem.innerHTML = `
            <h3>第${index + 1}题 <span class="answer-label ${labelClass}">${label}</span></h3>
            <div class="answer-comparison">
                <div class="user-answer ${isCorrect ? 'correct' : 'incorrect'}">
                    <h4>你的答案：</h4>
                    <p>${userAnswer || '未作答'}</p>
                </div>
                <div class="correct-answer">
                    <h4>正确答案：</h4>
                    <p>${correctAnswer}</p>
                </div>
            </div>
        `;
        
        container.appendChild(answerItem);
    });
}

// 显示段落匹配答案
function displayParagraphMatchingAnswers(section, userAnswers) {
    const container = document.getElementById('pm-answers-container');
    if (!section || !section.questions) {
        container.innerHTML = '<p>暂无答案数据</p>';
        return;
    }
    
    // 验证用户答案数组
    if (!Array.isArray(userAnswers)) {
        console.error('ParagraphMatching: userAnswers is not an array:', userAnswers);
        userAnswers = [];
    }
    
    container.innerHTML = '';
    
    section.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.answer;
        
        // 验证答案格式
        if (!correctAnswer) {
            console.warn(`ParagraphMatching: Question ${index + 1} has no correct answer`);
        }
        
        const isCorrect = userAnswer === correctAnswer;
        
        const answerItem = document.createElement('div');
        answerItem.className = `answer-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        const label = isCorrect ? '正确' : '错误';
        const labelClass = isCorrect ? 'label-correct' : 'label-incorrect';
        
        // 格式化显示内容
        const displayUserAnswer = userAnswer || '未作答';
        const displayCorrectAnswer = correctAnswer || '答案未知';
        
        answerItem.innerHTML = `
            <h3>第${index + 1}题 <span class="answer-label ${labelClass}">${label}</span></h3>
            <p><strong>题目：</strong>${question.question}</p>
            <div class="answer-comparison">
                <div class="user-answer ${isCorrect ? 'correct' : 'incorrect'}">
                    <h4>你的答案：</h4>
                    <p>${displayUserAnswer}</p>
                </div>
                <div class="correct-answer">
                    <h4>正确答案：</h4>
                    <p>${displayCorrectAnswer}</p>
                </div>
            </div>
        `;
        
        container.appendChild(answerItem);
    });
    
    console.log(`ParagraphMatching: Displayed answers for ${section.questions.length} questions`);
}

// 显示仔细阅读答案
function displayReadingComprehensionAnswers(section, userAnswers) {
    const container = document.getElementById('rc-answers-container');
    if (!section || !section.questions) {
        container.innerHTML = '<p>暂无答案数据</p>';
        return;
    }
    
    container.innerHTML = '';
    
    section.questions.forEach((question, index) => {
        const userAnswerIndex = userAnswers[index];
        const correctAnswerIndex = question.answer;
        const isCorrect = userAnswerIndex === correctAnswerIndex;
        
        const userAnswer = userAnswerIndex !== null && userAnswerIndex !== undefined 
            ? question.options[userAnswerIndex] 
            : '未作答';
        const correctAnswer = question.options[correctAnswerIndex];
        
        const answerItem = document.createElement('div');
        answerItem.className = `answer-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        const label = isCorrect ? '正确' : '错误';
        const labelClass = isCorrect ? 'label-correct' : 'label-incorrect';
        
        answerItem.innerHTML = `
            <h3>第${index + 1}题 <span class="answer-label ${labelClass}">${label}</span></h3>
            <p><strong>题目：</strong>${question.question}</p>
            <div class="answer-comparison">
                <div class="user-answer ${isCorrect ? 'correct' : 'incorrect'}">
                    <h4>你的答案：</h4>
                    <p>${userAnswer}</p>
                </div>
                <div class="correct-answer">
                    <h4>正确答案：</h4>
                    <p>${correctAnswer}</p>
                </div>
            </div>
        `;
        
        container.appendChild(answerItem);
    });
}

// 显示翻译答案
function displayTranslationAnswers(section, userAnswer) {
    const container = document.getElementById('tr-answers-container');
    if (!section) {
        container.innerHTML = '<p>暂无答案数据</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="answer-item">
            <h3>翻译题目</h3>
            <p><strong>中文原文：</strong></p>
            <p>${section.chinese}</p>
            
            <div class="answer-comparison">
                <div class="user-answer">
                    <h4>你的翻译：</h4>
                    <p>${userAnswer || '未作答'}</p>
                </div>
                <div class="correct-answer">
                    <h4>参考译文：</h4>
                    <p>${section.reference}</p>
                </div>
            </div>
            
            <div class="translation-reference">
                <h4>翻译要点：</h4>
                <ul>
                    <li>注意句子的语法结构和时态</li>
                    <li>保持原文的意思和语气</li>
                    <li>使用恰当的词汇和表达方式</li>
                    <li>注意标点符号的使用</li>
                </ul>
            </div>
        </div>
    `;
}

// 显示写作答案
function displayWritingAnswers(section, userAnswer) {
    const container = document.getElementById('wr-answers-container');
    if (!section) {
        container.innerHTML = '<p>暂无答案数据</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="answer-item">
            <h3>写作题目</h3>
            <p><strong>题目：</strong>${section.topic}</p>
            <p><strong>要求：</strong>${section.tips}</p>
            
            <div class="answer-comparison">
                <div class="user-answer">
                    <h4>你的作文：</h4>
                    <p>${userAnswer || '未作答'}</p>
                </div>
            </div>
            
            <div class="writing-feedback">
                <h4>写作建议：</h4>
                <ul>
                    <li>确保文章结构清晰，包含开头、主体和结尾</li>
                    <li>使用恰当的连接词和过渡句</li>
                    <li>注意语法正确性和词汇使用的准确性</li>
                    <li>控制字数在120-180词之间</li>
                    <li>表达观点要明确，论证要有力</li>
                </ul>
            </div>
        </div>
    `;
}

// 获取选词填空的正确答案
function getCorrectWordFillingAnswers(section) {
    // 使用section中保存的correctAnswers字段
    if (section.correctAnswers && Array.isArray(section.correctAnswers)) {
        return section.correctAnswers;
    }
    
    // 如果没有correctAnswers字段，则从blanks中计算（兼容旧版本）
    const correctAnswers = [];
    if (section.blanks && Array.isArray(section.blanks)) {
        section.blanks.forEach((blank, index) => {
            // 根据blank.answer（字母）找到对应的单词
            if (blank.answer && section.options) {
                const answerIndex = blank.answer.charCodeAt(0) - 'A'.charCodeAt(0);
                correctAnswers.push(section.options[answerIndex] || `答案${blank.answer}`);
            } else {
                correctAnswers.push('答案未知');
            }
        });
    }
    
    return correctAnswers;
}

// 设置事件监听器
function setupEventListeners() {
    const backButton = document.getElementById('backToResult');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '/result.html';
        });
    }
} 